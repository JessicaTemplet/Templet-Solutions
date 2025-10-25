// Templet Solutions — minimal JS for sticky-nav sites
// - Injects nav links from nav-contents.html
// - Highlights current page link

document.addEventListener("DOMContentLoaded", () => {
  fetch("./nav-contents.html", { cache: "no-cache" })
    .then(r => {
      if (!r.ok) throw new Error("Failed to load nav-contents.html");
      return r.text();
    })
    .then(html => {
      const nav = document.querySelector("#site-nav");
      if (nav) {
        nav.innerHTML = html;

        // active link highlight
        const here = location.pathname.replace(/\/+$/, "") || "/";
        nav.querySelectorAll("a").forEach(a => {
          const path = new URL(a.href, location.origin).pathname.replace(/\/+$/, "") || "/";
          if (path === here || (path !== "/" && here.startsWith(path))) {
            a.classList.add("active");
            a.setAttribute("aria-current", "page");
          }
        });
      }
    })
    .catch(console.error);
});
