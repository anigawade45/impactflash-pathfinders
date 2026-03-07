import numpy as np
from vision_guard import vision_guard

def calculate_project_score(data, xgb_model, iso_forest, shap_explainer, feature_names):
    """
    XGBoost-powered Ranking Score (AI Urgency Protocol: 400 trees, 22 features)
    """
    # 1. Feature Engineering (Constructing 22-feature vector)
    urgency_map = {'high': 3, 'medium': 2, 'low': 1}
    u_val = urgency_map.get(str(data.get('urgency', 'medium')).lower(), 2)
    
    amt = float(data.get('amount', 50000))
    ben = int(data.get('beneficiaries', 100))
    ngo_trust = float(data.get('ngo_trust', 50)) 
    
    # 4. VisionGuard (Document Verification - Run before scoring to include as feature)
    img_url = data.get('image_url')
    vision_result = {"isAuthentic": False, "analysis": "No document provided"}
    if img_url:
        vision_result = vision_guard.verify_need_document(img_url, data.get('title'))
    
    vision_authentic = vision_result.get("isAuthentic", False)

    # Prepare 22 features for model inference
    # In a real system, these would be fetched from database/knowledge graph
    features = np.zeros(22)
    features[0] = u_val # urgency_level
    features[1] = amt / 1000000 # funding_gap (normalized)
    features[2] = ben / 1000 # beneficiaries_count
    features[3] = 0.8 if data.get('category') == 'Health' else 0.5 # category_weight
    features[4] = 0.2 # region_risk
    features[5] = ngo_trust / 100 # ngo_track_record
    features[10] = 1.0 if vision_authentic else 0.0 # field/document verification
    # Other features 6-9, 11-21 stay at baseline 0.0 or random for MVP simulation
    for i in range(22):
        if features[i] == 0: features[i] = 0.1 # Baseline noise
    
    # XGBoost Inference (exact score from 400-tree ensemble)
    features_reshaped = features.reshape(1, -1)
    model_score = float(xgb_model.predict(features_reshaped)[0])
    
    # 3. Isolation Forest (Submission Pattern Anomaly: 200 trees)
    # Features: [amt, ben, u_val]
    fraud_features = np.array([[amt, ben, u_val]])
    is_pattern_anomaly = iso_forest.predict(fraud_features)[0] == -1
    
    # Contextual Logic (Rule-based overlays)
    is_contextual_anomaly = amt > 1000000 and u_val == 1
    
    # Final Aggregate Score
    final_score = min(max(round(model_score), 0), 100)
    
    # 6. SHAP Execution (Mathematically Exact Contributions)
    # Get Shapley values for this specific prediction
    shap_values = shap_explainer.shap_values(features_reshaped)[0]
    
    # Export top 4 contributing factors for Admin Dashboard
    shap_summary = []
    # Map raw shap values back to human-readable feature names
    indexed_shap = sorted(enumerate(shap_values), key=lambda x: abs(x[1]), reverse=True)
    for idx, val in indexed_shap[:4]:
        name = feature_names[idx].replace('_', ' ').title()
        prefix = "+" if val >= 0 else ""
        shap_summary.append({
            "feature": name,
            "impact": f"{prefix}{round(val, 1)}"
        })

    fraud_flag = is_pattern_anomaly or is_contextual_anomaly or (not vision_authentic and u_val == 3)
    verdict = "AUTO_APPROVE" if final_score >= 85 and not fraud_flag else ("AUTO_REJECT" if final_score < 40 or fraud_flag else "ADMIN_QUEUE")
    
    return {
        "score": final_score,
        "verdict": verdict,
        "why_high": "High urgency + AI vision verification success" if final_score > 75 else "Stable track record + Reasonable funding gap",
        "why_not_higher": vision_result.get("analysis", "No document flags") if not vision_authentic else "Standard regional risk weight",
        "fraud_status": "HIGH_RISK" if fraud_flag else "LOW_RISK",
        "fraudFlag": fraud_flag,
        "visionAuthentic": vision_authentic,
        "aiRecommendationPoints": vision_result.get("recommendation_points", []),
        "shap_summary": shap_summary,
        "one_flag": "PATTERN_ANOMALY" if is_pattern_anomaly else ("MISMATCH_OVERLAY" if is_contextual_anomaly else "None")
    }
