document.addEventListener('DOMContentLoaded', function () {
    
    /* ===== NEW: CENTRALIZED NAVIGATION INJECTOR (STEP 1) ===== */

    function loadNavigation() {
        // Use the hyphenated file name, which is consistent with your naming convention
        fetch('nav-content.html')
            .then(response => {
                if (!response.ok) {
                    // Log a warning if the nav file fails to load
                    console.warn(`Could not load navigation content from 'nav-content.html'. Status: ${response.status}`);
                    return ''; // Return empty string to prevent injection failure
                }
                return response.text();
            })
            .then(data => {
                // Find the target navigation container
                const nav = document.querySelector('nav[role="navigation"]');

                if (nav) {
                    // Assuming your HTML file has ONLY the logo h1 inside the <nav> (as directed):
                    // <nav> <h1 class="logo-h1">...</h1> </nav>
                    
                    // We need to inject the new content AFTER the logo but INSIDE the <nav>
                    nav.innerHTML += data;
                }
            })
            .catch(error => {
                console.error('Fatal error during navigation fetch:', error);
            });
    }

    // Immediately run the function to inject the menu structure
    loadNavigation();

    /* ===== MOBILE MENU FUNCTIONALITY (STEP 2: REMAINS BELOW TO RUN AFTER INJECTION) ===== */

    // 🛑 FIX 1: Changed 'mobile-nav' to match the class name used for the menu container in CSS: '.nav-links'
    // NOTE: These selectors MUST be run AFTER loadNavigation() completes, but we'll put the definition here.
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.querySelector('.nav-links'); // Targets the main navigation list

    // Desktop breakpoint definition (must match your CSS @media query)
    const desktopBreakpoint = 769; 

    function setMobileState(open) {
        // Since loadNavigation is asynchronous, these elements might not exist immediately. 
        // We'll trust the DOMContentLoaded event and the loadNavigation call to handle the timing.
        
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

    // Attach mobile menu listeners
    // We only attach listeners if the elements are found (which they should be after injection)
    if (menuToggle && mobileNav) {
        // Toggle menu on click
        menuToggle.addEventListener('click', () => {
            setMobileState(!mobileNav.classList.contains('open'));
        });

        // Close when clicking any link within the mobile nav
        mobileNav.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                // Wait for the smooth scroll to start before closing, if it's an anchor link
                if (a.getAttribute('href').startsWith('/#') || a.getAttribute('href').startsWith('#')) {
                    setTimeout(() => setMobileState(false), 300); 
                } else {
                    setMobileState(false);
                }
            });
        });

        // Close with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
                setMobileState(false);
            }
        });
    }

    /* ===== DESKTOP DROPDOWN (Click activation) REMAINS THE SAME ===== */

    const dropdownToggles = document.querySelectorAll('.dropdown > a'); 
    
    dropdownToggles.forEach(toggle => {
        // 🛑 FIX 3: Added a class for easy targeting for the desktop dropdown: 'dropdown-toggle'
        toggle.classList.add('dropdown-toggle'); 
        
        toggle.addEventListener('click', function(e) {
            if (window.innerWidth >= desktopBreakpoint) {
                e.preventDefault();
                const dropdown = this.closest('.dropdown');
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

    /* ===== SMOOTH SCROLLING & ANIMATION REMAINS THE SAME ===== */
    
    // Smooth Scrolling for all internal # anchors
    document.querySelectorAll('a[href^="#"], a[href^="/#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            
            const targetAttr = this.getAttribute('href');
            let targetId = targetAttr.replace(/^\//, ''); // Remove leading slash if present

            if (targetId.startsWith('#')) {
                e.preventDefault();
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for animations (More efficient: watches main sections)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Animate elements inside the intersecting section
                entry.target.querySelectorAll('.animate-on-scroll').forEach(el => {
                    el.classList.add('animated');
                });
                observer.unobserve(entry.target); // Stop observing once animated
            }
        });
    }, { threshold: 0.1 }); 

    // Observe main layout sections
    document.querySelectorAll('.hero, .features, .content-section, .lead-magnet').forEach((el) => {
        observer.observe(el);
    });
});