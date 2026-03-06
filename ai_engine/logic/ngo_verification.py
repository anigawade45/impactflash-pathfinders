import networkx as nx
from vision_guard import vision_guard

def check_doc_authenticity(image_url, doc_type="FCRA", reg_data=None):
    """
    Uses Gemini 1.5 Flash to detect document tampering and cross-verify data.
    """
    if not image_url:
        return {"success": False, "message": "No document proof provided."}

    if "milestone" in image_url.lower() or "proof" in image_url.lower():
        return vision_guard.verify_impact_proof(image_url)
    
    return vision_guard.verify_ngo_document(image_url, doc_type, reg_data)

def detect_circular_fraud_rings(transactions):
    """
    Uses NetworkX to detect circular donation rings (Layer 3)
    Input: Transactions list [(donor_id, ngo_id, amount), ...]
    Output: List of cycles (potential money laundering rings)
    """
    if not transactions:
        return []

    G = nx.DiGraph()
    for t in transactions:
        # Expected keys: donor_id, ngo_id, amount
        G.add_edge(t['donor_id'], t['ngo_id'], weight=t['amount'])
        
    # Find all simple cycles
    cycles = list(nx.simple_cycles(G))
    # Filter cycles that involve NGOs
    # In circular fraud, the chain usually involves at least 3 nodes (Donor -> NGO -> Donor etc.)
    return [cycle for cycle in cycles if len(cycle) >= 3]
