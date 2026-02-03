// Landing page functionality - Charts and animations

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    console.log('[Landing] Page loaded, initializing...');

    // Initialize chart
    initLandingCharts();

    // Initialize animations
    initScrollAnimations();
    animateNumbers();
    initMobileNav();

    // Load real data from backend
    loadLandingPageData();

    console.log('[Landing] Initialization complete');
});

// Initialize the complaints chart
function initLandingCharts() {
    const ctx = document.getElementById('complaintsChart');
    if (!ctx) {
        console.log('[Landing] No chart element found');
        return;
    }

    console.log('[Landing] Creating chart...');

    try {
        const chartCtx = ctx.getContext('2d');

        // Create gradients
        const gradient1 = chartCtx.createLinearGradient(0, 0, 0, 300);
        gradient1.addColorStop(0, 'rgba(26, 79, 139, 0.9)');
        gradient1.addColorStop(1, 'rgba(26, 79, 139, 0.5)');

        const gradient2 = chartCtx.createLinearGradient(0, 0, 0, 300);
        gradient2.addColorStop(0, 'rgba(19, 136, 8, 0.9)');
        gradient2.addColorStop(1, 'rgba(19, 136, 8, 0.5)');

        window.complaintsChartInstance = new Chart(chartCtx, {
            type: 'bar',
            data: {
                labels: ['Street Light', 'Water Supply', 'Road Damage', 'Garbage', 'Drainage'],
                datasets: [
                    {
                        label: 'Total Complaints',
                        data: [650, 890, 520, 487, 320],
                        backgroundColor: gradient1,
                        borderColor: '#1a4f8b',
                        borderWidth: 2,
                        borderRadius: 8,
                        barThickness: 35
                    },
                    {
                        label: 'Resolved',
                        data: [580, 760, 420, 429, 280],
                        backgroundColor: gradient2,
                        borderColor: '#138808',
                        borderWidth: 2,
                        borderRadius: 8,
                        barThickness: 35
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#4a5568',
                            font: {
                                family: "'Noto Sans', sans-serif",
                                size: 12
                            },
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#4a5568',
                            font: {
                                family: "'Noto Sans', sans-serif",
                                size: 12
                            }
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#4a5568',
                            font: {
                                family: "'Noto Sans', sans-serif",
                                size: 12
                            }
                        }
                    }
                }
            }
        });

        console.log('[Landing] Chart created successfully');
    } catch (error) {
        console.error('[Landing] Chart error:', error);
    }
}

// Scroll animations
function initScrollAnimations() {
    const statBoxes = document.querySelectorAll('.stat-box');
    const serviceCards = document.querySelectorAll('.service-card');
    const stepCards = document.querySelectorAll('.step-card');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                entry.target.style.animationDelay = `${index * 0.1}s`;
                entry.target.style.animation = 'fadeSlideUp 0.5s ease-out forwards';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    statBoxes.forEach(box => observer.observe(box));
    serviceCards.forEach(card => observer.observe(card));
    stepCards.forEach(card => observer.observe(card));
}

// Animate numbers counting up
function animateNumbers() {
    const numbers = document.querySelectorAll('.stat-box .number');

    numbers.forEach(numElement => {
        const text = numElement.textContent;
        const hasComma = text.includes(',');
        const hasDays = text.includes('Days');

        if (hasDays) return;

        const cleanNum = parseInt(text.replace(/,/g, ''));
        if (isNaN(cleanNum)) return;

        let current = 0;
        const increment = cleanNum / 50;
        const duration = 1500;
        const stepTime = duration / 50;

        const counter = setInterval(() => {
            current += increment;
            if (current >= cleanNum) {
                current = cleanNum;
                clearInterval(counter);
            }

            const displayNum = Math.floor(current);
            numElement.textContent = hasComma
                ? displayNum.toLocaleString()
                : displayNum;
        }, stepTime);
    });
}

// Mobile navigation
function initMobileNav() {
    const navLinks = document.querySelector('.nav-links');
    const navBrand = document.querySelector('.nav-brand');

    if (!navLinks || !navBrand) return;

    const menuBtn = document.createElement('button');
    menuBtn.className = 'mobile-menu-btn';
    menuBtn.innerHTML = '☰';
    menuBtn.style.cssText = `
        display: none;
        background: var(--primary, #1a4f8b);
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-size: 1.25rem;
        cursor: pointer;
    `;

    if (window.innerWidth <= 768) {
        menuBtn.style.display = 'block';
    }

    window.addEventListener('resize', () => {
        menuBtn.style.display = window.innerWidth <= 768 ? 'block' : 'none';
        navLinks.style.display = window.innerWidth <= 768 ? 'none' : 'flex';
    });

    menuBtn.addEventListener('click', () => {
        const isOpen = navLinks.style.display === 'flex';
        navLinks.style.display = isOpen ? 'none' : 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '100%';
        navLinks.style.left = '0';
        navLinks.style.right = '0';
        navLinks.style.background = 'white';
        navLinks.style.padding = '1rem';
        navLinks.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
    });

    if (navBrand && navBrand.parentElement) {
        navBrand.parentElement.appendChild(menuBtn);
    }
}

// Load real data from backend
async function loadLandingPageData() {
    try {
        console.log('[Landing] Loading data from backend...');

        const response = await fetch('http://localhost:5000/api/complaints');

        if (response.ok) {
            const data = await response.json();
            console.log('[Landing] Data received:', data);

            if (data.success && data.data) {
                updateLandingStats(data.data);
                updateChartData(data.data);
            }
        }
    } catch (error) {
        console.log('[Landing] Could not load data from backend:', error.message);
        // Keep default sample data
    }
}

// Update statistics on the page
function updateLandingStats(complaints) {
    const totalComplaints = complaints.length;
    const resolvedComplaints = complaints.filter(c => c.status === 'resolved').length;
    const pendingComplaints = complaints.filter(c => c.status === 'pending' || c.status === 'in_progress').length;

    const totalEl = document.getElementById('totalComplaints');
    const resolvedEl = document.getElementById('resolvedComplaints');
    const pendingEl = document.getElementById('pendingComplaints');

    if (totalEl) totalEl.textContent = totalComplaints.toLocaleString();
    if (resolvedEl) resolvedEl.textContent = resolvedComplaints.toLocaleString();
    if (pendingEl) pendingEl.textContent = pendingComplaints.toLocaleString();

    console.log('[Landing] Stats updated:', { totalComplaints, resolvedComplaints, pendingComplaints });
}

// Update chart with real data
function updateChartData(complaints) {
    if (!window.complaintsChartInstance) return;

    // Aggregate complaints by type
    const complaintsByType = {};
    const resolvedByType = {};

    complaints.forEach(complaint => {
        const type = complaint.complaint_type || 'Other';
        complaintsByType[type] = (complaintsByType[type] || 0) + 1;

        if (complaint.status === 'resolved') {
            resolvedByType[type] = (resolvedByType[type] || 0) + 1;
        }
    });

    const types = Object.keys(complaintsByType);

    if (types.length > 0) {
        window.complaintsChartInstance.data.labels = types;
        window.complaintsChartInstance.data.datasets[0].data = types.map(t => complaintsByType[t]);
        window.complaintsChartInstance.data.datasets[1].data = types.map(t => resolvedByType[t] || 0);
        window.complaintsChartInstance.update();
        console.log('[Landing] Chart updated with real data');
    }
}
