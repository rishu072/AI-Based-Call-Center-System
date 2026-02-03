"""
VMC (Vadodara Municipal Corporation) Service
Handles VMC-specific logic including ward/zone mapping, 
complaint sub-categories, and VMC software integration
"""

from typing import Dict, List, Optional
from datetime import datetime


class VMCService:
    """Service class for VMC-specific functionality"""
    
    def __init__(self):
        # VMC Zone Configuration - Vadodara Municipal Corporation
        self.zones = {
            'North': {'id': 'N', 'name_gu': 'ઉત્તર', 'name_hi': 'उत्तर'},
            'South': {'id': 'S', 'name_gu': 'દક્ષિણ', 'name_hi': 'दक्षिण'},
            'East': {'id': 'E', 'name_gu': 'પૂર્વ', 'name_hi': 'पूर्व'},
            'West': {'id': 'W', 'name_gu': 'પશ્ચિમ', 'name_hi': 'पश्चिम'},
            'Central': {'id': 'C', 'name_gu': 'મધ્ય', 'name_hi': 'मध्य'}
        }
        
        # VMC Ward Configuration (1-19 wards for Vadodara)
        self.wards = self._initialize_wards()
        
        # Complaint Categories with Sub-Categories
        self.complaint_categories = {
            'Street Light': {
                'id': 'SL',
                'name_gu': 'સ્ટ્રીટ લાઇટ',
                'name_hi': 'स्ट्रीट लाइट',
                'icon': '💡',
                'sub_categories': {
                    'light_off': {
                        'en': 'Light is not working / Off',
                        'gu': 'લાઇટ બંધ છે / કામ નથી કરતી',
                        'hi': 'लाइट बंद है / काम नहीं कर रही'
                    },
                    'pole_damaged': {
                        'en': 'Pole is damaged / Tilted',
                        'gu': 'થાંભલો તૂટેલો / નમેલો છે',
                        'hi': 'खंभा टूटा / झुका हुआ है'
                    },
                    'current_leakage': {
                        'en': 'Current leakage / Electric shock hazard',
                        'gu': 'વીજળી ગળતી / ઝટકો લાગે છે',
                        'hi': 'करंट लग रहा है / बिजली का झटका'
                    },
                    'flickering': {
                        'en': 'Light is flickering',
                        'gu': 'લાઇટ ઝબકી રહી છે',
                        'hi': 'लाइट टिमटिमा रही है'
                    },
                    'dim_light': {
                        'en': 'Light is dim / Low brightness',
                        'gu': 'લાઇટ ઝાંખી છે',
                        'hi': 'लाइट धीमी / कम है'
                    },
                    'wire_issue': {
                        'en': 'Wire hanging / Exposed wire',
                        'gu': 'વાયર લટકી રહ્યો છે',
                        'hi': 'तार लटक रहा है'
                    }
                }
            },
            'Water Supply': {
                'id': 'WS',
                'name_gu': 'પાણી પુરવઠો',
                'name_hi': 'पानी की आपूर्ति',
                'icon': '💧',
                'sub_categories': {
                    'no_water': {
                        'en': 'No water supply',
                        'gu': 'પાણી આવતું નથી',
                        'hi': 'पानी नहीं आ रहा'
                    },
                    'low_pressure': {
                        'en': 'Low water pressure',
                        'gu': 'પાણીનું દબાણ ઓછું છે',
                        'hi': 'पानी का प्रेशर कम है'
                    },
                    'dirty_water': {
                        'en': 'Dirty / Contaminated water',
                        'gu': 'ગંદુ / દૂષિત પાણી',
                        'hi': 'गंदा / दूषित पानी'
                    },
                    'pipe_leakage': {
                        'en': 'Pipe leakage',
                        'gu': 'પાઈપમાં ગળતર',
                        'hi': 'पाइप में लीकेज'
                    },
                    'main_line_burst': {
                        'en': 'Main water line burst',
                        'gu': 'મુખ્ય પાણીની લાઇન ફાટી',
                        'hi': 'मुख्य पानी की लाइन फट गई'
                    },
                    'irregular_supply': {
                        'en': 'Irregular water supply timing',
                        'gu': 'અનિયમિત પાણી આવે છે',
                        'hi': 'अनियमित पानी की सप्लाई'
                    },
                    'meter_issue': {
                        'en': 'Water meter not working',
                        'gu': 'વોટર મીટર કામ નથી કરતું',
                        'hi': 'वाटर मीटर काम नहीं कर रहा'
                    }
                }
            },
            'Road Damage': {
                'id': 'RD',
                'name_gu': 'રસ્તાનું નુકસાન',
                'name_hi': 'सड़क क्षति',
                'icon': '🛣️',
                'sub_categories': {
                    'pothole': {
                        'en': 'Pothole on road',
                        'gu': 'રસ્તામાં ખાડો',
                        'hi': 'सड़क पर गड्ढा'
                    },
                    'road_broken': {
                        'en': 'Road surface broken / Damaged',
                        'gu': 'રસ્તો તૂટેલો / ખરાબ',
                        'hi': 'सड़क टूटी / खराब'
                    },
                    'waterlogging': {
                        'en': 'Water logging on road',
                        'gu': 'રસ્તા પર પાણી ભરાય છે',
                        'hi': 'सड़क पर पानी भर जाता है'
                    },
                    'footpath_damaged': {
                        'en': 'Footpath / Sidewalk damaged',
                        'gu': 'ફૂટપાથ ખરાબ છે',
                        'hi': 'फुटपाथ खराब है'
                    },
                    'divider_damaged': {
                        'en': 'Road divider damaged',
                        'gu': 'ડિવાઇડર ખરાબ છે',
                        'hi': 'डिवाइडर खराब है'
                    },
                    'speed_breaker': {
                        'en': 'Speed breaker issue',
                        'gu': 'સ્પીડ બ્રેકર સમસ્યા',
                        'hi': 'स्पीड ब्रेकर समस्या'
                    }
                }
            },
            'Garbage': {
                'id': 'GB',
                'name_gu': 'કચરો',
                'name_hi': 'कचरा',
                'icon': '🗑️',
                'sub_categories': {
                    'not_collected': {
                        'en': 'Garbage not collected',
                        'gu': 'કચરો ઉપાડવામાં નથી આવતો',
                        'hi': 'कचरा नहीं उठाया जा रहा'
                    },
                    'overflowing_bin': {
                        'en': 'Overflowing garbage bin',
                        'gu': 'કચરાપેટી ભરાઈ ગઈ છે',
                        'hi': 'कचरा पेटी भर गई है'
                    },
                    'illegal_dumping': {
                        'en': 'Illegal garbage dumping',
                        'gu': 'ગેરકાનૂની રીતે કચરો નાખવો',
                        'hi': 'अवैध कचरा डंपिंग'
                    },
                    'no_dustbin': {
                        'en': 'No dustbin in area',
                        'gu': 'વિસ્તારમાં ડસ્ટબિન નથી',
                        'hi': 'क्षेत्र में डस्टबिन नहीं है'
                    },
                    'dead_animal': {
                        'en': 'Dead animal on road',
                        'gu': 'રસ્તા પર મરેલું પ્રાણી',
                        'hi': 'सड़क पर मृत पशु'
                    },
                    'construction_waste': {
                        'en': 'Construction waste / Debris',
                        'gu': 'બાંધકામનો કચરો',
                        'hi': 'निर्माण कचरा / मलबा'
                    }
                }
            },
            'Drainage': {
                'id': 'DR',
                'name_gu': 'ડ્રેનેજ',
                'name_hi': 'नाली',
                'icon': '🚿',
                'sub_categories': {
                    'drain_blocked': {
                        'en': 'Drain is blocked',
                        'gu': 'ડ્રેન બ્લોક છે',
                        'hi': 'नाली बंद है'
                    },
                    'drain_overflow': {
                        'en': 'Drain overflowing',
                        'gu': 'ડ્રેન ઊભરાઈ રહી છે',
                        'hi': 'नाली उभर रही है'
                    },
                    'no_drain': {
                        'en': 'No drainage system',
                        'gu': 'ડ્રેનેજ સિસ્ટમ નથી',
                        'hi': 'नाली व्यवस्था नहीं है'
                    },
                    'bad_smell': {
                        'en': 'Bad smell from drain',
                        'gu': 'ડ્રેનમાંથી ગંદી વાસ',
                        'hi': 'नाली से बदबू आ रही है'
                    },
                    'manhole_open': {
                        'en': 'Manhole cover missing / Open',
                        'gu': 'મેનહોલ ખુલ્લો છે',
                        'hi': 'मैनहोल खुला है'
                    }
                }
            },
            'Other': {
                'id': 'OT',
                'name_gu': 'અન્ય',
                'name_hi': 'अन्य',
                'icon': '📝',
                'sub_categories': {
                    'tree_fallen': {
                        'en': 'Tree fallen / Dangerous tree',
                        'gu': 'ઝાડ પડી ગયું / ખતરનાક ઝાડ',
                        'hi': 'पेड़ गिर गया / खतरनाक पेड़'
                    },
                    'mosquito': {
                        'en': 'Mosquito breeding',
                        'gu': 'મચ્છરોનો ઉપદ્રવ',
                        'hi': 'मच्छर पैदा हो रहे हैं'
                    },
                    'stray_animals': {
                        'en': 'Stray animal nuisance',
                        'gu': 'રખડતા પશુઓનો ઉપદ્રવ',
                        'hi': 'आवारा पशुओं की समस्या'
                    },
                    'encroachment': {
                        'en': 'Illegal encroachment',
                        'gu': 'ગેરકાનૂની દબાણ',
                        'hi': 'अवैध अतिक्रमण'
                    },
                    'general': {
                        'en': 'Other / General complaint',
                        'gu': 'અન્ય / સામાન્ય ફરિયાદ',
                        'hi': 'अन्य / सामान्य शिकायत'
                    }
                }
            },
            'Sanitation': {
                'id': 'SN',
                'name_gu': 'સ્વચ્છતા',
                'name_hi': 'स्वच्छता',
                'icon': '🧹',
                'sub_categories': {
                    'public_toilet': {
                        'en': 'Public toilet cleaning required',
                        'gu': 'જાહેર શૌચાલય સફાઈ જરૂરી',
                        'hi': 'सार्वजनिक शौचालय सफाई आवश्यक'
                    },
                    'open_defecation': {
                        'en': 'Open defecation issue',
                        'gu': 'ખુલ્લામાં શૌચ સમસ્યા',
                        'hi': 'खुले में शौच समस्या'
                    },
                    'mosquito_breeding': {
                        'en': 'Mosquito breeding / Stagnant water',
                        'gu': 'મચ્છર ઉત્પત્તિ / ભરાયેલું પાણી',
                        'hi': 'मच्छर प्रजनन / रुका हुआ पानी'
                    },
                    'public_place_dirty': {
                        'en': 'Public place is dirty',
                        'gu': 'જાહેર સ્થળ ગંદું છે',
                        'hi': 'सार्वजनिक स्थान गंदा है'
                    },
                    'urination_spot': {
                        'en': 'Public urination spot',
                        'gu': 'જાહેરમાં પેશાબ કરવાનું સ્થળ',
                        'hi': 'सार्वजनिक पेशाब स्थल'
                    }
                }
            }
        }
        
        # Known landmarks and areas in Vadodara for auto-detection
        self.vadodara_areas = self._initialize_vadodara_areas()
        
        # IVR Questions for each complaint type
        self.ivr_questions = self._initialize_ivr_questions()
    
    def _initialize_wards(self) -> Dict:
        """Initialize Vadodara ward configuration"""
        wards = {}
        # Vadodara has 19 wards
        ward_zones = {
            1: 'Central', 2: 'Central', 3: 'North', 4: 'North',
            5: 'East', 6: 'East', 7: 'South', 8: 'South',
            9: 'West', 10: 'West', 11: 'Central', 12: 'North',
            13: 'East', 14: 'South', 15: 'West', 16: 'Central',
            17: 'North', 18: 'South', 19: 'East'
        }
        
        for ward_num, zone in ward_zones.items():
            wards[f'Ward {ward_num}'] = {
                'number': ward_num,
                'zone': zone,
                'zone_id': self.zones[zone]['id']
            }
        
        return wards
    
    def _initialize_vadodara_areas(self) -> Dict:
        """Initialize known areas in Vadodara with ward/zone mapping"""
        return {
            # Central Zone
            'alkapuri': {'ward': 'Ward 1', 'zone': 'Central'},
            'sayajigunj': {'ward': 'Ward 1', 'zone': 'Central'},
            'fatehgunj': {'ward': 'Ward 2', 'zone': 'Central'},
            'race course': {'ward': 'Ward 1', 'zone': 'Central'},
            'mandvi': {'ward': 'Ward 11', 'zone': 'Central'},
            'raopura': {'ward': 'Ward 11', 'zone': 'Central'},
            'lehripura': {'ward': 'Ward 16', 'zone': 'Central'},
            'wadi': {'ward': 'Ward 2', 'zone': 'Central'},
            
            # North Zone
            'akota': {'ward': 'Ward 3', 'zone': 'North'},
            'vasna': {'ward': 'Ward 3', 'zone': 'North'},
            'karelibaug': {'ward': 'Ward 4', 'zone': 'North'},
            'gotri': {'ward': 'Ward 12', 'zone': 'North'},
            'subhanpura': {'ward': 'Ward 17', 'zone': 'North'},
            'manjalpur': {'ward': 'Ward 4', 'zone': 'North'},
            'old padra road': {'ward': 'Ward 12', 'zone': 'North'},
            
            # East Zone
            'harni': {'ward': 'Ward 5', 'zone': 'East'},
            'waghodia road': {'ward': 'Ward 5', 'zone': 'East'},
            'gorwa': {'ward': 'Ward 6', 'zone': 'East'},
            'makarpura': {'ward': 'Ward 13', 'zone': 'East'},
            'tandalja': {'ward': 'Ward 19', 'zone': 'East'},
            'sama': {'ward': 'Ward 6', 'zone': 'East'},
            
            # South Zone
            'chhani': {'ward': 'Ward 7', 'zone': 'South'},
            'vadsar': {'ward': 'Ward 8', 'zone': 'South'},
            'bapod': {'ward': 'Ward 14', 'zone': 'South'},
            'atladara': {'ward': 'Ward 18', 'zone': 'South'},
            'tarsali': {'ward': 'Ward 7', 'zone': 'South'},
            'nagarwada': {'ward': 'Ward 8', 'zone': 'South'},
            
            # West Zone
            'productivity road': {'ward': 'Ward 9', 'zone': 'West'},
            'ajwa road': {'ward': 'Ward 10', 'zone': 'West'},
            'nizampura': {'ward': 'Ward 15', 'zone': 'West'},
            'dabhoi road': {'ward': 'Ward 9', 'zone': 'West'},
            'navapura': {'ward': 'Ward 10', 'zone': 'West'},
            'vadiwadi': {'ward': 'Ward 15', 'zone': 'West'},
        }
    
    def _initialize_ivr_questions(self) -> Dict:
        """Initialize IVR-style questions for each complaint type"""
        return {
            'Street Light': {
                'initial': {
                    'en': 'I understand you have a street light issue. Please tell me what is the problem? Is the light off, pole damaged, or is there current leakage?',
                    'gu': 'મને સમજાયું કે તમને સ્ટ્રીટ લાઇટની સમસ્યા છે. મને જણાવો સમસ્યા શું છે? શું લાઇટ બંધ છે, થાંભલો ખરાબ છે, કે વીજળી ગળે છે?',
                    'hi': 'मुझे समझ आया कि आपको स्ट्रीट लाइट की समस्या है। मुझे बताएं समस्या क्या है? क्या लाइट बंद है, खंभा खराब है, या करंट लग रहा है?'
                },
                'sub_question': {
                    'en': 'How many street lights are affected? Is it one light or multiple lights in the area?',
                    'gu': 'કેટલી સ્ટ્રીટ લાઇટ્સને અસર થઈ છે? એક લાઇટ છે કે વિસ્તારમાં ઘણી લાઇટ્સ?',
                    'hi': 'कितनी स्ट्रीट लाइट्स प्रभावित हैं? एक लाइट है या इलाके में कई लाइट्स?'
                }
            },
            'Water Supply': {
                'initial': {
                    'en': 'I understand you have a water supply issue. Please tell me what is the problem? Is there no water, low pressure, dirty water, or pipe leakage?',
                    'gu': 'મને સમજાયું કે તમને પાણીની સમસ્યા છે. મને જણાવો સમસ્યા શું છે? પાણી નથી આવતું, દબાણ ઓછું છે, ગંદુ પાણી આવે છે, કે પાઈપમાં ગળતર છે?',
                    'hi': 'मुझे समझ आया कि आपको पानी की समस्या है। मुझे बताएं समस्या क्या है? पानी नहीं आ रहा, प्रेशर कम है, गंदा पानी आ रहा है, या पाइप में लीकेज है?'
                },
                'sub_question': {
                    'en': 'Since when are you facing this water issue? Is it a daily problem or sudden?',
                    'gu': 'ક્યારથી આ પાણીની સમસ્યા છે? દરરોજની સમસ્યા છે કે અચાનક?',
                    'hi': 'कब से यह पानी की समस्या है? क्या यह रोज़ की समस्या है या अचानक?'
                }
            },
            'Road Damage': {
                'initial': {
                    'en': 'I understand you have a road damage issue. Please tell me what is the problem? Is there a pothole, broken road, or water logging?',
                    'gu': 'મને સમજાયું કે તમને રસ્તાની સમસ્યા છે. મને જણાવો સમસ્યા શું છે? ખાડો છે, રસ્તો તૂટેલો છે, કે પાણી ભરાય છે?',
                    'hi': 'मुझे समझ आया कि आपको सड़क की समस्या है। मुझे बताएं समस्या क्या है? गड्ढा है, सड़क टूटी है, या पानी भर जाता है?'
                },
                'sub_question': {
                    'en': 'What is the approximate size of the pothole or damaged area? Is it dangerous for vehicles?',
                    'gu': 'ખાડા અથવા નુકસાન વિસ્તારનું અંદાજિત કદ શું છે? શું તે વાહનો માટે ખતરનાક છે?',
                    'hi': 'गड्ढे या क्षतिग्रस्त क्षेत्र का अनुमानित आकार क्या है? क्या यह वाहनों के लिए खतरनाक है?'
                }
            },
            'Garbage': {
                'initial': {
                    'en': 'I understand you have a garbage issue. Please tell me what is the problem? Is garbage not collected, bin overflowing, or illegal dumping?',
                    'gu': 'મને સમજાયું કે તમને કચરાની સમસ્યા છે. મને જણાવો સમસ્યા શું છે? કચરો ઉપાડતા નથી, ડસ્ટબિન ઊભરાઈ ગઈ છે, કે ગેરકાયદેસર કચરો નાખે છે?',
                    'hi': 'मुझे समझ आया कि आपको कचरे की समस्या है। मुझे बताएं समस्या क्या है? कचरा नहीं उठाया जा रहा, डस्टबिन भर गई है, या अवैध डंपिंग है?'
                },
                'sub_question': {
                    'en': 'How long has the garbage been lying there? Is it causing health hazard or bad smell?',
                    'gu': 'ક્યારથી કચરો પડ્યો છે? શું તેનાથી આરોગ્યનું જોખમ છે કે ગંદી વાસ આવે છે?',
                    'hi': 'कब से कचरा पड़ा है? क्या इससे स्वास्थ्य का खतरा है या बदबू आ रही है?'
                }
            },
            'Drainage': {
                'initial': {
                    'en': 'I understand you have a drainage issue. Please tell me what is the problem? Is drain blocked, overflowing, or there is bad smell?',
                    'gu': 'મને સમજાયું કે તમને ડ્રેનેજની સમસ્યા છે. મને જણાવો સમસ્યા શું છે? ડ્રેન બ્લોક છે, ઊભરાઈ રહી છે, કે ગંદી વાસ આવે છે?',
                    'hi': 'मुझे समझ आया कि आपको नाली की समस्या है। मुझे बताएं समस्या क्या है? नाली बंद है, उभर रही है, या बदबू आ रही है?'
                },
                'sub_question': {
                    'en': 'Is drain water entering your house or roadway? Is it causing any health hazard?',
                    'gu': 'શું ડ્રેનનું પાણી ઘરમાં કે રસ્તા પર આવે છે? શું તેનાથી આરોગ્યનું જોખમ છે?',
                    'hi': 'क्या नाली का पानी घर में या सड़क पर आ रहा है? क्या इससे स्वास्थ्य का खतरा है?'
                }
            }
        }
    
    def get_zone_for_area(self, area: str) -> Optional[Dict]:
        """
        Get zone and ward information for a given area
        
        Args:
            area: Area name to lookup
            
        Returns:
            Dict with zone and ward info, or None
        """
        area_lower = area.lower().strip()
        
        # Direct match
        if area_lower in self.vadodara_areas:
            info = self.vadodara_areas[area_lower]
            return {
                'area': area,
                'ward': info['ward'],
                'zone': info['zone'],
                'auto_detected': True
            }
        
        # Partial match
        for known_area, info in self.vadodara_areas.items():
            if known_area in area_lower or area_lower in known_area:
                return {
                    'area': area,
                    'ward': info['ward'],
                    'zone': info['zone'],
                    'auto_detected': True
                }
        
        return None
    
    def detect_ward_from_text(self, text: str) -> Optional[str]:
        """Detect ward number from text"""
        import re
        
        # Pattern for ward mentions
        patterns = [
            r'ward\s*(\d+)',
            r'ward\s*no\.?\s*(\d+)',
            r'વોર્ડ\s*(\d+)',
            r'वार्ड\s*(\d+)',
        ]
        
        text_lower = text.lower()
        for pattern in patterns:
            match = re.search(pattern, text_lower)
            if match:
                ward_num = int(match.group(1))
                if 1 <= ward_num <= 19:
                    return f'Ward {ward_num}'
        
        return None
    
    def detect_zone_from_text(self, text: str) -> Optional[str]:
        """Detect zone from text"""
        text_lower = text.lower()
        
        zone_keywords = {
            'North': ['north', 'ઉત્તર', 'उत्तर', 'uttar'],
            'South': ['south', 'દક્ષિણ', 'दक्षिण', 'dakshin'],
            'East': ['east', 'પૂર્વ', 'पूर्व', 'purv'],
            'West': ['west', 'પશ્ચિમ', 'पश्चिम', 'pashchim'],
            'Central': ['central', 'મધ્ય', 'मध्य', 'madhya', 'center']
        }
        
        for zone, keywords in zone_keywords.items():
            for keyword in keywords:
                if keyword in text_lower:
                    return zone
        
        return None
    
    def get_sub_categories(self, complaint_type: str, language: str = 'en') -> List[Dict]:
        """
        Get sub-categories for a complaint type
        
        Args:
            complaint_type: Main complaint category
            language: Language code (en, gu, hi)
            
        Returns:
            List of sub-category options
        """
        if complaint_type not in self.complaint_categories:
            return []
        
        category = self.complaint_categories[complaint_type]
        sub_cats = []
        
        for key, translations in category['sub_categories'].items():
            sub_cats.append({
                'id': key,
                'text': translations.get(language, translations.get('en', key))
            })
        
        return sub_cats
    
    def detect_sub_category(self, complaint_type: str, text: str) -> Optional[str]:
        """
        Detect sub-category from user text
        
        Args:
            complaint_type: Main complaint category
            text: User input text
            
        Returns:
            Detected sub-category ID or None
        """
        if complaint_type not in self.complaint_categories:
            return None
        
        text_lower = text.lower()
        category = self.complaint_categories[complaint_type]
        
        # Detection keywords for each sub-category
        detection_keywords = {
            'Street Light': {
                'light_off': ['not working', 'off', 'बंद', 'બંધ', 'not on', 'no light'],
                'pole_damaged': ['pole', 'tilted', 'damaged pole', 'broken pole', 'थंभा', 'થાંભલો'],
                'current_leakage': ['current', 'shock', 'leakage', 'करंट', 'વીજળી', 'electric'],
                'flickering': ['flicker', 'blink', 'on off', 'ટિમટિમ', 'टिमटिमा'],
                'dim_light': ['dim', 'low', 'dark', 'ઝાંખ', 'धीमी'],
                'wire_issue': ['wire', 'hanging', 'exposed', 'વાયર', 'तार']
            },
            'Water Supply': {
                'no_water': ['no water', 'not coming', 'नहीं आ', 'નથી આવત'],
                'low_pressure': ['pressure', 'weak', 'slow', 'प्रेशर', 'દબાણ'],
                'dirty_water': ['dirty', 'brown', 'smell', 'गंदा', 'ગંદુ', 'yellow'],
                'pipe_leakage': ['leakage', 'leak', 'broken pipe', 'लीकेज', 'ગળતર'],
                'main_line_burst': ['burst', 'main line', 'big', 'ફાટ', 'फट'],
                'irregular_supply': ['irregular', 'timing', 'sometimes', 'कभी', 'ક્યારેક'],
                'meter_issue': ['meter', 'billing', 'मीटर', 'મીટર']
            },
            'Road Damage': {
                'pothole': ['pothole', 'hole', 'खड्डा', 'ખાડો', 'pit'],
                'road_broken': ['broken', 'damaged', 'crack', 'टूट', 'તૂટ'],
                'waterlogging': ['water', 'logging', 'flood', 'पानी भर', 'પાણી ભરા'],
                'footpath_damaged': ['footpath', 'sidewalk', 'pavement', 'फुटपाथ', 'ફૂટપાથ'],
                'divider_damaged': ['divider', 'median', 'डिवाइडर', 'ડિવાઇડર'],
                'speed_breaker': ['speed breaker', 'bump', 'स्पीड ब्रेकर', 'સ્પીડ બ્રેકર']
            },
            'Garbage': {
                'not_collected': ['not collected', 'not picked', 'नहीं उठा', 'ઉપાડતા નથી'],
                'overflowing_bin': ['overflow', 'full', 'भर गई', 'ભરાઈ'],
                'illegal_dumping': ['illegal', 'dumping', 'throwing', 'अवैध', 'ગેરકાયદેસર'],
                'no_dustbin': ['no dustbin', 'no bin', 'डस्टबिन नहीं', 'ડસ્ટબિન નથી'],
                'dead_animal': ['animal', 'dead', 'carcass', 'मृत', 'મરેલ'],
                'construction_waste': ['construction', 'debris', 'rubble', 'निर्माण', 'બાંધકામ']
            },
            'Drainage': {
                'drain_blocked': ['blocked', 'clogged', 'not flowing', 'बंद', 'બ્લોક'],
                'drain_overflow': ['overflow', 'full', 'उभर', 'ઊભરા'],
                'no_drain': ['no drain', 'missing', 'नहीं है', 'નથી'],
                'bad_smell': ['smell', 'stink', 'बदबू', 'વાસ'],
                'manhole_open': ['manhole', 'open', 'cover', 'मैनहोल', 'મેનહોલ']
            }
        }
        
        if complaint_type in detection_keywords:
            for sub_cat, keywords in detection_keywords[complaint_type].items():
                for keyword in keywords:
                    if keyword in text_lower:
                        return sub_cat
        
        return None
    
    def get_ivr_question(self, complaint_type: str, question_type: str = 'initial', language: str = 'en') -> str:
        """
        Get IVR question for a complaint type
        
        Args:
            complaint_type: Main complaint category
            question_type: 'initial' or 'sub_question'
            language: Language code
            
        Returns:
            Question text in specified language
        """
        if complaint_type in self.ivr_questions:
            questions = self.ivr_questions[complaint_type]
            if question_type in questions:
                return questions[question_type].get(language, questions[question_type].get('en', ''))
        
        # Default question
        default_questions = {
            'initial': {
                'en': f'You have selected {complaint_type}. Please describe your issue in detail.',
                'gu': f'તમે {complaint_type} પસંદ કર્યું છે. કૃપા કરીને તમારી સમસ્યા વિગતવાર જણાવો.',
                'hi': f'आपने {complaint_type} चुना है। कृपया अपनी समस्या का विस्तार से वर्णन करें।'
            }
        }
        
        return default_questions.get(question_type, default_questions['initial']).get(language, '')
    
    def generate_complaint_id(self, complaint_type: str, ward: str = '') -> str:
        """
        Generate VMC-style complaint ID
        
        Format: VMC-{TYPE}-{WARD}-{TIMESTAMP}
        Example: VMC-SL-W01-20260121-001
        """
        import random
        
        type_id = self.complaint_categories.get(complaint_type, {}).get('id', 'OT')
        
        # Extract ward number
        ward_num = '00'
        if ward:
            import re
            match = re.search(r'\d+', ward)
            if match:
                ward_num = match.group().zfill(2)
        
        # Date and sequence
        date_str = datetime.now().strftime('%Y%m%d')
        seq = str(random.randint(1, 999)).zfill(3)
        
        return f"VMC-{type_id}-W{ward_num}-{date_str}-{seq}"
    
    def get_priority(self, complaint_type: str, sub_category: str = None) -> str:
        """
        Determine priority based on complaint type and sub-category
        
        Returns: 'high', 'medium', or 'normal'
        """
        high_priority = [
            ('Street Light', 'current_leakage'),
            ('Street Light', 'wire_issue'),
            ('Water Supply', 'main_line_burst'),
            ('Road Damage', 'waterlogging'),
            ('Drainage', 'drain_overflow'),
            ('Drainage', 'manhole_open')
        ]
        
        medium_priority = [
            ('Street Light', 'pole_damaged'),
            ('Water Supply', 'no_water'),
            ('Road Damage', 'pothole'),
            ('Garbage', 'dead_animal'),
            ('Drainage', 'drain_blocked')
        ]
        
        if (complaint_type, sub_category) in high_priority:
            return 'high'
        elif (complaint_type, sub_category) in medium_priority:
            return 'medium'
        
        return 'normal'


# Singleton instance
vmc_service = VMCService()


def get_vmc_service() -> VMCService:
    """Get the VMC service instance"""
    return vmc_service
