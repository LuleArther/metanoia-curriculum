/**
 * Glossary functionality for the Metanoia Curriculum
 * Handles loading, displaying, filtering, and searching glossary terms
 */

let glossaryTerms = [];
let filteredTerms = [];

/**
 * Initialize the glossary functionality
 */
function initGlossary() {
    loadGlossaryTerms();
    setupEventListeners();
}

/**
 * Load glossary terms from JSON file
 */
function loadGlossaryTerms() {
    fetch('../assets/data/glossary.json')
        .then(response => response.json())
        .then(data => {
            glossaryTerms = data.sort((a, b) => a.term.localeCompare(b.term));
            filteredTerms = [...glossaryTerms];
            setupAlphabetNav();
            displayGlossaryTerms();
        })
        .catch(error => console.error('Error loading glossary terms:', error));
}

/**
 * Set up alphabet navigation
 */
function setupAlphabetNav() {
    const letterNav = document.getElementById('letter-nav');
    letterNav.innerHTML = '';
    
    // Get all unique first letters from terms
    const firstLetters = [...new Set(glossaryTerms.map(item => item.term.charAt(0).toUpperCase()))];
    
    firstLetters.sort().forEach(letter => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `#section-${letter}`;
        a.textContent = letter;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector(`#section-${letter}`).scrollIntoView({ 
                behavior: 'smooth' 
            });
        });
        li.appendChild(a);
        letterNav.appendChild(li);
    });
}

/**
 * Display glossary terms grouped by first letter
 */
function displayGlossaryTerms() {
    const container = document.querySelector('.glossary-container');
    container.innerHTML = '';
    
    // Check if we have terms to display
    if (filteredTerms.length === 0) {
        document.querySelector('.no-results-message').style.display = 'block';
        return;
    }
    
    document.querySelector('.no-results-message').style.display = 'none';
    
    // Group terms by first letter
    const groupedTerms = {};
    filteredTerms.forEach(term => {
        const firstLetter = term.term.charAt(0).toUpperCase();
        if (!groupedTerms[firstLetter]) {
            groupedTerms[firstLetter] = [];
        }
        groupedTerms[firstLetter].push(term);
    });
    
    // Display terms by group
    Object.keys(groupedTerms).sort().forEach(letter => {
        const section = document.createElement('section');
        section.classList.add('glossary-section');
        section.id = `section-${letter}`;
        
        const heading = document.createElement('h2');
        heading.textContent = letter;
        section.appendChild(heading);
        
        const termList = document.createElement('dl');
        termList.classList.add('glossary-terms');
        
        groupedTerms[letter].forEach(item => {
            const termDiv = document.createElement('div');
            termDiv.classList.add('glossary-item');
            
            const dt = document.createElement('dt');
            dt.textContent = item.term;
            
            const dd = document.createElement('dd');
            dd.textContent = item.definition;
            
            // Add module reference if available
            if (item.modules && item.modules.length > 0) {
                const moduleRef = document.createElement('div');
                moduleRef.classList.add('module-reference');
                moduleRef.textContent = `Appears in: ${item.modules.join(', ')}`;
                dd.appendChild(moduleRef);
            }
            
            termDiv.appendChild(dt);
            termDiv.appendChild(dd);
            termList.appendChild(termDiv);
        });
        
        section.appendChild(termList);
        container.appendChild(section);
    });
}

/**
 * Filter glossary terms based on search query
 */
function filterGlossaryTerms(query) {
    query = query.toLowerCase().trim();
    
    if (query === '') {
        filteredTerms = [...glossaryTerms];
    } else {
        filteredTerms = glossaryTerms.filter(item => 
            item.term.toLowerCase().includes(query) || 
            item.definition.toLowerCase().includes(query)
        );
    }
    
    displayGlossaryTerms();
}

/**
 * Set up event listeners for search and filtering
 */
function setupEventListeners() {
    const searchInput = document.getElementById('glossary-search');
    const searchButton = document.getElementById('search-button');
    
    searchInput.addEventListener('input', () => {
        filterGlossaryTerms(searchInput.value);
    });
    
    searchButton.addEventListener('click', () => {
        filterGlossaryTerms(searchInput.value);
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            filterGlossaryTerms(searchInput.value);
        }
    });
}

/**
 * Initialize glossary tooltips across the site
 * This function can be called on any page to enable glossary term tooltips
 */
function initGlossaryTooltips() {
    fetch('../assets/data/glossary.json')
        .then(response => response.json())
        .then(data => {
            const terms = data;
            
            // Find all glossary term references and add tooltips
            document.querySelectorAll('.glossary-term').forEach(element => {
                const termText = element.textContent.toLowerCase();
                const term = terms.find(t => t.term.toLowerCase() === termText);
                
                if (term) {
                    // Create tooltip functionality
                    element.classList.add('has-tooltip');
                    element.setAttribute('title', term.definition);
                    
                    // Add hover interaction
                    element.addEventListener('mouseenter', (e) => {
                        const tooltip = document.createElement('div');
                        tooltip.classList.add('glossary-tooltip');
                        tooltip.textContent = term.definition;
                        document.body.appendChild(tooltip);
                        
                        // Position the tooltip
                        const rect = element.getBoundingClientRect();
                        tooltip.style.left = `${rect.left}px`;
                        tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
                        
                        // Add close functionality
                        tooltip.addEventListener('click', () => {
                            tooltip.remove();
                        });
                        
                        // Store tooltip reference
                        element.dataset.tooltip = tooltip;
                    });
                    
                    element.addEventListener('mouseleave', () => {
                        setTimeout(() => {
                            const tooltip = document.querySelector('.glossary-tooltip');
                            if (tooltip) tooltip.remove();
                        }, 300);
                    });
                }
            });
        })
        .catch(error => console.error('Error loading glossary terms for tooltips:', error));
}