/* =========================================================
   Templet Solutions - scripts.js
   Handles navigation injection and scroll animations
   ========================================================= */

/* ---------- Helpers ---------- */
function normalizePath(path) {
  // Normalize paths so /about, /about/, /about/index.html all match
  if (!path) return '/';
  let p = path.split('?')[0].split('#')[0];

  // Convert index.html to directory path
  p = p.replace(/index\.html$/i, '');

  // Ensure leading slash
  if (!p.startsWith('/')) p = '/' + p;

  // Collapse double slashes
  p = p.replace(/\/{2,}/g, '/');

  // Remove trailing slash except root
  if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);

  return p || '/';
}

function closeAllDropdowns(navWrapper) {
  navWrapper.querySelectorAll('.dropdown.open').forEach(dd => dd.classList.remove('open'));
}

/* ---------- NAVIGATION LOADER ---------- */
async function loadNavigationFromHTML() {
  const navWrapper = document.getElementById('navigation-bar-wrapper');
  if (!navWrapper) {
    console.warn('❌ Navigation wrapper not found: #navigation-bar-wrapper');
    return false;
  }

  try {
    const res = await fetch('/nav-contents.html', { cache: 'no-store' });
    if (!res.ok) throw new Error(`Navigation fetch failed: ${res.status}`);

    const html = await res.text();
    if (!html || html.trim().length < 10) {
      throw new Error('Navigation file returned empty content.');
    }

    navWrapper.innerHTML = html;
    console.log('✅ Navigation loaded successfully.');

    // After injection, wire up nav behaviors
    setupNavBehaviors(navWrapper);

    // Highlight active link
    highlightActiveNavLink(navWrapper);

    return true;
  } catch (error) {
    console.error('❌ Navigation load failed:', error);
    return false;
  }
}

function highlightActiveNavLink(navWrapper) {
  const current = normalizePath(window.location.pathname);
  const links = navWrapper.querySelectorAll('a[href]');

  links.forEach(link => {
    try {
      const linkPath = normalizePath(new URL(link.getAttribute('href'), window.location.origin).pathname);

      if (linkPath === current) {
        link.classList.add('active');

        // If the active link is inside a dropdown, optionally mark parent
        const dropdown = link.closest('.dropdown');
        if (dropdown) dropdown.classList.add('active');
      }
    } catch {
      // ignore malformed hrefs
    }
  });
}

function setupNavBehaviors(navWrapper) {
  // Mobile menu toggle (must be bound AFTER nav inject if #menu-toggle lives inside injected HTML)
  const menuToggle =
    document.getElementById('menu-toggle') ||
    navWrapper.querySelector('#menu-toggle');

  const navLinks =
    navWrapper.querySelector('.nav-links') ||
    document.querySelector('#navigation-bar-wrapper .nav-links');

  if (menuToggle && navLinks) {
    // Prevent duplicate listeners if scripts run twice
    if (!menuToggle.dataset.bound) {
      menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        const expanded = navLinks.classList.contains('open');
        menuToggle.setAttribute('aria-expanded', String(expanded));
      });
      menuToggle.dataset.bound = 'true';
    }
  } else {
    console.warn('⚠️ Mobile toggle binding skipped. Missing #menu-toggle or .nav-links.', {
      menuToggleFound: !!menuToggle,
      navLinksFound: !!navLinks
    });
  }

  // Dropdown toggles
  const dropdownToggles = navWrapper.querySelectorAll('.dropdown-toggle');
  dropdownToggles.forEach(toggle => {
    if (toggle.dataset.bound) return;

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const dropdown = toggle.closest('.dropdown');
      if (!dropdown) return;

      // Close other dropdowns, then open this one
      closeAllDropdowns(navWrapper);
      dropdown.classList.toggle('open');
    });

    toggle.dataset.bound = 'true';
  });

  // Close dropdowns when clicking outside nav
  if (!navWrapper.dataset.outsideClickBound) {
    document.addEventListener('click', (e) => {
      if (!navWrapper.contains(e.target)) closeAllDropdowns(navWrapper);
    });
    navWrapper.dataset.outsideClickBound = 'true';
  }

  // Close dropdowns on Escape
  if (!navWrapper.dataset.escapeBound) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllDropdowns(navWrapper);
    });
    navWrapper.dataset.escapeBound = 'true';
  }
}

/* ---------- SCROLL ANIMATION OBSERVER ---------- */
function setupAnimationObserver() {
  // Guard: older browsers or weird embedded contexts
  if (!('IntersectionObserver' in window)) return;

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

  document.querySelectorAll('.feature-card, .content-text, .content-image').forEach(el => {
    observer.observe(el);
  });
}

/* ---------- INITIALIZATION ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  const navOk = await loadNavigationFromHTML();
  if (!navOk) {
    console.warn('⚠️ Nav did not load. Check /nav-contents.html path and wrapper id.');
  }
  setupAnimationObserver();
});
