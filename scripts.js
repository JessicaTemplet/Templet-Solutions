// scripts.js - FINAL VERSION (NO INJECTION LOGIC)

// Define your mobile/desktop breakpoint (Must match CSS media query)
const desktopBreakpoint = 769;

/* ===== UTILITY FUNCTIONS ===== */

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
    // Elements are now static, no need to wait for injection
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.querySelector('.nav-links'); 
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    /* ===== 1. MOBILE MENU FUNCTIONALITY (Requires the #menu-toggle button to be present) ===== */
    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function() {
            const isOpen = mobileNav.classList.contains('open');
            setMobileState(mobileNav, menuToggle, !isOpen);
        });

        mobileNav.querySelectorAll('a:not(.dropdown-toggle)').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < desktopBreakpoint) {
                    setMobileState(mobileNav, menuToggle, false);
                }
            });
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
                setMobileState(mobileNav, menuToggle, false);
            }
        });
    }

    /* ===== 2. DESKTOP DROPDOWN FUNCTIONALITY ===== */
    dropdownToggles.forEach(dropdownButton => {
        const dropdown = dropdownButton.closest('.dropdown'); 

        dropdownButton.addEventListener('click', function(e) {
            if (window.innerWidth >= desktopBreakpoint) {
                e.preventDefault(); 
                const isOpen = dropdown.classList.toggle('open');
                this.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
                
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


/* ===== ANIMATION OBSERVER ===== */

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


/* ===== INITIALIZATION BLOCK (Runs when content is loaded) ===== */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Run the listeners and observer directly
    if (typeof attachListeners === 'function') attachListeners();
    if (typeof setupAnimationObserver === 'function') setupAnimationObserver();
    
    // 2. Setup the banner scroll/fade effect (Uses the #banner-wrapper ID)
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