"""
AI Smart Call Center - Text-to-Speech Service
Uses Google Text-to-Speech (gTTS) for voice response generation
"""

import os
import hashlib
from typing import Optional
from gtts import gTTS


class TTSService:
    """Service class for Text-to-Speech functionality using gTTS"""
    
    def __init__(self, cache_dir: str = "audio_cache"):
        self.cache_dir = cache_dir
        self._ensure_cache_dir()
        
        # Language mapping
        self.language_map = {
            "en": "en",
            "en-US": "en",
            "en-IN": "en",
            "hi": "hi",
            "hi-IN": "hi",
            "gu": "gu",
            "gu-IN": "gu"
        }
    
    def _ensure_cache_dir(self):
        """Ensure cache directory exists"""
        if not os.path.exists(self.cache_dir):
            os.makedirs(self.cache_dir)
    
    def _get_cache_filename(self, text: str, language: str) -> str:
        """Generate a unique filename based on text and language"""
        text_hash = hashlib.md5(f"{text}_{language}".encode()).hexdigest()
        return os.path.join(self.cache_dir, f"tts_{text_hash}.mp3")
    
    def generate_audio(self, text: str, language: str = "en") -> str:
        """
        Generate audio file from text
        
        Args:
            text: Text to convert to speech
            language: Language code (en, hi, gu)
            
        Returns:
            Path to generated audio file
        """
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")
        
        # Map language code
        lang_code = self.language_map.get(language, "en")
        
        # Check cache
        cache_path = self._get_cache_filename(text, lang_code)
        if os.path.exists(cache_path):
            return cache_path
        
        # Generate audio using gTTS
        try:
            tts = gTTS(text=text, lang=lang_code, slow=False)
            tts.save(cache_path)
            return cache_path
        except Exception as e:
            raise RuntimeError(f"Failed to generate audio: {str(e)}")
    
    def generate_welcome_message(self, language: str = "en") -> str:
        """Generate welcome message audio"""
        messages = {
            "en": "Welcome to AI Smart Call Center. How can I help you today?",
            "hi": "एआई स्मार्ट कॉल सेंटर में आपका स्वागत है। मैं आज आपकी कैसे मदद कर सकता हूं?",
            "gu": "AI સ્માર્ટ કોલ સેન્ટરમાં આપનું સ્વાગત છે. હું આજે તમારી કેવી રીતે મદદ કરી શકું?"
        }
        
        lang_code = self.language_map.get(language, "en")
        message = messages.get(lang_code, messages["en"])
        
        return self.generate_audio(message, lang_code)
    
    def generate_complaint_response(self, complaint_type: str, language: str = "en") -> str:
        """Generate response for complaint type selection"""
        responses = {
            "en": f"You have selected {complaint_type}. Please provide the location details.",
            "hi": f"आपने {complaint_type} चुना है। कृपया स्थान का विवरण दें।",
            "gu": f"તમે {complaint_type} પસંદ કર્યું છે. કૃપા કરીને સ્થાન વિગતો આપો."
        }
        
        lang_code = self.language_map.get(language, "en")
        response = responses.get(lang_code, responses["en"])
        
        return self.generate_audio(response, lang_code)
    
    def generate_success_message(self, complaint_id: str, language: str = "en") -> str:
        """Generate success message with complaint ID"""
        messages = {
            "en": f"Your complaint has been registered successfully. Your complaint ID is {complaint_id}. Please save this for future reference.",
            "hi": f"आपकी शिकायत सफलतापूर्वक दर्ज हो गई है। आपका शिकायत आईडी {complaint_id} है। कृपया इसे भविष्य के संदर्भ के लिए सहेजें।",
            "gu": f"તમારી ફરિયાદ સફળતાપૂર્વક નોંધાઈ ગઈ છે. તમારો ફરિયાદ ID {complaint_id} છે. કૃપા કરીને ભવિષ્યના સંદર્ભ માટે આ સાચવો."
        }
        
        lang_code = self.language_map.get(language, "en")
        message = messages.get(lang_code, messages["en"])
        
        return self.generate_audio(message, lang_code)
    
    def clear_cache(self):
        """Clear all cached audio files"""
        if os.path.exists(self.cache_dir):
            for file in os.listdir(self.cache_dir):
                file_path = os.path.join(self.cache_dir, file)
                if file.endswith(".mp3"):
                    os.remove(file_path)


# Singleton instance
tts_service = TTSService()


def get_tts_service() -> TTSService:
    """Get the TTS service instance"""
    return tts_service
