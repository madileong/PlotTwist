const dropdown = document.getElementById('exploreDropdown');
const container = document.getElementById('mediaContainer');

const booksAPI = 'https://www.googleapis.com/books/v1/volumes?q=harry+potter&key=AIzaSyDgIXd8KXZwlzkhN7gw1prj-1b1dWwkS0w'
const moviesAPI = 'http://www.omdbapi.com/?apikey=e9a00f76&s=harry+potter'

async function fetchData(type) {
    let books = [];
    let movies = [];

    try {
        if (type === 'books' || type === 'all') {
            const booksResponse = await fetch(booksAPI);
            const booksData = await booksResponse.json();

            books = (booksData.items || []).map(book => ({
                title: book.volumeInfo.title,
                mediaType: 'Book'
            }));
        }

        if (type === 'movies' || type === 'all') {
            const moviesResponse = await fetch(moviesAPI);
            const moviesData = await moviesResponse.json();
      
            movies = (moviesData.Search || []).map(movie => ({
                title: movie.Title || movie.title,
                mediaType: 'Movie'
            }));
        }

        console.log(books);
        const allMedia = [...books, ...movies];
        renderItems(allMedia);
    } catch (error) {
        console.error('Encountered error when fetching data: ', error);
    }
}

function renderItems(items) {
    mediaContainer.innerHTML = ''; // clear stuff

    if (items.length === 0) {
        mediaContainer.innerHTML = '<p>No media found</p>';
        return;
    }
  
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'item';
      
        const title = item.title || item.name || 'Untitled';
        const type = item.mediaType || 'Media';
  
        div.textContent = `${title} (${type})`;
        mediaContainer.appendChild(div);
    });
}

exploreDropdown.addEventListener('change', () => {
    const selected = exploreDropdown.value;
    fetchData(selected);
});

fetchData('all');

// Function to switch between pages
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Show the selected page
    document.getElementById(pageId).classList.add('active');
}

// Function for logging out
function logout() {
    alert("Logging out... (functionality coming soon!)");
}