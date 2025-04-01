// API Constants
const API_KEY = 'e61509697e8e926fb4a37c766ba95376'; 
const API_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x450?text=No+Image+Available';

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const resultsContainer = document.getElementById('results-container');
const watchlistContainer = document.getElementById('watchlist-container');
const loadingSpinner = document.getElementById('loading-spinner');
const searchNav = document.getElementById('search-nav');
const watchlistNav = document.getElementById('watchlist-nav');
const searchSection = document.getElementById('search-section');
const watchlistSection = document.getElementById('watchlist-section');
const filterButtons = document.querySelectorAll('.filter-button[data-type]');
const watchlistFilterButtons = document.querySelectorAll('.filter-button[data-list-type]');
const itemTemplate = document.getElementById('item-template');

// State
let currentFilter = 'all';
let currentWatchlistFilter = 'all';
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];

// Event Listeners
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMedia();
    }
});

searchButton.addEventListener('click', searchMedia);

// Navigation
searchNav.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveSection(searchSection);
    setActiveNavItem(searchNav);
});

watchlistNav.addEventListener('click', (e) => {
    e.preventDefault();
    setActiveSection(watchlistSection);
    setActiveNavItem(watchlistNav);
    renderWatchlist();
});

// Filter listeners
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        setActiveFilterButton(button, filterButtons);
        currentFilter = button.dataset.type;
        if (searchInput.value.trim() !== '') {
            searchMedia();
        }
    });
});

watchlistFilterButtons.forEach(button => {
    button.addEventListener('click', () => {
        setActiveFilterButton(button, watchlistFilterButtons);
        currentWatchlistFilter = button.dataset.listType;
        renderWatchlist();
    });
});

// Functions

/**
 * Set active section
 */
function setActiveSection(section) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    section.classList.add('active');
}

/**
 * Set active navigation item
 */
function setActiveNavItem(navItem) {
    document.querySelectorAll('nav a').forEach(item => item.classList.remove('active'));
    navItem.classList.add('active');
}

/**
 * Set active filter button
 */
function setActiveFilterButton(button, buttonGroup) {
    buttonGroup.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
}

/**
 * Search for media (movies and TV shows)
 */
async function searchMedia() {
    const query = searchInput.value.trim();
    
    if (!query) {
        showMessage(resultsContainer, 'Please enter a search term');
        return;
    }
    
    showLoading(true);
    clearResults();
    
    try {
        let results = [];
        
        // Search based on filter
        if (currentFilter === 'all' || currentFilter === 'movie') {
            const movieResults = await fetchAPI(`/search/movie?query=${encodeURIComponent(query)}`);
            results = [...results, ...movieResults.results.map(item => ({...item, media_type: 'movie'}))];
        }
        
        if (currentFilter === 'all' || currentFilter === 'tv') {
            const tvResults = await fetchAPI(`/search/tv?query=${encodeURIComponent(query)}`);
            results = [...results, ...tvResults.results.map(item => ({...item, media_type: 'tv'}))];
        }
        
        // Sort by popularity
        results.sort((a, b) => b.popularity - a.popularity);
        
        if (results.length === 0) {
            showMessage(resultsContainer, 'No results found. Try a different search term.');
        } else {
            renderResults(results);
        }
    } catch (error) {
        console.error('Search error:', error);
        showMessage(resultsContainer, 'An error occurred while searching. Please try again later.');
    } finally {
        showLoading(false);
    }
}

/**
 * Fetch data from the API
 */
async function fetchAPI(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}&api_key=${API_KEY}`);
    
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
}

/**
 * Render search results
 */
function renderResults(results) {
    clearResults();
    
    results.forEach(item => {
        const isInWatchlist = watchlist.some(watchlistItem => 
            watchlistItem.id === item.id && watchlistItem.media_type === item.media_type
        );
        
        const card = createMediaCard(item, isInWatchlist);
        resultsContainer.appendChild(card);
    });
}

/**
 * Create media card
 */
function createMediaCard(item, isInWatchlist = false) {
    const clone = itemTemplate.content.cloneNode(true);
    const card = clone.querySelector('.item-card');
    
    // Set data attributes for identification
    card.dataset.id = item.id;
    card.dataset.type = item.media_type;
    
    // Set image with better placeholder handling
    const posterPath = item.poster_path;
    const posterImg = card.querySelector('.poster');
    const title = item.media_type === 'movie' ? item.title : item.name;
    
    // Create a dynamic placeholder with the title if no poster is available
    const placeholderUrl = `https://via.placeholder.com/300x450/1a1a1a/ffffff?text=${encodeURIComponent(title)}`;
    
    posterImg.src = posterPath ? `${IMAGE_BASE_URL}${posterPath}` : placeholderUrl;
    posterImg.alt = title;
    
    // Add error handling for image loading
    posterImg.onerror = function() {
        this.src = placeholderUrl;
        this.onerror = null; // Prevent infinite loop if placeholder also fails
    };
    
    // Set text content
    card.querySelector('.title').textContent = title;
    
    // Set year
    const releaseDate = item.media_type === 'movie' ? item.release_date : item.first_air_date;
    card.querySelector('.year').textContent = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A';
    
    // Set type
    card.querySelector('.type').textContent = item.media_type === 'movie' ? 'Movie' : 'TV Show';
    
    // Set rating
    card.querySelector('.rating-value').textContent = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';
    
    // Set overview
    card.querySelector('.overview').textContent = item.overview || 'No description available.';
    
    // Set buttons
    const addButton = card.querySelector('.add-button');
    const removeButton = card.querySelector('.remove-button');
    
    if (isInWatchlist) {
        addButton.style.display = 'none';
        removeButton.style.display = 'flex';
    }
    
    addButton.addEventListener('click', () => addToWatchlist(item));
    removeButton.addEventListener('click', () => removeFromWatchlist(item.id, item.media_type));
    
    return card;
}

/**
 * Add item to watchlist
 */
function addToWatchlist(item) {
    // Check if item is already in watchlist
    const isInWatchlist = watchlist.some(watchlistItem => 
        watchlistItem.id === item.id && watchlistItem.media_type === item.media_type
    );
    
    if (!isInWatchlist) {
        watchlist.push(item);
        saveWatchlist();
        
        // Update UI
        const card = document.querySelector(`.item-card[data-id="${item.id}"][data-type="${item.media_type}"]`);
        if (card) {
            card.querySelector('.add-button').style.display = 'none';
            card.querySelector('.remove-button').style.display = 'flex';
        }
        
        // Show success message
        showToast(`Added to your watchlist!`);
    }
}

/**
 * Remove item from watchlist
 */
function removeFromWatchlist(id, type) {
    watchlist = watchlist.filter(item => !(item.id === id && item.media_type === type));
    saveWatchlist();
    
    // Update UI in search results if present
    const searchCard = document.querySelector(`#results-container .item-card[data-id="${id}"][data-type="${type}"]`);
    if (searchCard) {
        searchCard.querySelector('.add-button').style.display = 'flex';
        searchCard.querySelector('.remove-button').style.display = 'none';
    }
    
    // If on watchlist page, re-render the watchlist
    if (watchlistSection.classList.contains('active')) {
        renderWatchlist();
    }
    
    // Show success message
    showToast('Removed from your watchlist!');
}

/**
 * Render watchlist
 */
function renderWatchlist() {
    watchlistContainer.innerHTML = '';
    
    const filteredWatchlist = currentWatchlistFilter === 'all' 
        ? watchlist 
        : watchlist.filter(item => item.media_type === currentWatchlistFilter);
    
    if (filteredWatchlist.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-watchlist';
        emptyMessage.textContent = currentWatchlistFilter === 'all' 
            ? 'Your watch list is empty. Start adding items!' 
            : `No ${currentWatchlistFilter === 'movie' ? 'movies' : 'TV shows'} in your watch list.`;
        
        watchlistContainer.appendChild(emptyMessage);
        return;
    }
    
    filteredWatchlist.forEach(item => {
        const card = createMediaCard(item, true);
        watchlistContainer.appendChild(card);
    });
}

/**
 * Save watchlist to localStorage
 */
function saveWatchlist() {
    try {
        localStorage.setItem('watchlist', JSON.stringify(watchlist));
        console.log('Watchlist saved to localStorage:', watchlist);
    } catch (error) {
        console.error('Failed to save watchlist to localStorage:', error);
        // Show error message to user
        showToast('Failed to save watchlist. Please try again.');
    }
}

/**
 * Show loading spinner
 */
function showLoading(isLoading) {
    loadingSpinner.style.display = isLoading ? 'flex' : 'none';
}

/**
 * Clear results container
 */
function clearResults() {
    resultsContainer.innerHTML = '';
}

/**
 * Show message in container
 */
function showMessage(container, message) {
    container.innerHTML = `<div class="results-message">${message}</div>`;
}

/**
 * Show toast notification
 */
function showToast(message) {
    // Create toast element if it doesn't exist
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
        
        // Add styles
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.backgroundColor = 'rgba(44, 62, 80, 0.9)';
        toast.style.color = 'white';
        toast.style.padding = '12px 20px';
        toast.style.borderRadius = '4px';
        toast.style.zIndex = '1000';
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
        toast.style.transition = 'all 0.3s ease';
    }
    
    // Set message and show
    toast.textContent = message;
    toast.style.transform = 'translateY(0)';
    toast.style.opacity = '1';
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
    }, 3000);
}

// Initialize the application
function init() {
    // Load watchlist from localStorage
    try {
        const savedWatchlist = localStorage.getItem('watchlist');
        if (savedWatchlist) {
            watchlist = JSON.parse(savedWatchlist);
            console.log('Loaded watchlist from localStorage:', watchlist);
        } else {
            console.log('No watchlist found in localStorage');
            watchlist = [];
        }
    } catch (error) {
        console.error('Error loading watchlist from localStorage:', error);
        watchlist = [];
    }
    
    // Set default navigation
    setActiveSection(searchSection);
    setActiveNavItem(searchNav);
}

init(); 