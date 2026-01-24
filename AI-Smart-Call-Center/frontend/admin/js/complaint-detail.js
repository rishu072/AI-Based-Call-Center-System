// Complaint Detail Page JavaScript
const API_BASE_URL = 'http://localhost:5000/api';

let currentComplaint = null;
let complaintUpdates = [];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const complaintId = urlParams.get('id');

    if (!complaintId) {
        showError('No complaint ID provided');
        return;
    }

    loadComplaintDetails(complaintId);
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    const statusUpdateForm = document.getElementById('statusUpdateForm');

    if (statusUpdateForm) {
        statusUpdateForm.addEventListener('submit', handleStatusUpdate);
    }
}

// Load complaint details
async function loadComplaintDetails(complaintId) {
    try {
        // Show loading state
        document.getElementById('loadingState').style.display = 'block';
        document.getElementById('detailContent').style.display = 'none';
        document.getElementById('errorState').style.display = 'none';

        // Fetch complaint details
        const response = await fetch(`${API_BASE_URL}/complaints/${encodeURIComponent(complaintId)}`);

        if (!response.ok) {
            throw new Error('Complaint not found');
        }

        const data = await response.json();
        currentComplaint = data.data;

        // Load updates history
        await loadComplaintUpdates(complaintId);

        // Display complaint details
        displayComplaintDetails();

        // Hide loading, show content
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('detailContent').style.display = 'block';

    } catch (error) {
        console.error('Error loading complaint:', error);
        showError(error.message || 'Failed to load complaint details');
    }
}

// Load complaint updates history
async function loadComplaintUpdates(complaintId) {
    try {
        // Try to fetch updates from API (if endpoint exists)
        const response = await fetch(`${API_BASE_URL}/complaints/${encodeURIComponent(complaintId)}/updates`);

        if (response.ok) {
            const data = await response.json();
            complaintUpdates = data.data || [];
        } else {
            // If endpoint doesn't exist, use localStorage as fallback
            const storedUpdates = localStorage.getItem(`updates_${complaintId}`);
            complaintUpdates = storedUpdates ? JSON.parse(storedUpdates) : [];
        }

        // Add initial creation as first update if no updates exist
        if (complaintUpdates.length === 0 && currentComplaint) {
            complaintUpdates = [{
                timestamp: currentComplaint.created_at,
                status: 'pending',
                note: 'Complaint registered',
                admin: 'System'
            }];
        }

    } catch (error) {
        console.error('Error loading updates:', error);
        complaintUpdates = [];
    }

    displayUpdateHistory();
}

// Display complaint details
function displayComplaintDetails() {
    if (!currentComplaint) return;

    // Basic Information
    document.getElementById('complaintId').textContent = currentComplaint.id || 'N/A';
    document.getElementById('category').textContent = formatCategory(currentComplaint.category);
    document.getElementById('subCategory').textContent = currentComplaint.sub_category || 'N/A';

    const priorityElement = document.getElementById('priority');
    priorityElement.textContent = currentComplaint.priority || 'low';
    priorityElement.className = `info-value priority-badge ${currentComplaint.priority || 'low'}`;

    document.getElementById('createdDate').textContent = formatDate(currentComplaint.created_at);
    document.getElementById('updatedDate').textContent = formatDate(currentComplaint.updated_at || currentComplaint.created_at);

    // Status Badge
    const statusBadge = document.getElementById('statusBadge');
    const status = currentComplaint.status || 'pending';
    statusBadge.textContent = formatStatus(status);
    statusBadge.className = `status-badge ${status}`;

    // Citizen Information
    document.getElementById('citizenName').textContent = currentComplaint.name || 'N/A';
    document.getElementById('phoneNumber').textContent = currentComplaint.phone || 'N/A';
    document.getElementById('email').textContent = currentComplaint.email || 'N/A';

    // Location Information
    document.getElementById('ward').textContent = currentComplaint.ward || 'N/A';
    document.getElementById('zone').textContent = currentComplaint.zone || 'N/A';
    document.getElementById('address').textContent = currentComplaint.address || 'N/A';
    document.getElementById('landmark').textContent = currentComplaint.landmark || 'N/A';
    document.getElementById('area').textContent = currentComplaint.area || 'N/A';

    // Description
    document.getElementById('description').textContent = currentComplaint.description || 'No description provided';

    // Set current status in dropdown
    const newStatusSelect = document.getElementById('newStatus');
    if (newStatusSelect) {
        newStatusSelect.value = currentComplaint.status || 'pending';
    }
}

// Display update history
function displayUpdateHistory() {
    const updateHistoryContainer = document.getElementById('updateHistory');
    const noUpdatesElement = document.getElementById('noUpdates');
    const updateCountElement = document.getElementById('updateCount');

    if (complaintUpdates.length === 0) {
        updateHistoryContainer.innerHTML = '';
        noUpdatesElement.style.display = 'block';
        updateCountElement.textContent = '0 updates';
        return;
    }

    noUpdatesElement.style.display = 'none';
    updateCountElement.textContent = `${complaintUpdates.length} update${complaintUpdates.length > 1 ? 's' : ''}`;

    // Sort updates by timestamp (newest first)
    const sortedUpdates = [...complaintUpdates].sort((a, b) => {
        return new Date(b.timestamp) - new Date(a.timestamp);
    });

    const timelineHTML = sortedUpdates.map(update => createTimelineItem(update)).join('');
    updateHistoryContainer.innerHTML = timelineHTML;
}

// Create timeline item for update
function createTimelineItem(update) {
    const statusClass = update.status || 'pending';

    return `
        <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
                <div class="timeline-header">
                    <span class="status-badge ${statusClass} timeline-status">
                        ${formatStatus(update.status)}
                    </span>
                    <span class="timeline-date">${formatDate(update.timestamp)}</span>
                </div>
                <p class="timeline-note">${escapeHtml(update.note)}</p>
                ${update.admin ? `<p class="timeline-note" style="font-size: 12px; margin-top: 4px;">By: ${escapeHtml(update.admin)}</p>` : ''}
            </div>
        </div>
    `;
}

// Handle status update form submission
async function handleStatusUpdate(e) {
    e.preventDefault();

    const newStatus = document.getElementById('newStatus').value;
    const updateNote = document.getElementById('updateNote').value;

    if (!newStatus || !updateNote) {
        alert('Please fill in all fields');
        return;
    }

    try {
        // Get admin username
        const session = authManager.getSession();
        const adminName = session ? session.username : 'Admin';

        // Create update object
        const update = {
            timestamp: new Date().toISOString(),
            status: newStatus,
            note: updateNote,
            admin: adminName
        };

        // Update complaint status in backend
        const response = await fetch(`${API_BASE_URL}/complaints/${encodeURIComponent(currentComplaint.id)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: newStatus,
                updated_at: update.timestamp
            })
        });

        if (!response.ok) {
            throw new Error('Failed to update complaint status');
        }

        // Save update to localStorage (as backend doesn't have updates endpoint yet)
        const storedUpdates = localStorage.getItem(`updates_${currentComplaint.id}`);
        const existingUpdates = storedUpdates ? JSON.parse(storedUpdates) : [];
        existingUpdates.push(update);
        localStorage.setItem(`updates_${currentComplaint.id}`, JSON.stringify(existingUpdates));

        // Update current complaint
        currentComplaint.status = newStatus;
        currentComplaint.updated_at = update.timestamp;

        // Reload updates
        complaintUpdates = existingUpdates;
        displayUpdateHistory();

        // Update status badge
        const statusBadge = document.getElementById('statusBadge');
        statusBadge.textContent = formatStatus(newStatus);
        statusBadge.className = `status-badge ${newStatus}`;

        // Update last updated date
        document.getElementById('updatedDate').textContent = formatDate(update.timestamp);

        // Clear form
        document.getElementById('updateNote').value = '';

        // Show success message
        alert('Status updated successfully!');

    } catch (error) {
        console.error('Error updating status:', error);
        alert('Failed to update status. Please try again.');
    }
}

// Format category
function formatCategory(category) {
    const categoryMap = {
        'street_light': 'Street Light',
        'water_supply': 'Water Supply',
        'garbage': 'Garbage / Sanitation',
        'road_damage': 'Road Damage',
        'other': 'Other'
    };
    return categoryMap[category] || category || 'N/A';
}

// Format status
function formatStatus(status) {
    const statusMap = {
        'pending': 'Pending',
        'in_progress': 'In Progress',
        'resolved': 'Resolved',
        'rejected': 'Rejected'
    };
    return statusMap[status] || status;
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };

    return date.toLocaleDateString('en-US', options);
}

// Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show error state
function showError(message) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('detailContent').style.display = 'none';
    document.getElementById('errorState').style.display = 'block';
    document.getElementById('errorMessage').textContent = message;
}
