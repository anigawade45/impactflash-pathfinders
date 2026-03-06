import numpy as np
import xgboost as xgb
from sklearn.ensemble import IsolationForest
from sklearn.feature_extraction.text import TfidfVectorizer

# Import separated logic
from logic.project_scoring import calculate_project_score
from logic.ngo_verification import check_doc_authenticity, detect_circular_fraud_rings
from logic.allocation import suggest_split_lp, match_donor_causes

class ImpactEngine:
    def __init__(self):
        # Initialize models with heuristic training (MVP)
        self.xgb_model = self._train_initial_score_model()
        self.iso_forest = self._train_initial_fraud_model()
        self.tfidf = TfidfVectorizer(stop_words='english')
        
    def _train_initial_score_model(self):
        # Features: [urgency_level(1-3), deadline_days, amount_normalized, category_rank]
        # We want urgency to be the strongest weight.
        X = np.array([
            [3, 2, 0.1, 1], # Extreme urgency, immediate deadline
            [3, 7, 0.5, 1], # High urgency, 1 week deadline
            [2, 30, 0.3, 2], # Medium urgency, 1 month
            [1, 90, 0.8, 3], # Low urgency, long term
            [1, 15, 0.1, 1], # Low urgency, short term
        ])
        y = np.array([98, 90, 70, 40, 50])
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
        return calculate_project_score(data, self.xgb_model, self.iso_forest)

    def suggest_optimal_split(self, donation_amount, candidates):
        return suggest_split_lp(donation_amount, candidates)

    def detect_circular_fraud(self, transactions):
        return detect_circular_fraud_rings(transactions)

    def check_document_authenticity(self, image_url, doc_type="FCRA", reg_data=None):
        return check_doc_authenticity(image_url, doc_type, reg_data)

    def match_causes(self, donor_interests, activity_titles):
        return match_donor_causes(donor_interests, activity_titles, self.tfidf)

engine = ImpactEngine()
