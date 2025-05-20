/**
 * Search functionality for the Metanoia Curriculum
 * Handles search interface and results display
 */

let searchIndex = [];
let searchReady = false;

/**
 * Initialize search functionality
 */
function initSearch() {
    // Load search index
    loadSearchIndex();
    
    // Set up event listeners
    setupSearchEvents();
}

/**
 * Load search index from JSON file
 */
function loadSearchIndex() {
    fetch('../assets/data/search-index.json')
        .then(response => response.json())
        .then(data => {
            searchIndex = data;
            searchReady = true;
            console.log('Search index loaded successfully');
        })
        .catch(error => {
            console.error('Error loading search index:', error);
            document.getElementById('search-results').innerHTML = '<p class="error-message">Search functionality is currently unavailable.</p>';
        });
}

/**
 * Set up search event listeners
 */
function setupSearchEvents() {
    const searchInput = document.getElementById('search-input');
    const searchToggle = document.getElementById('search-toggle');
    const searchOverlay = document.getElementById('search-overlay');
    
    // Toggle search overlay
    if (searchToggle && searchOverlay) {
        searchToggle.addEventListener('click', function() {
            searchOverlay.classList.toggle('show');
            if (searchOverlay.classList.contains('show')) {
                searchInput.focus();
            }
        });
    }
    
    // Close search on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchOverlay && searchOverlay.classList.contains('show')) {
            searchOverlay.classList.remove('show');
        }
    });
    
    // Perform search on input
    if (searchInput) {
        searchInput.addEventListener('input', debounce(performSearch, 300));
        
        // Also trigger search on enter key
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

/**
 * Perform search and display results
 */
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    if (!searchInput || !searchResults) return;
    
    const query = searchInput.value.trim().toLowerCase();
    
    // Clear results if query is empty
    if (query === '') {
        searchResults.innerHTML = '';
        return;
    }
    
    // Wait for search index to load
    if (!searchReady) {
        searchResults.innerHTML = '<p>Loading search data...</p>';
        return;
    }
    
    // Filter search index for matching items
    const results = searchIndex.filter(item => {
        return item.title.toLowerCase().includes(query) || 
               item.content.toLowerCase().includes(query) ||
               (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)));
    });
    
    // Display results
    if (results.length === 0) {
        searchResults.innerHTML = '<p>No results found for "' + query + '"</p>';
    } else {
        let resultsHTML = '<h3>' + results.length + ' results found</h3>';
        resultsHTML += '<ul class="search-results-list">';
        
        results.forEach(result => {
            // Create excerpt with highlighted search term
            let excerpt = getExcerpt(result.content, query);
            
            resultsHTML += `
                <li class="search-result-item">
                    <a href="${result.url}" class="result-link">
                        <h4>${result.title}</h4>
                        <p class="result-excerpt">${excerpt}</p>
                        <div class="result-meta">
                            ${result.type ? '<span class="result-type">' + result.type + '</span>' : ''}
                            ${result.module ? '<span class="result-module">Module ' + result.module + '</span>' : ''}
                        </div>
                    </a>
                </li>
            `;
        });
        
        resultsHTML += '</ul>';
        searchResults.innerHTML = resultsHTML;
    }
}

/**
 * Create excerpt with highlighted search term
 * @param {string} content - Content to extract excerpt from
 * @param {string} query - Search query to highlight
 * @returns {string} HTML excerpt with highlighted query
 */
function getExcerpt(content, query) {
    // Find position of query in content
    const position = content.toLowerCase().indexOf(query.toLowerCase());
    
    if (position === -1) {
        // If query not found in content, return first 150 characters
        return content.substring(0, 150) + '...';
    }
    
    // Extract excerpt around the query
    const start = Math.max(0, position - 60);
    const end = Math.min(content.length, position + query.length + 60);
    let excerpt = content.substring(start, end);
    
    // Add ellipsis if needed
    if (start > 0) excerpt = '...' + excerpt;
    if (end < content.length) excerpt += '...';
    
    // Highlight the query in the excerpt
    const regex = new RegExp('(' + escapeRegExp(query) + ')', 'gi');
    excerpt = excerpt.replace(regex, '<mark>$1</mark>');
    
    return excerpt;
}

/**
 * Escape special characters for use in RegExp
 * @param {string} string - String to escape
 * @returns {string} Escaped string
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Debounce function to limit how often a function is called
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {function} Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}

// Initialize search when DOM is loaded
document.addEventListener('DOMContentLoaded', initSearch);