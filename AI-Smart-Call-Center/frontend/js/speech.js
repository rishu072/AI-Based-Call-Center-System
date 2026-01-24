// AI Smart Call Center - Speech Recognition and Text-to-Speech Module

// Initialize Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance;

// Global speech recognition instance
let speechRecognition = null;
let isListening = false;
let currentTranscript = '';
let interimTranscript = '';

// Initialize speech recognition if available
function initSpeechRecognition() {
    if (!CONFIG.FEATURES.SPEECH_RECOGNITION) {
        logger.warn('Speech Recognition not supported in this browser');
        return false;
    }

    try {
        speechRecognition = new SpeechRecognition();

        // Configure recognition settings
        speechRecognition.continuous = CONFIG.SPEECH.RECOGNITION.CONTINUOUS;
        speechRecognition.interimResults = CONFIG.SPEECH.RECOGNITION.INTERIM_RESULTS;
        speechRecognition.maxAlternatives = CONFIG.SPEECH.RECOGNITION.MAX_ALTERNATIVES;

        // Set initial language
        speechRecognition.lang = getLanguage();

        // Handle recognition results
        speechRecognition.onstart = handleRecognitionStart;
        speechRecognition.onresult = handleRecognitionResult;
        speechRecognition.onerror = handleRecognitionError;
        speechRecognition.onend = handleRecognitionEnd;

        logger.info('Speech Recognition initialized');
        return true;
    } catch (error) {
        logger.error('Failed to initialize Speech Recognition:', error);
        return false;
    }
}

/**
 * Handle speech recognition start
 */
function handleRecognitionStart() {
    isListening = true;
    currentTranscript = '';
    interimTranscript = '';

    if (typeof onListeningStart === 'function') {
        onListeningStart();
    }

    logger.info('Speech recognition started');
}

/**
 * Handle speech recognition results
 */
function handleRecognitionResult(event) {
    interimTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
            currentTranscript += transcript + ' ';
        } else {
            interimTranscript += transcript;
        }
    }

    // Update UI with current transcript - try multiple callback approaches
    // First try window-level callback (set by call.html)
    if (typeof window.onFlowTranscriptUpdate === 'function') {
        window.onFlowTranscriptUpdate(currentTranscript, interimTranscript);
    }
    // Then try global onTranscriptUpdate (set by flow.js)
    if (typeof onTranscriptUpdate === 'function' && onTranscriptUpdate !== handleRecognitionResult) {
        onTranscriptUpdate(currentTranscript, interimTranscript);
    }
    // Also try window.onTranscriptUpdate
    if (typeof window.onTranscriptUpdate === 'function') {
        window.onTranscriptUpdate(currentTranscript, interimTranscript);
    }

    logger.debug('Transcript:', currentTranscript);
}

/**
 * Handle speech recognition errors
 */
function handleRecognitionError(event) {
    let errorMessage = 'Speech recognition error';

    switch (event.error) {
        case 'no-speech':
            errorMessage = 'No speech detected. Please speak louder.';
            break;
        case 'audio-capture':
            errorMessage = 'No microphone found. Ensure microphone is connected.';
            break;
        case 'network':
            errorMessage = 'Network error occurred.';
            break;
        case 'not-allowed':
            errorMessage = 'Microphone permission denied.';
            break;
        case 'service-not-allowed':
            errorMessage = 'Speech recognition service not allowed.';
            break;
        default:
            errorMessage = `Error: ${event.error}`;
    }

    logger.error('Recognition error:', errorMessage);

    // Call multiple callback approaches
    if (typeof onRecognitionError === 'function') {
        onRecognitionError(errorMessage);
    }
    if (typeof window.onRecognitionError === 'function') {
        window.onRecognitionError(errorMessage);
    }
}

/**
 * Handle speech recognition end
 */
function handleRecognitionEnd() {
    isListening = false;

    logger.info('Speech recognition ended');

    // Call multiple callback approaches
    if (typeof onListeningEnd === 'function') {
        onListeningEnd();
    }
    if (typeof window.onListeningEnd === 'function') {
        window.onListeningEnd();
    }
}

/**
 * Start listening for speech
 * @param {String} language - Optional language code (defaults to current language)
 * @returns {Boolean} Success status
 */
function startListening(language = null) {
    logger.info('startListening called with language:', language);

    if (!CONFIG.FEATURES.SPEECH_RECOGNITION) {
        logger.error(CONFIG.ERRORS.SPEECH_ERROR);
        return false;
    }

    if (!speechRecognition) {
        logger.info('Initializing speech recognition...');
        if (!initSpeechRecognition()) {
            logger.error('Failed to initialize speech recognition');
            return false;
        }
    }

    // If already listening, stop first
    if (isListening) {
        try {
            speechRecognition.stop();
        } catch (e) {
            // Ignore errors when stopping
        }
    }

    try {
        // Reset transcript
        currentTranscript = '';
        interimTranscript = '';

        // Set language if provided
        if (language) {
            speechRecognition.lang = language;
        } else if (typeof getLanguage === 'function') {
            speechRecognition.lang = getLanguage();
        } else {
            speechRecognition.lang = 'en-US';
        }

        // Start recognition
        speechRecognition.start();
        logger.info('Listening started with language:', speechRecognition.lang);
        return true;
    } catch (error) {
        logger.error('Error starting speech recognition:', error);

        // If it's "already started" error, return true anyway
        if (error.message && error.message.includes('already started')) {
            isListening = true;
            return true;
        }
        return false;
    }
}

/**
 * Stop listening for speech
 * @returns {Boolean} Success status
 */
function stopListening() {
    logger.info('stopListening called');

    if (!speechRecognition) {
        logger.warn('Speech recognition not initialized');
        return false;
    }

    try {
        speechRecognition.stop();
        isListening = false;
        logger.info('Listening stopped');
        return true;
    } catch (error) {
        logger.error('Error stopping speech recognition:', error);
        isListening = false;
        return false;
    }
}

/**
 * Abort ongoing speech recognition
 */
function abortListening() {
    if (speechRecognition) {
        try {
            speechRecognition.abort();
            isListening = false;
            logger.info('Speech recognition aborted');
        } catch (error) {
            logger.error('Error aborting speech recognition:', error);
        }
    }
}

/**
 * Get current transcript
 * @returns {String} Full transcript collected so far
 */
function getTranscript() {
    return currentTranscript.trim();
}

/**
 * Clear transcript
 */
function clearTranscript() {
    currentTranscript = '';
    interimTranscript = '';
}

/**
 * Check if currently listening
 * @returns {Boolean} True if actively listening
 */
function isCurrentlyListening() {
    return isListening;
}

/**
 * Text-to-Speech: Speak text
 * @param {String} text - Text to speak
 * @param {String} language - Optional language code
 * @param {Function} callback - Optional callback when speech ends
 */
function speak(text, language = null, callback = null) {
    if (!CONFIG.FEATURES.SPEECH_SYNTHESIS) {
        logger.warn('Speech Synthesis not supported in this browser');
        return false;
    }

    if (!text || text.trim() === '') {
        logger.error(CONFIG.ERRORS.EMPTY_INPUT);
        return false;
    }

    try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);

        // Set properties
        utterance.lang = language || getLanguage();
        utterance.rate = CONFIG.SPEECH.SPEECH_SYNTHESIS.RATE;
        utterance.pitch = CONFIG.SPEECH.SPEECH_SYNTHESIS.PITCH;
        utterance.volume = CONFIG.SPEECH.SPEECH_SYNTHESIS.VOLUME;

        // Handle speech end
        utterance.onend = () => {
            logger.info('Speech synthesis completed');
            if (typeof callback === 'function') {
                callback();
            }
            if (typeof onSpeechEnd === 'function') {
                onSpeechEnd();
            }
        };

        // Handle errors
        utterance.onerror = (event) => {
            logger.error('Speech synthesis error:', event.error);
            if (typeof onSpeechError === 'function') {
                onSpeechError(event.error);
            }
        };

        // Start speaking
        window.speechSynthesis.speak(utterance);
        logger.info('Speaking:', text);
        return true;
    } catch (error) {
        logger.error('Error in text-to-speech:', error);
        return false;
    }
}

/**
 * Stop ongoing speech
 */
function stopSpeaking() {
    try {
        window.speechSynthesis.cancel();
        logger.info('Speech stopped');
        return true;
    } catch (error) {
        logger.error('Error stopping speech:', error);
        return false;
    }
}

/**
 * Pause speech synthesis
 */
function pauseSpeech() {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        try {
            window.speechSynthesis.pause();
            logger.info('Speech paused');
            return true;
        } catch (error) {
            logger.error('Error pausing speech:', error);
            return false;
        }
    }
    return false;
}

/**
 * Resume speech synthesis
 */
function resumeSpeech() {
    if (window.speechSynthesis.paused) {
        try {
            window.speechSynthesis.resume();
            logger.info('Speech resumed');
            return true;
        } catch (error) {
            logger.error('Error resuming speech:', error);
            return false;
        }
    }
    return false;
}

/**
 * Check if speech synthesis is currently speaking
 * @returns {Boolean}
 */
function isSpeaking() {
    return window.speechSynthesis.speaking;
}

/**
 * Change language for speech recognition
 * @param {String} langCode - Language code (e.g., 'en-US', 'hi-IN')
 */
function setRecognitionLanguage(langCode) {
    if (Object.values(CONFIG.SPEECH.LANGUAGES).includes(langCode)) {
        setLanguage(langCode);
        if (speechRecognition) {
            speechRecognition.lang = langCode;
        }
        logger.info('Recognition language set to:', langCode);
        return true;
    } else {
        logger.error('Invalid language code:', langCode);
        return false;
    }
}

/**
 * Get list of available speech synthesis voices
 * @returns {Array} Array of voice objects
 */
function getAvailableVoices() {
    try {
        const voices = window.speechSynthesis.getVoices();
        logger.info('Available voices:', voices.length);
        return voices;
    } catch (error) {
        logger.error('Error getting voices:', error);
        return [];
    }
}

/**
 * Set voice for speech synthesis
 * @param {Number} voiceIndex - Index of voice from available voices
 */
function setVoice(voiceIndex) {
    try {
        const voices = window.speechSynthesis.getVoices();
        if (voiceIndex >= 0 && voiceIndex < voices.length) {
            // Store voice index for later use
            window.selectedVoiceIndex = voiceIndex;
            logger.info('Voice set to:', voices[voiceIndex].name);
            return true;
        }
    } catch (error) {
        logger.error('Error setting voice:', error);
    }
    return false;
}

/**
 * Request microphone permission
 * @returns {Promise} Resolves if permission granted
 */
async function requestMicrophonePermission() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop the stream after getting permission
        stream.getTracks().forEach(track => track.stop());
        logger.info('Microphone permission granted');
        return true;
    } catch (error) {
        logger.error('Microphone permission denied:', error);
        return false;
    }
}

/**
 * Check browser support for speech features
 * @returns {Object} Support status for each feature
 */
function checkSpeechSupport() {
    return {
        speechRecognition: CONFIG.FEATURES.SPEECH_RECOGNITION,
        speechSynthesis: CONFIG.FEATURES.SPEECH_SYNTHESIS,
        microphone: typeof navigator.mediaDevices !== 'undefined'
    };
}

/**
 * Initialize all speech features
 * @returns {Boolean} Success status
 */
function initializeSpeechFeatures() {
    const support = checkSpeechSupport();

    if (!support.speechRecognition && !support.speechSynthesis) {
        logger.error('Speech features not supported in this browser');
        return false;
    }

    if (support.speechRecognition) {
        initSpeechRecognition();
    }

    // Listen for voice changes in speech synthesis
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => {
            logger.info('Available voices updated');
        };
    }

    logger.info('Speech features initialized');
    return true;
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    initializeSpeechFeatures();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    stopListening();
    stopSpeaking();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initSpeechRecognition,
        startListening,
        stopListening,
        abortListening,
        getTranscript,
        clearTranscript,
        isCurrentlyListening,
        speak,
        stopSpeaking,
        pauseSpeech,
        resumeSpeech,
        isSpeaking,
        setRecognitionLanguage,
        getAvailableVoices,
        setVoice,
        requestMicrophonePermission,
        checkSpeechSupport,
        initializeSpeechFeatures
    };
}
