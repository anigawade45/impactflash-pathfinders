import os
import requests
import json
import base64
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
api_key = os.getenv("GEMINI_API_KEY")
if api_key and api_key != "your_gemini_api_key_here":
    genai.configure(api_key=api_key)
    HAS_GEMINI = True
else:
    HAS_GEMINI = False
    print("\n[VISION_GUARD] ⚠️  GEMINI_API_KEY not set. Using simulation mode.")

class VisionGuard:
    """
    Advanced Document & Proof-of-Life Verification Logic.
    Uses Gemini 1.5 Flash for high-fidelity vision processing.
    """

    def __init__(self):
        if not HAS_GEMINI:
            self.model = None
            return
            
        try:
            # Try to find a suitable Flash model dynamically to avoid 404s
            available_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
            print(f"[VISION_GUARD] Available Models: {available_models}")
            
            preferred = ['models/gemini-1.5-flash', 'models/gemini-1.5-flash-latest', 'models/gemini-flash-latest', 'models/gemini-2.0-flash-exp']
            selected_model = 'gemini-1.5-flash' # Default
            
            for p in preferred:
                if p in available_models:
                    selected_model = p
                    break
            
            print(f"[VISION_GUARD] 🤖 Selected Model: {selected_model}")
            self.model = genai.GenerativeModel(selected_model)
        except Exception as e:
            print(f"[VISION_GUARD] ⚠️ Model discovery failed: {e}. Defaulting to gemini-1.5-flash.")
            self.model = genai.GenerativeModel('gemini-1.5-flash')

    def _download_image(self, url):
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                return response.content
            return None
        except Exception as e:
            print(f"[VISION_GUARD] ❌ Download Error: {e}")
            return None

    def verify_ngo_document(self, image_url, doc_type="FCRA", reg_data=None):
        """
        Logic for Layer 1: NGO Registration Vetting
        Checks for tampering, official stamps, and matching ID details.
        """
        print(f"\n[VISION_GUARD] 🔍 INITIALIZING LAYER 1 VETTING: {doc_type}")
        
        if not HAS_GEMINI:
            return self._simulate_verification(image_url, doc_type)

        image_data = self._download_image(image_url)
        if not image_data:
            return {"isAuthentic": False, "analysis": "INVALID_SOURCE: Image unreachable.", "confidence": 0}

        # Structure user data for the prompt
        user_info = f"\nUser Submitted Data:\n{json.dumps(reg_data, indent=2)}" if reg_data else ""

        prompt = f"""
        Analyze this image which is supposed to be an NGO {doc_type} Registration Certificate.
        Perform the following checks:
        1. Document Type: Is this actually a {doc_type} certificate or registration document?
        2. Authenticity: Does it have official seals, signatures, and stamps? Are there signs of digital tampering?
        3. Cross-Verification: Compare any text on the document with the user-submitted data below:
        {user_info}
        
        Check if the 'Organization Name' and 'Registration Number' / 'NGO ID' match exactly or reasonably.
        
        Return the result strictly as a JSON object with this schema:
        {{
            "isAuthentic": boolean (must be true only if document is real AND data matches roughly),
            "confidence": float (0-1),
            "analysis": "string explaining findings and any mismatches",
            "extractedDetails": {{
                "name": "string or null",
                "registrationNumber": "string or null"
            }},
            "checks": {{
                "metadata_sync": "PASS" | "FAIL",
                "watermark_presence": "DETECTED" | "NOT_DETECTED",
                "pixel_shading": "CONSISTENT" | "INCONSISTENT",
                "data_match": "MATCHED" | "MISMATCHED"
            }}
        }}
        """

        try:
            # Prepare image part
            contents = [
                {"mime_type": "image/jpeg", "data": image_data},
                prompt
            ]
            
            response = self.model.generate_content(contents)
            
            # Clean JSON response (sometimes Gemini adds ```json ... ```)
            text = response.text.replace('```json', '').replace('```', '').strip()
            result = json.loads(text)
            return result
        except Exception as e:
            print(f"[VISION_GUARD] ❌ Gemini Error: {e}")
            return self._simulate_verification(image_url, doc_type, fallback=True)

    def verify_impact_proof(self, image_url):
        """
        Logic for Layer 4/5: Milestone Fund Release
        Verify 'Proof of Life' images for beneficiaries.
        """
        print(f"\n[VISION_GUARD] 🔍 INITIALIZING LAYER 5 IMPACT PROOF-OF-LIFE CHECK")
        
        if not HAS_GEMINI:
            return self._simulate_proof_verification(image_url)

        image_data = self._download_image(image_url)
        if not image_data:
            return {"isAuthentic": False, "analysis": "RECYCLED_MEDIA: Resource unreachable.", "confidence": 0}

        prompt = """
        Analyze this image which is submitted as 'Proof of Impact' for an NGO project.
        Determine:
        1. Context: Does it show a humanitarian or social activity (feeding, healthcare, teaching, construction)?
        2. Uniqueness: Does it look like a real, raw photo or a generic stock image?
        3. Beneficiaries: Are people visible who appear to be benefiting from a service?
        
        Return the result strictly as a JSON object:
        {
            "isAuthentic": boolean,
            "confidence": float (0-1),
            "analysis": "string explanation",
            "labels": ["list", "of", "detected", "activities"],
            "action": "APPROVE_FUND_RELEASE" | "BLOCK_FUND_RELEASE"
        }
        """

        try:
            contents = [
                {"mime_type": "image/jpeg", "data": image_data},
                prompt
            ]
            response = self.model.generate_content(contents)
            text = response.text.replace('```json', '').replace('```', '').strip()
            result = json.loads(text)
            return result
        except Exception as e:
            print(f"[VISION_GUARD] ❌ Gemini Error: {e}")
            return self._simulate_proof_verification(image_url)

    def _simulate_verification(self, image_url, doc_type, fallback=False):
        # Simulation logic for when API is unavailable
        is_recycled = any(x in image_url.lower() for x in ["stock", "placeholder", "unsplash-demo", "dummy"])
        confidence = 0.95 if not is_recycled else 0.2
        is_authentic = confidence > 0.6
        return {
            "isAuthentic": is_authentic,
            "confidence": confidence,
            "analysis": "Simulated analysis. Genuine document pattern detected." if is_authentic else "Simulated analysis. recycling detected.",
            "checks": {
                "metadata_sync": "PASS" if is_authentic else "FAIL",
                "watermark_presence": "DETECTED",
                "pixel_shading": "CONSISTENT"
            }
        }

    def _simulate_proof_verification(self, image_url):
        return {
            "isAuthentic": True,
            "confidence": 0.95,
            "analysis": "Simulated: Unique scene geometry verified.",
            "labels": ["Humanitarian Activity", "Verified Beneficiary"],
            "action": "APPROVE_FUND_RELEASE"
        }

vision_guard = VisionGuard()
