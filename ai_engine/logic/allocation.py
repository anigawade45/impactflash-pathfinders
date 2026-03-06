import numpy as np
from scipy.optimize import linprog
from sklearn.metrics.pairwise import cosine_similarity

def suggest_split_lp(donation_amount, candidates):
    """
    Linear Programming (LP) Optimizer for Multi-NGO Allocation
    Objective: Maximize Impact (Score * Allocation)
    """
    if not candidates or len(candidates) < 1:
        return []

    # Objective: Maximize AI score (linprog minimizes, so negate)
    c = [-item['aiScore'] for item in candidates]
    
    # Constraint: sum(x) = total
    A_eq = [[1 for _ in candidates]]
    b_eq = [donation_amount]
    
    # 2. alloc_i >= donation_amount * 0.1 (Min 10% per NGO for meaningful impact)
    # 3. alloc_i >= 100 (Absolute minimum per NGO)
    # Bounds: Ensure decent split (10% to 90%)
    bounds = [(max(100, donation_amount * 0.1), donation_amount * 0.9) for _ in candidates]
    
    # Handle single candidate
    if len(candidates) == 1:
        bounds = [(donation_amount, donation_amount)]

    res = linprog(c, A_eq=A_eq, b_eq=b_eq, bounds=bounds, method='highs')
    
    if res.success:
        splits = []
        for i, val in enumerate(res.x):
            score = candidates[i]['aiScore']
            reason = "Primary Priority: Maximum urgency detected." if score > 85 else \
                     "Impact Optimized: High ROI for humanitarian spend." if score > 70 else \
                     "Stability Bias: Support for verified consistent operations."
            
            splits.append({
                "targetId": candidates[i]['_id'],
                "targetType": candidates[i].get('type', 'Need'),
                "title": candidates[i]['title'],
                "ngoId": candidates[i]['ngoId'],
                "ngoName": candidates[i].get('ngoName', 'Verified NGO'),
                "category": candidates[i].get('category', 'Humanitarian'),
                "amount": round(val, 2),
                "percentage": round((val / donation_amount) * 100, 1),
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
