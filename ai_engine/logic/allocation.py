import numpy as np
from scipy.optimize import linprog
from sklearn.metrics.pairwise import cosine_similarity

def suggest_split_lp(donation_amount, candidates, donor_causes=None):
    """
    Linear Programming (LP) Optimizer for Multi-NGO Allocation
    Objective: Maximize: Sum of (impact_rate × ai_score × amount)
    Constraints:
      1. sum(allocations) = donation_amount
      2. 0 <= allocation_i <= funding_gap_i
    """
    if not candidates or len(candidates) < 1:
        return []

    if donor_causes is None:
        donor_causes = []

    # Objective coefficients
    # linprog minimizes, so we negate the impact score
    # impact_rate = 1.0 (base) + 0.0015 (if cause matches)
    c = []
    for item in candidates:
        impact_rate = 1.0
        # Check if item category is in donor's preferred causes
        if item.get('category') in donor_causes:
            impact_rate += 0.0015
        
        # Coeff = -(impact_rate * ai_score)
        c.append(-(impact_rate * item['aiScore']))
    
    # Constraint: sum(x) = total
    A_eq = [[1 for _ in candidates]]
    b_eq = [donation_amount]
    
    # Bounds: 0 <= x_i <= funding_gap_i
    bounds = []
    for item in candidates:
        # Default gap if not provided, though it's better to have real data
        gap = item.get('funding_gap', donation_amount * 10) # Fallback to 10x
        bounds.append((0, float(gap)))
    
    # If total gap is less than donation_amount, linprog might fail or we should cap it
    total_gap = sum(b for a, b in bounds)
    if total_gap < donation_amount:
        # Just use what we have, cap the equality to total_gap
        b_eq = [total_gap]

    res = linprog(c, A_eq=A_eq, b_eq=b_eq, bounds=bounds, method='highs')
    
    if res.success:
        splits = []
        for i, val in enumerate(res.x):
            score = candidates[i]['aiScore']
            is_match = candidates[i].get('category') in donor_causes
            
            reason = "Maximum Priority + Cause Match Bonus applied." if (score > 85 and is_match) else \
                     "Urgency Impact: High humanitarian ROI." if score > 70 else \
                     "Cause Alignment: Optimized for your preferred sectors." if is_match else \
                     "Stabilization Fund: Allocation for verified need."
            
            splits.append({
                "targetId": candidates[i]['_id'],
                "targetType": candidates[i].get('type', 'Need'),
                "title": candidates[i]['title'],
                "ngoId": candidates[i]['ngoId'],
                "ngoName": candidates[i].get('ngoName', 'Verified NGO'),
                "category": candidates[i].get('category', 'Humanitarian'),
                "amount": round(val, 2),
                "percentage": round((val / donation_amount) * 100, 1) if donation_amount > 0 else 0,
                "reason": reason
            })
        return splits
    return []

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
