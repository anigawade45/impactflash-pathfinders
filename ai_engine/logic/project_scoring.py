import numpy as np
from vision_guard import vision_guard

def calculate_project_score(data, xgb_model, iso_forest):
    """
    XGBoost-powered Ranking Score (Urgency Protocol)
    Inputs: data, xgb_model, iso_forest
    """
    # Feature engineering
    urgency_map = {'high': 3, 'medium': 2, 'low': 1}
    u_val = urgency_map.get(str(data.get('urgency', 'medium')).lower(), 2)
    days = int(data.get('daysLeft', 30))
    amt = float(data.get('amount', data.get('targetAmount', 50000)))
    
    # Prepare for prediction
    # Features: [urgency_level(1-3), deadline_days, amount_normalized, category_rank]
    features = np.array([[u_val, days, amt/100000, 1]])
    xgb_score = xgb_model.predict(features)[0]
    
    # --- Multipliers & Penalties (Layered Logic) ---
    final_score = float(xgb_score)
    pos_reasons = []
    neg_reasons = []

    if u_val == 3: pos_reasons.append("Critical urgency detected (XGBoost Tier 1)")
    if days <= 7: pos_reasons.append("Immediate intervention required")

    img_url = data.get('image_url')
    is_authentic = False
    if img_url:
        vision_result = vision_guard.verify_need_document(img_url, data.get('title'))
        is_authentic = vision_result.get("isAuthentic", False)
        if is_authentic:
            final_score += 10
            pos_reasons.append("VisionGuard: Verified authentic")
        else:
            final_score -= 15
            neg_reasons.append("VisionGuard: Documentation anomaly")
    else:
        final_score -= 10
        neg_reasons.append("Missing supporting evidence")

    # Fraud Check
    fraud_features = np.array([[amt, 1, 0.5]])
    is_anomaly = iso_forest.predict(fraud_features)[0] == -1
    
    final_score = min(max(round(final_score), 0), 100)
    
    return {
        "score": final_score,
        "verdict": "APPROVED" if final_score > 70 and not is_anomaly else "PENDING",
        "why_high": ", ".join(pos_reasons[:2]),
        "why_not_higher": ", ".join(neg_reasons),
        "fraud_status": "HIGH RISK" if is_anomaly else "LOW RISK",
        "fraudFlag": bool(is_anomaly)
    }
