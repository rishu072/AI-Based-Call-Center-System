"""
AI Smart Call Center - AI Service
Handles AI-related functionality including intent detection, response generation,
and IVR-style conversation flow with multilingual support (English, Hindi, Gujarati)
"""

import re
from typing import Dict, List, Optional, Tuple

# Import VMC service for sub-category handling
try:
    from services.vmc_service import get_vmc_service
except ImportError:
    get_vmc_service = None


class AIService:
    """Service class for AI-related functionality with multilingual support"""
    
    def __init__(self):
        # Initialize VMC service
        self.vmc_service = get_vmc_service() if get_vmc_service else None
        
        # Multi-language complaint keywords
        self.complaint_keywords = {
            'Street Light': {
                'en': ['light', 'lamp', 'street light', 'pole', 'dark', 'bulb', 'electricity', 'lighting', 'streetlight'],
                'hi': ['लाइट', 'बत्ती', 'खंभा', 'बिजली', 'अंधेरा', 'बल्ब', 'स्ट्रीट लाइट'],
                'gu': ['લાઇટ', 'બત્તી', 'થાંભલો', 'વીજળી', 'અંધારું', 'બલ્બ', 'સ્ટ્રીટ લાઇટ']
            },
            'Water Supply': {
                'en': ['water', 'supply', 'pipe', 'leakage', 'tap', 'plumbing', 'no water', 'dirty water'],
                'hi': ['पानी', 'सप्लाई', 'पाइप', 'नल', 'लीकेज', 'जल', 'गंदा पानी'],
                'gu': ['પાણી', 'સપ્લાય', 'પાઈપ', 'નળ', 'ગળતર', 'ગંદુ પાણી']
            },
            'Road Damage': {
                'en': ['road', 'pothole', 'damage', 'crack', 'street', 'asphalt', 'pavement', 'broken road', 'pit', 'hole'],
                'hi': ['सड़क', 'गड्ढा', 'टूटी सड़क', 'रास्ता', 'खराब सड़क', 'गड्डा'],
                'gu': ['રસ્તો', 'ખાડો', 'તૂટેલો રસ્તો', 'સડક', 'ખરાબ રસ્તો']
            },
            'Garbage': {
                'en': ['garbage', 'waste', 'trash', 'rubbish', 'cleanup', 'dustbin', 'dump', 'sanitation', 'dirty', 'smell'],
                'hi': ['कचरा', 'कूड़ा', 'गंदगी', 'डस्टबिन', 'सफाई', 'बदबू'],
                'gu': ['કચરો', 'કચરાપેટી', 'ગંદકી', 'ડસ્ટબિન', 'સફાઈ', 'વાસ']
            },
            'Drainage': {
                'en': ['drain', 'drainage', 'sewer', 'gutter', 'blocked drain', 'overflow', 'manhole', 'sewage'],
                'hi': ['नाली', 'गटर', 'सीवर', 'मैनहोल', 'उभरना', 'बहाव'],
                'gu': ['ડ્રેન', 'ગટર', 'નાળું', 'મેનહોલ', 'ઊભરાવું']
            }
        }
        
        # Multilingual greetings
        self.greetings = {
            'en': [
                "Hello! Welcome to Vadodara Nagar Samwad - AI Smart Call Center.",
                "Hi! How can I assist you today?",
                "Welcome! I'm here to help register your complaint."
            ],
            'hi': [
                "नमस्ते! वडोदरा नगर संवाद - AI स्मार्ट कॉल सेंटर में आपका स्वागत है।",
                "नमस्कार! आज मैं आपकी कैसे मदद कर सकता हूं?",
                "स्वागत है! मैं आपकी शिकायत दर्ज करने में मदद के लिए यहां हूं।"
            ],
            'gu': [
                "નમસ્તે! વડોદરા નગર સંવાદ - AI સ્માર્ટ કોલ સેન્ટરમાં આપનું સ્વાગત છે.",
                "હેલો! આજે હું તમારી કેવી રીતે મદદ કરી શકું?",
                "સ્વાગત છે! હું તમારી ફરિયાદ નોંધવામાં મદદ માટે અહીં છું."
            ]
        }
        
        # Multilingual confirmations
        self.confirmations = {
            'en': [
                "I've registered your complaint successfully.",
                "Your complaint has been recorded in our system.",
                "Thank you for reporting this issue. We'll take action soon."
            ],
            'hi': [
                "मैंने आपकी शिकायत सफलतापूर्वक दर्ज कर ली है।",
                "आपकी शिकायत हमारे सिस्टम में दर्ज हो गई है।",
                "इस समस्या की रिपोर्ट करने के लिए धन्यवाद। हम जल्द ही कार्रवाई करेंगे।"
            ],
            'gu': [
                "મેં તમારી ફરિયાદ સફળતાપૂર્વક નોંધી લીધી છે.",
                "તમારી ફરિયાદ અમારી સિસ્ટમમાં નોંધાઈ ગઈ છે.",
                "આ સમસ્યાની જાણ કરવા બદલ આભાર. અમે જલ્દી પગલાં લઈશું."
            ]
        }
        
        # Current conversation context
        self.conversation_state = {}
    
    def get_language_code(self, language: str) -> str:
        """Convert language code to simple format"""
        lang_map = {
            'en': 'en', 'en-US': 'en', 'en-IN': 'en',
            'hi': 'hi', 'hi-IN': 'hi',
            'gu': 'gu', 'gu-IN': 'gu'
        }
        return lang_map.get(language, 'en')
    
    def detect_complaint_type(self, text: str, language: str = None) -> Optional[str]:
        """
        Detect complaint type from user input text (supports English, Hindi, Gujarati)
        
        Args:
            text: User input text
            language: Optional language hint (en, hi, gu)
            
        Returns:
            Detected complaint type or None
        """
        if not text:
            return None
            
        text_lower = text.lower()
        
        # Count matching keywords for each type across all languages
        scores: Dict[str, int] = {}
        for complaint_type, lang_keywords in self.complaint_keywords.items():
            score = 0
            # Check keywords in all languages
            for lang, keywords in lang_keywords.items():
                for keyword in keywords:
                    if keyword.lower() in text_lower or keyword in text:
                        score += 1
            if score > 0:
                scores[complaint_type] = score
        
        # Return type with highest score
        if scores:
            return max(scores, key=scores.get)
        
        return None
    
    def detect_with_sub_category(self, text: str, language: str = 'en') -> Dict:
        """
        Detect complaint type and sub-category from text
        
        Args:
            text: User input text
            language: Language code
            
        Returns:
            Dict with complaint_type and sub_category
        """
        complaint_type = self.detect_complaint_type(text, language)
        sub_category = None
        
        if complaint_type and self.vmc_service:
            sub_category = self.vmc_service.detect_sub_category(complaint_type, text)
        
        return {
            'complaint_type': complaint_type,
            'sub_category': sub_category,
            'confidence': 'high' if sub_category else ('medium' if complaint_type else 'low')
        }
    
    def extract_location(self, text: str) -> Dict[str, str]:
        """
        Extract location information from text
        
        Args:
            text: User input text
            
        Returns:
            Dictionary with location components
        """
        location = {
            'area': '',
            'ward': '',
            'zone': ''
        }
        
        # Ward detection
        ward_match = re.search(r'ward\s*(\d+)', text.lower())
        if ward_match:
            location['ward'] = f"Ward {ward_match.group(1)}"
        
        # Zone detection
        zones = ['North', 'South', 'East', 'West', 'Central']
        for zone in zones:
            if zone.lower() in text.lower():
                location['zone'] = zone
                break
        
        return location
    
    def extract_phone_number(self, text: str) -> Optional[str]:
        """
        Extract phone number from text
        
        Args:
            text: User input text
            
        Returns:
            Extracted phone number or None
        """
        # Pattern for Indian phone numbers
        phone_patterns = [
            r'\b(\d{10})\b',                    # 10 digits
            r'\b(\d{3}[-\s]?\d{3}[-\s]?\d{4})\b',  # XXX-XXX-XXXX
            r'\b\+91[-\s]?(\d{10})\b'           # +91 prefix
        ]
        
        for pattern in phone_patterns:
            match = re.search(pattern, text)
            if match:
                return re.sub(r'[-\s]', '', match.group(1))
        
        return None
    
    def generate_response(self, intent: str, data: dict = None, language: str = 'en') -> str:
        """
        Generate AI response based on intent in specified language
        
        Args:
            intent: User intent (e.g., 'greeting', 'complaint', 'confirmation')
            data: Optional additional data
            language: Language code (en, hi, gu)
            
        Returns:
            Generated response text in specified language
        """
        lang = self.get_language_code(language)
        
        # Multilingual response templates
        responses = {
            'greeting': {
                'en': "Hello! Welcome to Vadodara Nagar Samwad - AI Smart Call Center. How can I help you today?",
                'hi': "नमस्ते! वडोदरा नगर संवाद में आपका स्वागत है। आज मैं आपकी कैसे मदद कर सकता हूं?",
                'gu': "નમસ્તે! વડોદરા નગર સંવાદમાં આપનું સ્વાગત છે. આજે હું તમારી કેવી રીતે મદદ કરી શકું?"
            },
            'ask_complaint_type': {
                'en': "What type of complaint would you like to register? You can choose from: Street Light, Water Supply, Road Damage, Garbage, or Drainage.",
                'hi': "आप किस प्रकार की शिकायत दर्ज करना चाहते हैं? आप चुन सकते हैं: स्ट्रीट लाइट, पानी की आपूर्ति, सड़क क्षति, कचरा, या नाली।",
                'gu': "તમે કયા પ્રકારની ફરિયાદ નોંધાવવા માંગો છો? તમે પસંદ કરી શકો છો: સ્ટ્રીટ લાઇટ, પાણી પુરવઠો, રસ્તાનું નુકસાન, કચરો, અથવા ડ્રેનેજ."
            },
            'ask_sub_category': {
                'en': "Please describe more specifically what the issue is with the {complaint_type}?",
                'hi': "{complaint_type} में क्या समस्या है, कृपया विस्तार से बताएं?",
                'gu': "{complaint_type} માં શું સમસ્યા છે, કૃપા કરીને વિગતવાર જણાવો?"
            },
            'ask_location': {
                'en': "Please provide the location details. Tell me the area name, landmark, or address where this issue is.",
                'hi': "कृपया स्थान का विवरण दें। मुझे बताएं कि यह समस्या किस क्षेत्र, लैंडमार्क या पते पर है।",
                'gu': "કૃપા કરીને સ્થાનની વિગતો આપો. મને જણાવો કે આ સમસ્યા કયા વિસ્તાર, લેન્ડમાર્ક અથવા સરનામે છે."
            },
            'ask_ward': {
                'en': "Which ward number is this location in? If you don't know, tell me the nearest landmark.",
                'hi': "यह स्थान किस वार्ड नंबर में है? अगर नहीं पता तो निकटतम लैंडमार्क बताएं।",
                'gu': "આ સ્થાન કયા વોર્ડ નંબરમાં છે? જો ખબર ન હોય તો નજીકનું લેન્ડમાર્ક જણાવો."
            },
            'ask_phone': {
                'en': "Please provide your contact phone number so we can reach you with updates.",
                'hi': "कृपया अपना संपर्क फोन नंबर दें ताकि हम आपको अपडेट दे सकें।",
                'gu': "કૃપા કરીને તમારો સંપર્ક ફોન નંબર આપો જેથી અમે તમને અપડેટ આપી શકીએ."
            },
            'confirm_complaint': {
                'en': "Let me confirm - you're reporting a {complaint_type} issue at {area}, {ward}, {zone}. Is this correct?",
                'hi': "मैं पुष्टि कर रहा हूं - आप {area}, {ward}, {zone} में {complaint_type} की समस्या की रिपोर्ट कर रहे हैं। क्या यह सही है?",
                'gu': "હું ખાતરી કરું છું - તમે {area}, {ward}, {zone} માં {complaint_type} સમસ્યાની જાણ કરી રહ્યા છો. શું આ સાચું છે?"
            },
            'submission_success': {
                'en': "Your complaint has been registered successfully! Your complaint ID is {complaint_id}. Please save this ID to track your complaint status. Our team will address this issue soon.",
                'hi': "आपकी शिकायत सफलतापूर्वक दर्ज हो गई है! आपका शिकायत ID {complaint_id} है। कृपया अपनी शिकायत की स्थिति ट्रैक करने के लिए इस ID को सहेजें। हमारी टीम जल्द ही इस समस्या का समाधान करेगी।",
                'gu': "તમારી ફરિયાદ સફળતાપૂર્વક નોંધાઈ ગઈ છે! તમારો ફરિયાદ ID {complaint_id} છે. કૃપા કરીને તમારી ફરિયાદની સ્થિતિ ટ્રૅક કરવા માટે આ ID સાચવો. અમારી ટીમ જલ્દી જ આ સમસ્યાનું સમાધાન કરશે."
            },
            'clarification': {
                'en': "I'm sorry, I didn't understand that. Could you please repeat or describe your issue again?",
                'hi': "मुझे खेद है, मुझे समझ नहीं आया। कृपया दोबारा बताएं या अपनी समस्या का वर्णन करें।",
                'gu': "મને માફ કરશો, મને સમજાયું નહીં. કૃપા કરીને ફરીથી કહો અથવા તમારી સમસ્યાનું વર્ણન કરો."
            },
            'error': {
                'en': "I apologize, but there was an error processing your request. Please try again.",
                'hi': "मुझे खेद है, आपके अनुरोध को प्रोसेस करने में त्रुटि हुई। कृपया पुनः प्रयास करें।",
                'gu': "મને માફ કરશો, પણ તમારી વિનંતી પ્રોસેસ કરવામાં ભૂલ થઈ. કૃપા કરીને ફરીથી પ્રયાસ કરો."
            },
            'goodbye': {
                'en': "Thank you for using Vadodara Nagar Samwad. Have a great day!",
                'hi': "वडोदरा नगर संवाद का उपयोग करने के लिए धन्यवाद। आपका दिन शुभ हो!",
                'gu': "વડોદરા નગર સંવાદનો ઉપયોગ કરવા બદલ આભાર. તમારો દિવસ શુભ રહે!"
            },
            'auto_detected_location': {
                'en': "I've identified your location as {area} in {ward}, {zone} Zone. Is this correct?",
                'hi': "मैंने आपका स्थान {ward}, {zone} ज़ोन में {area} के रूप में पहचाना है। क्या यह सही है?",
                'gu': "મેં તમારું સ્થાન {ward}, {zone} ઝોનમાં {area} તરીકે ઓળખ્યું છે. શું આ સાચું છે?"
            },
            'priority_high': {
                'en': "This appears to be an urgent issue. We've marked it as HIGH PRIORITY and will address it immediately.",
                'hi': "यह एक जरूरी समस्या लगती है। हमने इसे उच्च प्राथमिकता के रूप में चिह्नित किया है और तुरंत इसका समाधान करेंगे।",
                'gu': "આ એક તાકીદનો મુદ્દો લાગે છે. અમે તેને ઉચ્ચ પ્રાથમિકતા તરીકે ચિહ્નિત કર્યો છે અને તરત જ તેનું સમાધાન કરીશું."
            }
        }
        
        # Get response template
        response_templates = responses.get(intent, responses['clarification'])
        response = response_templates.get(lang, response_templates.get('en', ''))
        
        # Format response with data if provided
        if data:
            try:
                response = response.format(**data)
            except KeyError:
                pass
        
        return response
    
    def get_ivr_question(self, complaint_type: str, language: str = 'en') -> str:
        """
        Get IVR-style follow-up question for a complaint type
        
        Args:
            complaint_type: The detected complaint type
            language: Language code
            
        Returns:
            IVR question in the specified language
        """
        if self.vmc_service:
            return self.vmc_service.get_ivr_question(complaint_type, 'initial', self.get_language_code(language))
        
        # Fallback questions
        return self.generate_response('ask_sub_category', {'complaint_type': complaint_type}, language)
    
    def process_input(self, text: str, context: dict = None) -> dict:
        """
        Process user input and determine appropriate action
        
        Args:
            text: User input text
            context: Current conversation context
            
        Returns:
            Dictionary with action and response
        """
        context = context or {}
        
        # Detect complaint type
        complaint_type = self.detect_complaint_type(text)
        
        # Extract location
        location = self.extract_location(text)
        
        # Extract phone
        phone = self.extract_phone_number(text)
        
        result = {
            'detected_complaint_type': complaint_type,
            'location': location,
            'phone_number': phone,
            'response': '',
            'next_action': ''
        }
        
        # Determine next action based on what we have
        if not context.get('complaint_type') and complaint_type:
            result['response'] = self.generate_response('ask_location')
            result['next_action'] = 'get_location'
        elif not context.get('phone_number') and phone:
            result['response'] = self.generate_response('confirm_complaint', context)
            result['next_action'] = 'confirm'
        else:
            result['response'] = self.generate_response('ask_complaint_type')
            result['next_action'] = 'get_complaint_type'
        
        return result
    
    def get_complaint_summary(self, complaint_data: dict) -> str:
        """
        Generate a summary of the complaint for confirmation
        
        Args:
            complaint_data: Complaint information
            
        Returns:
            Summary text
        """
        summary_parts = []
        
        if complaint_data.get('complaint_type'):
            summary_parts.append(f"Complaint Type: {complaint_data['complaint_type']}")
        
        if complaint_data.get('area'):
            summary_parts.append(f"Location: {complaint_data['area']}")
        
        if complaint_data.get('ward'):
            summary_parts.append(f"Ward: {complaint_data['ward']}")
        
        if complaint_data.get('zone'):
            summary_parts.append(f"Zone: {complaint_data['zone']}")
        
        if complaint_data.get('description'):
            summary_parts.append(f"Description: {complaint_data['description']}")
        
        return "\n".join(summary_parts)


# Singleton instance
ai_service = AIService()


def get_ai_service() -> AIService:
    """Get the AI service instance"""
    return ai_service
