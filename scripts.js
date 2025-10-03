document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');
    
    // Desktop breakpoint definition (must match your CSS @media query)
    const desktopBreakpoint = 769; 

    /* ===== MOBILE MENU FUNCTIONALITY ===== */
    function setMobileState(open) {
        if (!mobileNav || !menuToggle) return; // Exit if elements aren't present

        if (open) {
            mobileNav.classList.add('open');
            menuToggle.setAttribute('aria-expanded', 'true');
            mobileNav.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden'; // Prevents background scroll
        } else {
            mobileNav.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
            mobileNav.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    }

    if (menuToggle && mobileNav) {
        // Toggle menu on click
        menuToggle.addEventListener('click', () => {
            setMobileState(!mobileNav.classList.contains('open'));
        });

        // Close when clicking any link within the mobile nav
        mobileNav.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                // Wait for the smooth scroll to start before closing, if it's an anchor link
                if (a.getAttribute('href').startsWith('#')) {
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

    /* ===== DESKTOP DROPDOWN (Click activation) ===== */
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            // Only use click logic on larger screens (Desktop)
            if (window.innerWidth >= desktopBreakpoint) {
                e.preventDefault();
                const dropdown = this.closest('.dropdown');
                const isOpen = dropdown.classList.toggle('open');
                this.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
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

    /* ===== SMOOTH SCROLLING & ANIMATION (Optimized) ===== */
    
    // Smooth Scrolling for all internal # anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
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
    }, { threshold: 0.1 }); // Trigger when 10% of the section is visible

    // Observe main layout sections
    document.querySelectorAll('.hero, .features, .content-section, .lead-magnet').forEach((el) => {
        observer.observe(el);
    });
});
