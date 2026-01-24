// AI Smart Call Center - UI Management Module

// ===== Message/Notification System =====

/**
 * Show message/notification
 * @param {String} message - Message text
 * @param {String} type - Message type (info, success, error, warning)
 * @param {Number} duration - Auto-hide duration in ms
 */
function showMessage(message, type = 'info', duration = null) {
    logger.info(`[${type}] ${message}`);

    // Create notification element
    const notification = createNotification(message, type);
    document.body.appendChild(notification);

    // Auto-hide after duration
    if (duration) {
        setTimeout(() => {
            notification.remove();
        }, duration);
    }
}

/**
 * Show error message
 * @param {String} message - Error message
 * @param {Number} duration - Auto-hide duration
 */
function showError(message, duration = CONFIG.UI.TOAST_DURATION) {
    showMessage(message, 'error', duration);
}

/**
 * Show success message
 * @param {String} message - Success message
 * @param {Number} duration - Auto-hide duration
 */
function showSuccess(message, duration = CONFIG.UI.TOAST_DURATION) {
    showMessage(message, 'success', duration);
}

/**
 * Show info message
 * @param {String} message - Info message
 * @param {Number} duration - Auto-hide duration
 */
function showInfo(message, duration = CONFIG.UI.TOAST_DURATION) {
    showMessage(message, 'info', duration);
}

/**
 * Show warning message
 * @param {String} message - Warning message
 * @param {Number} duration - Auto-hide duration
 */
function showWarning(message, duration = CONFIG.UI.TOAST_DURATION) {
    showMessage(message, 'warning', duration);
}

/**
 * Create notification element
 * @param {String} message - Notification message
 * @param {String} type - Notification type
 * @returns {HTMLElement} Notification element
 */
function createNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: var(--${type === 'error' ? 'danger' : type === 'success' ? 'accent' : 'primary'}-color);
        color: white;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease-out;
    `;

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
        margin-left: 15px;
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
    `;
    closeBtn.onclick = () => notification.remove();
    notification.appendChild(closeBtn);

    return notification;
}

// ===== Loading Indicators =====

/**
 * Show loading spinner
 * @param {String} message - Optional loading message
 */
function showLoading(message = 'Loading...') {
    logger.info('Showing loading indicator');

    // Remove existing loader if present
    removeLoading();

    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9998;
    `;

    const spinnerBox = document.createElement('div');
    spinnerBox.style.cssText = `
        text-align: center;
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    `;

    // Add spinner animation
    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width: 50px;
        height: 50px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 15px;
    `;

    const text = document.createElement('p');
    text.textContent = message;
    text.style.cssText = `
        color: var(--dark-text);
        margin: 0;
        font-weight: 500;
    `;

    spinnerBox.appendChild(spinner);
    spinnerBox.appendChild(text);
    loader.appendChild(spinnerBox);
    document.body.appendChild(loader);

    // Add animation styles if not present
    if (!document.getElementById('loader-styles')) {
        const style = document.createElement('style');
        style.id = 'loader-styles';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

/**
 * Hide loading spinner
 */
function removeLoading() {
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.remove();
    }
}

/**
 * Alternative alias for removeLoading
 */
function hideLoading() {
    removeLoading();
}

// ===== Text/Content Updates =====

/**
 * Update element content
 * @param {String} selector - CSS selector
 * @param {String|HTMLElement} content - Content to set
 * @param {Boolean} asHTML - If true, set as innerHTML; else textContent
 */
function updateUI(selector, content, asHTML = false) {
    const element = document.querySelector(selector);
    if (element) {
        if (asHTML) {
            element.innerHTML = content;
        } else {
            element.textContent = content;
        }
        logger.debug('UI updated:', selector);
    } else {
        logger.warn('Element not found:', selector);
    }
}

/**
 * Update multiple UI elements at once
 * @param {Object} updates - Object with selector as key and content as value
 */
function updateUIBatch(updates) {
    for (const [selector, content] of Object.entries(updates)) {
        updateUI(selector, content);
    }
}

/**
 * Set element text
 * @param {String} selector - CSS selector
 * @param {String} text - Text content
 */
function setText(selector, text) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = text;
    }
}

/**
 * Get element text
 * @param {String} selector - CSS selector
 * @returns {String} Element text
 */
function getText(selector) {
    const element = document.querySelector(selector);
    return element ? element.textContent : '';
}

/**
 * Set element HTML
 * @param {String} selector - CSS selector
 * @param {String} html - HTML content
 */
function setHTML(selector, html) {
    const element = document.querySelector(selector);
    if (element) {
        element.innerHTML = html;
    }
}

/**
 * Get element HTML
 * @param {String} selector - CSS selector
 * @returns {String} Element HTML
 */
function getHTML(selector) {
    const element = document.querySelector(selector);
    return element ? element.innerHTML : '';
}

// ===== Class/Attribute Management =====

/**
 * Add class to element
 * @param {String} selector - CSS selector
 * @param {String} className - Class name to add
 */
function addClass(selector, className) {
    const element = document.querySelector(selector);
    if (element) {
        element.classList.add(className);
    }
}

/**
 * Remove class from element
 * @param {String} selector - CSS selector
 * @param {String} className - Class name to remove
 */
function removeClass(selector, className) {
    const element = document.querySelector(selector);
    if (element) {
        element.classList.remove(className);
    }
}

/**
 * Toggle class on element
 * @param {String} selector - CSS selector
 * @param {String} className - Class name to toggle
 */
function toggleClass(selector, className) {
    const element = document.querySelector(selector);
    if (element) {
        element.classList.toggle(className);
    }
}

/**
 * Set element attribute
 * @param {String} selector - CSS selector
 * @param {String} attribute - Attribute name
 * @param {String} value - Attribute value
 */
function setAttribute(selector, attribute, value) {
    const element = document.querySelector(selector);
    if (element) {
        element.setAttribute(attribute, value);
    }
}

/**
 * Get element attribute
 * @param {String} selector - CSS selector
 * @param {String} attribute - Attribute name
 * @returns {String} Attribute value
 */
function getAttribute(selector, attribute) {
    const element = document.querySelector(selector);
    return element ? element.getAttribute(attribute) : null;
}

/**
 * Show element
 * @param {String} selector - CSS selector
 */
function show(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.style.display = '';
        logger.debug('Element shown:', selector);
    }
}

/**
 * Hide element
 * @param {String} selector - CSS selector
 */
function hide(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.style.display = 'none';
        logger.debug('Element hidden:', selector);
    }
}

/**
 * Toggle element visibility
 * @param {String} selector - CSS selector
 */
function toggle(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.style.display = element.style.display === 'none' ? '' : 'none';
    }
}

// ===== Event Handlers =====

/**
 * Handle button clicks
 * @param {String} selector - Button CSS selector
 * @param {Function} callback - Click handler function
 */
function onButtonClick(selector, callback) {
    const button = document.querySelector(selector);
    if (button) {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            logger.info('Button clicked:', selector);
            callback(e);
        });
    } else {
        logger.warn('Button not found:', selector);
    }
}

/**
 * Handle multiple button clicks
 * @param {Object} buttonHandlers - Object with selector as key and callback as value
 */
function onButtonClickBatch(buttonHandlers) {
    for (const [selector, callback] of Object.entries(buttonHandlers)) {
        onButtonClick(selector, callback);
    }
}

/**
 * Handle form submission
 * @param {String} selector - Form CSS selector
 * @param {Function} callback - Submit handler function
 */
function onFormSubmit(selector, callback) {
    const form = document.querySelector(selector);
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            logger.info('Form submitted:', selector);
            callback(e);
        });
    } else {
        logger.warn('Form not found:', selector);
    }
}

/**
 * Handle input change
 * @param {String} selector - Input CSS selector
 * @param {Function} callback - Change handler function
 */
function onInputChange(selector, callback) {
    const input = document.querySelector(selector);
    if (input) {
        input.addEventListener('change', (e) => {
            logger.debug('Input changed:', selector, e.target.value);
            callback(e);
        });
    }
}

/**
 * Handle select change
 * @param {String} selector - Select CSS selector
 * @param {Function} callback - Change handler function
 */
function onSelectChange(selector, callback) {
    onInputChange(selector, callback);
}

/**
 * Enable element
 * @param {String} selector - CSS selector
 */
function enableElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.disabled = false;
        removeClass(selector, 'disabled');
    }
}

/**
 * Disable element
 * @param {String} selector - CSS selector
 */
function disableElement(selector) {
    const element = document.querySelector(selector);
    if (element) {
        element.disabled = true;
        addClass(selector, 'disabled');
    }
}

// ===== Navigation =====

/**
 * Navigate to a page
 * @param {String} page - Page URL or path
 * @param {Boolean} newTab - Open in new tab
 */
function navigateTo(page, newTab = false) {
    logger.info('Navigating to:', page);

    if (newTab) {
        window.open(page, '_blank');
    } else {
        window.location.href = page;
    }
}

/**
 * Go back to previous page
 */
function goBack() {
    logger.info('Going back to previous page');
    window.history.back();
}

/**
 * Reload current page
 */
function reloadPage() {
    logger.info('Reloading page');
    window.location.reload();
}

/**
 * Get current page URL
 * @returns {String} Current page URL
 */
function getCurrentPage() {
    return window.location.href;
}

/**
 * Get page title
 * @returns {String} Page title
 */
function getPageTitle() {
    return document.title;
}

/**
 * Set page title
 * @param {String} title - New page title
 */
function setPageTitle(title) {
    document.title = title;
    logger.info('Page title set to:', title);
}

/**
 * Check if page is at URL
 * @param {String} url - URL to check
 * @returns {Boolean} True if current page matches
 */
function isAtPage(url) {
    return window.location.pathname.includes(url);
}

// ===== Form Utilities =====

/**
 * Get form data as object
 * @param {String} selector - Form CSS selector
 * @returns {Object} Form data
 */
function getFormData(selector) {
    const form = document.querySelector(selector);
    if (!form) return null;

    const formData = new FormData(form);
    const data = {};

    for (const [key, value] of formData.entries()) {
        data[key] = value;
    }

    return data;
}

/**
 * Set form data from object
 * @param {String} selector - Form CSS selector
 * @param {Object} data - Data to populate
 */
function setFormData(selector, data) {
    const form = document.querySelector(selector);
    if (!form) return;

    for (const [key, value] of Object.entries(data)) {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
            input.value = value;
        }
    }
}

/**
 * Clear form
 * @param {String} selector - Form CSS selector
 */
function clearForm(selector) {
    const form = document.querySelector(selector);
    if (form) {
        form.reset();
        logger.info('Form cleared:', selector);
    }
}

/**
 * Clear input
 * @param {String} selector - Input CSS selector
 */
function clearInput(selector) {
    const input = document.querySelector(selector);
    if (input) {
        input.value = '';
    }
}

/**
 * Get input value
 * @param {String} selector - Input CSS selector
 * @returns {String} Input value
 */
function getInputValue(selector) {
    const input = document.querySelector(selector);
    return input ? input.value : '';
}

/**
 * Set input value
 * @param {String} selector - Input CSS selector
 * @param {String} value - Value to set
 */
function setInputValue(selector, value) {
    const input = document.querySelector(selector);
    if (input) {
        input.value = value;
    }
}

// ===== Initialize UI =====

/**
 * Initialize all UI interactions
 */
function initializeUI() {
    logger.info('Initializing UI module');

    // Setup event listeners for common elements if they exist
    const callButton = document.querySelector('#startCall, [onclick*="startListening"]');
    if (callButton) {
        callButton.addEventListener('click', () => {
            logger.info('Call started');
        });
    }

    // Initialize tooltips, modals, etc. as needed
    setupResponsiveMenu();
}

/**
 * Setup responsive menu
 */
function setupResponsiveMenu() {
    // Add mobile menu functionality if needed
    logger.debug('Responsive menu setup initialized');
}

/**
 * Show modal/dialog
 * @param {String} title - Modal title
 * @param {String} message - Modal message
 * @param {String} type - Modal type (info, warning, error, success)
 * @param {Object} buttons - Button configuration
 */
function showModal(title, message, type = 'info', buttons = null) {
    const modal = document.createElement('div');
    modal.className = `modal modal-${type}`;
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        max-width: 500px;
        min-width: 300px;
    `;

    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    titleEl.style.cssText = 'color: var(--primary-color); margin-bottom: 15px;';
    modal.appendChild(titleEl);

    const messageEl = document.createElement('p');
    messageEl.textContent = message;
    messageEl.style.cssText = 'color: var(--dark-text); margin-bottom: 20px; line-height: 1.6;';
    modal.appendChild(messageEl);

    if (buttons) {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display: flex; gap: 10px; justify-content: flex-end;';

        for (const [label, callback] of Object.entries(buttons)) {
            const btn = document.createElement('button');
            btn.textContent = label;
            btn.className = 'btn btn-primary';
            btn.style.cssText = 'padding: 10px 20px; cursor: pointer;';
            btn.onclick = () => {
                if (typeof callback === 'function') callback();
                modal.remove();
                overlay.remove();
            };
            buttonContainer.appendChild(btn);
        }
        modal.appendChild(buttonContainer);
    }

    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999;
    `;
    overlay.onclick = () => {
        modal.remove();
        overlay.remove();
    };

    document.body.appendChild(overlay);
    document.body.appendChild(modal);
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    initializeUI();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showMessage,
        showError,
        showSuccess,
        showInfo,
        showWarning,
        showLoading,
        removeLoading,
        hideLoading,
        updateUI,
        updateUIBatch,
        setText,
        getText,
        setHTML,
        getHTML,
        addClass,
        removeClass,
        toggleClass,
        setAttribute,
        getAttribute,
        show,
        hide,
        toggle,
        onButtonClick,
        onButtonClickBatch,
        onFormSubmit,
        onInputChange,
        onSelectChange,
        enableElement,
        disableElement,
        navigateTo,
        goBack,
        reloadPage,
        getCurrentPage,
        getPageTitle,
        setPageTitle,
        isAtPage,
        getFormData,
        setFormData,
        clearForm,
        clearInput,
        getInputValue,
        setInputValue,
        showModal,
        initializeUI
    };
}
