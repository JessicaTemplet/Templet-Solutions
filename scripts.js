/* script.js - Cleaned, robust interactions */

/* Helper: wait for DOM loaded */
document.addEventListener('DOMContentLoaded', function () {

    /* --------- Partial content loader --------- */
    async function loadContent(url, elementId) {
        try {
            // Add loading state
            const container = document.getElementById(elementId);
            if (container) {
                container.classList.add('loading');
            }
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const content = await response.text();
            
            if (container) {
                // Clear and insert new content with proper structure
                container.innerHTML = `
                    <div class="container">
                        <div class="content-grid">
                            <div class="content-text">
                                ${content}
                            </div>
                        </div>
                    </div>
                `;
                
                // Remove loading state
                container.classList.remove('loading');
                
                // Re-initialize animations for new content
                container.querySelectorAll('.animate-init').forEach(el => {
                    revealObserver.observe(el);
                });
                
                // Scroll to content
                container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                console.error(`Element with ID '${elementId}' not found.`);
            }
        } catch (error) {
            console.error('Failed to load content:', error);
            const container = document.getElementById(elementId);
            if (container) {
                container.innerHTML = `
                    <div class="container">
                        <div class="content-grid">
                            <div class="content-text">
                                <h2>Content Not Available</h2>
                                <p>Sorry, we couldn't load the requested content. Please try again later.</p>
                                <a href="#home" class="cta-button">Return Home</a>
                            </div>
                        </div>
                    </div>
                `;
                container.classList.remove('loading');
            }
        }
    }

    // Attach click handlers for loadable links
    document.querySelectorAll('.load-content').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const url = this.dataset.url;
            if (url) loadContent(url, 'main-content-placeholder');
            
            // Close mobile menu if open
            if (mobileNav && mobileNav.classList.contains('open')) {
                setMobileState(false);
            }
        });
    });

    /* --------- Smooth anchor scrolling (safe) --------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Only handle internal anchors with at least one character after '#'
            if (href && href.length > 1 && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    
                    // Close mobile menu if open
                    if (mobileNav && mobileNav.classList.contains('open')) {
                        setMobileState(false);
                    }
                } else {
                    // If target doesn't exist, let default behavior happen or just do nothing
                    console.warn('Anchor target not found:', href);
                }
            }
        });
    });

    /* --------- Intersection Observer for reveal animations --------- */
    const observerOptions = {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-on-scroll');
                entry.target.classList.remove('animate-init');
                // Optionally unobserve to save work
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-init').forEach(el => revealObserver.observe(el));

    /* --------- Dropdown (desktop) - accessible toggle --------- */
    const dropdown = document.getElementById('resources-dropdown');
    const dropdownToggle = document.getElementById('dropdown-toggle');

    if (dropdown && dropdownToggle) {
        dropdownToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.toggle('open');
            dropdownToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        // Close if clicked outside
        document.addEventListener('click', (e) => {
            if (!dropdown.contains(e.target) && dropdown.classList.contains('open')) {
                dropdown.classList.remove('open');
                dropdownToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Keyboard: close with Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && dropdown.classList.contains('open')) {
                dropdown.classList.remove('open');
                dropdownToggle.setAttribute('aria-expanded', 'false');
                dropdownToggle.focus();
            }
        });
    }

    /* --------- Mobile menu toggle --------- */
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');

    // Function to set mobile navigation state
    function setMobileState(open) {
        if (open) {
            mobileNav.classList.add('open');
            menuToggle.setAttribute('aria-expanded', 'true');
            mobileNav.setAttribute('aria-hidden', 'false');
            // prevent body scroll while menu open
            document.body.style.overflow = 'hidden';
        } else {
            mobileNav.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
            mobileNav.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            // Close any open mobile dropdowns
            closeMobileDropdowns();
        }
    }

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', () => {
            setMobileState(!mobileNav.classList.contains('open'));
        });

        // Allow keyboard toggling (Enter/Space)
        menuToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setMobileState(!mobileNav.classList.contains('open'));
            }
        });

        // Close when clicking a mobile link
        mobileNav.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => setMobileState(false));
        });

        // Close mobile menu when clicking outside it
        document.addEventListener('click', (e) => {
            if (!mobileNav.contains(e.target) && !menuToggle.contains(e.target) && mobileNav.classList.contains('open')) {
                setMobileState(false);
            }
        });

        // Close with Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
                setMobileState(false);
            }
        });
    }

    /* --------- Mobile dropdown inside mobile nav --------- */
    document.querySelectorAll('.mobile-dropdown-toggle').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            const parent = this.parentElement;
            const isOpen = parent.classList.toggle('mobile-dropdown-open');
            this.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    });

    /* --------- Close mobile dropdowns when nav closes (safety) --------- */
    const closeMobileDropdowns = () => {
        document.querySelectorAll('.mobile-dropdown-open').forEach(el => {
            el.classList.remove('mobile-dropdown-open');
            const btn = el.querySelector('.mobile-dropdown-toggle');
            if (btn) btn.setAttribute('aria-expanded', 'false');
        });
    };

    /* --------- Observe dynamically-inserted animate-init elements (for content loader) --------- */
    const observerForNew = new MutationObserver((mutations) => {
        mutations.forEach(m => {
            m.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    node.querySelectorAll && node.querySelectorAll('.animate-init').forEach(el => {
                        revealObserver.observe(el);
                    });
                }
            });
        });
    });

    observerForNew.observe(document.body, { childList: true, subtree: true });

});
