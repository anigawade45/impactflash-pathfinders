import numpy as np
from vision_guard import vision_guard

def verify_outcome_fidelity(image_url, promised, delivered, title):
    """
    Core AI logic for Impact Story Validation.
    Checks:
    1. Vision: Does the photo reflect the delivery?
    2. Consistency: Numbers match between promised and delivered?
    3. Location: Metadata check (simulated).
    """
    
    # 1. Vision Guard Check
    vision_result = vision_guard.verify_impact_proof(image_url)
    is_authentic = vision_result.get("isAuthentic", False)
    
    # 2. Promised vs Delivered Analysis
    promised_ben = int(promised.get('beneficiaries', 0))
    delivered_ben = int(delivered.get('beneficiaries', 0))
    
    promised_amt = float(promised.get('amount', 0))
    delivered_amt = float(delivered.get('amount', 0))
    
    is_ben_match = delivered_ben >= (promised_ben * 0.9) # 90% threshold
    is_amt_consistent = delivered_amt <= (promised_amt * 1.1) # Max 10% overage
    
    score = 100
    flags = []
    
    if not is_authentic:
        score -= 40
        flags.append("VISION_MISMATCH: Photo does not appear to reflect human-centered impact.")
    
    if not is_ben_match:
        score -= 20
        flags.append(f"BEN_GAP: Delivered {delivered_ben}, promised {promised_ben}")
        
    if not is_amt_consistent:
        score -= 10
        flags.append(f"COST_OVERRUN: Spent ₹{delivered_amt}, budget ₹{promised_amt}")

    # Simulated Location/Metadata Match
    # In a real app, extract EXIF data
    location_score = 95 # Simulated
    
    status = "VERIFIED" if score >= 80 else "FLAGGED"
    
    return {
        "success": True,
        "isAuthentic": is_authentic and score >= 70,
        "score": score,
        "status": status,
        "flags": flags,
        "visionAnalysis": vision_result.get("analysis", "No vision data"),
        "fidelityMetrics": {
            "beneficiaryMatch": f"{round(delivered_ben/promised_ben*100 if promised_ben > 0 else 0)}%",
            "costEfficiency": "OPTIMAL" if is_amt_consistent else "HIGH_EXPENDITURE",
            "locationConfidence": f"{location_score}%"
        },
        "recommendation": "AUTO_PUBLISH" if status == "VERIFIED" else "ADMIN_VETTING_REQUIRED"
    }
