from flask import Flask, jsonify, request
from flask_cors import CORS
from engine import engine

app = Flask(__name__)
CORS(app)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok", "service": "impactflash_ai_engine"})

@app.route('/api/score', methods=['POST'])
def get_score():
    """
    Input: { type: 'need'|'campaign', urgency: ..., amount: ..., beneficiaries: ... }
    Output: { score: 0-100, fraudFlag: bool, explanation: str, shap_summary: list }
    """
    data = request.json
    result = engine.calculate_score(data)
    return jsonify(result)

@app.route('/api/suggest-split', methods=['POST'])
def suggest_split():
    """
    Input: { amount: float, candidates: [...], donor_causes: [...] }
    """
    data = request.json
    donation_amount = data.get('amount')
    candidates = data.get('candidates', [])
    donor_causes = data.get('donor_causes', [])
    
    if not donation_amount or not candidates:
        return jsonify({"success": False, "message": "Missing input data"}), 400
        
    splits = engine.suggest_optimal_split(donation_amount, candidates, donor_causes)
    return jsonify({
        "success": True,
        "splits": splits
    })

@app.route('/api/fraud/ring-check', methods=['POST'])
def check_fraud_ring():
    """
    Input: { transactions: [{donor_id, ngo_id, amount}] }
    """
    data = request.json
    transactions = data.get('transactions', [])
    rings = engine.detect_circular_fraud(transactions)
    
    return jsonify({
        "isSafe": len(rings) == 0,
        "detectedRings": rings,
        "riskLevel": "high" if len(rings) > 0 else "low"
    })

@app.route('/api/verify-document', methods=['POST'])
def verify_document():
    """
    Input: { image_url: "...", doc_type: "...", reg_data: {...} }
    """
    data = request.json
    url = data.get('image_url')
    doc_type = data.get('doc_type', 'FCRA')
    reg_data = data.get('reg_data')

    if not url:
        return jsonify({"success": False, "message": "Missing image_url"}), 400
        
    result = engine.check_document_authenticity(url, doc_type, reg_data)
    return jsonify(result)

@app.route('/api/verify-outcome', methods=['POST'])
def verify_outcome():
    """
    Input: { image_url: "...", promised_data: {...}, delivered_data: {...}, project_title: "..." }
    """
    data = request.json
    url = data.get('image_url')
    promised = data.get('promised_data', {})
    delivered = data.get('delivered_data', {})
    title = data.get('project_title')

    if not url or not promised or not delivered:
        return jsonify({"success": False, "message": "Missing required outcome data"}), 400
        
    result = engine.verify_impact_outcome(url, promised, delivered, title)
    return jsonify(result)

@app.route('/api/retrain', methods=['POST'])
def retrain_model():
    """
    Input: { outcome_data: { ngo_id: ..., success_rate: ..., completion_time: ... } }
    """
    data = request.json
    outcome = data.get('outcome_data')
    if not outcome:
        return jsonify({"success": False, "message": "Missing outcome data"}), 400
        
    # Trigger model refinement logic in engine
    engine.refine_model_from_outcome(outcome)
    
    return jsonify({
        "success": True,
        "message": "Feedback loop closed. Model updated with outcome data.",
        "new_trust_delta": "+5" if outcome.get('status') == 'success' else "-10"
    })

@app.route('/api/match-causes', methods=['POST'])
def match_causes():
    """
    Input: { interests: "...", activities: ["title1", "title2", ...] }
    """
    data = request.json
    interests = data.get('interests')
    activity_titles = data.get('activities', [])
    
    scores = engine.match_causes(interests, activity_titles)
    return jsonify({
        "matchingScores": scores
    })

if __name__ == '__main__':
    # Listen on all interfaces for internal communication
    app.run(host='0.0.0.0', port=8000, debug=True)
