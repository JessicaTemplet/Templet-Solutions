// scripts.js - Phase 1 shell (nav/footer injection, active link, small helpers)
(function () {
  function inject(selector, url) {
    return fetch(url, {cache: 'no-cache'})
      .then(r => {
        if (!r.ok) throw new Error('Failed to load ' + url);
        return r.text();
      })
      .then(html => {
        const el = document.querySelector(selector);
        if (el) el.innerHTML = html;
      });
  }

  // Wait for DOM, then inject
  document.addEventListener('DOMContentLoaded', function(){
    Promise.all([
      inject('#site-nav', '/nav-contents.html'),
      inject('#site-footer', '/footer-contents.html')
    ]).then(function(){
      // Highlight active link
      const here = location.pathname.replace(/\/+$/, '') || '/';
      document.querySelectorAll('#site-nav a').forEach(a => {
        const path = (new URL(a.href, location.origin)).pathname.replace(/\/+$/, '') || '/';
        if (path === here || (path !== '/' && here.startsWith(path))) {
          a.classList.add('active');
          a.setAttribute('aria-current', 'page');
        }
      });
    }).catch(console.error);
  });
})();
