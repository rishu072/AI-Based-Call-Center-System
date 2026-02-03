// AI Smart Call Center - State Management with localStorage

// Default initial state
const INITIAL_STATE = {
    // Current step in the flow
    currentStep: 'init',

    // User language preference
    language: 'en-US',

    // Complaint information
    complaint: {
        type: null,           // e.g., "Street Light", "Water Supply"
        subType: null,        // Sub-category if applicable
        description: '',
        priority: 'normal'
    },

    // Address information
    address: {
        houseNo: '',
        area: '',
        ward: '',
        zone: ''
    },

    // User details
    userDetails: {
        phoneNumber: '',
        description: '',
        email: ''
    },

    // Review data before submission
    review: {},

    // Complaint ID after successful submission
    complaintId: null,

    // Call state
    callActive: false,

    // Application initialization state
    isInitialized: false,

    // Timestamp of last update
    lastUpdated: null
};

// Initialize app state - will be set after loadStateFromStorage is defined
let appState = null;

/**
 * Load state from localStorage
 * @returns {Object|null} Saved state or null if not found
 */
function loadStateFromStorage() {
    try {
        if (!CONFIG.FEATURES.LOCAL_STORAGE) {
            logger.warn('localStorage not available');
            return null;
        }

        const savedState = localStorage.getItem('complaintAppState');
        if (savedState) {
            const parsedState = JSON.parse(savedState);
            logger.info('State loaded from localStorage');
            return parsedState;
        }
    } catch (error) {
        logger.error('Error loading state from localStorage:', error);
    }
    return null;
}

/**
 * Save current state to localStorage
 */
function saveStateToStorage() {
    try {
        if (!CONFIG.FEATURES.LOCAL_STORAGE) {
            logger.warn('localStorage not available');
            return false;
        }

        appState.lastUpdated = new Date().toISOString();
        localStorage.setItem('complaintAppState', JSON.stringify(appState));
        logger.info('State saved to localStorage');
        return true;
    } catch (error) {
        logger.error('Error saving state to localStorage:', error);
        return false;
    }
}

/**
 * Update state with new values and persist to localStorage
 * @param {Object} updates - Object containing state updates
 */
function setState(updates) {
    if (typeof updates !== 'object' || updates === null) {
        logger.error('setState requires an object');
        return;
    }

    // Deep merge for nested objects
    appState = {
        ...appState,
        ...updates,
        // Deep merge complaint, address, and userDetails
        complaint: { ...appState.complaint, ...(updates.complaint || {}) },
        address: { ...appState.address, ...(updates.address || {}) },
        userDetails: { ...appState.userDetails, ...(updates.userDetails || {}) }
    };

    // Remove nested properties from top level if they were passed
    delete appState.complaint.complaint;
    delete appState.address.address;
    delete appState.userDetails.userDetails;

    // Save to localStorage
    saveStateToStorage();

    if (CONFIG.APP.DEBUG) {
        logger.debug('State updated:', appState);
    }
}

/**
 * Get entire app state - always refreshes from localStorage for cross-page consistency
 * @returns {Object} Current application state
 */
function getState() {
    // Always load fresh from localStorage to get updates from other pages
    const freshState = loadStateFromStorage();
    if (freshState) {
        appState = freshState;
    }
    return { ...appState };
}

/**
 * Get specific state property
 * @param {String} key - Property key to retrieve
 * @returns {*} Value of the property
 */
function getStateValue(key) {
    return appState[key];
}

/**
 * Set language preference
 * @param {String} langCode - Language code (e.g., 'en-US', 'hi-IN')
 */
function setLanguage(langCode) {
    if (Object.values(CONFIG.SPEECH.LANGUAGES).includes(langCode)) {
        setState({ language: langCode });
        logger.info('Language set to:', langCode);
    } else {
        logger.error('Invalid language code:', langCode);
    }
}

/**
 * Get current language
 * @returns {String} Current language code
 */
function getLanguage() {
    return appState.language;
}

/**
 * Set complaint type and optional sub-type
 * @param {String} type - Complaint type
 * @param {String} subType - Optional sub-type
 */
function setComplaintType(type, subType = null) {
    setState({
        complaint: {
            type: type,
            subType: subType
        }
    });
    logger.info('Complaint type set to:', type);
}

/**
 * Get complaint type
 * @returns {Object} Complaint type and subType
 */
function getComplaintType() {
    return {
        type: appState.complaint.type,
        subType: appState.complaint.subType
    };
}

/**
 * Set address information
 * @param {Object} addressData - Address object with houseNo, area, ward, zone
 */
function setAddress(addressData) {
    if (typeof addressData === 'object') {
        setState({ address: addressData });
        logger.info('Address set');
    } else {
        logger.error('Address data must be an object');
    }
}

/**
 * Get address information
 * @returns {Object} Address object
 */
function getAddress() {
    return { ...appState.address };
}

/**
 * Set user details
 * @param {Object} userDetails - User details object
 */
function setUserDetails(userDetails) {
    if (typeof userDetails === 'object') {
        setState({ userDetails: userDetails });
        logger.info('User details set');
    } else {
        logger.error('User details must be an object');
    }
}

/**
 * Get user details
 * @returns {Object} User details object
 */
function getUserDetails() {
    return { ...appState.userDetails };
}

/**
 * Clear all state and localStorage
 */
function clearState() {
    appState = JSON.parse(JSON.stringify(INITIAL_STATE));
    try {
        if (CONFIG.FEATURES.LOCAL_STORAGE) {
            localStorage.removeItem('complaintAppState');
            logger.info('State cleared from localStorage');
        }
    } catch (error) {
        logger.error('Error clearing localStorage:', error);
    }
}

/**
 * Reset state to initial values
 */
function resetState() {
    appState = JSON.parse(JSON.stringify(INITIAL_STATE));
    saveStateToStorage();
    logger.info('State reset to initial values');
}

/**
 * Print entire state (for debugging)
 */
function debugState() {
    if (CONFIG.APP.DEBUG) {
        console.table(appState);
    }
}

/**
 * Export state as JSON (for testing/export)
 * @returns {String} JSON string of current state
 */
function exportState() {
    return JSON.stringify(appState, null, 2);
}

// Save state to localStorage on page unload
window.addEventListener('beforeunload', () => {
    saveStateToStorage();
});

// Initialize appState now that loadStateFromStorage is defined
appState = loadStateFromStorage() || { ...INITIAL_STATE };

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        setState,
        getState,
        getStateValue,
        setLanguage,
        getLanguage,
        setComplaintType,
        getComplaintType,
        setAddress,
        getAddress,
        setUserDetails,
        getUserDetails,
        clearState,
        resetState,
        saveStateToStorage,
        loadStateFromStorage,
        debugState,
        exportState
    };
}
