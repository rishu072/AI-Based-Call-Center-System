const CONFIG = {
    API: {
        BASE_URL: 'http://localhost:5000',
        ENDPOINTS: {
            COMPLAINTS: '/api/complaints',
            STATISTICS: '/api/complaints/statistics',
            STATUS: '/api/complaints/status',
            HEALTH: '/api/health',
            INFO: '/api/info'
        },
        TIMEOUT: 30000,
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000
    },

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

    APP: {
        NAME: 'Vadodara Nagar Samwad',
        VERSION: '1.0.0',
        DEBUG: true,
        LOG_LEVEL: 'info'
    },

    UI: {
        ANIMATION_DURATION: 300,
        TOAST_DURATION: 5000,
        DEBOUNCE_DELAY: 300
    },

    VALIDATION: {
        MIN_COMPLAINT_LENGTH: 10,
        MAX_COMPLAINT_LENGTH: 1000,
        HOUSE_NO_MIN_LENGTH: 1,
        AREA_MIN_LENGTH: 3
    },

    ERRORS: {
        NETWORK_ERROR: 'Network error. Please check your internet connection.',
        API_ERROR: 'Unable to connect to the server. Please try again.',
        VALIDATION_ERROR: 'Please fill in all required fields.',
        SPEECH_ERROR: 'Speech recognition not supported or permission denied.',
        SUBMISSION_ERROR: 'Failed to submit complaint. Please try again.',
        EMPTY_INPUT: 'Please provide some input before submitting.'
    },

    SUCCESS: {
        COMPLAINT_SUBMITTED: 'Your complaint has been submitted successfully!',
        COPIED_TO_CLIPBOARD: 'Complaint ID copied to clipboard!',
        PAGE_NAVIGATED: 'Navigating to next page...'
    },

    COMPLAINT_TYPES: {
        'Street Light': '💡 Street Light',
        'Water Supply': '💧 Water Supply',
        'Road Damage': '🛣️ Road Damage',
        'Garbage': '🗑️ Garbage',
        'Sanitation': '🧹 Sanitation',
        'Other': '📋 Other'
    },

    ZONES: [
        'North',
        'South',
        'East',
        'West',
        'Central'
    ],

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

CONFIG.FEATURES = {
    SPEECH_RECOGNITION: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
    SPEECH_SYNTHESIS: 'speechSynthesis' in window,
    LOCAL_STORAGE: typeof (Storage) !== 'undefined',
    CLIPBOARD: navigator.clipboard !== undefined
};

const logger = {
    debug: (message, data) => {
        if (CONFIG.APP.DEBUG && CONFIG.APP.LOG_LEVEL === 'debug') {
            console.log(`[DEBUG] ${message}`, data || '');
        }
    },
    info: (message, data) => {
        if (CONFIG.APP.DEBUG) {
            console.log(`[INFO] ${message}`, data || '');
        }
    },
    warn: (message, data) => {
        console.warn(`[WARN] ${message}`, data || '');
    },
    error: (message, data) => {
        console.error(`[ERROR] ${message}`, data || '');
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, logger };
}
