/* ===== UTILITY FUNCTIONS (Defined for scope but used after content loads) ===== */

// ... (setMobileState function remains unchanged) ...

function attachListeners() {
    // Elements are guaranteed to exist here since they are injected or are static.
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.querySelector('.nav-links'); // Targets the main navigation list
    
    // 🛑 THE FIX: Target the button element with the class .dropdown-toggle
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');

    /* ===== 1. MOBILE MENU FUNCTIONALITY ===== */

    // ... (Mobile menu functionality remains unchanged) ...

    /* ===== 2. DESKTOP DROPDOWN FUNCTIONALITY (Controlled by JS) ===== */

    dropdownToggles.forEach(dropdownButton => { // Renamed 'toggle' to 'dropdownButton' for clarity
        
        // Removed: dropdownButton.classList.add('dropdown-toggle'); — This is now unnecessary since you select by this class.
        
        dropdownButton.addEventListener('click', function(e) {
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
        dropdownButton.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.closest('.dropdown').classList.remove('open');
                this.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // Close ALL desktop dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth >= desktopBreakpoint) {
            // Note: Since the toggle is a button, it matches both .dropdown-toggle and not an anchor
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

// ... (The rest of your code, including loadNavigation and animation, remains the same) ...
