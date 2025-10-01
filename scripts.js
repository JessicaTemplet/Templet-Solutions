/* script.js - Updated for Mobile-First Menu */

document.addEventListener('DOMContentLoaded', function () {
    /* ===== MOBILE MENU FUNCTIONALITY ===== */
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');

    // Function to set mobile navigation state
    function setMobileState(open) {
        if (open) {
            mobileNav.classList.add('open');
            menuToggle.setAttribute('aria-expanded', 'true');
            mobileNav.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        } else {
            mobileNav.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
            mobileNav.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            closeMobileDropdowns();
        }
    }

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            setMobileState(!mobileNav.classList.contains('open'));
        });

        // Keyboard toggling
        menuToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setMobileState(!mobileNav.classList.contains('open'));
            }
        });

        // Close when clicking mobile links
        mobileNav.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => setMobileState(false));
        });

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!mobileNav.contains(e.target) && !menuToggle.contains(e.target) && mobileNav.classList.contains('open')) {
                setMobileState(false);
            }
        });

        // Close with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
                setMobileState(false);
            }
        });
    }

    /* ===== MOBILE DROPDOWN TOGGLE ===== */
    document.querySelectorAll('.mobile-dropdown-toggle').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const parent = this.parentElement;
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

    /* ===== DESKTOP DROPDOWN (Click instead of hover for better mobile) ===== */
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            if (window.innerWidth < 769) {
                e.preventDefault();
                const dropdown = this.closest('.dropdown');
                const isOpen = dropdown.classList.toggle('open');
                this.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            }
        });
    });

    // Close desktop dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.matches('.dropdown-toggle')) {
            document.querySelectorAll('.dropdown.open').forEach(dropdown => {
                dropdown.classList.remove('open');
                dropdown.querySelector('.dropdown-toggle').setAttribute('aria-expanded', 'false');
            });
        }
    });

    /* ===== EXISTING FUNCTIONALITY (keep your current code below) ===== */
    
    // Your existing content loader, smooth scrolling, and animation code
    async function loadContent(url, elementId) {
        // ... your existing loadContent function ...
    }

    document.querySelectorAll('.load-content').forEach(link => {
        // ... your existing content loading handlers ...
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        // ... your existing smooth scrolling code ...
    });

    // ... rest of your existing JavaScript (Intersection Observer, etc.) ...
});
