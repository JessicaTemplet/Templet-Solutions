// Function to load content from a file and inject it into an element
async function loadContent(url, elementId) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const content = await response.text();
        const container = document.getElementById(elementId);
        if (container) {
            // Replace the entire section content
            const section = container.closest('.content-section');
            if (section) {
                section.innerHTML = `
                    <div class="container">
                        ${content}
                    </div>
                `;
            } else {
                container.innerHTML = content;
            }
            // Scroll to the content
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            console.error(`Element with ID '${elementId}' not found.`);
        }
    } catch (error) {
        console.error('Failed to load content:', error);
        // Fallback content
        const container = document.getElementById(elementId);
        if (container) {
            container.innerHTML = `
                <div class="container">
                    <h2>Content Not Available</h2>
                    <p>Sorry, we couldn't load the requested content. Please try again later.</p>
                </div>
            `;
        }
    }
}

// Load content on link click (for the dropdown partials)
document.querySelectorAll('.load-content').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const url = this.dataset.url;
        loadContent(url, 'main-content-placeholder');
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll animations (NOTE: You'll need to make sure the CSS for .animate-on-scroll is in style.css)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-on-scroll');
        }
    });
});

// Observe all elements you want to animate on scroll
document.querySelectorAll('.animate-on-scroll').forEach(element => observer.observe(element));

// Toggle mobile menu visibility
const menuToggle = document.getElementById('menu-toggle');
const mobileNav = document.getElementById('mobile-nav');

menuToggle.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
});

// Close the mobile menu when a link is clicked
document.querySelectorAll('.mobile-links a').forEach(link => {
    link.addEventListener('click', () => {
        mobileNav.classList.remove('open');
    });
});
