document.addEventListener('DOMContentLoaded', function () {
    /* ===== MOBILE MENU FUNCTIONALITY (Button/Hamburger) ===== */
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');

    // Function to set mobile navigation state
    function setMobileState(open) {
        if (open) {
            mobileNav.classList.add('open');
            menuToggle.setAttribute('aria-expanded', 'true');
            mobileNav.setAttribute('aria-hidden', 'false');
            // Hide main page scroll when menu is open
            document.body.style.overflow = 'hidden'; 
        } else {
            mobileNav.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
            mobileNav.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            // Close any open mobile dropdowns when the main menu closes
            closeMobileDropdowns(); 
        }
    }

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            setMobileState(!mobileNav.classList.contains('open'));
        });

        // Close when clicking a main mobile link (excluding dropdown links)
        mobileNav.querySelectorAll('a').forEach(a => {
            // Check if the link is NOT part of a dropdown content
            if (!a.closest('.mobile-dropdown-content')) {
                a.addEventListener('click', () => setMobileState(false));
            }
        });

        // Close with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
                setMobileState(false);
            }
        });
    }

    /* ===== MOBILE DROPDOWN TOGGLE (For Articles) ===== */
    document.querySelectorAll('.mobile-dropdown-toggle').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const parent = this.closest('.mobile-dropdown');
            const isOpen = parent.classList.toggle('mobile-dropdown-open');
            this.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    });

    // Close all mobile dropdowns
    function closeMobileDropdowns() {
        document.querySelectorAll('.mobile-dropdown-open').forEach(el => {
            el.classList.remove('mobile-dropdown-open');
            const btn = el.querySelector('.mobile-dropdown-toggle');
            if (btn) btn.setAttribute('aria-expanded', 'false');
        });
    }

    /* ===== DESKTOP DROPDOWN (Click instead of hover) ===== */
    // Note: This logic only applies to screens wider than 768px (Desktop/Tablet).
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            // Only use click logic on larger screens (769px+)
            if (window.innerWidth >= 769) {
                e.preventDefault();
                const dropdown = this.closest('.dropdown');
                const isOpen = dropdown.classList.toggle('open');
                this.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            }
        });
    });

    // Close ALL desktop dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        // Only run on desktop
        if (window.innerWidth >= 769) {
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

    /* ===== EXISTING FUNCTIONALITY (Kept in place) ===== */
    
    // NOTE: Your previous partial content loading logic was removed as the new links point to separate folder pages (e.g., /Services/ or /Articles/article-title.html)
    
    // Smooth Scrolling for all internal # anchors (e.g., #resource-library)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
            
            // Close mobile menu after clicking an internal link
            if (mobileNav.classList.contains('open')) {
                setMobileState(false);
            }
        });
    });

    // Intersection Observer for animations (Kept)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-on-scroll');
            }
        });
    });

    document.querySelectorAll('.feature-card, .content-text, .content-image').forEach((el) => {
        observer.observe(el);
    });
});

