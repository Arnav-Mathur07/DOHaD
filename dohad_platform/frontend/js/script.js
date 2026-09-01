/**
 * DOHaD Platform - Main JavaScript Application (Multi-Page Version)
 * Data loading via fetch(), static CSV parsing, filtering, and chart generation.
 */

// Global State
const appState = {
    data: [],           // Original loaded data
    filteredData: [],   // Data after applying filters
    charts: {}          // Chart.js instances
};

const globalMetalColors = {
    'Mercury': '#f87171',
    'Cadmium': '#fbbf24',
    'Lead': '#4ade80',
    'Arsenic': '#60a5fa'
};

// DOM Elements
const DOM = {
    mobileMenu: document.getElementById('mobile-menu'),
    navLinksContainer: document.querySelector('.nav-links'),

    // Stats (Home)
    statTotal: document.getElementById('stat-total-studies'),
    statCountries: document.getElementById('stat-unique-countries'),
    statYears: document.getElementById('stat-year-range'),

    // Filters (Database)
    searchInput: document.getElementById('search-input'),
    metalFilter: document.getElementById('metal-filter'),
    speciesFilter: document.getElementById('species-filter'),
    stageFilter: document.getElementById('stage-filter'),
    countryFilter: document.getElementById('country-filter'),
    yearMinInput: document.getElementById('year-min'),
    yearMaxInput: document.getElementById('year-max'),
    btnResetFilters: document.getElementById('btn-reset-filters'),

    // Results (Database)
    resultsGrid: document.getElementById('results-grid'),
    resultsCount: document.getElementById('results-count'),

    // Charts canvases (Analytics)
    chartYear: document.getElementById('chart-studies-year'),
    chartMetal: document.getElementById('chart-studies-metal'),
    chartDoseMercury: document.getElementById('chart-dose-mercury'),
    chartDoseCadmium: document.getElementById('chart-dose-cadmium'),
    chartDoseLead: document.getElementById('chart-dose-lead'),
    chartDoseArsenic: document.getElementById('chart-dose-arsenic')
};

/**
 * Initialize Application
 */
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();

    // Site-wide Authentication Check
    const isAuthPage = window.location.pathname.endsWith('auth.html');
    const isAuthenticated = sessionStorage.getItem('dohad_auth_token') === 'true';

    // If they aren't authenticated and they aren't on the auth page -> block them
    if (!isAuthenticated && !isAuthPage) {
        window.location.href = 'auth.html';
        return;
    }

    // Initialize global scroll animations immediately so the page doesn't stay white if the backend hangs
    initScrollAnimations();

    // Directly fetch data from the server file (backend simulation)
    // Only fetch if they are authorized or if data is explicitly needed on an auth page
    loadData().then(() => {
        // Initialize components based on the current page's DOM elements
        if (DOM.statTotal) updateHomeStats();

        // Ensure charts are initialized BEFORE filters are applied,
        // because applyFilters() implicitly updates the charts!
        if (DOM.chartYear) {
            initCharts();
        }

        if (DOM.resultsGrid || DOM.metalFilter || DOM.chartYear) {
            populateFilterDropdowns();
            restoreFilterInputs();
            applyFilters(); // Initial render based on loaded state (which updates charts and cards)
            if (DOM.resultsGrid || DOM.metalFilter) {
                initFilterListeners();
            }
        }

        // Fetch live internet news
        if (document.getElementById('news-grid')) {
            fetchNews();
        }

        const refreshBtn = document.getElementById('refresh-news-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const icon = refreshBtn.querySelector('i');
                if (icon) icon.classList.add('fa-spin');

                // Clear the grid visually
                const grid = document.getElementById('news-grid');
                if (grid) grid.innerHTML = '<div class="error-message" role="alert"><p>Loading latest healthcare updates...</p></div>';

                fetchNews().then(() => {
                    setTimeout(() => { if (icon) icon.classList.remove('fa-spin'); }, 500);
                });
            });
        }
    });
});

let globalScrollObserver = null;

/**
 * Premium Agency Animations (GSAP, Lenis, Custom Cursor)
 */
function initScrollAnimations() {
    // 1. Initialize Lenis Smooth Scroll
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // https://www.desmos.com/calculator/brs54l4xou
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
            infinite: false,
        });

        // Integrate Lenis tick with GSAP
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0);
        } else {
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        }
    }

    // 2. Custom Magnetic Cursor Logic
    const cursor = document.querySelector('.custom-cursor');
    if (cursor) {
        // Use GSAP's quickTo for maximum performance hardware-accelerated cursor
        let xTo = gsap.quickTo(cursor, "x", { duration: 0.1, ease: "power3" });
        let yTo = gsap.quickTo(cursor, "y", { duration: 0.1, ease: "power3" });

        // Track mouse position with 0 lag hardware transform
        document.addEventListener('mousemove', (e) => {
            xTo(e.clientX);
            yTo(e.clientY);
        });

        // Add hover expanding state to all interactive elements
        const interactiveElements = document.querySelectorAll('a, button, select, input, .card, .map-cell');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
        });

        // Magnetic Pull Effect on Buttons
        const magneticButtons = document.querySelectorAll('.btn');
        magneticButtons.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const h = rect.width / 2;
                const v = rect.height / 2;
                const x = e.clientX - rect.left - h;
                const y = e.clientY - rect.top - v;

                // Pull button gently towards cursor
                btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = `translate(0px, 0px)`;
            });
        });
    }

    // 3. GSAP ScrollTrigger Animations
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Convert the old .animate-on-scroll elements to sleek GSAP fades
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        animatedElements.forEach((el, index) => {
            // Immediately clean up old CSS classes that might contain legacy CSS transitions
            el.classList.remove('animate-on-scroll', 'is-visible', 'fade-in-left', 'fade-in-right');

            let delayTime = el.classList.contains('delay-100') ? 0.1 :
                el.classList.contains('delay-200') ? 0.2 :
                    el.classList.contains('delay-300') ? 0.3 :
                        el.classList.contains('delay-400') ? 0.4 :
                            el.classList.contains('delay-500') ? 0.5 : 0;

            gsap.fromTo(el,
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: "power3.out",
                    force3D: true, // Forces GPU acceleration
                    scrollTrigger: {
                        trigger: el,
                        start: "top 85%",
                        toggleActions: "play none none reverse",
                        onEnter: () => el.style.transition = 'none', // Prevent CSS fighting GSAP
                        onLeaveBack: () => el.style.transition = 'none'
                    },
                    delay: delayTime,
                    onStart: () => el.style.transition = 'none',
                    onComplete: () => {
                        gsap.set(el, { clearProps: "transform,opacity" }); // give back to CSS
                        el.style.transition = ''; // restore hover transitions
                    },
                    onReverseComplete: () => {
                        el.style.transition = '';
                    }
                }
            );
        });
    }
}

/**
 * Setup Navigation
 */
function initNavigation() {
    if (DOM.mobileMenu) {
        DOM.mobileMenu.addEventListener('click', () => {
            DOM.navLinksContainer.classList.toggle('active');
            const expanded = DOM.navLinksContainer.classList.contains('active');
            DOM.mobileMenu.setAttribute('aria-expanded', expanded);
        });
    }
}

/**
 * Parse CSV format dynamically
 */
function parseCSV(text) {
    const lines = text.split('\n');
    if (lines.length === 0) return [];

    const parseLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim().replace(/^"|"$/g, ''));
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim().replace(/^"|"$/g, ''));
        return result;
    };

    const headers = parseLine(lines[0]).map(h => h.replace(/^\uFEFF/, '').toLowerCase().trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseLine(line);
        if (values.length === headers.length || values.length > 1) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] !== undefined ? values[index] : '';
            });

            const yearVal = parseInt(row.year);
            row._numericYear = isNaN(yearVal) ? null : yearVal;

            data.push(row);
        }
    }
    return data;
}

/**
 * Fetch CSV Data from backend (simulated via file read)
 */
async function loadData() {
    try {
        const response = await fetch('http://localhost:3000/api/papers');
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const data = await response.json();

        // Map any mismatched column names to what the UI expects
        appState.data = data.map(row => ({
            ...row,
            metal: row.toxicant || '',
            species: 'Human', // Default for these databases
            outcome: row.key_finding || '',
            _numericYear: parseInt(row.year) || null,
            doi: row.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${row.pmid}/` : '#'
        }));

        if (appState.data.length > 0) {
            appState.filteredData = [...appState.data];
        } else {
            if (DOM.resultsCount) showError("Dataset is empty.");
        }
    } catch (error) {
        console.error("Data loading failed:", error);
        if (DOM.resultsCount) showError("Failed to fetch data from the server. Please ensure backend is running.");
    }
}


function showError(message) {
    if (DOM.resultsGrid) {
        DOM.resultsGrid.innerHTML = `<div class="error-message" role="alert"><p>${message}</p></div>`;
    }
    if (DOM.resultsCount) {
        DOM.resultsCount.textContent = 'Data error';
    }
}

/**
 * Extract unique values and populate filter dropdowns dynamically
 */
function populateFilterDropdowns() {
    if (!DOM.metalFilter) return;

    // We do not overwrite the hardcoded options defined in HTML anymore.
    // Instead we only dynamically add missing countries.
    DOM.countryFilter.length = 1;

    const countries = [...new Set(appState.data.map(item => item.country))].filter(Boolean).sort();

    countries.forEach(country => DOM.countryFilter.add(new Option(country, country)));

    const years = appState.data.map(item => item._numericYear).filter(y => y !== null);
    if (years.length > 0) {
        if (DOM.yearMinInput) DOM.yearMinInput.placeholder = Math.min(...years);
        if (DOM.yearMaxInput) DOM.yearMaxInput.placeholder = Math.max(...years);
    } else {
        if (DOM.yearMinInput) DOM.yearMinInput.placeholder = "Min";
        if (DOM.yearMaxInput) DOM.yearMaxInput.placeholder = "Max";
    }
}

/**
 * Filter State Management
 */
function getFilterValues() {
    if (DOM.searchInput) {
        // Read from DOM
        const articleTypeEl = document.getElementById('article-type-filter');

        const filters = {
            searchTerm: DOM.searchInput.value.toLowerCase().trim(),
            selectedArticleType: articleTypeEl ? articleTypeEl.value : '',
            selectedMetal: DOM.metalFilter.value,
            selectedSpecies: DOM.speciesFilter.value,
            selectedStage: DOM.stageFilter ? DOM.stageFilter.value.toLowerCase() : '',
            selectedCountry: DOM.countryFilter.value,
            minYearStr: DOM.yearMinInput.value,
            maxYearStr: DOM.yearMaxInput.value
        };
        sessionStorage.setItem('dohad_filters', JSON.stringify(filters));
        return filters;
    } else {
        // Read from SessionStorage (for pages without the filter UI like analytics.html)
        const saved = sessionStorage.getItem('dohad_filters');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { }
        }
    }
    return { searchTerm: '', selectedArticleType: '', selectedMetal: '', selectedSpecies: '', selectedStage: '', selectedCountry: '', minYearStr: '', maxYearStr: '' };
}

function restoreFilterInputs() {
    if (!DOM.searchInput) return; // Only if filter UI exists

    const saved = sessionStorage.getItem('dohad_filters');
    if (saved) {
        try {
            const f = JSON.parse(saved);
            DOM.searchInput.value = f.searchTerm || '';
            const articleTypeEl = document.getElementById('article-type-filter');
            if (articleTypeEl) articleTypeEl.value = f.selectedArticleType || '';
            DOM.metalFilter.value = f.selectedMetal || '';
            DOM.speciesFilter.value = f.selectedSpecies || '';
            if (DOM.stageFilter) DOM.stageFilter.value = f.selectedStage || '';
            DOM.countryFilter.value = f.selectedCountry || '';
            DOM.yearMinInput.value = f.minYearStr || '';
            DOM.yearMaxInput.value = f.maxYearStr || '';
        } catch (e) {
            console.error("Filter state parse error", e);
        }
    }
}

function resetFilters() {
    if (!DOM.searchInput) return;
    DOM.searchInput.value = '';
    const articleTypeEl = document.getElementById('article-type-filter');
    if (articleTypeEl) articleTypeEl.value = '';
    DOM.metalFilter.value = '';
    DOM.speciesFilter.value = '';
    if (DOM.stageFilter) DOM.stageFilter.value = '';
    DOM.countryFilter.value = '';
    DOM.yearMinInput.value = '';
    DOM.yearMaxInput.value = '';

    // Clear session storage specifically for filters
    sessionStorage.removeItem('dohad_filters');

    applyFilters();
}

/**
 * Update stats on the Homepage
 */
function updateHomeStats() {
    if (!DOM.statTotal) return;

    const total = appState.data.length;
    const uniqueCountries = new Set(appState.data.map(item => item.country).filter(Boolean)).size;

    const years = appState.data.map(item => item._numericYear).filter(y => y !== null);
    let yearRange = '--';
    if (years.length > 0) {
        yearRange = `${Math.min(...years)} - ${Math.max(...years)}`;
    }

    DOM.statTotal.textContent = total;
    DOM.statCountries.textContent = uniqueCountries;
    DOM.statYears.textContent = yearRange;

    // --- Dynamic Flip Card Injections ---

    // 1. Calculate and Inject Total Studies breakdown by Toxicant
    const flipMetalsList = document.getElementById('flip-metals-list');
    if (flipMetalsList) {
        const metalCounts = { 'Arsenic': 0, 'Level': 0, 'Mercury': 0, 'Cadmium': 0, 'Lead': 0 };
        appState.data.forEach(item => {
            const m = item.metal || 'Unknown';
            metalCounts[m] = (metalCounts[m] || 0) + 1;
        });

        // Filter out Unknown/0 and sort descending
        const sortedMetals = Object.entries(metalCounts)
            .filter(([k, v]) => v > 0 && k !== 'Unknown')
            .sort((a, b) => b[1] - a[1]);

        flipMetalsList.innerHTML = sortedMetals.length
            ? sortedMetals.map(([metal, count]) => `<li><span style="font-weight: 500;">${metal}</span> <span>${count}</span></li>`).join('')
            : '<li>No toxicant data</li>';
    }

    // 2. Calculate and Inject Top 4 Countries
    const flipCountriesList = document.getElementById('flip-countries-list');
    if (flipCountriesList) {
        const countryMap = {};
        appState.data.forEach(item => {
            const c = item.country || '';
            if (c) countryMap[c] = (countryMap[c] || 0) + 1;
        });

        const sortedCountries = Object.entries(countryMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4); // Only show top 4 to fit in the small card height

        flipCountriesList.innerHTML = sortedCountries.length
            ? sortedCountries.map(([country, count]) => `<li><span style="font-weight: 500;">${country}</span> <span>${count}</span></li>`).join('')
            : '<li>No country data</li>';
    }
}

/**
 * Apply filters to all data
 */
function applyFilters() {
    // Rely on getFilterValues to pull from DOM or Session
    const f = getFilterValues();

    const minYear = f.minYearStr === '' ? -Infinity : parseInt(f.minYearStr);
    const maxYear = f.maxYearStr === '' ? Infinity : parseInt(f.maxYearStr);

    appState.filteredData = appState.data.filter(item => {
        // Deep search across Title and Outcome/Abstract
        const titleMatch = (item.title && item.title.toLowerCase().includes(f.searchTerm));
        const outcomeMatch = (item.outcome && item.outcome.toLowerCase().includes(f.searchTerm));
        // Also check abstract if it exists natively in the CSV
        const abstractMatch = (item.abstract && item.abstract.toLowerCase().includes(f.searchTerm));
        const matchesSearch = f.searchTerm === '' || titleMatch || outcomeMatch || abstractMatch;

        const matchesMetal = !f.selectedMetal || item.metal === f.selectedMetal;
        const matchesSpecies = !f.selectedSpecies || item.species === f.selectedSpecies;
        const matchesCountry = !f.selectedCountry || item.country === f.selectedCountry;

        // Article Type logic (Research vs Review)
        let matchesArticleType = true;
        if (f.selectedArticleType) {
            const artType = (item.article_type || item.type || "").toLowerCase();
            const titleLow = (item.title || "").toLowerCase();
            if (f.selectedArticleType === 'Research') {
                matchesArticleType = artType.includes('research') || (!titleLow.includes('review') && !artType.includes('review'));
            } else if (f.selectedArticleType === 'Review') {
                matchesArticleType = artType.includes('review') || titleLow.includes('review');
            }
        }

        // Exposure Period filtering involves checking title and outcome text
        let matchesStage = true;
        if (f.selectedStage) {
            const titleText = (item.title || "").toLowerCase();
            const outcomeText = (item.outcome || "").toLowerCase();
            matchesStage = titleText.includes(f.selectedStage) || outcomeText.includes(f.selectedStage);
        }

        let matchesYear = true;
        if (item._numericYear !== null) {
            matchesYear = (item._numericYear >= minYear && item._numericYear <= maxYear);
        } else {
            matchesYear = (minYear === -Infinity && maxYear === Infinity);
        }

        return matchesSearch && matchesMetal && matchesSpecies && matchesCountry && matchesYear && matchesStage && matchesArticleType;
    });

    appState.displayLimit = 50; // Reset pagination limit whenever a new filter is applied

    if (DOM.resultsGrid) renderCards();
    if (DOM.chartYear) updateChartsData();
}

function initFilterListeners() {
    if (!DOM.searchInput) return;

    const inputs = [DOM.searchInput, DOM.metalFilter, DOM.speciesFilter, DOM.countryFilter, DOM.yearMinInput, DOM.yearMaxInput];
    if (DOM.stageFilter) inputs.push(DOM.stageFilter);
    const articleTypeEl = document.getElementById('article-type-filter');
    if (articleTypeEl) inputs.push(articleTypeEl);

    inputs.forEach(input => {
        if (!input) return;
        input.removeEventListener('input', applyFilters);
        input.removeEventListener('change', applyFilters);
        input.addEventListener('input', applyFilters);
        input.addEventListener('change', applyFilters);
    });

    if (DOM.btnResetFilters) {
        DOM.btnResetFilters.removeEventListener('click', resetFilters);
        DOM.btnResetFilters.addEventListener('click', resetFilters);
    }
}

/**
 * Render Data Cards
 */
function renderCards() {
    if (!DOM.resultsGrid) return;

    DOM.resultsGrid.innerHTML = '';
    DOM.resultsCount.textContent = `Showing ${appState.filteredData.length} result${appState.filteredData.length !== 1 ? 's' : ''}`;

    if (appState.filteredData.length === 0) {
        DOM.resultsGrid.innerHTML = `
            <div class="no-results-message">
                <h3>No results found or database empty</h3>
                <p>Try adjusting your search terms or relaxing the filters.</p>
            </div>`;
        return;
    }

    const fragment = document.createDocumentFragment();

    // Check if we are on the homepage index
    const isHomepage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');

    // Limit the display size to protect browser memory and layout calculation times (Pagination)
    const currentLimit = isHomepage ? 6 : (appState.displayLimit || 50);
    const displayData = appState.filteredData.slice(0, currentLimit);

    displayData.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'research-card stagger-anim';
        card.setAttribute('tabindex', '0');

        card.innerHTML = `
            <h3 class="card-title">
                <a href="${item.doi || '#'}" target="_blank" rel="noopener noreferrer">${item.title || 'Untitled'}</a>
            </h3>
            <div class="card-meta">
                <span class="tag tag-metal">${item.metal || 'N/A'}</span>
                <span class="tag tag-species">${item.species || 'N/A'}</span>
                <span class="tag tag-country">${item.country || 'N/A'}</span>
                <span class="tag tag-year">${item.year || 'N/A'}</span>
            </div>
            <div class="card-details">
                <p><strong>Organ:</strong> ${item.organ || 'Not specified'}</p>
                <p><strong>Outcome:</strong> ${item.outcome || 'Not specified'}</p>
            </div>
            <div class="card-footer">
                <a href="${item.doi || '#'}" target="_blank" rel="noopener noreferrer" class="doi-link" aria-label="View study via DOI">
                    View via DOI <i class="fa-solid fa-arrow-right" style="margin-left: 0.3rem;"></i>
                </a>
            </div>
        `;
        fragment.appendChild(card);
    });

    DOM.resultsGrid.appendChild(fragment);

    // UI Expansion Buttons
    if (isHomepage && appState.filteredData.length > 6) {
        const viewMoreContainer = document.createElement('div');
        viewMoreContainer.style = 'grid-column: 1 / -1; display: flex; justify-content: center; margin-top: 2rem;';

        viewMoreContainer.innerHTML = `
            <a href="database.html" class="btn btn-primary" style="padding: 1rem 3rem; font-size: 1.1rem; border-radius: 30px; display: inline-flex; align-items: center; gap: 0.5rem;">
                <i class="fa-solid fa-database"></i> Explore Full Database (${appState.filteredData.length} Studies)
            </a>
        `;
        DOM.resultsGrid.appendChild(viewMoreContainer);
    } else if (!isHomepage && appState.filteredData.length > currentLimit) {
        // Load More button for the main Database page
        const loadMoreContainer = document.createElement('div');
        loadMoreContainer.style = 'grid-column: 1 / -1; display: flex; justify-content: center; margin-top: 2rem;';

        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.className = 'btn btn-primary';
        loadMoreBtn.style = 'padding: 0.8rem 2.5rem; border-radius: 30px; cursor: pointer;';
        loadMoreBtn.innerHTML = 'Load More Results';

        loadMoreBtn.onclick = () => {
            appState.displayLimit += 50;
            renderCards();
        };

        loadMoreContainer.appendChild(loadMoreBtn);
        DOM.resultsGrid.appendChild(loadMoreContainer);
    }

    // GSAP List Animation for newly spawned cards
    if (typeof gsap !== 'undefined') {
        const newCards = DOM.resultsGrid.querySelectorAll('.stagger-anim');
        gsap.fromTo(newCards,
            { y: 30, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.05,
                ease: "power2.out",
                force3D: true, // GPU accelerate
                onStart: function () {
                    // Disable CSS transitions on targets fighting GSAP framing
                    this.targets().forEach(t => t.style.transition = 'none');
                },
                onComplete: function () {
                    this.targets().forEach(t => t.style.transition = '');
                    gsap.set(this.targets(), { clearProps: "transform,opacity" }); // Clean up
                }
            }
        );
    }
}

/**
 * Initialize Chart.js structured instances (runs once)
 */
function initCharts() {
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = '#718096';
    const commonOpts = { responsive: true, maintainAspectRatio: false, animation: { duration: 500 } };
    appState.charts.year = new Chart(DOM.chartYear, { type: 'line', data: { labels: [], datasets: [] }, options: { ...commonOpts, plugins: { legend: { display: true, position: 'top' } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } } });
    const pieCalloutPlugin = {
        id: 'pieCallout',
        afterDraw: (chart) => {
            if (chart.config.type !== 'pie') return;
            const ctx = chart.ctx;
            chart.data.datasets.forEach((dataset, i) => {
                const meta = chart.getDatasetMeta(i);
                meta.data.forEach((arc, index) => {
                    const value = dataset.data[index];
                    if (!value || value === 0) return;

                    const centerX = arc.x;
                    const centerY = arc.y;
                    const midAngle = (arc.startAngle + arc.endAngle) / 2;
                    const radius = arc.outerRadius;

                    // Pointing coordinates (tip of arrow inside the slice)
                    const pointX = centerX + Math.cos(midAngle) * (radius - 5);
                    const pointY = centerY + Math.sin(midAngle) * (radius - 5);

                    // Elbow outside - move it closer
                    const elbowX = centerX + Math.cos(midAngle) * (radius + 5);
                    const elbowY = centerY + Math.sin(midAngle) * (radius + 5);

                    const isLeft = elbowX < centerX;
                    // Shrink horizontal line
                    const endX = isLeft ? elbowX - 25 : elbowX + 25;

                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(elbowX, elbowY);
                    ctx.lineTo(pointX, pointY);

                    // Draw arrow head
                    const headLen = 8;
                    const angle = Math.atan2(pointY - elbowY, pointX - elbowX);
                    ctx.lineTo(pointX - headLen * Math.cos(angle - Math.PI / 6), pointY - headLen * Math.sin(angle - Math.PI / 6));
                    ctx.moveTo(pointX, pointY);
                    ctx.lineTo(pointX - headLen * Math.cos(angle + Math.PI / 6), pointY - headLen * Math.sin(angle + Math.PI / 6));

                    // Draw horizontal line
                    ctx.moveTo(elbowX, elbowY);
                    ctx.lineTo(endX, elbowY);

                    ctx.strokeStyle = '#2d3748';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();

                    // Text
                    ctx.fillStyle = '#2d3748';
                    ctx.font = '600 13px Inter, sans-serif';
                    ctx.textAlign = isLeft ? 'right' : 'left';
                    ctx.textBaseline = 'middle';
                    const labelStr = chart.data.labels[index] + ' (' + value + ')';
                    ctx.fillText(labelStr, isLeft ? endX - 8 : endX + 8, elbowY);
                    ctx.restore();
                });
            });
        }
    };

    appState.charts.metal = new Chart(DOM.chartMetal, {
        type: 'pie',
        data: { labels: [], datasets: [] },
        options: {
            ...commonOpts,
            layout: { padding: { top: 40, bottom: 40, left: 100, right: 100 } },
            plugins: {
                legend: { display: true, position: 'bottom' }
            },
            onClick: (event, elements, chart) => {
                const overlay = document.getElementById('body-parts-overlay');
                const dataset = chart.data.datasets[0];
                const baseColors = chart.data.labels.map(m => globalMetalColors[m] || '#999');

                if (!elements.length) {
                    // Reset to normal colors
                    dataset.backgroundColor = baseColors;
                    chart.update();
                    if (overlay) overlay.style.display = 'none';
                    return;
                }

                const index = elements[0].index;
                const metal = chart.data.labels[index];

                // Dim unselected slices
                dataset.backgroundColor = baseColors.map((color, i) => i === index ? color : color + '40');
                chart.update();

                // Calculate Body Parts Distribution directly from the Organ column
                const counts = { heart: 0, lungs: 0, liver: 0, kidney: 0, brain: 0 };

                appState.filteredData.forEach(item => {
                    if (item.metal === metal) {
                        const organ = (item.organ || '').toLowerCase();
                        if (organ.includes('heart')) counts.heart++;
                        if (organ.includes('lung')) counts.lungs++;
                        if (organ.includes('liver')) counts.liver++;
                        if (organ.includes('kidney')) counts.kidney++;
                        if (organ.includes('brain')) counts.brain++;
                    }
                });

                if (overlay) {
                    document.getElementById('body-parts-title').innerText = metal;
                    document.getElementById('bp-heart').innerText = counts.heart;
                    document.getElementById('bp-lungs').innerText = counts.lungs;
                    document.getElementById('bp-liver').innerText = counts.liver;
                    document.getElementById('bp-kidney').innerText = counts.kidney;
                    document.getElementById('bp-brain').innerText = counts.brain;
                    overlay.style.display = 'block';
                }
            },
            onHover: (event, elements, chart) => {
                event.native.target.style.cursor = elements[0] ? 'pointer' : 'default';
            }
        },
        plugins: [pieCalloutPlugin]
    });
    const baseOpts = { ...commonOpts, plugins: { legend: { display: false } }, maintainAspectRatio: false };

    // Explicitly show X and Y axes on every bar chart quadrant per user request
    const optsAll = { ...baseOpts, scales: { x: { grid: { drawBorder: false } }, y: { beginAtZero: true, suggestedMax: 10 } } };

    if (DOM.chartDoseMercury) appState.charts.doseMercury = new Chart(DOM.chartDoseMercury, { type: 'bar', data: { labels: [], datasets: [] }, options: optsAll });
    if (DOM.chartDoseCadmium) appState.charts.doseCadmium = new Chart(DOM.chartDoseCadmium, { type: 'bar', data: { labels: [], datasets: [] }, options: optsAll });
    if (DOM.chartDoseLead) appState.charts.doseLead = new Chart(DOM.chartDoseLead, { type: 'bar', data: { labels: [], datasets: [] }, options: optsAll });
    if (DOM.chartDoseArsenic) appState.charts.doseArsenic = new Chart(DOM.chartDoseArsenic, { type: 'bar', data: { labels: [], datasets: [] }, options: optsAll });
}

// Actual Geographic Lat/Long Coordinates for Leaflet
const COUNTRY_LAT_LONG = {
    'USA': [37.0902, -95.7129],
    'Canada': [56.1304, -106.3468],
    'Mexico': [23.6345, -102.5528],
    'Brazil': [-14.2350, -51.9253],
    'Chile': [-35.6751, -71.5430],
    'Argentina': [-38.4161, -63.6167],
    'Spain': [40.4637, -3.7492],
    'France': [46.2276, 2.2137],
    'UK': [55.3781, -3.4360],
    'Italy': [41.8719, 12.5674],
    'Germany': [51.1657, 10.4515],
    'Sweden': [60.1282, 18.6435],
    'Poland': [51.9194, 19.1451],
    'Croatia': [45.1000, 15.2000],
    'Russia': [61.5240, 105.3188],
    'Saudi Arabia': [23.8859, 45.0792],
    'Iran': [32.4279, 53.6880],
    'Egypt': [26.8206, 30.8025],
    'Lebanon': [33.8547, 35.8623],
    'Turkey': [38.9637, 35.2433],
    'South Africa': [-30.5595, 22.9375],
    'Nigeria': [9.0820, 8.6753],
    'Senegal': [14.4974, -14.4524],
    'India': [20.5937, 78.9629],
    'Bangladesh': [23.6850, 90.3563],
    'China': [35.8617, 104.1954],
    'Japan': [36.2048, 138.2529],
    'South Korea': [35.9078, 127.7669],
    'Taiwan': [23.6978, 120.9605],
    'Australia': [-25.2744, 133.7751],
    'Indonesia': [-0.7893, 113.9213]
};

// Global registry to prevent re-initializing maps
window.miniMaps = {};
window.miniMapLayers = {};

function updateHeatmaps() {
    // Only init Leaflet if it's loaded
    if (typeof L === 'undefined') return;

    const metals = ['Mercury', 'Cadmium', 'Lead', 'Arsenic'];

    metals.forEach(metal => {
        const containerId = `mini-map-${metal.toLowerCase()}`;
        const container = document.getElementById(containerId);
        if (!container) return;

        // 1. Initialize Map if it doesn't exist
        if (!window.miniMaps[metal]) {
            window.miniMaps[metal] = L.map(containerId, {
                center: [20, 0], // Equatorish focus
                zoom: 0,
                zoomControl: false,
                dragging: false,
                scrollWheelZoom: false,
                doubleClickZoom: false,
                touchZoom: false,
                attributionControl: false
            });

            // Use a clean, gray, label-free basemap
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
                attribution: ''
            }).addTo(window.miniMaps[metal]);

            // Layer group for easy clearing
            window.miniMapLayers[metal] = L.layerGroup().addTo(window.miniMaps[metal]);
        }

        // 2. Clear old markers
        const layerGroup = window.miniMapLayers[metal];
        layerGroup.clearLayers();

        // 3. Tally Data
        const countryCounts = {};
        let maxCount = 0;
        appState.filteredData.forEach(item => {
            const itemMetal = (item.metal || '').toLowerCase();
            const targetMetal = metal.toLowerCase();

            if (itemMetal.includes(targetMetal) || itemMetal === targetMetal) {
                const c = item.country || '';
                if (c) {
                    const normalizedC = Object.keys(COUNTRY_LAT_LONG).find(k => k.toLowerCase() === c.toLowerCase());
                    const validCountry = normalizedC || c;

                    if (COUNTRY_LAT_LONG[validCountry]) {
                        countryCounts[validCountry] = (countryCounts[validCountry] || 0) + 1;
                        if (countryCounts[validCountry] > maxCount) maxCount = countryCounts[validCountry];
                    }
                }
            }
        });

        const color = globalMetalColors[metal] || '#ff0000';

        // 4. Draw Markers
        Object.entries(countryCounts).forEach(([country, count]) => {
            const coords = COUNTRY_LAT_LONG[country];
            if (!coords) return;

            // Size formula
            const radius = maxCount > 0 ? 3 + (count / maxCount) * 8 : 4;

            // Create dot
            L.circleMarker(coords, {
                radius: radius,
                fillColor: color,
                color: color,
                weight: 1,
                opacity: 0.8,
                fillOpacity: 0.8
            }).addTo(layerGroup).bindTooltip(`${country}: ${count} studies`);

            // Create aura
            L.circleMarker(coords, {
                radius: radius * 3,
                fillColor: color,
                color: color,
                weight: 0,
                fillOpacity: 0.15
            }).addTo(layerGroup);
        });
    });
}

/**
 * Refills data inside Chart.js seamlessly to prevent flickering
 */
function updateChartsData() {
    if (!appState.charts.year || !appState.data.length || !DOM.chartYear) return;

    const db = appState.filteredData;

    // Clear charts if empty filtered
    if (db.length === 0) {
        appState.charts.year.data.labels = []; appState.charts.year.data.datasets = [];
        appState.charts.metal.data.labels = []; appState.charts.metal.data.datasets = [];

        ['doseMercury', 'doseCadmium', 'doseLead', 'doseArsenic'].forEach(chartId => {
            if (appState.charts[chartId]) {
                appState.charts[chartId].data.labels = [];
                appState.charts[chartId].data.datasets = [];
            }
        });

        appState.charts.year.update(); appState.charts.metal.update();
        ['doseMercury', 'doseCadmium', 'doseLead', 'doseArsenic'].forEach(chartId => {
            if (appState.charts[chartId]) appState.charts[chartId].update();
        });

        updateHeatmaps();
        return;
    }

    const targetMetals = ['Mercury', 'Cadmium', 'Lead', 'Arsenic'];

    const yearMetalCounts = {};
    const allYears = new Set();

    targetMetals.forEach(metal => yearMetalCounts[metal] = {});

    db.forEach(item => {
        if (item.year && item.metal && targetMetals.includes(item.metal)) {
            allYears.add(item.year);
            yearMetalCounts[item.metal][item.year] = (yearMetalCounts[item.metal][item.year] || 0) + 1;
        }
    });

    const sortedYears = Array.from(allYears).sort((a, b) => parseInt(a) - parseInt(b));

    const datasets = targetMetals.map(metal => {
        return {
            label: metal,
            data: sortedYears.map(y => yearMetalCounts[metal][y] || 0),
            borderColor: globalMetalColors[metal],
            backgroundColor: globalMetalColors[metal],
            borderWidth: 2,
            fill: false,
            tension: 0.3,
            pointBackgroundColor: globalMetalColors[metal]
        };
    });

    appState.charts.year.data = {
        labels: sortedYears,
        datasets: datasets
    };
    const allowedMetals = ['Lead', 'Cadmium', 'Mercury', 'Arsenic'];
    const metalCounts = {};
    db.forEach(item => {
        if (item.metal && allowedMetals.includes(item.metal)) {
            metalCounts[item.metal] = (metalCounts[item.metal] || 0) + 1;
        }
    });
    const metals = Object.keys(metalCounts).sort();
    appState.charts.metal.data = {
        labels: metals,
        datasets: [{ data: metals.map(m => metalCounts[m]), backgroundColor: metals.map(m => globalMetalColors[m]), borderWidth: 1, hoverOffset: 4 }]
    };

    appState.charts.year.update();
    appState.charts.metal.update();

    if (appState.charts.doseMercury) {
        // Check if a 'dose' column exists in the CSV data
        const hasDoseColumn = appState.data.length > 0 && 'dose' in appState.data[0];

        DOM.chartDoseMercury.parentElement.parentElement.parentElement.style.display = 'block';

        const doseCounts = {
            'Mercury': { 'Low (<1)': 0, 'Medium (1-10)': 0, 'High (>10)': 0 },
            'Cadmium': { 'Low (<1)': 0, 'Medium (1-10)': 0, 'High (>10)': 0 },
            'Lead': { 'Low (<1)': 0, 'Medium (1-10)': 0, 'High (>10)': 0 },
            'Arsenic': { 'Low (<1)': 0, 'Medium (1-10)': 0, 'High (>10)': 0 }
        };

        if (hasDoseColumn) {
            db.forEach(item => {
                if (item.metal && doseCounts[item.metal] && item.dose !== undefined && item.dose !== '') {
                    const val = parseFloat(item.dose);
                    if (!isNaN(val)) {
                        if (val < 1) doseCounts[item.metal]['Low (<1)']++;
                        else if (val <= 10) doseCounts[item.metal]['Medium (1-10)']++;
                        else doseCounts[item.metal]['High (>10)']++;
                    }
                }
            });
        }

        const targetMetals = ['Mercury', 'Cadmium', 'Lead', 'Arsenic'];
        const colors = ['#f87171', '#fbbf24', '#4ade80', '#60a5fa']; // Red, Yellow, Green, Blue
        const chartKeys = ['doseMercury', 'doseCadmium', 'doseLead', 'doseArsenic'];
        const doseLabels = ['Low (<1)', 'Medium (1-10)', 'High (>10)'];

        // Find global max to sync Y axes height
        let maxCount = 0;
        targetMetals.forEach(metal => {
            Object.values(doseCounts[metal]).forEach(val => {
                if (val > maxCount) maxCount = val;
            });
        });
        const yMax = Math.max(10, Math.ceil(maxCount * 1.2)); // Give some headroom

        targetMetals.forEach((metal, index) => {
            const chartKey = chartKeys[index];
            if (appState.charts[chartKey]) {
                appState.charts[chartKey].data = {
                    labels: doseLabels,
                    datasets: [{
                        label: metal,
                        data: [doseCounts[metal]['Low (<1)'], doseCounts[metal]['Medium (1-10)'], doseCounts[metal]['High (>10)']],
                        backgroundColor: colors[index],
                        borderRadius: 4
                    }]
                };

                // Update Max Y to keep them visually comparable
                appState.charts[chartKey].options.scales.y.max = yMax;
                appState.charts[chartKey].update();
            }
        });
    }

    updateHeatmaps();
}

/**
 * Fetch Live Academic News via CrossRef API
 */
async function fetchNews() {
    const newsGrid = document.getElementById('news-grid');
    if (!newsGrid) return;

    try {
        const rssFeeds = [
            'http://feeds.bbci.co.uk/news/health/rss.xml',
            'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml',
            'https://www.who.int/rss-feeds/news-english.xml',
            'https://www.nature.com/nm.rss'
        ];

        // Pick a random feed so every refresh pulls from a different major healthcare outlet
        const randomFeed = rssFeeds[Math.floor(Math.random() * rssFeeds.length)];

        // Append a dynamic timestamp to bypass aggressive browser caching on refresh
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(randomFeed)}&_t=${new Date().getTime()}`;
        const response = await fetch(apiUrl, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const data = await response.json();
        const articles = data.items || [];

        if (articles.length === 0) {
            newsGrid.innerHTML = '<div class="no-results-message"><p>No recent news found.</p></div>';
            return;
        }

        newsGrid.innerHTML = '';
        const fragment = document.createDocumentFragment();

        // Extract publisher name dynamically from the RSS feed metadata
        const feedTitle = (data.feed && data.feed.title) ? data.feed.title.replace(' - RSS', '') : 'Global Health News';

        let addedCount = 0;

        // Shuffle articles so hitting the same feed twice still looks fresh
        const shuffledArticles = articles.sort(() => 0.5 - Math.random());

        for (let i = 0; i < shuffledArticles.length; i++) {
            if (addedCount >= 10) break;

            const item = shuffledArticles[i];
            const title = item.title || 'Untitled News';

            // Format publication date
            let pubDate = 'Recent';
            if (item.pubDate) {
                pubDate = new Date(item.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            }

            const url = item.link || '#';
            const publisher = feedTitle;
            const authorText = item.author ? item.author : 'Editorial Staff';

            let abstractText = 'Read full article for more details...';
            if (item.description) {
                const clean = item.description.replace(/<[^>]*>?/gm, '');
                abstractText = clean.length > 150 ? clean.substring(0, 150) + '...' : clean;
            }

            const card = document.createElement('div');
            card.className = 'research-card animate-on-scroll stagger-anim';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.justifyContent = 'space-between';

            card.innerHTML = `
                <div>
                    <div class="card-meta" style="margin-bottom: 0.5rem;">
                        <span class="badge" style="background-color: var(--primary-light); color: var(--primary-dark); font-size: 0.75rem; padding: 0.2rem 0.6rem;">${publisher}</span>
                        <span style="font-size: 0.8rem; color: var(--text-muted); float: right;">${pubDate}</span>
                    </div>
                    <h3 style="font-size: 1.15rem; margin-bottom: 0.75rem; line-height: 1.4;"><a href="${url}" target="_blank" style="color: var(--text-main); text-decoration: none;">${title}</a></h3>
                    <p style="font-size: 0.85rem; color: var(--primary-color); font-weight: 500; margin-bottom: 0.5rem;">${authorText}</p>
                    <p class="abstract-text" style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5;">${abstractText}</p>
                </div>
                <div class="card-footer" style="padding-top: 1rem; border-top: 1px solid var(--border-color); margin-top: auto;">
                    <a href="${url}" target="_blank" rel="noopener noreferrer" class="doi-link" style="color: var(--accent-color); font-weight: 600; font-size: 0.9rem;">
                        Read Full Story <i class="fa-solid fa-arrow-right" style="margin-left: 0.3rem;"></i>
                    </a>
                </div>
            `;
            fragment.appendChild(card);
            addedCount++;
        }

        if (addedCount === 0) {
            newsGrid.innerHTML = '<div class="no-results-message"><p>No recent English news found.</p></div>';
            return;
        }

        newsGrid.appendChild(fragment);

        // GSAP List Animation for News Cards
        if (typeof gsap !== 'undefined') {
            const newCards = newsGrid.querySelectorAll('.stagger-anim');
            // Ensure opacity is set before animating
            gsap.set(newCards, { opacity: 0, y: 30 });
            gsap.to(newCards, {
                y: 0,
                opacity: 1,
                duration: 0.6,
                stagger: 0.1,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: newsGrid,
                    start: "top 80%"
                },
                onComplete: function () {
                    // Do not clear opacity, just transform to prevent disappearance
                    gsap.set(this.targets(), { clearProps: "transform" });
                }
            });
        }
    } catch (err) {
        console.error('Error fetching academic news:', err);
        newsGrid.innerHTML = '<div class="no-results-message"><p>Unable to load news feed. Please try again later.</p></div>';
    }
}

/**
 * Advanced Dynamic Leaflet Map Modal Renderer
 */
window.openMapModal = function (title) {
    if (typeof L === 'undefined') return;

    const metal = title.replace(' Map', '').trim();

    const titleEl = document.getElementById('map-modal-title');
    if (titleEl) titleEl.innerText = title + ' - Geographic Distribution';

    const contentBox = document.getElementById('map-modal-content');
    if (!contentBox) return;

    contentBox.innerHTML = `
        <div style="position: relative; width: 100%; height: 100%; min-height: 50vh; display: flex; align-items: stretch; justify-content: stretch;">
            <div id="leaflet-modal-map" style="width: 100%; height: 100%; border-radius: 4px; z-index: 1;"></div>
        </div>
    `;

    const modal = document.getElementById('map-modal');
    if (modal) modal.style.display = 'flex';

    // Must wait for display: flex to render the container dimensions for Leaflet
    setTimeout(() => {
        if (window.modalMap) {
            window.modalMap.off();
            window.modalMap.remove();
        }

        window.modalMap = L.map('leaflet-modal-map', {
            center: [20, 0],
            zoom: 2,
            minZoom: 1
        });

        // Add a beautiful Map tile layer (Light Mode matching site theme)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }).addTo(window.modalMap);

        const countryCounts = {};
        let maxCount = 0;

        // Tally based on current filtered dataset
        appState.filteredData.forEach(item => {
            const itemMetal = (item.metal || '').toLowerCase();
            const targetMetal = metal.toLowerCase();
            if (itemMetal.includes(targetMetal) || itemMetal === targetMetal) {
                const c = item.country || '';
                if (c) {
                    const normalizedC = Object.keys(COUNTRY_LAT_LONG).find(k => k.toLowerCase() === c.toLowerCase());
                    const validCountry = normalizedC || c;
                    if (COUNTRY_LAT_LONG[validCountry]) {
                        countryCounts[validCountry] = (countryCounts[validCountry] || 0) + 1;
                        if (countryCounts[validCountry] > maxCount) maxCount = countryCounts[validCountry];
                    }
                }
            }
        });

        const color = globalMetalColors[metal] || '#4A3A8A';

        // Check if we have any data
        if (Object.keys(countryCounts).length === 0) {
            L.popup()
                .setLatLng([20, 0])
                .setContent(`No data available for ${metal}`)
                .openOn(window.modalMap);
        } else {
            Object.entries(countryCounts).forEach(([country, count]) => {
                const coords = COUNTRY_LAT_LONG[country];
                if (!coords) return;

                const radius = maxCount > 0 ? 8 + (count / maxCount) * 20 : 10;

                // Create dot
                L.circleMarker(coords, {
                    radius: radius,
                    fillColor: color,
                    color: '#fff',
                    weight: 2,
                    opacity: 1,
                    fillOpacity: 0.7
                }).addTo(window.modalMap).bindTooltip(`<b>${country}</b><br>${count} studies`, { permanent: true, direction: 'top', className: 'custom-leaflet-tooltip' });

                // Create aura
                L.circleMarker(coords, {
                    radius: radius * 2.5,
                    fillColor: color,
                    color: color,
                    weight: 0,
                    fillOpacity: 0.15
                }).addTo(window.modalMap);
            });
        }
    }, 100);
};

window.closeMapModal = function () {
    const modal = document.getElementById('map-modal');
    if (modal) modal.style.display = 'none';
};
