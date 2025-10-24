// scripts.js - FINAL CORRECTED VERSION (CLEANED)

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
    
    // Target the button element with the class .dropdown-toggle
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
        
        const dropdown = dropdownButton.closest('.dropdown'); // Find the parent <li> once

        dropdownButton.addEventListener('click', function(e) {
            if (window.innerWidth >= desktopBreakpoint) {
                e.preventDefault(); // Prevent default link behavior on desktop
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
                dropdown.classList.remove('open');
                this.setAttribute('aria-expanded', 'false');
            }
        });

        // 🟢 Close dropdown on mouse leave (Desktop only)
        dropdown.addEventListener('mouseleave', function() {
            if (window.innerWidth >= desktopBreakpoint) {
                this.classList.remove('open'); 
                dropdownButton.setAttribute('aria-expanded', 'false');
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


// Extended utility for injecting HTML partials
function injectPartial(selector, file) {
    const el = document.querySelector(selector);
    if (!el) {
        console.warn(`Injection target not found for selector: ${selector}`);
        return Promise.resolve();
    }
    return fetch(file, {cache: 'no-cache'})
        .then(r => {
            if (!r.ok) {
                console.error(`Failed to fetch ${file}: ${r.statusText}`);
                return '';
            }
            return r.text();
        })
        .then(html => { el.innerHTML = html; })
        .catch(e => console.error('Injection error for', file, e));
}


/* ===== INITIALIZATION (Runs when scripts.js is loaded) ===== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Inject all partials (Header, Nav, Footer) concurrently
    Promise.all([
        injectPartial('#banner-wrapper', '/header.html'), // Assuming this contains your logo/banner content
        injectPartial('#navigation-bar-wrapper', '/nav-contents.html'),
        injectPartial('#footer-wrapper', '/footer-contents.html') // Assuming you have a separate file for the full footer content
    ]).then(() => {
        // 2. ONLY run listeners AFTER all content is injected
        if (typeof attachListeners === 'function') attachListeners();
        if (typeof setupAnimationObserver === 'function') setupAnimationObserver();
    }).catch(error => {
        console.error("Critical error during content injection:", error);
    });
    
    // 3. Setup the banner scroll/fade effect (Uses the #banner-wrapper ID)
    const header = document.querySelector('#banner-wrapper');
    if (header) {
         window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            const fadeStart = 0;    
            const fadeEnd = 150;    // Banner fully fades out after 150px
            const opacity = Math.max(1 - (scrollY - fadeStart) / (fadeEnd - fadeStart), 0);
            header.style.opacity = opacity;
         });
    }
});