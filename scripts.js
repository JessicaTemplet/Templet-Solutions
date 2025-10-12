// scripts.js - UPDATED FOR GLOBAL SIDEBAR MENU
// =================================================================

// Define your mobile/desktop breakpoint (kept for mobile menu close on link click)
const desktopBreakpoint = 769;

/* ===== UTILITY FUNCTIONS (Defined for scope but used after content loads) ===== */

function setMobileState(navElement, menuButton, isOpen) {
    if (isOpen) {
        navElement.classList.add('open');
        navElement.setAttribute('aria-hidden', 'false');
        menuButton.setAttribute('aria-expanded', 'true');
    } else {
        navElement.classList.remove('open');
        navElement.setAttribute('aria-hidden', 'true');
        menuButton.setAttribute('aria-expanded', 'false');
    }
}

function attachListeners() {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.querySelector('.nav-links');
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    /* ===== 1. GLOBAL MENU TOGGLE FUNCTIONALITY (Now applies to all sizes) ===== */

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function() {
            const isOpen = mobileNav.classList.contains('open');
            setMobileState(mobileNav, menuToggle, !isOpen);
        });

        // Close menu when a standard link is clicked
        mobileNav.querySelectorAll('a:not(.dropdown-toggle)').forEach(link => {
            link.addEventListener('click', () => {
                // Always close the sidebar when a final link is clicked
                setMobileState(mobileNav, menuToggle, false);
            });
        });

        // Close menu on Escape key press
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
                setMobileState(mobileNav, menuToggle, false);
            }
        });
    }

    /* ===== 2. DROPDOWN FUNCTIONALITY (Now applies to all sizes via click) ===== */

    dropdownToggles.forEach(dropdownButton => {
        const dropdown = dropdownButton.closest('.dropdown');

        dropdownButton.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent accidental navigation on click
            
            // Toggle the dropdown open/closed
            const isOpen = dropdown.classList.toggle('open');
            this.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            
            // Close other open dropdowns (Applies to all screens)
            document.querySelectorAll('.dropdown.open').forEach(otherDropdown => {
                if (otherDropdown !== dropdown) {
                    otherDropdown.classList.remove('open');
                    const otherToggle = otherDropdown.querySelector('.dropdown-toggle');
                    if (otherToggle) {
                        otherToggle.setAttribute('aria-expanded', 'false');
                    }
                }
            });
        });

        // A11Y: Close on Escape key press when dropdown is open
        dropdownButton.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                dropdown.classList.remove('open');
                this.setAttribute('aria-expanded', 'false');
            }
        });

        // REMOVED: mouseleave handler (Hover behavior is inconsistent with click-to-open sidebar)
    });

    // Close ALL dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        // If the click is NOT on a dropdown button AND NOT inside the sidebar (mobileNav)
        if (!e.target.matches('.dropdown-toggle') && !e.target.closest('.nav-links')) {
            document.querySelectorAll('.dropdown.open').forEach(dropdown => {
                dropdown.classList.remove('open');
                const toggle = dropdown.querySelector('.dropdown-toggle');
                if (toggle) {
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
        }
    });
}


/* ===== NAVIGATION CONTENT LOADING FIX (The batch fix for all pages) ===== */

function loadNavigationFromHTML() {
    const navContainer = document.getElementById('navigation-bar-wrapper'); 
    if (!navContainer) return;

    fetch('/nav-contents.html') 
        .then(response => {
            if (!response.ok) {
                console.error('Failed to load navigation content:', response.statusText);
                return ''; 
            }
            return response.text();
        })
        .then(htmlContent => {
            navContainer.innerHTML = htmlContent;
            attachListeners();
        })
        .catch(error => {
            console.error('Error fetching navigation content:', error);
        });
}


/* ===== ANIMATION OBSERVER (Kept for completeness) ===== */

function setupAnimationObserver() {
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-on-scroll');
                observer.unobserve(entry.target);
            }
        });
    }, {
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    });

    document.querySelectorAll('.feature-card, .content-text, .content-image').forEach(element => {
        observer.observe(element);
    });
}


/* ===== INITIALIZATION (Runs when scripts.js is loaded) ===== */

document.addEventListener('DOMContentLoaded', () => {
    loadNavigationFromHTML(); 
    setupAnimationObserver();
});
