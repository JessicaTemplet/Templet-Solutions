// =================================================================
// scripts.js - FINAL CORRECTED VERSION
// =================================================================

// Define your mobile/desktop breakpoint (Must match CSS media query)
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
    // Elements are guaranteed to exist here since they are injected or are static.
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.querySelector('.nav-links'); // Targets the main navigation list
    
    // 🛑 The fix remains: Target the button element with the class .dropdown-toggle
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    /* ===== 1. MOBILE MENU FUNCTIONALITY ===== */

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function() {
            const isOpen = mobileNav.classList.contains('open');
            setMobileState(mobileNav, menuToggle, !isOpen);
        });

        // Close mobile menu when a link inside is clicked
        mobileNav.querySelectorAll('a:not(.dropdown-toggle)').forEach(link => {
            link.addEventListener('click', () => {
                // Only close if we are in mobile view
                if (window.innerWidth < desktopBreakpoint) {
                    setMobileState(mobileNav, menuToggle, false);
                }
            });
        });

        // Close mobile menu on Escape key press
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
                setMobileState(mobileNav, menuToggle, false);
            }
        });
    }

    /* ===== 2. DESKTOP DROPDOWN FUNCTIONALITY (Controlled by JS) ===== */

    dropdownToggles.forEach(dropdownButton => {
        
        dropdownButton.addEventListener('click', function(e) {
            if (window.innerWidth >= desktopBreakpoint) {
                e.preventDefault(); // Prevent default link behavior on desktop
                const dropdown = this.closest('.dropdown');
                const isOpen = dropdown.classList.toggle('open');
                this.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                
                // Close other open dropdowns
                document.querySelectorAll('.dropdown.open').forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        otherDropdown.classList.remove('open');
                        const otherToggle = otherDropdown.querySelector('.dropdown-toggle');
                        if (otherToggle) {
                            otherToggle.setAttribute('aria-expanded', 'false');
                        }
                    }
                });
            }
        });

        // A11Y: Close on Escape key press when dropdown is open
        dropdownButton.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.closest('.dropdown').classList.remove('open');
                this.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Close ALL desktop dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth >= desktopBreakpoint) {
            // Checks if the click target is NOT a dropdown button AND NOT inside the dropdown content
            if (!e.target.matches('.dropdown-toggle') && !e.target.closest('.dropdown-content')) {
                document.querySelectorAll('.dropdown.open').forEach(dropdown => {
                    dropdown.classList.remove('open');
                    const toggle = dropdown.querySelector('.dropdown-toggle');
                    if (toggle) {
                        toggle.setAttribute('aria-expanded', 'false');
                    }
                });
            }
        }
    });
}


/* ===== NAVIGATION CONTENT LOADING FIX (The batch fix for all pages) ===== */

// 🛑 NEW FUNCTION: Loads navigation content from the external HTML file
function loadNavigationFromHTML() {
    const navContainer = document.getElementById('main-nav');
    if (!navContainer) return; // Exit if the container isn't found

    // This path must be correct for all your HTML pages
    fetch('nav-contents.html') 
        .then(response => {
            if (!response.ok) {
                console.error('Failed to load navigation content:', response.statusText);
                return ''; 
            }
            return response.text();
        })
        .then(htmlContent => {
            // Inject the fetched HTML (the <button> and <ul>) into the empty <nav> tag
            navContainer.innerHTML = htmlContent;

            // CRITICAL: Call attachListeners AFTER the content has been injected
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
    // 1. Load the Navigation content from the external file
    loadNavigationFromHTML(); 
    
    // 2. Setup scroll animations for other page content
    setupAnimationObserver();
    
    // The attachListeners() call is now managed inside loadNavigationFromHTML()
});
