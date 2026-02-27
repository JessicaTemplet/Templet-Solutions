/* =========================================================
   Templet Solutions - scripts.js
   Navigation injection + dropdowns + scroll animations
   (No hamburger menu / no mobile toggle)
   ========================================================= */

/* ---------- Helpers ---------- */
function normalizePath(path) {
  if (!path) return '/';
  let p = path.split('?')[0].split('#')[0];
  p = p.replace(/index\.html$/i, '');
  if (!p.startsWith('/')) p = '/' + p;
  p = p.replace(/\/{2,}/g, '/');
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
    if (!html || html.trim().length < 10) throw new Error('Navigation file returned empty content.');

    navWrapper.innerHTML = html;
    console.log('✅ Navigation loaded successfully.');

    highlightActiveNavLink(navWrapper);
    setupDropdowns(navWrapper);

    return true;
  } catch (err) {
    console.error('❌ Navigation load failed:', err);
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
        const dropdown = link.closest('.dropdown');
        if (dropdown) dropdown.classList.add('active');
      }
    } catch {
      // ignore malformed hrefs
    }
  });
}

function setupDropdowns(navWrapper) {
  const toggles = navWrapper.querySelectorAll('.dropdown-toggle');

  toggles.forEach(toggle => {
    if (toggle.dataset.bound) return;

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      const dropdown = toggle.closest('.dropdown');
      if (!dropdown) return;

      // Toggle this dropdown, close others
      const isOpen = dropdown.classList.contains('open');
      closeAllDropdowns(navWrapper);
      if (!isOpen) dropdown.classList.add('open');
    });

    toggle.dataset.bound = 'true';
  });

  // Click outside closes dropdowns
  if (!navWrapper.dataset.outsideClickBound) {
    document.addEventListener('click', (e) => {
      if (!navWrapper.contains(e.target)) closeAllDropdowns(navWrapper);
    });
    navWrapper.dataset.outsideClickBound = 'true';
  }

  // Escape closes dropdowns
  if (!navWrapper.dataset.escapeBound) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllDropdowns(navWrapper);
    });
    navWrapper.dataset.escapeBound = 'true';
  }
}

/* ---------- SCROLL ANIMATION OBSERVER ---------- */
function setupAnimationObserver() {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-on-scroll');
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -100px 0px', threshold: 0.1 });

  document.querySelectorAll('.feature-card, .content-text, .content-image').forEach(el => observer.observe(el));
}

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  await loadNavigationFromHTML();
  setupAnimationObserver();
});
