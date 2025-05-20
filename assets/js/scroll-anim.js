/**
 * Scroll animations for Metanoia Curriculum Website
 * Handles animated content appearance on scroll
 */

/**
 * Initialize scroll animations
 */
function initScrollAnimations() {
    // Identify elements to animate
    const animElements = document.querySelectorAll('.scroll-anim');
    
    // Set up intersection observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Stop observing after animation is triggered
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null, // viewport
        threshold: 0.15, // 15% of element visible
        rootMargin: '0px 0px -100px 0px' // trigger a bit earlier
    });
    
    // Observe all animation elements
    animElements.forEach(element => {
        observer.observe(element);
    });
    
    // Handle header scrolling effect
    handleHeaderScroll();
}

/**
 * Handle header shrinking/styling on scroll
 */
function handleHeaderScroll() {
    const header = document.getElementById('site-header');
    const scrollThreshold = 50; // pixels scrolled before changing header
    
    if (!header) return;
    
    // Check scroll position on load
    if (window.scrollY > scrollThreshold) {
        header.classList.add('scrolled');
    }
    
    // Listen for scroll events
    window.addEventListener('scroll', () => {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/**
 * Smooth scroll to element by ID
 * @param {string} elementId - ID of target element
 */
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    window.scrollTo({
        top: element.offsetTop - 70, // Adjust for header height
        behavior: 'smooth'
    });
}

/**
 * Set up scroll-to-anchor links
 */
function setupAnchorLinks() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#" or for dropdown toggles
            if (href === '#' || this.classList.contains('dropdown-toggle')) {
                return;
            }
            
            e.preventDefault();
            
            const targetId = href.substring(1);
            scrollToElement(targetId);
        });
    });
}

// Initialize scroll animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    setupAnchorLinks();
});