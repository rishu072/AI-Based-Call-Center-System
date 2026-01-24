const FLOW_STEPS = {
    WELCOME: 'welcome',
    LANGUAGE_SELECTION: 'language_selection',
    COMPLAINT_TYPE: 'complaint_type',
    COMPLAINT_DETAILS: 'complaint_details',
    LOCATION: 'location',
    ADDRESS_DETAILS: 'address_details',
    CONTACT_INFO: 'contact_info',
    REVIEW: 'review',
    SUBMIT: 'submit',
    SUCCESS: 'success'
};

const FLOW_CONFIG = {
    [FLOW_STEPS.WELCOME]: {
        prompt: "Welcome to AI Smart Call Center. Please select a language to continue.",
        type: 'language_selection',
        nextStep: FLOW_STEPS.LANGUAGE_SELECTION,
        requiresSpeech: false
    },

    [FLOW_STEPS.LANGUAGE_SELECTION]: {
        prompt: "Please say or select your preferred language: English, Hindi, or Gujarati.",
        type: 'selection',
        options: ['English', 'Hindi', 'Gujarati'],
        nextStep: FLOW_STEPS.COMPLAINT_TYPE,
        requiresSpeech: true,
        handler: handleLanguageSelection
    },

    [FLOW_STEPS.COMPLAINT_TYPE]: {
        prompt: "What type of complaint do you want to register? Please choose from: Street Light, Water Supply, Road Damage, or Garbage.",
        type: 'selection',
        options: ['Street Light', 'Water Supply', 'Road Damage', 'Garbage'],
        nextStep: FLOW_STEPS.COMPLAINT_DETAILS,
        requiresSpeech: true,
        handler: handleComplaintType
    },

    [FLOW_STEPS.COMPLAINT_DETAILS]: {
        prompt: "Please describe your complaint in detail. Tell us what you experienced and where.",
        type: 'free_text',
        nextStep: FLOW_STEPS.LOCATION,
        requiresSpeech: true,
        handler: handleComplaintDetails
    },

    [FLOW_STEPS.LOCATION]: {
        prompt: "Now let's get the location details. Please provide the area or locality name.",
        type: 'free_text',
        nextStep: FLOW_STEPS.ADDRESS_DETAILS,
        requiresSpeech: true,
        handler: handleLocation
    },

    [FLOW_STEPS.ADDRESS_DETAILS]: {
        prompt: "Please provide your house number or building number, ward, and zone.",
        type: 'form',
        fields: ['houseNo', 'ward', 'zone'],
        nextStep: FLOW_STEPS.CONTACT_INFO,
        requiresSpeech: false,
        handler: handleAddressDetails
    },

    [FLOW_STEPS.CONTACT_INFO]: {
        prompt: "Finally, please provide your contact phone number so we can reach you.",
        type: 'free_text',
        nextStep: FLOW_STEPS.REVIEW,
        requiresSpeech: true,
        handler: handleContactInfo
    },

    [FLOW_STEPS.REVIEW]: {
        prompt: "Let me review your complaint details. If everything is correct, I'll submit it.",
        type: 'review',
        nextStep: FLOW_STEPS.SUBMIT,
        requiresSpeech: false,
        handler: handleReview
    },

    [FLOW_STEPS.SUBMIT]: {
        prompt: "Submitting your complaint...",
        type: 'submit',
        nextStep: FLOW_STEPS.SUCCESS,
        requiresSpeech: false,
        handler: handleSubmit
    },

    [FLOW_STEPS.SUCCESS]: {
        prompt: "Your complaint has been successfully registered!",
        type: 'success',
        nextStep: null,
        requiresSpeech: false,
        handler: handleSuccess
    }
};

let currentStep = FLOW_STEPS.WELCOME;
let flowHistory = [];
let flowData = {};

function initializeFlow() {
    currentStep = FLOW_STEPS.WELCOME;
    flowHistory = [];
    flowData = {};
    logger.info('Flow initialized');
    return getFlowMessage(currentStep);
}

function getFlowMessage(step) {
    const config = FLOW_CONFIG[step];

    if (!config) {
        logger.error('Invalid flow step:', step);
        return null;
    }

    return {
        step: step,
        prompt: config.prompt,
        type: config.type,
        options: config.options || [],
        requiresSpeech: config.requiresSpeech
    };
}

function getCurrentStepConfig() {
    return FLOW_CONFIG[currentStep];
}

function processUserInput(userInput, additionalData = {}) {
    const config = FLOW_CONFIG[currentStep];

    if (!config) {
        logger.error('No configuration for current step:', currentStep);
        return false;
    }

    logger.info('Processing input for step:', currentStep, 'Input:', userInput);

    flowHistory.push({
        step: currentStep,
        input: userInput,
        timestamp: new Date().toISOString()
    });

    if (config.handler && typeof config.handler === 'function') {
        const result = config.handler(userInput, additionalData);

        if (!result) {
            logger.warn('Handler returned false for step:', currentStep);
            return false;
        }
    }

    if (config.nextStep) {
        const previousStep = currentStep;
        currentStep = config.nextStep;

        logger.info('Moving from', previousStep, 'to', currentStep);

        return {
            success: true,
            nextMessage: getFlowMessage(currentStep)
        };
    } else {
        logger.info('Flow completed');
        return {
            success: true,
            completed: true
        };
    }
}

function handleLanguageSelection(userInput) {
    const languages = {
        'english': CONFIG.SPEECH.LANGUAGES.ENGLISH,
        'hindi': CONFIG.SPEECH.LANGUAGES.HINDI,
        'gujarati': CONFIG.SPEECH.LANGUAGES.GUJARATI
    };

    const input = userInput.toLowerCase().trim();
    const langCode = languages[input];

    if (langCode) {
        setLanguage(langCode);
        setRecognitionLanguage(langCode);
        flowData.language = langCode;
        logger.info('Language set to:', langCode);
        return true;
    } else {
        logger.error('Invalid language selection:', userInput);
        return false;
    }
}

function handleComplaintType(userInput) {
    const validTypes = ['Street Light', 'Water Supply', 'Road Damage', 'Garbage'];
    const input = userInput.trim();

    if (validTypes.includes(input)) {
        setComplaintType(input);
        flowData.complaintType = input;
        logger.info('Complaint type set to:', input);
        return true;
    }

    const matched = validTypes.find(type =>
        type.toLowerCase().includes(input.toLowerCase()) ||
        input.toLowerCase().includes(type.toLowerCase())
    );

    if (matched) {
        setComplaintType(matched);
        flowData.complaintType = matched;
        logger.info('Complaint type matched to:', matched);
        return true;
    }

    logger.warn('No matching complaint type for:', userInput);
    return false;
}

function handleComplaintDetails(userInput) {
    if (userInput && userInput.trim().length > CONFIG.VALIDATION.MIN_COMPLAINT_LENGTH) {
        flowData.complaintDescription = userInput;

        setState({
            userDetails: {
                description: userInput
            }
        });

        logger.info('Complaint details saved');
        return true;
    }

    logger.warn('Complaint description too short');
    return false;
}

function handleLocation(userInput) {
    if (userInput && userInput.trim().length > CONFIG.VALIDATION.AREA_MIN_LENGTH) {
        flowData.area = userInput;

        setState({
            address: {
                area: userInput
            }
        });

        logger.info('Location set to:', userInput);
        return true;
    }

    logger.warn('Location input invalid');
    return false;
}

function handleAddressDetails(addressData) {
    if (typeof addressData === 'object' && addressData.houseNo && addressData.ward && addressData.zone) {
        setAddress(addressData);
        flowData.addressDetails = addressData;
        logger.info('Address details saved');
        return true;
    }

    logger.warn('Invalid address data');
    return false;
}

function handleContactInfo(userInput) {
    const phonePattern = /\d{10}/;
    const input = userInput.replace(/\D/g, '');

    if (phonePattern.test(input)) {
        flowData.phoneNumber = input;

        setState({
            userDetails: {
                phoneNumber: input
            }
        });

        logger.info('Phone number saved');
        return true;
    }

    logger.warn('Invalid phone number format');
    return false;
}

function handleReview(userInput) {
    const confirmation = userInput.toLowerCase();

    if (confirmation.includes('yes') || confirmation.includes('correct') || confirmation.includes('submit')) {
        logger.info('User confirmed review');
        return true;
    } else if (confirmation.includes('no') || confirmation.includes('edit')) {
        const previousStep = flowHistory[flowHistory.length - 2]?.step;
        if (previousStep) {
            currentStep = previousStep;
            logger.info('User wants to edit, going back to:', previousStep);
        }
        return true;
    }

    return true;
}

function handleSubmit() {
    logger.info('Submitting complaint with data:', flowData);

    const complaintData = {
        complaint_type: flowData.complaintType || '',
        description: flowData.complaintDescription || '',
        house_no: flowData.addressDetails?.houseNo || '',
        area: flowData.area || '',
        ward: flowData.addressDetails?.ward || '',
        zone: flowData.addressDetails?.zone || '',
        phone_number: flowData.phoneNumber || ''
    };

    return true;
}

function handleSuccess() {
    logger.info('Complaint flow completed successfully');
    return true;
}

function getCurrentStep() {
    return currentStep;
}

function getCurrentStepName() {
    return currentStep.replace(/_/g, ' ').toUpperCase();
}

function goToStep(step) {
    if (FLOW_CONFIG[step]) {
        currentStep = step;
        logger.info('Navigated to step:', step);
        return true;
    }

    logger.error('Invalid step:', step);
    return false;
}

function goToPreviousStep() {
    if (flowHistory.length > 1) {
        const previousStep = flowHistory[flowHistory.length - 2].step;
        currentStep = previousStep;
        flowHistory.pop();

        logger.info('Moved to previous step:', previousStep);
        return true;
    }

    logger.warn('No previous step available');
    return false;
}

function skipToStep(step) {
    if (FLOW_CONFIG[step]) {
        currentStep = step;
        logger.info('Skipped to step:', step);
        return true;
    }

    logger.error('Invalid step to skip to:', step);
    return false;
}

function getFlowProgress() {
    const steps = Object.values(FLOW_STEPS);
    const currentIndex = steps.indexOf(currentStep);
    const totalSteps = steps.length;

    return {
        currentStep: currentStep,
        currentIndex: currentIndex,
        totalSteps: totalSteps,
        progress: ((currentIndex + 1) / totalSteps) * 100,
        history: flowHistory
    };
}

function getFlowData() {
    return { ...flowData };
}

function clearFlowData() {
    flowData = {};
    logger.info('Flow data cleared');
}

function resetFlow() {
    initializeFlow();
    clearFlowData();
    logger.info('Flow reset completely');
}

function speakFlowMessage(step = null, callback = null) {
    const messageStep = step || currentStep;
    const config = FLOW_CONFIG[messageStep];

    if (config) {
        speak(config.prompt, null, callback);
    }
}

function onTranscriptUpdate(finalTranscript, interimTranscript) {
    logger.debug('Transcript update - Final:', finalTranscript, 'Interim:', interimTranscript);

    if (typeof onFlowTranscriptUpdate === 'function') {
        onFlowTranscriptUpdate(finalTranscript, interimTranscript);
    }
}

function onRecognitionError(errorMessage) {
    logger.error('Recognition error in flow:', errorMessage);

    if (typeof onFlowError === 'function') {
        onFlowError(errorMessage);
    }
}

function onListeningStart() {
    logger.info('Listening started in flow');

    if (typeof onFlowListeningStart === 'function') {
        onFlowListeningStart();
    }
}

function onListeningEnd() {
    logger.info('Listening ended in flow');

    if (typeof onFlowListeningEnd === 'function') {
        onFlowListeningEnd();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    logger.info('Initializing conversation flow');
    initializeFlow();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FLOW_STEPS,
        FLOW_CONFIG,
        initializeFlow,
        getFlowMessage,
        getCurrentStepConfig,
        processUserInput,
        getCurrentStep,
        getCurrentStepName,
        goToStep,
        goToPreviousStep,
        skipToStep,
        getFlowProgress,
        getFlowData,
        clearFlowData,
        resetFlow,
        speakFlowMessage
    };
}
