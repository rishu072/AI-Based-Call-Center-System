async function apiRequest(endpoint, method = 'GET', data = null, options = {}) {
    const url = CONFIG.API.BASE_URL + endpoint;
    const retryAttempts = options.retryAttempts || CONFIG.API.RETRY_ATTEMPTS;
    const timeout = options.timeout || CONFIG.API.TIMEOUT;

    const requestOptions = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...options.headers
        },
        timeout: timeout
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        requestOptions.body = JSON.stringify(data);
    }

    let lastError = null;
    let attempt = 0;

    while (attempt < retryAttempts) {
        try {
            logger.info(`API Request: ${method} ${endpoint} (Attempt ${attempt + 1}/${retryAttempts})`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(url, {
                ...requestOptions,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new ApiError(
                    errorData.message || `HTTP Error ${response.status}`,
                    response.status,
                    errorData
                );
            }

            const responseData = await response.json().catch(() => ({}));

            logger.info(`API Success: ${method} ${endpoint}`, responseData);

            return {
                success: true,
                status: response.status,
                data: responseData
            };

        } catch (error) {
            lastError = error;

            if (error instanceof ApiError) {
                logger.error(`API Error: ${error.message}`, error);

                if (error.status >= 400 && error.status < 500) {
                    throw error;
                }
            } else if (error.name === 'AbortError') {
                logger.warn(`API Request timeout: ${endpoint}`);
            } else {
                logger.error(`API Request failed: ${error.message}`);
            }

            attempt++;

            if (attempt < retryAttempts) {
                const delay = CONFIG.API.RETRY_DELAY * Math.pow(2, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError || new Error('API request failed after all retries');
}

class ApiError extends Error {
    constructor(message, status = 500, response = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.response = response;
    }
}

async function submitComplaint(complaintData) {
    try {
        logger.info('Submitting complaint:', complaintData);

        if (!validateComplaintData(complaintData)) {
            throw new ApiError('Invalid complaint data', 400);
        }

        const result = await apiRequest(
            CONFIG.API.ENDPOINTS.COMPLAINTS,
            'POST',
            complaintData
        );

        if (result.success) {
            logger.info('Complaint submitted successfully');

            if (result.data.complaint_id) {
                setState({
                    complaintId: result.data.complaint_id
                });
            }

            return {
                success: true,
                complaint_id: result.data.complaint_id,
                message: result.data.message || 'Complaint submitted successfully'
            };
        }

    } catch (error) {
        logger.error('Error submitting complaint:', error);

        return {
            success: false,
            error: error.message,
            details: error.response
        };
    }
}

async function getComplaintStatus(complaintId) {
    try {
        if (!complaintId) {
            throw new ApiError('Complaint ID is required', 400);
        }

        logger.info('Fetching complaint status for:', complaintId);

        const endpoint = `${CONFIG.API.ENDPOINTS.COMPLAINTS}/${complaintId}`;
        const result = await apiRequest(endpoint, 'GET');

        if (result.success) {
            logger.info('Complaint status retrieved:', result.data);

            return {
                success: true,
                complaint: result.data
            };
        }

    } catch (error) {
        logger.error('Error fetching complaint status:', error);

        return {
            success: false,
            error: error.message
        };
    }
}

async function getAllComplaints() {
    try {
        logger.info('Fetching all complaints');

        const result = await apiRequest(CONFIG.API.ENDPOINTS.COMPLAINTS, 'GET');

        if (result.success) {
            logger.info('Complaints retrieved:', result.data.length, 'items');

            return {
                success: true,
                complaints: result.data
            };
        }

    } catch (error) {
        logger.error('Error fetching complaints:', error);

        return {
            success: false,
            error: error.message
        };
    }
}

async function updateComplaintStatus(complaintId, status) {
    try {
        if (!complaintId || !status) {
            throw new ApiError('Complaint ID and status are required', 400);
        }

        logger.info('Updating complaint status:', complaintId, 'to', status);

        const endpoint = `${CONFIG.API.ENDPOINTS.COMPLAINTS}/${complaintId}`;
        const result = await apiRequest(endpoint, 'PUT', { status: status });

        if (result.success) {
            logger.info('Complaint status updated successfully');

            return {
                success: true,
                message: 'Status updated successfully'
            };
        }

    } catch (error) {
        logger.error('Error updating complaint status:', error);

        return {
            success: false,
            error: error.message
        };
    }
}

async function checkAPIHealth() {
    try {
        logger.info('Checking API health');

        const result = await apiRequest('/health', 'GET');

        if (result.success) {
            logger.info('API is healthy');

            return {
                success: true,
                status: 'healthy'
            };
        }

    } catch (error) {
        logger.error('API health check failed:', error);

        return {
            success: false,
            status: 'unhealthy',
            error: error.message
        };
    }
}

function validateComplaintData(complaintData) {
    if (!complaintData || typeof complaintData !== 'object') {
        logger.error('Complaint data must be an object');
        return false;
    }

    if (!complaintData.complaint_type) {
        logger.error('Missing required field: complaint_type');
        return false;
    }

    if (complaintData.phone_number && complaintData.phone_number.trim()) {
        const phoneDigits = complaintData.phone_number.replace(/\D/g, '');
        if (phoneDigits.length !== 10) {
            logger.warn('Phone number should be 10 digits, got:', phoneDigits.length);
        }
    }

    const validTypes = Object.keys(CONFIG.COMPLAINT_TYPES);
    if (!validTypes.includes(complaintData.complaint_type)) {
        logger.warn('Unknown complaint type:', complaintData.complaint_type);
    }

    logger.info('Complaint data validation passed');
    return true;
}

function getApiErrorMessage(response) {
    if (!response) {
        return CONFIG.ERRORS.API_ERROR;
    }

    if (typeof response === 'string') {
        return response;
    }

    if (response.error) {
        return response.error;
    }

    if (response.message) {
        return response.message;
    }

    return CONFIG.ERRORS.API_ERROR;
}

async function retryApiCall(apiCallFunction, maxAttempts = 3) {
    let lastError;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            logger.info(`Attempt ${attempt}/${maxAttempts}`);
            return await apiCallFunction();
        } catch (error) {
            lastError = error;
            logger.warn(`Attempt ${attempt} failed:`, error.message);

            if (attempt < maxAttempts) {
                const delay = 1000 * Math.pow(2, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError;
}

function createFormData(data) {
    const formData = new FormData();

    for (const [key, value] of Object.entries(data)) {
        if (value instanceof File) {
            formData.append(key, value);
        } else if (Array.isArray(value)) {
            value.forEach((item, index) => {
                formData.append(`${key}[${index}]`, item);
            });
        } else {
            formData.append(key, value);
        }
    }

    return formData;
}

async function getComplaintCategories() {
    try {
        logger.info('Fetching complaint categories');
        const result = await apiRequest('/api/vmc/categories', 'GET');

        if (result.success && result.data.success) {
            return {
                success: true,
                categories: result.data.categories
            };
        }
        return { success: false, categories: [] };
    } catch (error) {
        logger.error('Error fetching categories:', error);
        return { success: false, error: error.message };
    }
}

async function getSubCategories(complaintType, language = 'en') {
    try {
        logger.info('Fetching sub-categories for:', complaintType);
        const endpoint = `/api/vmc/sub-categories/${encodeURIComponent(complaintType)}?language=${language}`;
        const result = await apiRequest(endpoint, 'GET');

        if (result.success && result.data.success) {
            return {
                success: true,
                sub_categories: result.data.sub_categories
            };
        }
        return { success: false, sub_categories: [] };
    } catch (error) {
        logger.error('Error fetching sub-categories:', error);
        return { success: false, error: error.message };
    }
}

async function detectLocation(area, text = '') {
    try {
        logger.info('Detecting location for area:', area);
        const result = await apiRequest('/api/vmc/detect-location', 'POST', {
            area: area,
            text: text || area
        });

        if (result.success && result.data.success) {
            return {
                success: true,
                location: result.data.location,
                auto_detected: result.data.auto_detected
            };
        }
        return { success: false, location: null };
    } catch (error) {
        logger.error('Error detecting location:', error);
        return { success: false, error: error.message };
    }
}

async function getVMCWards() {
    try {
        logger.info('Fetching VMC wards');
        const result = await apiRequest('/api/vmc/wards', 'GET');

        if (result.success && result.data.success) {
            return {
                success: true,
                wards: result.data.wards
            };
        }
        return { success: false, wards: {} };
    } catch (error) {
        logger.error('Error fetching wards:', error);
        return { success: false, error: error.message };
    }
}

async function getVMCZones() {
    try {
        logger.info('Fetching VMC zones');
        const result = await apiRequest('/api/vmc/zones', 'GET');

        if (result.success && result.data.success) {
            return {
                success: true,
                zones: result.data.zones
            };
        }
        return { success: false, zones: {} };
    } catch (error) {
        logger.error('Error fetching zones:', error);
        return { success: false, error: error.message };
    }
}

async function getKnownAreas() {
    try {
        logger.info('Fetching known areas');
        const result = await apiRequest('/api/vmc/areas', 'GET');

        if (result.success && result.data.success) {
            return {
                success: true,
                areas: result.data.areas
            };
        }
        return { success: false, areas: [] };
    } catch (error) {
        logger.error('Error fetching areas:', error);
        return { success: false, error: error.message };
    }
}

async function generateComplaintId(complaintType, ward = '') {
    try {
        logger.info('Generating complaint ID for:', complaintType);
        const result = await apiRequest('/api/vmc/generate-id', 'POST', {
            complaint_type: complaintType,
            ward: ward
        });

        if (result.success && result.data.success) {
            return {
                success: true,
                complaint_id: result.data.complaint_id
            };
        }
        return { success: false, complaint_id: null };
    } catch (error) {
        logger.error('Error generating complaint ID:', error);
        return { success: false, error: error.message };
    }
}

async function getComplaintPriority(complaintType, subCategory = null) {
    try {
        logger.info('Getting priority for:', complaintType, subCategory);
        const result = await apiRequest('/api/vmc/priority', 'POST', {
            complaint_type: complaintType,
            sub_category: subCategory
        });

        if (result.success && result.data.success) {
            return {
                success: true,
                priority: result.data.priority
            };
        }
        return { success: false, priority: 'normal' };
    } catch (error) {
        logger.error('Error getting priority:', error);
        return { success: false, error: error.message };
    }
}

async function getIVRQuestion(complaintType, questionType = 'initial', language = 'en') {
    try {
        logger.info('Getting IVR question for:', complaintType);
        const result = await apiRequest('/api/vmc/ivr-question', 'POST', {
            complaint_type: complaintType,
            question_type: questionType,
            language: language
        });

        if (result.success && result.data.success) {
            return {
                success: true,
                question: result.data.question
            };
        }
        return { success: false, question: '' };
    } catch (error) {
        logger.error('Error getting IVR question:', error);
        return { success: false, error: error.message };
    }
}

async function detectComplaintType(text, language = 'en') {
    try {
        logger.info('Detecting complaint type from text');
        const result = await apiRequest('/api/ai/detect-type', 'POST', {
            text: text,
            context: { language: language }
        });

        if (result.success && result.data.success) {
            return {
                success: true,
                complaint_type: result.data.complaint_type,
                sub_category: result.data.sub_category,
                confidence: result.data.confidence,
                ivr_question: result.data.ivr_question
            };
        }
        return { success: false, complaint_type: null };
    } catch (error) {
        logger.error('Error detecting complaint type:', error);
        return { success: false, error: error.message };
    }
}

async function getAIResponse(intent, data = {}, language = 'en') {
    try {
        logger.info('Getting AI response for intent:', intent);
        const result = await apiRequest('/api/ai/response', 'POST', {
            intent: intent,
            data: data,
            language: language
        });

        if (result.success && result.data.success) {
            return {
                success: true,
                response: result.data.response
            };
        }
        return { success: false, response: '' };
    } catch (error) {
        logger.error('Error getting AI response:', error);
        return { success: false, error: error.message };
    }
}

async function generateTTS(text, language = 'en') {
    try {
        logger.info('Generating TTS audio');
        const result = await apiRequest('/api/tts/generate', 'POST', {
            text: text,
            language: language
        });

        if (result.success && result.data.success) {
            return {
                success: true,
                audio_url: CONFIG.API.BASE_URL + result.data.audio_url
            };
        }
        return { success: false, audio_url: null };
    } catch (error) {
        logger.error('Error generating TTS:', error);
        return { success: false, error: error.message };
    }
}


// ===== IVR Controller API Functions =====

async function createIVRSession() {
    try {
        logger.info('Creating new IVR session');
        const result = await apiRequest('/api/ivr/session', 'POST');

        if (result.success && result.data.success) {
            return {
                success: true,
                session_id: result.data.session_id,
                greeting: result.data.greeting
            };
        }
        return { success: false, session_id: null };
    } catch (error) {
        logger.error('Error creating IVR session:', error);
        return { success: false, error: error.message };
    }
}

async function processIVRInput(userInput, sessionId = null) {
    try {
        logger.info('Processing IVR input:', userInput);
        const result = await apiRequest('/api/ivr/process', 'POST', {
            user_input: userInput,
            session_id: sessionId
        });

        if (result.success && result.data.success) {
            return {
                success: true,
                session_id: result.data.session_id,
                state: result.data.state,
                language: result.data.language,
                message: result.data.message,
                is_complete: result.data.is_complete,
                collected_data: result.data.collected_data,
                complaint_id: result.data.complaint_id,
                next_expected_input: result.data.next_expected_input
            };
        }
        return { success: false, message: 'Failed to process input' };
    } catch (error) {
        logger.error('Error processing IVR input:', error);
        return { success: false, error: error.message };
    }
}

async function getIVRSession(sessionId) {
    try {
        logger.info('Getting IVR session:', sessionId);
        const result = await apiRequest(`/api/ivr/session/${sessionId}`, 'GET');

        if (result.success && result.data.success) {
            return {
                success: true,
                session: result.data
            };
        }
        return { success: false, session: null };
    } catch (error) {
        logger.error('Error getting IVR session:', error);
        return { success: false, error: error.message };
    }
}

async function endIVRSession(sessionId) {
    try {
        logger.info('Ending IVR session:', sessionId);
        const result = await apiRequest(`/api/ivr/session/${sessionId}`, 'DELETE');

        return { success: result.success };
    } catch (error) {
        logger.error('Error ending IVR session:', error);
        return { success: false, error: error.message };
    }
}

async function downloadComplaintPDF(complaintId) {
    try {
        logger.info('Downloading PDF for complaint:', complaintId);

        const url = `${CONFIG.API.BASE_URL}${CONFIG.API.ENDPOINTS.COMPLAINTS}/${complaintId}/pdf`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `complaint_${complaintId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        logger.info('PDF downloaded successfully');
        return true;

    } catch (error) {
        logger.error('Error downloading PDF:', error);
        return false;
    }
}

function initializeAPI() {
    logger.info('API module initialized');

    if (CONFIG.APP.DEBUG) {
        checkAPIHealth().then(result => {
            if (result.success) {
                logger.info('API is ready');
            } else {
                logger.warn('API health check failed - backend may be unavailable');
            }
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    initializeAPI();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        apiRequest,
        ApiError,
        submitComplaint,
        getComplaintStatus,
        getAllComplaints,
        updateComplaintStatus,
        checkAPIHealth,
        validateComplaintData,
        getApiErrorMessage,
        retryApiCall,
        createFormData,
        downloadComplaintPDF,
        initializeAPI,
        // IVR Controller Functions
        createIVRSession,
        processIVRInput,
        getIVRSession,
        endIVRSession
    };
}
