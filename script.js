const dropdown = document.getElementById('exploreDropdown');
const container = document.getElementById('mediaContainer');

async function fetchData(type) {
    let books = [];
    let movies = [];

    const seenBookTitles = new Set();
    const seenMovieTitles = new Set();

    try {
        if (type === 'books' || type === 'all') {
            let startIndex = 0;

            while (books.length < 50 && startIndex <= 100) {
                const url = `https://www.googleapis.com/books/v1/volumes?q=the&startIndex=${startIndex}&maxResults=10&key=AIzaSyDgIXd8KXZwlzkhN7gw1prj-1b1dWwkS0w`;
                startIndex += 10;

                const res = await fetch(url);
                const data = await res.json();

                if (data.items) {
                    data.items.forEach(book => {
                        const title = book.volumeInfo.title;
                        if (title && !seenBookTitles.has(title) && books.length < 50) {
                            seenBookTitles.add(title);
                            books.push({
                                title: title,
                                mediaType: 'Book'
                            });
                        }
                    });
                }
            }
        }

        if (type === 'movies' || type === 'all') {
            let page = 1;
        
            while (movies.length < 50 && page <= 10) {
                const url = `https://www.omdbapi.com/?apikey=e9a00f76&s=star&page=${page}`;
                page++;
        
                const res = await fetch(url);
                const data = await res.json();
        
                if (data.Response === "True" && data.Search) {
                    data.Search.forEach(movie => {
                        const title = movie.Title;
                        if (title && !seenMovieTitles.has(title) && movies.length < 50) {
                            seenMovieTitles.add(title);
                            movies.push({
                                title: title,
                                mediaType: 'Movie'
                            });
                        }
                    });
                } else {
                    console.warn(`OMDb response issue on page ${page - 1}: ${data.Error}`);
                    break;
                }
            }
        }

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