/* =========================================================
   Templet Solutions - scripts.js
   Handles navigation injection and scroll animations
   ========================================================= */

/* ===== NAVIGATION LOADER ===== */
function loadNavigationFromHTML() {
    const navWrapper = document.getElementById('navigation-bar-wrapper');
    if (!navWrapper) {
        console.warn('Navigation wrapper not found.');
        return;
    }

    fetch('/nav-contents.html')
        .then(response => {
            if (!response.ok) throw new Error(`Navigation fetch failed: ${response.status}`);
            return response.text();
        })
        .then(html => {
            navWrapper.innerHTML = html;
            console.log('✅ Navigation loaded successfully.');

            // Highlight current page link
            const currentPath = window.location.pathname.replace(/index\.html$/, '');
            const links = navWrapper.querySelectorAll('a');
            links.forEach(link => {
                if (link.pathname === currentPath || link.pathname === window.location.pathname) {
                    link.classList.add('active');
                }
            });

            // Dropdown toggle setup
            const dropdownToggles = navWrapper.querySelectorAll('.dropdown-toggle');
            dropdownToggles.forEach(toggle => {
                toggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    const dropdown = toggle.closest('.dropdown');
                    dropdown.classList.toggle('open');
                });
            });
        })
        .catch(error => console.error('❌ Navigation load failed:', error));
}

/* ===== SCROLL ANIMATION OBSERVER ===== */
function setupAnimationObserver() {
    const observer = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-on-scroll');
                observerInstance.unobserve(entry.target);
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

/* ===== INITIALIZATION ===== */
document.addEventListener('DOMContentLoaded', () => {
    loadNavigationFromHTML();
       // Mobile menu toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('#navigation-bar-wrapper .nav-links');  // Targets the loaded nav

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            const expanded = navLinks.classList.contains('open');
            menuToggle.setAttribute('aria-expanded', expanded);
        });
    }
    setupAnimationObserver();
});
