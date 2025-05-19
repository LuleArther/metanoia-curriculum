/**
 * Main JavaScript file for Metanoia Curriculum Website
 * Handles common functionality across the site
 */

// Once DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Load header and footer components
  loadComponents();
  
  // Set up theme switching
  setupThemeSwitcher();
  
  // Check user role if not on role selection page
  if (!window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
      checkUserRole();
  }
});

/**
* Loads header and footer components via fetch API
*/
function loadComponents() {
  // Get header placeholder
  const headerPlaceholder = document.getElementById('header-placeholder');
  if (headerPlaceholder) {
      // Determine the correct path based on current directory depth
      const headerPath = getCorrectPath() + 'assets/includes/header.html';
      
      // Fetch and insert header
      fetch(headerPath)
          .then(response => {
              if (!response.ok) {
                  throw new Error(`Failed to load header: ${response.status}`);
              }
              return response.text();
          })
          .then(data => {
              headerPlaceholder.innerHTML = data;
              // Initialize header functionality after loading
              initializeHeader();
          })
          .catch(error => {
              console.error('Error loading header:', error);
              headerPlaceholder.innerHTML = '<div class="error-message">Failed to load header component. Please refresh the page.</div>';
          });
  }
  
  // Get footer placeholder
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
      // Determine the correct path based on current directory depth
      const footerPath = getCorrectPath() + 'assets/includes/footer.html';
      
      // Fetch and insert footer
      fetch(footerPath)
          .then(response => {
              if (!response.ok) {
                  throw new Error(`Failed to load footer: ${response.status}`);
              }
              return response.text();
          })
          .then(data => {
              footerPlaceholder.innerHTML = data;
              // Initialize footer functionality after loading
              initializeFooter();
          })
          .catch(error => {
              console.error('Error loading footer:', error);
              footerPlaceholder.innerHTML = '<div class="error-message">Failed to load footer component. Please refresh the page.</div>';
          });
  }
}

/**
* Determines the correct path prefix based on the current directory depth
* @returns {string} Path prefix to use for assets
*/
function getCorrectPath() {
  // Get current path
  const path = window.location.pathname;
  
  // Check if we're in a subdirectory
  if (path.includes('/student/') || path.includes('/teacher/')) {
      return '../';
  }
  
  return './';
}

/**
* Initializes header functionality after it's loaded
*/
function initializeHeader() {
  // Set up mobile menu toggle
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const navigation = document.querySelector('.primary-navigation');
  
  if (menuToggle && navigation) {
      menuToggle.addEventListener('click', function() {
          navigation.classList.toggle('show-menu');
          menuToggle.setAttribute('aria-expanded', 
              menuToggle.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
          );
      });
  }
  
  // Setup theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
      
      // Set initial state based on saved preference
      const currentTheme = localStorage.getItem('metanoia_theme') || 'light';
      themeToggle.innerHTML = currentTheme === 'dark' 
          ? '<i class="fas fa-sun"></i>' 
          : '<i class="fas fa-moon"></i>';
  }
  
  // Highlight current page in navigation
  highlightCurrentPage();
}

/**
* Initializes footer functionality after it's loaded
*/
function initializeFooter() {
  // Initialize any footer-specific functionality here
  const year = document.getElementById('current-year');
  if (year) {
      year.textContent = new Date().getFullYear();
  }
}

/**
* Checks if user has selected a role and redirects if not
*/
function checkUserRole() {
  // Check if user role is stored in localStorage
  const userRole = localStorage.getItem('metanoia_user_role');
  
  // If no role is set and not on index page, redirect to role selection
  if (!userRole) {
      window.location.href = getCorrectPath() + 'index.html';
  }
}

/**
* Sets up theme switching functionality
*/
function setupThemeSwitcher() {
  // Check for saved theme preference or use default
  const currentTheme = localStorage.getItem('metanoia_theme') || 'light';
  
  // Apply the theme
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  // Update stylesheet
  const themeStyle = document.getElementById('theme-style');
  if (themeStyle) {
      const basePath = getCorrectPath() + 'assets/css/';
      themeStyle.href = `${basePath}${currentTheme}.css`;
  }
}

/**
* Toggles between light and dark themes
*/
function toggleTheme() {
  // Get current theme
  const currentTheme = localStorage.getItem('metanoia_theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  // Save to localStorage
  localStorage.setItem('metanoia_theme', newTheme);
  
  // Update page without refresh
  document.documentElement.setAttribute('data-theme', newTheme);
  
  // Update theme stylesheet
  const themeStyle = document.getElementById('theme-style');
  if (themeStyle) {
      const basePath = getCorrectPath() + 'assets/css/';
      themeStyle.href = `${basePath}${newTheme}.css`;
  }
  
  // Update toggle button icon
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
      themeToggle.innerHTML = newTheme === 'dark' 
          ? '<i class="fas fa-sun"></i>' 
          : '<i class="fas fa-moon"></i>';
  }
}

/**
* Highlights the current page in the navigation menu
*/
function highlightCurrentPage() {
  // Get current page path
  const currentPath = window.location.pathname;
  
  // Find all navigation links
  const navLinks = document.querySelectorAll('.primary-navigation a');
  
  // Check each link against current path
  navLinks.forEach(link => {
      const linkPath = link.getAttribute('href');
      
      if (linkPath && currentPath.includes(linkPath) && linkPath !== '#' && linkPath !== '/') {
          link.classList.add('active');
          
          // If inside dropdown, also highlight parent
          const parentLi = link.closest('li.has-dropdown');
          if (parentLi) {
              parentLi.classList.add('active');
          }
      }
  });
}