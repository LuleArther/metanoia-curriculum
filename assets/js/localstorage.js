/**
 * Local Storage Utilities for Metanoia Curriculum
 * Handles saving and retrieving user progress, settings, and quiz results
 */

const STORAGE_KEYS = {
    USER_ROLE: 'metanoia_user_role',
    THEME: 'metanoia_theme',
    MODULE_PROGRESS: 'metanoia_module_progress',
    QUIZ_RESULTS: 'metanoia_quiz_results',
    COMPLETED_ACTIVITIES: 'metanoia_completed_activities',
    BOOKMARKS: 'metanoia_bookmarks',
    NOTES: 'metanoia_notes'
};

/**
 * Check if local storage is available
 * @returns {boolean} True if local storage is available
 */
function isLocalStorageAvailable() {
    try {
        const test = 'test';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

/**
 * Save data to local storage
 * @param {string} key - The storage key
 * @param {any} data - The data to store
 * @returns {boolean} Success status
 */
function saveToStorage(key, data) {
    if (!isLocalStorageAvailable()) {
        console.warn('Local storage is not available');
        return false;
    }
    
    try {
        const serializedData = JSON.stringify(data);
        localStorage.setItem(key, serializedData);
        return true;
    } catch (e) {
        console.error('Error saving to local storage:', e);
        return false;
    }
}

/**
 * Load data from local storage
 * @param {string} key - The storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} The retrieved data or default value
 */
function loadFromStorage(key, defaultValue = null) {
    if (!isLocalStorageAvailable()) {
        console.warn('Local storage is not available');
        return defaultValue;
    }
    
    try {
        const serializedData = localStorage.getItem(key);
        if (serializedData === null) {
            return defaultValue;
        }
        return JSON.parse(serializedData);
    } catch (e) {
        console.error('Error loading from local storage:', e);
        return defaultValue;
    }
}

/**
 * Remove data from local storage
 * @param {string} key - The storage key
 * @returns {boolean} Success status
 */
function removeFromStorage(key) {
    if (!isLocalStorageAvailable()) {
        console.warn('Local storage is not available');
        return false;
    }
    
    try {
        localStorage.removeItem(key);
        return true;
    } catch (e) {
        console.error('Error removing from local storage:', e);
        return false;
    }
}

/**
 * Clear all Metanoia data from local storage
 * @returns {boolean} Success status
 */
function clearAllMetanoiaData() {
    if (!isLocalStorageAvailable()) {
        console.warn('Local storage is not available');
        return false;
    }
    
    try {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        return true;
    } catch (e) {
        console.error('Error clearing all Metanoia data:', e);
        return false;
    }
}

/**
 * Save user role preference
 * @param {string} role - The user role ('student' or 'teacher')
 */
function saveUserRole(role) {
    saveToStorage(STORAGE_KEYS.USER_ROLE, role);
}

/**
 * Get user role preference
 * @returns {string|null} The user role or null if not set
 */
function getUserRole() {
    return loadFromStorage(STORAGE_KEYS.USER_ROLE, null);
}

/**
 * Save theme preference
 * @param {string} theme - The theme ('light' or 'dark')
 */
function saveThemePreference(theme) {
    saveToStorage(STORAGE_KEYS.THEME, theme);
}

/**
 * Get theme preference
 * @returns {string} The theme ('light' or 'dark')
 */
function getThemePreference() {
    return loadFromStorage(STORAGE_KEYS.THEME, 'light');
}

/**
 * Save module progress
 * @param {number} moduleNumber - The module number
 * @param {number} progress - Progress percentage (0-100)
 */
function saveModuleProgress(moduleNumber, progress) {
    const allProgress = loadFromStorage(STORAGE_KEYS.MODULE_PROGRESS, {});
    allProgress[moduleNumber] = progress;
    saveToStorage(STORAGE_KEYS.MODULE_PROGRESS, allProgress);
}

/**
 * Get module progress
 * @param {number} moduleNumber - The module number
 * @returns {number} Progress percentage (0-100)
 */
function getModuleProgress(moduleNumber) {
    const allProgress = loadFromStorage(STORAGE_KEYS.MODULE_PROGRESS, {});
    return allProgress[moduleNumber] || 0;
}

/**
 * Get progress for all modules
 * @returns {object} Object with module numbers as keys and progress as values
 */
function getAllModuleProgress() {
    return loadFromStorage(STORAGE_KEYS.MODULE_PROGRESS, {});
}

/**
 * Mark an activity as completed
 * @param {string} activityId - Unique identifier for the activity
 */
function markActivityCompleted(activityId) {
    const completed = loadFromStorage(STORAGE_KEYS.COMPLETED_ACTIVITIES, []);
    if (!completed.includes(activityId)) {
        completed.push(activityId);
        saveToStorage(STORAGE_KEYS.COMPLETED_ACTIVITIES, completed);
    }
}

/**
 * Check if an activity is completed
 * @param {string} activityId - Unique identifier for the activity
 * @returns {boolean} True if activity is completed
 */
function isActivityCompleted(activityId) {
    const completed = loadFromStorage(STORAGE_KEYS.COMPLETED_ACTIVITIES, []);
    return completed.includes(activityId);
}

/**
 * Save quiz result
 * @param {string} quizId - Unique identifier for the quiz
 * @param {object} result - Quiz result object
 */
function saveQuizResult(quizId, result) {
    const allResults = loadFromStorage(STORAGE_KEYS.QUIZ_RESULTS, {});
    allResults[quizId] = result;
    saveToStorage(STORAGE_KEYS.QUIZ_RESULTS, allResults);
}

/**
 * Get quiz result
 * @param {string} quizId - Unique identifier for the quiz
 * @returns {object|null} Quiz result object or null if not taken
 */
function getQuizResult(quizId) {
    const allResults = loadFromStorage(STORAGE_KEYS.QUIZ_RESULTS, {});
    return allResults[quizId] || null;
}

/**
 * Add a bookmark
 * @param {string} pageUrl - URL of the bookmarked page
 * @param {string} title - Title of the bookmarked page
 */
function addBookmark(pageUrl, title) {
    const bookmarks = loadFromStorage(STORAGE_KEYS.BOOKMARKS, []);
    const bookmark = { url: pageUrl, title, timestamp: Date.now() };
    
    // Check if bookmark already exists
    const existingIndex = bookmarks.findIndex(b => b.url === pageUrl);
    if (existingIndex >= 0) {
        bookmarks[existingIndex] = bookmark; // Update existing
    } else {
        bookmarks.push(bookmark); // Add new
    }
    
    saveToStorage(STORAGE_KEYS.BOOKMARKS, bookmarks);
}

/**
 * Remove a bookmark
 * @param {string} pageUrl - URL of the bookmarked page
 */
function removeBookmark(pageUrl) {
    const bookmarks = loadFromStorage(STORAGE_KEYS.BOOKMARKS, []);
    const filteredBookmarks = bookmarks.filter(b => b.url !== pageUrl);
    saveToStorage(STORAGE_KEYS.BOOKMARKS, filteredBookmarks);
}

/**
 * Get all bookmarks
 * @returns {array} Array of bookmark objects
 */
function getAllBookmarks() {
    return loadFromStorage(STORAGE_KEYS.BOOKMARKS, []);
}

/**
 * Save a note
 * @param {string} pageUrl - URL of the associated page
 * @param {string} noteText - Text content of the note
 */
function saveNote(pageUrl, noteText) {
    const notes = loadFromStorage(STORAGE_KEYS.NOTES, {});
    notes[pageUrl] = {
        text: noteText,
        lastUpdated: Date.now()
    };
    saveToStorage(STORAGE_KEYS.NOTES, notes);
}

/**
 * Get a note
 * @param {string} pageUrl - URL of the associated page
 * @returns {object|null} Note object or null if not found
 */
function getNote(pageUrl) {
    const notes = loadFromStorage(STORAGE_KEYS.NOTES, {});
    return notes[pageUrl] || null;
}

/**
 * Get all notes
 * @returns {object} Object with page URLs as keys and note objects as values
 */
function getAllNotes() {
    return loadFromStorage(STORAGE_KEYS.NOTES, {});
}