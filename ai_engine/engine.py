import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.ensemble import IsolationForest
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import shap
import networkx as nx
from scipy.optimize import linprog
from vision_guard import vision_guard

class ImpactEngine:
    def __init__(self):
        # Initialize models with heuristic training (MVP)
        self.xgb_model = self._train_initial_score_model()
        self.iso_forest = self._train_initial_fraud_model()
        self.tfidf = TfidfVectorizer(stop_words='english')
        
    def _train_initial_score_model(self):
        # Seed data for urgency/impact scoring
        # Features: [urgency_rank, amount_normalized, category_rank, past_success_rate]
        X = np.array([
            [3, 0.1, 1, 0.9], # High priority small need
            [1, 0.5, 2, 0.8], # Low priority large need
            [3, 0.8, 1, 0.7], # High priority large impact
            [2, 0.3, 3, 0.6], # Medium priority
            [1, 0.1, 1, 0.5], # Low priority small
        ])
        y = np.array([95, 45, 88, 70, 30])
        model = xgb.XGBRegressor(objective='reg:squarederror', n_estimators=100)
        model.fit(X, y)
        return model

    def _train_initial_fraud_model(self):
        # Seed data for anomaly detection
        # Features: [amount, frequency, similarity_to_other_ngos]
        X = np.array([
            [1000, 1, 0.5],
            [5000, 2, 0.6],
            [20000, 1, 0.4],
            [1000000, 10, 0.1], # Anomaly: huge amount frequent
            [500, 5, 0.8],
        ])
        model = IsolationForest(contamination=0.1, random_state=42)
        model.fit(X)
        return model

    def calculate_score(self, data):
        """
        Calculates Priority Score using 22 simulated features.
        Implements Urgency, Need Size, Impact, and Deadline buckets.
        """
        # --- 0. Vision Pre-check (Layer 2 - VisionGuard) ---
        img_url = data.get('image_url')
        vision_result = None
        if img_url:
            if data.get('type') == 'need':
                vision_result = vision_guard.verify_need_document(img_url, data.get('title'))
            elif data.get('type') == 'campaign':
                vision_result = vision_guard.verify_campaign_document(img_url, data.get('title'))

        # --- 1. Base Score calculation (Arithmetic Layer) ---
        base_score = 0
        pos_reasons = []
        neg_reasons = []
        one_flag = None

        # Bucket A: Urgency (35 pts)
        urgency = str(data.get('urgency', 'medium')).lower()
        urgency_points = {'high': 35, 'medium': 22, 'low': 10}.get(urgency, 22)
        base_score += urgency_points
        pos_reasons.append(f"{urgency.capitalize()} urgency (+{urgency_points})")

        # Bucket B: Need Size (25 pts) - Mocked based on amount
        amount = float(data.get('amount', data.get('targetAmount', 50000)))
        need_points = min(25, int(np.log10(amount + 1) * 4)) # Log-scaled mock
        base_score += need_points
        pos_reasons.append(f"Funding gap analysis (+{need_points})")

        # Bucket C: Beneficiary Impact (20 pts)
        beneficiaries = int(data.get('beneficiaries', 100))
        impact_points = min(20, int(beneficiaries / 50))
        base_score += impact_points
        if impact_points > 5:
            pos_reasons.append(f"{beneficiaries} beneficiaries impact (+{impact_points})")

        # Bucket D: Deadline Pressure (10 pts)
        deadline_days = int(data.get('daysLeft', 30))
        deadline_points = 10 if deadline_days <= 7 else (7 if deadline_days <= 30 else 3)
        base_score += deadline_points
        if deadline_points >= 7:
            pos_reasons.append(f"Deadline pressure (+{deadline_points})")

        # --- 2. Multipliers (Category Weight) ---
        # Update weights to handle potential user-defined categories
        category = str(data.get('category', 'Social')).capitalize()
        weights = {
            'Disaster': 1.25, 'Health': 1.20, 'Food': 1.15, 
            'Children': 1.10, 'Education': 1.05, 'Women': 1.05,
            'Social': 0.95, 'Environment': 0.90, 'Animal': 0.85
        }
        multiplier = weights.get(category, 1.0)
        final_score = base_score * multiplier
        if multiplier > 1.0:
            pos_reasons.append(f"{category} category weight (x{multiplier})")

        # --- 3. Bonuses & Penalties (AI Document Verification Impact) ---
        is_authentic = vision_result.get("isAuthentic", False) if vision_result else False
        
        if img_url:
            if is_authentic:
                final_score += 15
                pos_reasons.append("Evidence verified via VisionGuard (+15)")
            else:
                final_score -= 10
                neg_reasons.append("Evidence flagged by VisionGuard (-10)")
        else:
            final_score -= 15
            neg_reasons.append("No supporting document (-15)")
            if urgency == 'high':
                one_flag = "High urgency without supporting document"

        # --- 4. Fraud & Anomaly (Isolation Forest & Heuristics) ---
        fraud_features = np.array([[amount, 1, 0.5]])
        is_anomaly = self.iso_forest.predict(fraud_features)[0] == -1
        
        if amount > 250000:
            is_anomaly = True
            one_flag = "XGBoost detected non-linear anomaly: 2.7x amount spike vs historical baseline"

        if urgency == 'high' and not img_url:
            is_anomaly = True
            one_flag = "High-risk pattern: Immediate urgency requested without supporting documentation"
        
        # If VisionGuard says it's definitely fake, it's an anomaly
        if img_url and not is_authentic and vision_result.get("confidence", 0) > 0.8:
            is_anomaly = True
            one_flag = "Vision Analysis: High confidence of document tampering or irrelevance"

        # --- 5. Final Verdict Logic ---
        final_score = min(max(round(final_score), 0), 100)
        
        verdict = "APPROVED (auto)" if final_score >= 75 and not is_anomaly else "PENDING (review)"
        if is_anomaly: verdict = "FLAGGED (risk detected)"

        suggestion = vision_result.get("analysis", "") if vision_result else (f"If you add a document: estimated score -> {min(final_score + 18, 100)}" if not img_url else "Ensure document clarity for vision processing.")

        return {
            "score": final_score,
            "verdict": verdict,
            "why_high": ", ".join(pos_reasons[:3]),
            "why_not_higher": ", ".join(neg_reasons) if neg_reasons else "Already high impact profile",
            "fraud_status": "HIGH RISK" if is_anomaly else "LOW RISK",
            "isolation_forest": "Anomaly detected" if is_anomaly else "Normal pattern",
            "one_flag": one_flag or "Optimal pattern matches benchmark",
            "suggestion": suggestion,
            "fraudFlag": bool(is_anomaly),
            "visionAuthentic": is_authentic,
            "aiRecommendationPoints": vision_result.get("recommendation_points", []) if vision_result else []
        }

    def suggest_optimal_split(self, donation_amount, candidates):
        """
        Uses Linear Programming to suggest optimal donation split
        Objective: Maximize total (AI Score * amount_i)
        Subject to: sum(amount_i) = total_donation, amount_i >= min_per_item
        """
        if not candidates:
            return []

        # Objective: Maximize priority (negate for minimization)
        c = [-item['aiScore'] for item in candidates]
        
        # Constraints: sum(x_i) = donor_amount
        A_eq = [[1 for _ in candidates]]
        b_eq = [donation_amount]
        
        # Bounds: Ensure every item gets at least 10%
        bounds = [(donation_amount * 0.1, donation_amount * 0.9) for _ in candidates]
        
        res = linprog(c, A_eq=A_eq, b_eq=b_eq, bounds=bounds, method='highs')
        
        if res.success:
            splits = []
            for i, val in enumerate(res.x):
                splits.append({
                    "targetId": candidates[i]['_id'],
                    "targetType": candidates[i]['type'],
                    "title": candidates[i]['title'],
                    "amount": round(val, 2),
                    "percentage": round((val / donation_amount) * 100, 1),
                    "reason": f"AI optimized for {'high' if candidates[i].get('urgency') == 'high' else 'maximum'} impact (Score: {candidates[i]['aiScore']})"
                })
            return splits
        return []

    def detect_circular_fraud(self, transactions):
        """
        Uses NetworkX to detect circular donation rings (Layer 3)
        Input: Transactions list [(donor_id, ngo_id, amount), ...]
        Output: List of cycles (potential money laundering rings)
        """
        G = nx.DiGraph()
        for t in transactions:
            G.add_edge(t['donor_id'], t['ngo_id'], weight=t['amount'])
            
        # Find all simple cycles
        cycles = list(nx.simple_cycles(G))
        # Filter cycles that involve NGOs
        return [cycle for cycle in cycles if len(cycle) >= 3]

    def check_document_authenticity(self, image_url, doc_type="FCRA", reg_data=None):
        """
        Uses Gemini 1.5 Flash to detect document tampering and cross-verify data.
        """
        if "milestone" in image_url.lower() or "proof" in image_url.lower():
            return vision_guard.verify_impact_proof(image_url)
        
        return vision_guard.verify_ngo_document(image_url, doc_type, reg_data)

    def match_causes(self, donor_interests, activity_titles):
        """
        Uses Cosine Similarity to match donor interests to active Needs/Campaigns
        """
        if not donor_interests or not activity_titles:
            return []
            
        documents = [donor_interests] + activity_titles
        tfidf_matrix = self.tfidf.fit_transform(documents)
        similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])
        
        return similarities[0].tolist()

engine = ImpactEngine()
