// scripts.js - FINAL VERSION WITH DESKTOP HOVER-OUT AND MOBILE CLICK-AWAY
// =================================================================

// Define your mobile/desktop breakpoint
const desktopBreakpoint = 769;

/* ===== UTILITY FUNCTIONS (Defined for scope but used after content loads) ===== */

function setMobileState(navElement, menuButton, isOpen) {
    if (isOpen) {
        navElement.classList.add('open');
        navElement.setAttribute('aria-hidden', 'false');
        menuButton.setAttribute('aria-expanded', 'true');
        // Add a class to the body to prevent scrolling on mobile when menu is open
        document.body.classList.add('menu-open');
    } else {
        navElement.classList.remove('open');
        navElement.setAttribute('aria-hidden', 'true');
        menuButton.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('menu-open');
    }
}

function attachListeners() {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.querySelector('.nav-links');
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    if (menuToggle && mobileNav) {
        
        /* ===== 1. GLOBAL MENU TOGGLE FUNCTIONALITY (Open/Close on click) ===== */

        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent this click from immediately triggering the document click-away
            const isOpen = mobileNav.classList.contains('open');
            setMobileState(mobileNav, menuToggle, !isOpen);
        });

        /* ===== 2. DESKTOP HOVER-OUT LOGIC (Close on mouseleave for large screens) ===== */
        
        mobileNav.addEventListener('mouseleave', function() {
            // Only close on mouseleave if we're in desktop mode AND the menu is open
            if (window.innerWidth >= desktopBreakpoint && mobileNav.classList.contains('open')) {
                setMobileState(mobileNav, menuToggle, false);
            }
        });
        
        /* ===== 3. MOBILE CLICK-AWAY LOGIC (Close on document click for small screens) ===== */
        
        document.addEventListener('click', function(e) {
            // Check if menu is open AND we are on a mobile screen size
            if (mobileNav.classList.contains('open') && window.innerWidth < desktopBreakpoint) {
                // If the click target is NOT the menu toggle AND NOT inside the menu
                if (!menuToggle.contains(e.target) && !mobileNav.contains(e.target)) {
                    setMobileState(mobileNav, menuToggle, false);
                }
            }
        });

        // Close menu when a standard link is clicked (e.g., Home, About Us)
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

    /* ===== 4. DROPDOWN FUNCTIONALITY (Click to open/close) ===== */

    dropdownToggles.forEach(dropdownButton => {
        const dropdown = dropdownButton.closest('.dropdown');

        dropdownButton.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent accidental navigation on click
            e.stopPropagation(); // Prevent this click from bubbling up and closing the main sidebar or other dropdowns
            
            // Toggle the dropdown open/closed
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
        });

        // A11Y: Close on Escape key press when dropdown is open
        dropdownButton.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                dropdown.classList.remove('open');
                this.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Close inner dropdowns when clicking outside of them
    document.addEventListener('click', (e) => {
        // If the click is NOT on a dropdown toggle AND NOT inside the dropdown menu itself
        if (!e.target.matches('.dropdown-toggle') && !e.target.closest('.dropdown-content')) {
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
