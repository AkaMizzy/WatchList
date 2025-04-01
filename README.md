# WatchList - Your Personal Entertainment Tracker

A responsive web application that allows users to search for movies and TV shows and create a personalized watch list.

![WatchList Screenshot](https://via.placeholder.com/800x400?text=WatchList+App+Screenshot)

## Features

- Search for movies and TV shows using the Open Movie Database (OMDb) API
- Filter search results by type (movies or TV shows)
- View detailed information including title, release year, rating, and synopsis
- Add items to your personal watch list
- Filter your watch list by content type
- Responsive design for all screen sizes
- Data persistence using localStorage

## Technologies Used

- HTML5
- CSS3 (with Flexbox and Grid for layout)
- JavaScript (ES6+)
- Open Movie Database (OMDb) API
- Local Storage for data persistence
- Font Awesome icons

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. Clone this repository or download the files
2. Open `index.html` in your web browser

The application is already using a free OMDb API key (limited to 1,000 requests per day). If you need your own key:
- Visit [https://www.omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx) to request a free API key
- Once you receive your key, open `app.js` and replace the existing API key:

```javascript
const API_KEY = 'your_api_key_here';
```

## How to Use

1. **Searching for Content**:
   - Enter a title in the search bar and press Enter or click the search icon
   - Use the filter buttons to narrow results to just movies or TV shows
   - Browse through results with details like release year, type, and rating

2. **Managing Your Watch List**:
   - Click "Add to Watch List" on any item you want to save
   - Navigate to "My Watch List" tab to view all saved items
   - Filter your watch list by content type
   - Remove items by clicking the "Remove" button

## Project Structure

- `index.html` - Main HTML structure
- `styles.css` - All styling and responsive design rules
- `app.js` - JavaScript functionality including API integration and watch list management

## API Usage

This project uses the Open Movie Database (OMDb) API to fetch movie and TV show data. The following endpoints are used:

- `/?s=query&type=movie` - Search for movies
- `/?s=query&type=series` - Search for TV shows
- `/?i=imdbID` - Get detailed information for a specific title

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Open Movie Database (OMDb)](https://www.omdbapi.com/) for providing the API
- [Font Awesome](https://fontawesome.com/) for the icons 