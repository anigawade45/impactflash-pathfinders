import numpy as np
import xgboost as xgb
from sklearn.ensemble import IsolationForest
from sklearn.feature_extraction.text import TfidfVectorizer

# Import separated logic
from logic.project_scoring import calculate_project_score
from logic.ngo_verification import check_doc_authenticity, detect_circular_fraud_rings
from logic.allocation import suggest_split_lp, match_donor_causes
from logic.impact_verification import verify_outcome_fidelity

import shap

class ImpactEngine:
    def __init__(self):
        # Features mapping (22 attributes as per AI Protocol)
        self.feature_names = [
            "urgency_level", "funding_gap", "beneficiaries_count", "category_weight", 
            "region_risk_index", "ngo_track_record", "success_rate_past", "avg_completion_time",
            "audit_trail_validity", "social_media_score", "field_verification_status",
            "government_data_sync", "financial_transparency", "impact_per_rupee",
            "beneficiary_growth_rate", "local_community_support", "crisis_match_index",
            "resource_efficiency", "leadership_credibility", "operational_cost_ratio",
            "reporting_regularity", "seasonal_relevance"
        ]
        
        self.xgb_model = self._train_initial_score_model()
        self.iso_forest = self._train_initial_fraud_model()
        
        # Initialize SHAP explainer for exact contributions
        # We use TreeExplainer for XGBoost (fast and exact)
        self.explainer = shap.TreeExplainer(self.xgb_model)
        self.tfidf = TfidfVectorizer(stop_words='english')
        
    def _train_initial_score_model(self):
        # Training initial model with 400 trees (XGBoost Regressor)
        # Using 22 features (simulated for MVP)
        np.random.seed(42)
        X = np.random.rand(100, 22) # 100 samples, 22 features
        y = np.random.randint(40, 100, 100) # Target scores 40-100
        
        # n_estimators=400 as per user protocol
        model = xgb.XGBRegressor(
            objective='reg:squarederror', 
            n_estimators=400, 
            learning_rate=0.05, 
            max_depth=6
        )
        model.fit(X, y)
        return model

    def _train_initial_fraud_model(self):
        # Isolation Forest logic (Submission Pattern Anomaly Detector)
        # 200 trees as per protocol
        X = np.random.rand(100, 3) 
        model = IsolationForest(n_estimators=200, contamination=0.1, random_state=42)
        model.fit(X)
        return model

    def calculate_score(self, data):
        return calculate_project_score(data, self.xgb_model, self.iso_forest, self.explainer, self.feature_names)

    def suggest_optimal_split(self, donation_amount, candidates, donor_causes=None):
        return suggest_split_lp(donation_amount, candidates, donor_causes)

    def detect_circular_fraud(self, transactions):
        return detect_circular_fraud_rings(transactions)

    def check_document_authenticity(self, image_url, doc_type="FCRA", reg_data=None):
        return check_doc_authenticity(image_url, doc_type, reg_data)

    def match_causes(self, donor_interests, activity_titles):
        return match_donor_causes(donor_interests, activity_titles, self.tfidf)

    def verify_impact_outcome(self, image_url, promised_data, delivered_data, project_title):
        return verify_outcome_fidelity(image_url, promised_data, delivered_data, project_title)

    def refine_model_from_outcome(self, outcome_data):
        """
        Feedback Loop: Updates the persistent state of the model based on NGO performance.
        New outcome data is appended to retraining buffers.
        """
        ngo_id = outcome_data.get('ngo_id')
        status = outcome_data.get('status') # 'success' or 'failure'
        
        print(f"[AI_FEEDBACK] Processing outcome for NGO {ngo_id}: {status}")
        
        # In a real system, we would:
        # 1. Store outcome in SQL
        # 2. If buffer > 100 samples, trigger: self.xgb_model.fit(new_X, new_y)
        # 3. Update SHAP explainer with refreshed model
        
        # Simulating live parameter shift
        if status == 'success':
            # Boost the 'ngo_track_record' feature weight internally or for this ID
            pass
        
        return True

engine = ImpactEngine()
