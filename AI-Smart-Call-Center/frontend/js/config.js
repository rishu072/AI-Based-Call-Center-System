/**
 * AI Smart Call Center - Configuration
 * Centralized configuration for the frontend application
 * Supports environment-based settings for development and production
 */

// Detect environment
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname === '';

// Get API URL from environment or use defaults
const getApiUrl = () => {
    // Check for custom API URL in localStorage (for testing)
    const customUrl = localStorage.getItem('API_BASE_URL');
    if (customUrl) return customUrl;
    
    // Use localhost for development
    if (isLocalhost) {
        return 'http://localhost:5000';
    }
    
    // Production URL - update this when deploying
    return window.location.origin.includes('github.io') 
        ? 'https://your-backend-api.onrender.com'  // Update with your production API
        : 'http://localhost:5000';
};

const CONFIG = {
    // Environment
    ENV: isLocalhost ? 'development' : 'production',
    
    // API Configuration
    API: {
        BASE_URL: getApiUrl(),
        ENDPOINTS: {
            COMPLAINTS: '/api/complaints',
            STATISTICS: '/api/complaints/statistics',
            STATUS: '/api/complaints/status',
            HEALTH: '/api/health',
            INFO: '/api/info',
            CATEGORIES: '/api/vmc/categories',
            SUB_CATEGORIES: '/api/vmc/sub-categories',
            DETECT_LOCATION: '/api/vmc/detect-location',
            WARDS: '/api/vmc/wards',
            ZONES: '/api/vmc/zones',
            GENERATE_ID: '/api/vmc/generate-id',
            TTS: '/api/tts/generate',
            IVR_SESSION: '/api/ivr/session',
            IVR_PROCESS: '/api/ivr/process'
        },
        TIMEOUT: 30000,
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000
    },

    // Speech Recognition Configuration
    SPEECH: {
        LANGUAGES: {
            ENGLISH: 'en-US',
            HINDI: 'hi-IN',
            GUJARATI: 'gu-IN'
        },
        DEFAULT_LANGUAGE: 'en-US',

        RECOGNITION: {
            CONTINUOUS: true,
            INTERIM_RESULTS: true,
            MAX_ALTERNATIVES: 1,
            TIMEOUT: 15000
        },

        SPEECH_SYNTHESIS: {
            RATE: 1.0,
            PITCH: 1.0,
            VOLUME: 1.0
        }
    },

    // Application Settings
    APP: {
        NAME: 'Vadodara Nagar Samwad',
        VERSION: '2.0.0',
        DEBUG: isLocalhost, // Only debug in development
        LOG_LEVEL: isLocalhost ? 'debug' : 'error'
    },

    // UI Configuration
    UI: {
        ANIMATION_DURATION: 300,
        TOAST_DURATION: 5000,
        DEBOUNCE_DELAY: 300,
        AUTO_REFRESH_INTERVAL: 30000 // 30 seconds
    },

    // Validation Rules
    VALIDATION: {
        MIN_COMPLAINT_LENGTH: 10,
        MAX_COMPLAINT_LENGTH: 1000,
        HOUSE_NO_MIN_LENGTH: 1,
        AREA_MIN_LENGTH: 3,
        PHONE_LENGTH: 10
    },

    // Error Messages
    ERRORS: {
        NETWORK_ERROR: 'Network error. Please check your internet connection.',
        API_ERROR: 'Unable to connect to the server. Please try again.',
        VALIDATION_ERROR: 'Please fill in all required fields.',
        SPEECH_ERROR: 'Speech recognition not supported or permission denied.',
        SUBMISSION_ERROR: 'Failed to submit complaint. Please try again.',
        EMPTY_INPUT: 'Please provide some input before submitting.',
        TIMEOUT_ERROR: 'Request timed out. Please try again.',
        NOT_FOUND: 'Resource not found.'
    },

    // Success Messages
    SUCCESS: {
        COMPLAINT_SUBMITTED: 'Your complaint has been submitted successfully!',
        COPIED_TO_CLIPBOARD: 'Complaint ID copied to clipboard!',
        PAGE_NAVIGATED: 'Navigating to next page...',
        STATUS_UPDATED: 'Status updated successfully!'
    },

    // Complaint Types with Icons
    COMPLAINT_TYPES: {
        'Street Light': '💡 Street Light',
        'Water Supply': '💧 Water Supply',
        'Road Damage': '🛣️ Road Damage',
        'Garbage': '🗑️ Garbage',
        'Drainage': '🚿 Drainage',
        'Sanitation': '🧹 Sanitation',
        'Other': '📋 Other'
    },

    // Sub-categories for each complaint type
    SUB_CATEGORIES: {
        'Street Light': [
            'Light Not Working',
            'Flickering Light',
            'Pole Damaged',
            'Wire Exposed/Dangerous',
            'New Light Required'
        ],
        'Water Supply': [
            'No Water Supply',
            'Low Pressure',
            'Contaminated Water',
            'Pipe Leakage',
            'Irregular Supply',
            'New Connection Required'
        ],
        'Road Damage': [
            'Pothole',
            'Road Cave-in',
            'Damaged Footpath',
            'Missing Road Markings',
            'Damaged Speed Breaker',
            'Waterlogging on Road'
        ],
        'Garbage': [
            'Garbage Not Collected',
            'Overflowing Dustbin',
            'Illegal Dumping',
            'Dead Animal',
            'Construction Debris'
        ],
        'Drainage': [
            'Blocked Drain',
            'Overflowing Sewer',
            'Manhole Cover Missing',
            'Gutter Cleaning Required',
            'Drainage Overflow'
        ],
        'Sanitation': [
            'Public Toilet Cleaning',
            'Open Defecation Issue',
            'Mosquito Breeding',
            'Stagnant Water'
        ],
        'Other': [
            'General Complaint',
            'Suggestion',
            'Inquiry'
        ]
    },

    // Zones
    ZONES: [
        'North',
        'South',
        'East',
        'West',
        'Central'
    ],

    // Wards
    WARDS: [
        'Ward 1',
        'Ward 2',
        'Ward 3',
        'Ward 4',
        'Ward 5',
        'Ward 6',
        'Ward 7',
        'Ward 8'
    ],

    // n8n Webhook Configuration (optional)
    N8N: {
        WEBHOOK_URL: null,
        WEBHOOKS: {
            COMPLAINT_RECEIVED: null,
            COMPLAINT_SUBMITTED: null,
            STATUS_UPDATE: null,
            ESCALATION: null
        },
        API: {
            BASE_URL: null,
            API_KEY: null
        },
        ENABLED: false,
        RETRY: {
            ATTEMPTS: 3,
            DELAY: 1000
        }
    }
};

// Feature Detection
CONFIG.FEATURES = {
    SPEECH_RECOGNITION: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
    SPEECH_SYNTHESIS: 'speechSynthesis' in window,
    LOCAL_STORAGE: typeof (Storage) !== 'undefined',
    CLIPBOARD: navigator.clipboard !== undefined,
    GEOLOCATION: 'geolocation' in navigator,
    SERVICE_WORKER: 'serviceWorker' in navigator,
    NOTIFICATIONS: 'Notification' in window
};

// Logger utility with proper levels
const logger = {
    levels: {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3
    },
    
    currentLevel: function() {
        return this.levels[CONFIG.APP.LOG_LEVEL] || 1;
    },
    
    debug: function(message, data) {
        if (this.currentLevel() <= this.levels.debug) {
            console.log(`[DEBUG] ${message}`, data || '');
        }
    },
    
    info: function(message, data) {
        if (this.currentLevel() <= this.levels.info) {
            console.log(`[INFO] ${message}`, data || '');
        }
    },
    
    warn: function(message, data) {
        if (this.currentLevel() <= this.levels.warn) {
            console.warn(`[WARN] ${message}`, data || '');
        }
    },
    
    error: function(message, data) {
        console.error(`[ERROR] ${message}`, data || '');
    }
};

// API URL setter for runtime configuration
CONFIG.setApiUrl = function(url) {
    localStorage.setItem('API_BASE_URL', url);
    CONFIG.API.BASE_URL = url;
    logger.info('API URL updated to:', url);
};

// Reset API URL to default
CONFIG.resetApiUrl = function() {
    localStorage.removeItem('API_BASE_URL');
    CONFIG.API.BASE_URL = getApiUrl();
    logger.info('API URL reset to:', CONFIG.API.BASE_URL);
};

// Freeze config to prevent accidental mutations in production
if (CONFIG.ENV === 'production') {
    Object.freeze(CONFIG);
    Object.freeze(CONFIG.API);
    Object.freeze(CONFIG.SPEECH);
    Object.freeze(CONFIG.APP);
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, logger };
}

// Log environment info on load
logger.info(`${CONFIG.APP.NAME} v${CONFIG.APP.VERSION} - ${CONFIG.ENV} mode`);
logger.info('API URL:', CONFIG.API.BASE_URL);
