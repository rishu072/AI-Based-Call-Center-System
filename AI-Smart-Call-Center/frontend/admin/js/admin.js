// Admin Dashboard JavaScript
// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

let allComplaints = [];
let filteredComplaints = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadComplaints();
    setupEventListeners();
    setupAutoRefresh();
});

// Setup event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const refreshBtn = document.getElementById('refreshBtn');

    if (searchInput) {
        searchInput.addEventListener('input', filterComplaints);
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', filterComplaints);
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterComplaints);
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            loadComplaints();
        });
    }
}

// Setup auto-refresh every 30 seconds
function setupAutoRefresh() {
    setInterval(() => {
        loadComplaints(true); // Silent refresh
    }, 30000);
}

// Load all complaints from API
async function loadComplaints(silent = false) {
    try {
        const response = await fetch(`${API_BASE_URL}/complaints`);

        if (!response.ok) {
            throw new Error('Failed to fetch complaints');
        }

        const data = await response.json();
        allComplaints = data.data || [];
        filteredComplaints = [...allComplaints];

        updateStatistics();
        filterComplaints();

        if (!silent) {
            console.log(`Loaded ${allComplaints.length} complaints`);
        }

    } catch (error) {
        console.error('Error loading complaints:', error);
        showError('Failed to load complaints. Please try again.');
    }
}

// Update statistics cards
function updateStatistics() {
    const total = allComplaints.length;
    const pending = allComplaints.filter(c => c.status === 'pending').length;
    const inProgress = allComplaints.filter(c => c.status === 'in_progress').length;
    const resolved = allComplaints.filter(c => c.status === 'resolved').length;

    document.getElementById('totalComplaints').textContent = total;
    document.getElementById('pendingComplaints').textContent = pending;
    document.getElementById('inProgressComplaints').textContent = inProgress;
    document.getElementById('resolvedComplaints').textContent = resolved;
}

// Filter complaints based on search and filters
function filterComplaints() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;

    filteredComplaints = allComplaints.filter(complaint => {
        // Search filter
        const matchesSearch = !searchTerm ||
            complaint.id.toLowerCase().includes(searchTerm) ||
            (complaint.name && complaint.name.toLowerCase().includes(searchTerm)) ||
            (complaint.phone && complaint.phone.includes(searchTerm)) ||
            (complaint.description && complaint.description.toLowerCase().includes(searchTerm));

        // Status filter
        const matchesStatus = !statusFilter || complaint.status === statusFilter;

        // Category filter
        const matchesCategory = !categoryFilter || complaint.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
    });

    renderComplaintsTable();
}

// Render complaints table
function renderComplaintsTable() {
    const tbody = document.getElementById('complaintsTableBody');
    const emptyState = document.getElementById('emptyState');

    if (filteredComplaints.length === 0) {
        tbody.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';

    const rows = filteredComplaints.map(complaint => createTableRow(complaint)).join('');
    tbody.innerHTML = rows;
}

// Create table row for complaint
function createTableRow(complaint) {
    const statusClass = complaint.status || 'pending';
    const priorityClass = complaint.priority || 'low';
    const createdDate = formatDate(complaint.created_at);
    const categoryDisplay = formatCategory(complaint.category);

    return `
        <tr>
            <td>
                <strong>${escapeHtml(complaint.id)}</strong>
            </td>
            <td>${escapeHtml(complaint.name || 'N/A')}</td>
            <td>${categoryDisplay}</td>
            <td>
                <span class="status-badge ${statusClass}">
                    ${formatStatus(statusClass)}
                </span>
            </td>
            <td>
                <span class="priority-badge ${priorityClass}">
                    ${priorityClass}
                </span>
            </td>
            <td>${escapeHtml(complaint.ward || 'N/A')} / ${escapeHtml(complaint.zone || 'N/A')}</td>
            <td>${createdDate}</td>
            <td>
                <a href="complaint-detail.html?id=${encodeURIComponent(complaint.id)}" class="btn-view">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    View
                </a>
            </td>
        </tr>
    `;
}

// Format category for display
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

// Format status for display
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

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show error message
function showError(message) {
    const tbody = document.getElementById('complaintsTableBody');
    tbody.innerHTML = `
        <tr class="loading-row">
            <td colspan="8">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #ef4444;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p style="color: #ef4444; margin-top: 12px;">${escapeHtml(message)}</p>
            </td>
        </tr>
    `;
}
