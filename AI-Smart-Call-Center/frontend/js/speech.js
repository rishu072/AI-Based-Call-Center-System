// AI Smart Call Center - Speech Recognition and Text-to-Speech Module
// Complete working version

// Initialize Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const SpeechSynthesisUtterance = window.SpeechSynthesisUtterance || window.webkitSpeechSynthesisUtterance;

// Global speech recognition instance
let speechRecognition = null;
let isListening = false;
let currentTranscript = '';
let interimTranscript = '';
let shouldAutoRestart = false;

// Initialize speech recognition
function initSpeechRecognition() {
    console.log('[SPEECH] Initializing speech recognition...');

    if (!SpeechRecognition) {
        console.error('[SPEECH] Speech Recognition not supported');
        return false;
    }

    try {
        speechRecognition = new SpeechRecognition();

        // Configure settings
        speechRecognition.continuous = true;
        speechRecognition.interimResults = true;
        speechRecognition.maxAlternatives = 1;
        speechRecognition.lang = 'en-US';

        // Event handlers
        speechRecognition.onstart = function () {
            isListening = true;
            console.log('[SPEECH] Started listening');

            // Update UI
            const statusText = document.getElementById('statusText');
            if (statusText) {
                statusText.textContent = '🎤 Listening... Speak now!';
            }
        };

        speechRecognition.onresult = function (event) {
            interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    currentTranscript += transcript + ' ';
                    console.log('[SPEECH] Final:', transcript);
                } else {
                    interimTranscript += transcript;
                    console.log('[SPEECH] Interim:', transcript);
                }
            }

            const fullText = currentTranscript + interimTranscript;
            console.log('[SPEECH] Full text:', fullText);

            // Update input field directly
            const userInput = document.getElementById('userInput');
            if (userInput) {
                userInput.value = fullText;
            }

            // Update AI response to show we're hearing
            const aiResponse = document.getElementById('aiResponse');
            if (aiResponse && fullText.length > 0) {
                aiResponse.value = '🎤 Hearing: "' + fullText + '"';
            }

            // Call any registered callbacks
            if (typeof window.onTranscriptUpdate === 'function') {
                window.onTranscriptUpdate(currentTranscript, interimTranscript);
            }
        };

        speechRecognition.onerror = function (event) {
            console.error('[SPEECH] Error:', event.error);

            const statusText = document.getElementById('statusText');

            if (event.error === 'no-speech') {
                if (statusText) statusText.textContent = '🔄 No speech detected. Still listening...';
                // Auto-restart on no-speech
                if (shouldAutoRestart) {
                    setTimeout(() => {
                        try {
                            speechRecognition.start();
                        } catch (e) {
                            console.log('[SPEECH] Could not auto-restart');
                        }
                    }, 500);
                }
            } else if (event.error === 'not-allowed') {
                if (statusText) statusText.textContent = '❌ Microphone blocked. Click lock icon in address bar.';
                isListening = false;
            } else {
                if (statusText) statusText.textContent = '❌ Error: ' + event.error;
            }
        };

        speechRecognition.onend = function () {
            console.log('[SPEECH] Recognition ended');

            // Auto-restart if we should still be listening
            if (shouldAutoRestart && isListening) {
                console.log('[SPEECH] Auto-restarting...');
                setTimeout(() => {
                    try {
                        speechRecognition.start();
                    } catch (e) {
                        console.log('[SPEECH] Could not restart:', e.message);
                        isListening = false;
                    }
                }, 300);
            } else {
                isListening = false;
            }
        };

        console.log('[SPEECH] Speech recognition initialized successfully');
        return true;
    } catch (error) {
        console.error('[SPEECH] Init failed:', error);
        return false;
    }
}

// Start listening
function startListening(language = 'en-US') {
    console.log('[SPEECH] startListening called with language:', language);

    if (!SpeechRecognition) {
        console.error('[SPEECH] Not supported');
        return false;
    }

    if (!speechRecognition) {
        if (!initSpeechRecognition()) {
            return false;
        }
    }

    // Stop if currently listening
    if (isListening) {
        try {
            speechRecognition.stop();
        } catch (e) { }
    }

    try {
        // Reset transcript
        currentTranscript = '';
        interimTranscript = '';

        // Set language
        speechRecognition.lang = language || 'en-US';

        // Enable auto-restart
        shouldAutoRestart = true;

        // Start
        speechRecognition.start();
        console.log('[SPEECH] Started with language:', speechRecognition.lang);
        return true;
    } catch (error) {
        console.error('[SPEECH] Start error:', error);
        if (error.message && error.message.includes('already started')) {
            isListening = true;
            return true;
        }
        return false;
    }
}

// Stop listening
function stopListening() {
    console.log('[SPEECH] stopListening called');
    shouldAutoRestart = false;
    isListening = false;

    if (speechRecognition) {
        try {
            speechRecognition.stop();
        } catch (e) { }
    }

    return true;
}

// Get transcript
function getTranscript() {
    return currentTranscript.trim();
}

// Clear transcript
function clearTranscript() {
    currentTranscript = '';
    interimTranscript = '';
}

// Check if listening
function isCurrentlyListening() {
    return isListening;
}

// Request microphone permission
async function requestMicrophonePermission() {
    console.log('[SPEECH] Requesting microphone permission...');
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        console.log('[SPEECH] Permission granted');
        return true;
    } catch (error) {
        console.error('[SPEECH] Permission denied:', error);
        return false;
    }
}

// Check speech support
function checkSpeechSupport() {
    return {
        speechRecognition: !!SpeechRecognition,
        speechSynthesis: 'speechSynthesis' in window,
        microphone: typeof navigator.mediaDevices !== 'undefined'
    };
}

// Text-to-speech functions
function speak(text, language = 'en-US') {
    console.log('[SPEECH] Speaking:', text.substring(0, 50) + '...');

    if (!('speechSynthesis' in window)) {
        console.error('[SPEECH] Speech synthesis not supported');
        return false;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
    return true;
}

function stopSpeaking() {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
}

function isSpeaking() {
    return 'speechSynthesis' in window && window.speechSynthesis.speaking;
}

// Set recognition language
function setRecognitionLanguage(language) {
    if (speechRecognition) {
        speechRecognition.lang = language;
        console.log('[SPEECH] Language set to:', language);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    console.log('[SPEECH] DOM loaded, checking support...');
    const support = checkSpeechSupport();
    console.log('[SPEECH] Browser support:', support);

    if (support.speechRecognition) {
        initSpeechRecognition();
    } else {
        console.warn('[SPEECH] Speech recognition not supported in this browser');
    }
});

// Make functions globally available
window.startListening = startListening;
window.stopListening = stopListening;
window.getTranscript = getTranscript;
window.clearTranscript = clearTranscript;
window.isCurrentlyListening = isCurrentlyListening;
window.requestMicrophonePermission = requestMicrophonePermission;
window.checkSpeechSupport = checkSpeechSupport;
window.speak = speak;
window.stopSpeaking = stopSpeaking;
window.isSpeaking = isSpeaking;
window.setRecognitionLanguage = setRecognitionLanguage;
