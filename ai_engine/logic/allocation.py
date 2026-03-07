import numpy as np
from scipy.optimize import linprog
from sklearn.metrics.pairwise import cosine_similarity

import datetime

def suggest_split_lp(donation_amount, candidates, donor_causes=None):
    """
    Enhanced Multi-NGO Allocation Optimizer
    Factors in:
      - AI Protocol Item Score (40%)
      - NGO Layer Verification Status (30%)
      - Urgency Delta (20%)
      - Donor Affinity Match (10%)
    Ensures allocation to multiple NGOs for maximum reach.
    """
    if not candidates or len(candidates) < 1:
        return []

    if donor_causes is None:
        donor_causes = []

    urgency_map = {'high': 2.0, 'medium': 1.2, 'low': 0.8}
    
    # 1. Calculate Composite Scores for Ranking
    processed_candidates = []
    for item in candidates:
        ai_score = item.get('aiScore', 50)
        ngo_trust = item.get('ngoTrustScore', 50)
        urgency_val = urgency_map.get(str(item.get('urgency', 'medium')).lower(), 1.0)
        
        affinity_bonus = 1.2 if item.get('category') in donor_causes else 1.0
        
        # Composite Score: weighted normalization
        composite_score = (
            (ai_score * 0.4) + 
            (ngo_trust * 0.3) + 
            (urgency_val * 40 * 0.2) + # normalized roughly to 0-40 scale
            (affinity_bonus * 10)
        )
        
        # Proximity to deadline (extra nudge if close)
        deadline_str = item.get('deadline')
        if deadline_str:
            try:
                deadline = datetime.datetime.fromisoformat(str(deadline_str).replace('Z', ''))
                days_left = (deadline - datetime.datetime.now()).days
                if days_left < 7:
                    composite_score *= 1.1 # 10% boost for upcoming deadlines
            except:
                pass

        processed_candidates.append({
            **item,
            'composite_score': composite_score
        })

    # Sort by composite score
    processed_candidates.sort(key=lambda x: x['composite_score'], reverse=True)
    
    # Take top 5 candidates to ensure diversity but quality
    top_candidates = processed_candidates[:5]
    n = len(top_candidates)
    
    # Objective coefficients: Linprog minimizes, so negate
    c = [-c['composite_score'] for c in top_candidates]
    
    # Constraint 1: sum(x_i) = total_amount
    A_eq = [[1 for _ in range(n)]]
    b_eq = [donation_amount]
    
    # Bounds: 0 <= x_i <= funding_gap_i
    # Diversification Constraint: x_i <= total_amount * 0.4 (Max 40% to one NGO)
    # This forces the money to be split among at least 3 NGOs if possible.
    max_cap = donation_amount * 0.4 if n >= 3 else donation_amount * 0.6
    
    bounds = []
    for item in top_candidates:
        gap = float(item.get('funding_gap', donation_amount))
        bounds.append((0, min(gap, max_cap)))
    
    # Solve LP
    res = linprog(c, A_eq=A_eq, b_eq=b_eq, bounds=bounds, method='highs')
    
    if not res.success:
        # Fallback to proportional split if LP fails (due to constraints)
        total_score = sum(c['composite_score'] for c in top_candidates)
        splits = []
        for item in top_candidates:
            share = (item['composite_score'] / total_score) * donation_amount
            val = min(share, float(item.get('funding_gap', donation_amount)))
            splits.append(_format_split(item, val, donation_amount, donor_causes))
        return splits

    # Format success results
    splits = []
    for i, val in enumerate(res.x):
        if val < 1: continue # Skip negligible amounts
        item = top_candidates[i]
        splits.append(_format_split(item, val, donation_amount, donor_causes))
        
    return splits

def _format_split(item, amount, total, donor_causes):
    is_match = item.get('category') in donor_causes
    score = item.get('aiScore', 0)
    
    reason = "Urgent humanitarian node with verified trust signatures." if str(item.get('urgency')).lower() == 'high' else \
             "Optimal alignment with your social capital causes." if is_match else \
             "High-fidelity project with 90+ AI Score." if score > 90 else \
             "Strategic allocation to maximize NGO reach."

    return {
        "targetId": item['_id'],
        "targetType": item.get('type', 'Need'),
        "title": item['title'],
        "ngoId": item['ngoId'],
        "ngoName": item.get('ngoName', 'Verified NGO'),
        "category": item.get('category', 'Humanitarian'),
        "amount": round(amount, 2),
        "percentage": round((amount / total) * 100, 1) if total > 0 else 0,
        "reason": reason
    }

def match_donor_causes(donor_interests, activity_titles, tfidf_vectorizer):
    """
    Uses Cosine Similarity to match donor interests to active Needs/Campaigns
    """
    if not donor_interests or not activity_titles:
        return []
        
    documents = [donor_interests] + activity_titles
    tfidf_matrix = tfidf_vectorizer.fit_transform(documents)
    similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])
    
    return similarities[0].tolist()
