document.addEventListener('DOMContentLoaded', function () {
    
    // Desktop breakpoint definition (must match your CSS @media query)
    const desktopBreakpoint = 769;

    /* ===== UTILITY FUNCTIONS (Defined for scope but used after content loads) ===== */

    function setMobileState(open, menuToggle, mobileNav) {
        if (!mobileNav || !menuToggle) return;

        if (open) {
            mobileNav.classList.add('open');
            menuToggle.textContent = 'Close';
            menuToggle.setAttribute('aria-expanded', 'true');
            mobileNav.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        } else {
            mobileNav.classList.remove('open');
            menuToggle.textContent = 'Menu';
            menuToggle.setAttribute('aria-expanded', 'false');
            mobileNav.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }

    function attachListeners() {
        // Elements are guaranteed to exist here since they are injected or are static.
        const menuToggle = document.getElementById('menu-toggle');
        const mobileNav = document.querySelector('.nav-links'); // Targets the main navigation list
        const dropdownToggles = document.querySelectorAll('.dropdown > a');

        /* ===== 1. MOBILE MENU FUNCTIONALITY ===== */

        if (menuToggle && mobileNav) {
            // Toggle menu on click
            menuToggle.addEventListener('click', () => {
                setMobileState(!mobileNav.classList.contains('open'), menuToggle, mobileNav);
            });

            // Close when clicking any link within the mobile nav
            mobileNav.querySelectorAll('a').forEach(a => {
                a.addEventListener('click', () => {
                    // Only close immediately if not a dropdown toggle itself on desktop, or if it's an internal hash link
                    if (window.innerWidth < desktopBreakpoint || a.closest('.dropdown')) {
                        // Use a slight timeout to allow anchor scroll to start before closing
                        setTimeout(() => setMobileState(false, menuToggle, mobileNav), 100);
                    }
                });
            });

            // Close with Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
                    setMobileState(false, menuToggle, mobileNav);
                }
            });
        }

        /* ===== 2. DESKTOP DROPDOWN FUNCTIONALITY (Controlled by JS) ===== */

        dropdownToggles.forEach(toggle => {
            // Ensure the toggle has the necessary class (you added this in the draft, keeping it)
            toggle.classList.add('dropdown-toggle');
            
            toggle.addEventListener('click', function(e) {
                if (window.innerWidth >= desktopBreakpoint) {
                    e.preventDefault();
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
            toggle.addEventListener('keydown', function(e) {
                if (e.key === 'Escape') {
                    this.closest('.dropdown').classList.remove('open');
                    this.setAttribute('aria-expanded', 'false');
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

    /* ===== CENTRALIZED NAVIGATION INJECTOR (STEP 1) ===== */
    
    function loadNavigation() {
        fetch('nav-content.html')
            .then(response => {
                if (!response.ok) {
                    console.warn(`Could not load navigation content from 'nav-content.html'. Status: ${response.status}`);
                    return '';
                }
                return response.text();
            })
            .then(data => {
                const nav = document.querySelector('nav[role="navigation"]');

                if (nav) {
                    // Inject the navigation HTML after the logo
                    nav.innerHTML += data;
                    
                    // 💥 CRITICAL FIX: Attach all listeners ONLY after the navigation HTML is injected
                    attachListeners(); 
                }
            })
            .catch(error => {
                console.error('Fatal error during navigation fetch:', error);
            });
    }

    // Immediately run the function to inject the menu structure
    loadNavigation();

    /* ===== SMOOTH SCROLLING & ANIMATION (Can run independent of nav injection) ===== */
    
    // Smooth Scrolling for all internal # anchors
    document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            
            const targetAttr = this.getAttribute('href');
            let targetId = targetAttr.replace(/^\//, ''); // Remove leading slash if present

            if (targetId.startsWith('#') && document.querySelector(targetId)) {
                e.preventDefault();
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.querySelectorAll('.animate-on-scroll').forEach(el => {
                    el.classList.add('animated');
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 }); 

    // Observe main layout sections
    document.querySelectorAll('.hero, .features, .content-section, .lead-magnet').forEach((el) => {
        observer.observe(el);
    });
});
