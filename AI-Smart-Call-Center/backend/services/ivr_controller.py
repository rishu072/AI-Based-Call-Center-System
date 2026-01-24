"""
AI-Powered IVR Controller for Government Citizen Complaint System
Handles call-center style IVR conversation flow with state management
Supports: English, Hindi (Hinglish acceptable)

This is the core IVR brain that:
1. Understands the caller's spoken issue (converted to text)
2. Identifies the complaint category clearly
3. Asks ONLY the next most relevant question
4. Never asks unnecessary or repeated questions
5. Works like a call-center IVR, not a chatbot
"""

import json
import re
from typing import Dict, Optional, Tuple
from datetime import datetime

# Try to import VMC service for location detection
try:
    from services.vmc_service import get_vmc_service
except ImportError:
    get_vmc_service = None


class IVRController:
    """
    AI-Powered IVR Controller for Government Citizen Complaint System
    
    Supported complaint categories:
    - Street Light
    - Water Supply
    - Garbage / Sanitation
    - Road Damage
    - Other
    
    Supported languages:
    - English
    - Hindi (Hinglish acceptable)
    """
    
    # Conversation states
    STATE_GREETING = "greeting"
    STATE_ASK_ISSUE = "ask_issue"
    STATE_DETECT_CATEGORY = "detect_category"
    STATE_ASK_SUB_CATEGORY = "ask_sub_category"
    STATE_ASK_LOCATION = "ask_location"
    STATE_ASK_LANDMARK = "ask_landmark"
    STATE_ASK_PHONE = "ask_phone"
    STATE_CONFIRM = "confirm"
    STATE_COMPLETE = "complete"
    
    # Valid complaint categories
    COMPLAINT_CATEGORIES = [
        "Street Light",
        "Water Supply",
        "Garbage",
        "Road Damage",
        "Other"
    ]
    
    def __init__(self):
        """Initialize the IVR Controller"""
        self.vmc_service = get_vmc_service() if get_vmc_service else None
        
        # Multi-language keyword patterns for complaint detection
        self.category_keywords = {
            "Street Light": {
                "en": ["light", "lamp", "street light", "pole", "dark", "bulb", "streetlight", "no light", "broken light"],
                "hi": ["लाइट", "बत्ती", "खंभा", "बिजली", "अंधेरा", "बल्ब", "light nahi", "light band", "light kharab"]
            },
            "Water Supply": {
                "en": ["water", "supply", "pipe", "leakage", "tap", "no water", "dirty water", "water problem"],
                "hi": ["पानी", "सप्लाई", "पाइप", "नल", "लीकेज", "pani nahi", "pani band", "pani ganda", "pipeline"]
            },
            "Garbage": {
                "en": ["garbage", "waste", "trash", "rubbish", "dustbin", "sanitation", "dirty", "smell", "cleaning"],
                "hi": ["कचरा", "कूड़ा", "गंदगी", "सफाई", "बदबू", "kachra", "kuda", "safai nahi", "gandgi"]
            },
            "Road Damage": {
                "en": ["road", "pothole", "damage", "crack", "street", "broken road", "pit", "hole", "asphalt"],
                "hi": ["सड़क", "गड्ढा", "टूटी सड़क", "रास्ता", "खराब सड़क", "sadak", "gadda", "road kharab", "road toota"]
            }
        }
        
        # Sub-category questions per category
        self.sub_category_questions = {
            "Street Light": {
                "en": "Is the light not working, flickering, or is the pole damaged?",
                "hi": "Kya light band hai, jhilmila rahi hai, ya pole tuta hua hai?"
            },
            "Water Supply": {
                "en": "Is there no water supply, low pressure, or pipe leakage?",
                "hi": "Kya pani nahi aa raha, kam pressure hai, ya pipe leak hai?"
            },
            "Garbage": {
                "en": "Is garbage not collected, dustbin overflowing, or bad smell issue?",
                "hi": "Kya kachra nahi uthaya gaya, dustbin bhar gaya, ya badbu ki samasya hai?"
            },
            "Road Damage": {
                "en": "Is there a pothole, road crack, or waterlogging on the road?",
                "hi": "Kya sadak mein gadda hai, daraar hai, ya pani jamaa hai?"
            },
            "Other": {
                "en": "Please briefly describe your issue.",
                "hi": "Kripya apni samasya ka varnan karein."
            }
        }
    
    def create_session(self) -> Dict:
        """Create a new IVR session with empty state"""
        return {
            "session_id": datetime.now().strftime("%Y%m%d%H%M%S"),
            "state": self.STATE_GREETING,
            "language": "en",
            "collected_data": {
                "category": None,
                "sub_category": None,
                "description": None,
                "location": None,
                "landmark": None,
                "phone": None,
                "ward": None,
                "zone": None
            },
            "conversation_history": [],
            "created_at": datetime.now().isoformat()
        }
    
    def process_input(self, user_input: str, session: Dict) -> Dict:
        """
        Process user input and return the next IVR response
        
        Args:
            user_input: Text from speech-to-text conversion
            session: Current session state
            
        Returns:
            JSON response with next action and IVR message
        """
        # Detect language from input
        language = self._detect_language(user_input)
        session["language"] = language
        
        # Add to conversation history
        session["conversation_history"].append({
            "role": "user",
            "text": user_input,
            "timestamp": datetime.now().isoformat()
        })
        
        # Process based on current state
        current_state = session["state"]
        
        if current_state == self.STATE_GREETING:
            return self._handle_greeting(user_input, session)
        
        elif current_state == self.STATE_ASK_ISSUE:
            return self._handle_issue_detection(user_input, session)
        
        elif current_state == self.STATE_ASK_SUB_CATEGORY:
            return self._handle_sub_category(user_input, session)
        
        elif current_state == self.STATE_ASK_LOCATION:
            return self._handle_location(user_input, session)
        
        elif current_state == self.STATE_ASK_LANDMARK:
            return self._handle_landmark(user_input, session)
        
        elif current_state == self.STATE_ASK_PHONE:
            return self._handle_phone(user_input, session)
        
        elif current_state == self.STATE_CONFIRM:
            return self._handle_confirmation(user_input, session)
        
        elif current_state == self.STATE_COMPLETE:
            return self._generate_response(
                session,
                "Your complaint is already registered.",
                "Aapki shikayat pehle se darj hai.",
                self.STATE_COMPLETE,
                is_complete=True
            )
        
        # Default: Ask for the issue
        return self._generate_response(
            session,
            "Please describe your complaint.",
            "Kripya apni shikayat batayein.",
            self.STATE_ASK_ISSUE
        )
    
    def _detect_language(self, text: str) -> str:
        """Detect if input is in Hindi or English"""
        # Check for Devanagari characters (Hindi)
        if re.search(r'[\u0900-\u097F]', text):
            return "hi"
        
        # Check for common Hindi/Hinglish transliteration patterns
        hinglish_patterns = [
            r'\b(hai|nahi|kya|mein|ko|ka|ki|ke|aur|yeh|woh|kaise|kab|kahan|kripya)\b',
            r'\b(haan|ji|theek|sahi|galat|band|chalu|kharab|kaam|bol|bolo|suniye)\b'
        ]
        
        for pattern in hinglish_patterns:
            if re.search(pattern, text.lower()):
                return "hi"
        
        return "en"
    
    def _detect_category(self, text: str) -> Optional[str]:
        """Detect complaint category from user input"""
        text_lower = text.lower()
        scores = {}
        
        for category, lang_keywords in self.category_keywords.items():
            score = 0
            for lang, keywords in lang_keywords.items():
                for keyword in keywords:
                    if keyword.lower() in text_lower:
                        score += 1
            if score > 0:
                scores[category] = score
        
        if scores:
            return max(scores, key=scores.get)
        
        return None
    
    def _extract_phone(self, text: str) -> Optional[str]:
        """Extract phone number from text"""
        # Remove spaces and common separators
        cleaned = re.sub(r'[\s\-\.]', '', text)
        
        # Pattern for 10-digit Indian phone number
        match = re.search(r'(?:\+91)?(\d{10})', cleaned)
        if match:
            return match.group(1)
        
        # Try to find any 10-digit sequence
        match = re.search(r'\d{10}', cleaned)
        if match:
            return match.group()
        
        return None
    
    def _extract_location_info(self, text: str) -> Dict:
        """Extract location components from text"""
        location = {
            "area": text.strip(),
            "ward": None,
            "zone": None
        }
        
        # Ward detection
        ward_match = re.search(r'ward\s*(?:no\.?\s*)?(\d+)', text.lower())
        if ward_match:
            location["ward"] = f"Ward {ward_match.group(1)}"
        
        # Zone detection
        zones = ["North", "South", "East", "West", "Central"]
        for zone in zones:
            if zone.lower() in text.lower():
                location["zone"] = zone
                break
        
        # Use VMC service if available for better location detection
        if self.vmc_service and location["area"]:
            try:
                vmc_location = self.vmc_service.detect_location(location["area"])
                if vmc_location and vmc_location.get("success"):
                    location.update(vmc_location.get("location", {}))
            except Exception:
                pass
        
        return location
    
    def _handle_greeting(self, user_input: str, session: Dict) -> Dict:
        """Handle initial greeting state"""
        # Try to detect if user directly mentioned their issue
        category = self._detect_category(user_input)
        
        if category:
            session["collected_data"]["category"] = category
            session["collected_data"]["description"] = user_input
            
            # Move to sub-category question
            question = self.sub_category_questions.get(category, self.sub_category_questions["Other"])
            return self._generate_response(
                session,
                question["en"],
                question["hi"],
                self.STATE_ASK_SUB_CATEGORY
            )
        
        # No category detected, ask for issue
        return self._generate_response(
            session,
            "Namaste. Welcome to Municipal Complaint Helpline. Please describe your complaint.",
            "Namaste. Nagar Nigam Shikayat Helpline mein aapka swagat hai. Kripya apni shikayat batayein.",
            self.STATE_ASK_ISSUE
        )
    
    def _handle_issue_detection(self, user_input: str, session: Dict) -> Dict:
        """Handle issue description and detect category"""
        category = self._detect_category(user_input)
        
        if category:
            session["collected_data"]["category"] = category
            session["collected_data"]["description"] = user_input
            
            # Ask sub-category question
            question = self.sub_category_questions.get(category, self.sub_category_questions["Other"])
            return self._generate_response(
                session,
                question["en"],
                question["hi"],
                self.STATE_ASK_SUB_CATEGORY
            )
        
        # Could not detect category, assign to "Other"
        session["collected_data"]["category"] = "Other"
        session["collected_data"]["description"] = user_input
        
        # Ask for location directly
        return self._generate_response(
            session,
            "Your issue has been noted. Please provide the location address.",
            "Aapki samasya note ki gayi. Kripya pata batayein jahaan samasya hai.",
            self.STATE_ASK_LOCATION
        )
    
    def _handle_sub_category(self, user_input: str, session: Dict) -> Dict:
        """Handle sub-category response"""
        session["collected_data"]["sub_category"] = user_input
        
        # Ask for location
        return self._generate_response(
            session,
            "Where is this issue located? Please provide the area name and address.",
            "Yeh samasya kahan hai? Kripya area ka naam aur pata batayein.",
            self.STATE_ASK_LOCATION
        )
    
    def _handle_location(self, user_input: str, session: Dict) -> Dict:
        """Handle location input"""
        location_info = self._extract_location_info(user_input)
        session["collected_data"]["location"] = location_info["area"]
        session["collected_data"]["ward"] = location_info.get("ward")
        session["collected_data"]["zone"] = location_info.get("zone")
        
        # If ward/zone detected, skip landmark, ask for phone
        if location_info.get("ward") or location_info.get("zone"):
            return self._generate_response(
                session,
                "Please provide your mobile number for follow-up.",
                "Kripya apna mobile number batayein follow-up ke liye.",
                self.STATE_ASK_PHONE
            )
        
        # Ask for landmark for better location
        return self._generate_response(
            session,
            "Any nearby landmark? This helps us locate the issue faster.",
            "Koi najdeeki landmark? Isse hum jaldi madad kar sakte hain.",
            self.STATE_ASK_LANDMARK
        )
    
    def _handle_landmark(self, user_input: str, session: Dict) -> Dict:
        """Handle landmark input"""
        session["collected_data"]["landmark"] = user_input
        
        # Ask for phone number
        return self._generate_response(
            session,
            "Please provide your mobile number for follow-up.",
            "Kripya apna mobile number batayein follow-up ke liye.",
            self.STATE_ASK_PHONE
        )
    
    def _handle_phone(self, user_input: str, session: Dict) -> Dict:
        """Handle phone number input"""
        phone = self._extract_phone(user_input)
        
        if phone:
            session["collected_data"]["phone"] = phone
            
            # Generate confirmation message
            data = session["collected_data"]
            location_str = data.get("location", "")
            if data.get("landmark"):
                location_str += f", near {data['landmark']}"
            
            confirm_en = (f"Confirm: {data['category']} complaint at {location_str}. "
                         f"Contact: {phone}. Say 'yes' to confirm or 'no' to cancel.")
            confirm_hi = (f"Prishti karein: {data['category']} shikayat {location_str} par. "
                         f"Sampark: {phone}. 'Haan' bolein confirm ke liye, 'Na' cancel ke liye.")
            
            return self._generate_response(
                session,
                confirm_en,
                confirm_hi,
                self.STATE_CONFIRM
            )
        
        # Invalid phone, ask again
        return self._generate_response(
            session,
            "Please provide a valid 10-digit mobile number.",
            "Kripya 10 ank ka sahi mobile number batayein.",
            self.STATE_ASK_PHONE
        )
    
    def _handle_confirmation(self, user_input: str, session: Dict) -> Dict:
        """Handle yes/no confirmation"""
        text_lower = user_input.lower()
        
        # Check for affirmative response
        affirmative = ["yes", "haan", "ha", "ji", "correct", "sahi", "theek", "confirm", "ok", "okay"]
        negative = ["no", "nahi", "na", "galat", "cancel", "wrong"]
        
        if any(word in text_lower for word in affirmative):
            # Generate complaint ID
            complaint_id = self._generate_complaint_id(session)
            session["collected_data"]["complaint_id"] = complaint_id
            session["state"] = self.STATE_COMPLETE
            
            success_en = (f"Your complaint has been registered. "
                         f"Complaint ID: {complaint_id}. "
                         f"Please save this ID to track status. Thank you.")
            success_hi = (f"Aapki shikayat darj ho gayi hai. "
                         f"Shikayat ID: {complaint_id}. "
                         f"Kripya yeh ID surakshit rakhein status ke liye. Dhanyavaad.")
            
            return self._generate_response(
                session,
                success_en,
                success_hi,
                self.STATE_COMPLETE,
                is_complete=True,
                complaint_id=complaint_id
            )
        
        if any(word in text_lower for word in negative):
            # Reset to ask issue again
            session["collected_data"] = {
                "category": None,
                "sub_category": None,
                "description": None,
                "location": None,
                "landmark": None,
                "phone": None,
                "ward": None,
                "zone": None
            }
            
            return self._generate_response(
                session,
                "Cancelled. Please describe your complaint again.",
                "Radd kiya gaya. Kripya dubara apni shikayat batayein.",
                self.STATE_ASK_ISSUE
            )
        
        # Unclear response
        return self._generate_response(
            session,
            "Please say 'yes' to confirm or 'no' to cancel.",
            "Kripya 'haan' bolein confirm ke liye ya 'na' cancel ke liye.",
            self.STATE_CONFIRM
        )
    
    def _generate_complaint_id(self, session: Dict) -> str:
        """Generate a unique complaint ID"""
        category = session["collected_data"].get("category", "OTH")
        category_codes = {
            "Street Light": "SL",
            "Water Supply": "WS",
            "Garbage": "GB",
            "Road Damage": "RD",
            "Other": "OT"
        }
        code = category_codes.get(category, "OT")
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        return f"VMC-{code}-{timestamp}"
    
    def _generate_response(
        self,
        session: Dict,
        message_en: str,
        message_hi: str,
        next_state: str,
        is_complete: bool = False,
        complaint_id: str = None
    ) -> Dict:
        """Generate JSON response for IVR"""
        language = session.get("language", "en")
        message = message_hi if language == "hi" else message_en
        
        session["state"] = next_state
        
        # Add to conversation history
        session["conversation_history"].append({
            "role": "assistant",
            "text": message,
            "timestamp": datetime.now().isoformat()
        })
        
        response = {
            "success": True,
            "session_id": session.get("session_id"),
            "state": next_state,
            "language": language,
            "message": message,
            "is_complete": is_complete,
            "collected_data": session["collected_data"],
            "next_expected_input": self._get_expected_input(next_state)
        }
        
        if complaint_id:
            response["complaint_id"] = complaint_id
        
        return response
    
    def _get_expected_input(self, state: str) -> str:
        """Get description of expected input for the state"""
        expected = {
            self.STATE_GREETING: "greeting or complaint description",
            self.STATE_ASK_ISSUE: "complaint description",
            self.STATE_ASK_SUB_CATEGORY: "specific issue details",
            self.STATE_ASK_LOCATION: "location/address",
            self.STATE_ASK_LANDMARK: "nearby landmark",
            self.STATE_ASK_PHONE: "10-digit mobile number",
            self.STATE_CONFIRM: "yes/no confirmation",
            self.STATE_COMPLETE: "none - complaint registered"
        }
        return expected.get(state, "text input")


# Singleton instance
ivr_controller = IVRController()


def get_ivr_controller() -> IVRController:
    """Get the IVR controller instance"""
    return ivr_controller


def process_ivr_input(user_input: str, session: Dict = None) -> Dict:
    """
    Main function to process IVR input
    
    Args:
        user_input: Text from speech-to-text
        session: Current session state (None to create new)
        
    Returns:
        JSON response with IVR action
    """
    controller = get_ivr_controller()
    
    if session is None:
        session = controller.create_session()
    
    return controller.process_input(user_input, session)
