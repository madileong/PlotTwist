// --- I. CONSTANTS AND GLOBAL STATE ---
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY_HERE"; // Or "PASTE_YOUR_API_KEY_HERE"
const SAVED_ITEMS_STORAGE_KEY = 'plotTwistSavedItems';
let savedItems = [];
let homePageMediaContainer; // To store reference to mediaContainer for home page

// --- II. PAGE NAVIGATION AND DYNAMIC CONTENT LOADING ---

/**
 * Shows the specified page and hides all others.
 * @param {string} pageId The ID of the page div to show.
 */
function showPage(pageId) {
  // Hide all elements with the class 'page'
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => {
    page.classList.remove('active');
  });

  // Show the element with the specified ID by adding the 'active' class
  const activePage = document.getElementById(pageId);
  if (activePage) {
    activePage.classList.add('active');
    if (pageId === 'books') {
      fetchAndRenderDynamicPageContent('books', '#books .page-content', 'Book', 'books');
    } else if (pageId === 'movies') {
      fetchAndRenderDynamicPageContent('movies', '#movies .page-content', 'Movie', 'movies');
    } else if (pageId === 'saved') {
      renderSavedItemsPageContent();
    }
    // Home page content is managed by initializeHomePageLogic
  }
}

// --- III. SAVED ITEMS MANAGEMENT ---

function loadSavedItemsFromStorage() {
  const storedItems = localStorage.getItem(SAVED_ITEMS_STORAGE_KEY);
  if (storedItems) {
    savedItems = JSON.parse(storedItems);
  }
}

function persistSavedItemsToStorage() {
  localStorage.setItem(SAVED_ITEMS_STORAGE_KEY, JSON.stringify(savedItems));
}

function isItemSaved(itemData) {
  return savedItems.some(savedItem => savedItem.title === itemData.title && savedItem.mediaType.toLowerCase() === itemData.mediaType.toLowerCase());
}

function updateAllVisibleHeartIconsForItem(itemDataToUpdate, isNowSaved) {
  document.querySelectorAll('.save-heart-icon').forEach(icon => {
    const iconItemData = {
      title: icon.dataset.title,
      mediaType: icon.dataset.mediatype ? icon.dataset.mediatype.toLowerCase() : ''
    };
    if (iconItemData.title === itemDataToUpdate.title && iconItemData.mediaType === itemDataToUpdate.mediaType) {
      if (isNowSaved) {
        icon.classList.remove('far');
        icon.classList.add('fas');
      } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
      }
    }
  });
}

function toggleSaveItem(itemDataFromIcon) {
  const itemData = {
    ...itemDataFromIcon,
    mediaType: itemDataFromIcon.mediaType ? itemDataFromIcon.mediaType.toLowerCase() : ''
  };

  let wasSaved = isItemSaved(itemData);

  if (wasSaved) {
    savedItems = savedItems.filter(savedItem => !(savedItem.title === itemData.title && savedItem.mediaType.toLowerCase() === itemData.mediaType));
  } else {
    savedItems.push(itemData);
  }
  persistSavedItemsToStorage();

  if (document.getElementById('saved')?.classList.contains('active')) {
    renderSavedItemsPageContent();
  }

  updateAllVisibleHeartIconsForItem(itemData, !wasSaved);
}

function clearSavedItems() {
  if (confirm("Are you sure? This will clear all your saved items.")) {
    savedItems = [];
    localStorage.removeItem(SAVED_ITEMS_STORAGE_KEY);

    document.querySelectorAll('.save-heart-icon.fas.fa-heart').forEach(icon => {
      icon.classList.remove('fas');
      icon.classList.add('far');
    });

    if (document.getElementById('saved')?.classList.contains('active')) {
      renderSavedItemsPageContent();
    }
    
    showPage('home');
    console.log("Saved items cleared. Navigated to home page.");
  }
}

// --- IV. UI RENDERING AND DOM MANIPULATION ---

/**
 * Creates a DOM element for a single media item.
 * @param {object} item - The media item object (expecting title, description, mediaType).
 * @param {string} defaultItemTypeForDisplay - Fallback type string if item.mediaType is missing (e.g., 'Book', 'Movie', 'Item').
 * @returns {HTMLElement} The created media item div.
 */
function createMediaItemDOM(item, defaultItemTypeForDisplay) {
  const mediaItemDiv = document.createElement("div");
  mediaItemDiv.classList.add("media-item");

  const typeString = item.mediaType || defaultItemTypeForDisplay;
  let displayMediaType = typeString;
  if (typeString && typeof typeString === 'string' && typeString.length > 0) {
      displayMediaType = typeString.charAt(0).toUpperCase() + typeString.slice(1).toLowerCase();
  }

  let imgSrc = 'https://cdn-icons-png.flaticon.com/512/4241/4241295.png'; // Default to movie icon
  const effectiveMediaType = (typeString || '').toLowerCase();
  if (effectiveMediaType === 'book') {
      imgSrc = 'https://cdn-icons-png.flaticon.com/512/29/29302.png'; // Book icon
  }

  const itemDataForSave = {
    title: item.title,
    description: item.description || "",
    mediaType: displayMediaType
  };
  const initiallySaved = isItemSaved({ ...itemDataForSave, mediaType: itemDataForSave.mediaType.toLowerCase() });

  mediaItemDiv.innerHTML = `
    <img src="${imgSrc}" alt="${item.title}" class="media-image"/>
    <h3>${item.title}</h3>
    <p class="media-description">${item.description || "No description available."}</p>
    <div class="media-item-footer">
      <p class="media-type-display">Type: ${displayMediaType}</p>
      <i class="save-heart-icon ${initiallySaved ? 'fas fa-heart' : 'far fa-heart'}"
         data-title="${item.title}"
         data-description="${item.description || ""}"
         data-mediatype="${displayMediaType}"
         role="button"
         aria-label="Save or unsave item"
         tabindex="0"></i>
    </div>
  `;
  return mediaItemDiv;
}

/**
 * Renders a list of media items into a specified container.
 * @param {Array} items - Array of item objects.
 * @param {HTMLElement} containerElement - The HTML element to render items into.
 * @param {string} defaultMediaTypeForDisplay - Fallback type string if item.mediaType is missing.
 * @param {string} [emptyMessageContext='items'] - Context for the "no items found" message.
 */
function renderMediaItemsToContainer(items, containerElement, defaultMediaTypeForDisplay, emptyMessageContext = 'items') {
  if (!containerElement) {
    console.error("Target container for rendering items is not defined.");
    return;
  }
  containerElement.innerHTML = "";

  if (!items || items.length === 0) {
    containerElement.innerHTML = `<p>No ${emptyMessageContext} found. Please try again later!</p>`;
    return;
  }

  items.forEach(item => {
    const mediaItemDiv = createMediaItemDOM(item, item.mediaType || defaultMediaTypeForDisplay);
    containerElement.appendChild(mediaItemDiv);
  });

  containerElement.querySelectorAll('.save-heart-icon').forEach(icon => {
    icon.addEventListener('click', () => {
      const itemData = { title: icon.dataset.title, description: icon.dataset.description, mediaType: icon.dataset.mediatype };
      toggleSaveItem(itemData);
    });
  });
}

/**
 * Fetches and renders content for pages like 'Books' or 'Movies'.
 */
async function fetchAndRenderDynamicPageContent(pageName, containerSelector, itemTypeSingular, itemTypePlural) {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error(`${itemTypeSingular} page content container (${containerSelector}) not found.`);
    return;
  }
  // Restore check to prevent re-fetching if content is already there
  if (container.children.length > 0 && !container.innerHTML.includes(`Loading ${itemTypePlural}...`)) {
    return;
  }
  container.innerHTML = `<p>Loading ${itemTypePlural}...</p>`;
  const promptText = `Give me a list of 10 diverse and popular ${itemTypePlural}. Respond ONLY with a valid JSON array of objects. Each object in the array MUST have exactly three properties: "title", "description", and "mediaType". The value for "mediaType" must be the string "${itemTypeSingular}". All property names MUST be enclosed in double quotes. All string values (for "title", "description", and "mediaType") MUST be enclosed in double quotes and properly escaped (e.g., \\" for quotes within strings, \\\\ for backslashes, \\n for newlines). Do not include any text or explanation before or after the JSON array.`;
  try {
    const res = await fetchAICompletions(promptText);
    if (!res.ok) throw new Error(`API request failed with status ${res.status}`);
    const data = await res.json();
    if (!data.choices || !data.choices[0]) throw new Error("No AI choices returned.");
    const message = data.choices[0].message.content;
    const cleanMessage = message.replace(/```json|```/g, "").trim();
    console.log(`Attempting to parse JSON for ${itemTypePlural}:`, cleanMessage);
    const parsedItems = JSON.parse(cleanMessage);
    renderMediaItemsToContainer(parsedItems, container, itemTypeSingular, itemTypePlural.toLowerCase());
  } catch (error) {
    console.error(`Error fetching/rendering ${itemTypePlural} for ${pageName} page:`, error);
    if (container) {
        container.innerHTML = `<p>Sorry! Could not load ${itemTypePlural}. An error occurred: ${error.message}</p>`;
    }
  }
}

/**
 * Renders items on the "Saved" page.
 */
function renderSavedItemsPageContent() {
  const savedContainer = document.querySelector("#saved .page-content");
  if (!savedContainer) {
    console.error("Saved page content container (.page-content within #saved) not found.");
    return;
  }

  if (savedItems.length === 0) {
    // If no saved items, set the specific message for the saved page.
    savedContainer.innerHTML = "<p>You haven't saved any items yet. Click the heart on any book or movie to save it here!</p>";
  } else {
    renderMediaItemsToContainer(savedItems, savedContainer, 'Item');
  }
}

/**
 * Helper function to make the API call to OpenAI.
 * @param {string} promptText - The prompt to send to the AI.
 * @returns {Promise<Response>} The fetch API Response object.
 */
async function fetchAICompletions(promptText) {
  return fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: promptText }]
    })
  });
}

// --- V. HOME PAGE SPECIFIC LOGIC ---

function getCurrentHomePageMediaType() {
  const selectedButton = document.querySelector(".toggleButton.selected");
  return selectedButton ? selectedButton.textContent : 'Book'; // Default to 'Book' if none selected
}

async function fetchAndRenderHomePageRecommendations(promptText, defaultMediaType, emptyMessageContext) {
  if (!homePageMediaContainer) {
    console.error("Home page media container not initialized.");
    return;
  }
  homePageMediaContainer.innerHTML = `<p>Loading AI recommendations...</p>`;
  try {
    const res = await fetchAICompletions(promptText);
    if (!res.ok) throw new Error(`API request failed with status ${res.status}`);
    const data = await res.json();
    if (!data.choices || !data.choices[0]) throw new Error("No AI choices returned.");
    const message = data.choices[0].message.content;
    const cleanMessage = message.replace(/```json|```/g, "").trim();
    console.log(`Attempting to parse JSON for home page recommendations:`, cleanMessage);
    const parsedItems = JSON.parse(cleanMessage);
    renderMediaItemsToContainer(parsedItems, homePageMediaContainer, defaultMediaType, emptyMessageContext);
  } catch (error) {
    console.error("AI fetch error for home page:", error);
    if (homePageMediaContainer) {
        homePageMediaContainer.innerHTML = `<p>Sorry! AI recommendations failed. Try again later. Error: ${error.message}</p>`;
    }
  }
}

function initializeHomePageLogic() {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const bookButton = document.getElementById("bookButton");
  const movieButton = document.getElementById("movieButton");
  const arrow = document.getElementById("arrow");
  const exploreTitle = document.getElementById("exploreTitle");
  homePageMediaContainer = document.getElementById("mediaContainer"); // Initialize global reference

  if (bookButton) {
    bookButton.addEventListener("click", () => {
      bookButton.classList.add("selected");
      if (movieButton) movieButton.classList.remove("selected");
      if (arrow) arrow.innerHTML = "⬅️";
    });
  }

  if (movieButton) {
    movieButton.addEventListener("click", () => {
      movieButton.classList.add("selected");
      if (bookButton) bookButton.classList.remove("selected");
      if (arrow) arrow.innerHTML = "➡️";
    });
  }

  if (searchBtn && searchInput && exploreTitle && homePageMediaContainer) {
    searchBtn.addEventListener("click", async () => {
      const selectedToggle = getCurrentHomePageMediaType();
      const searchTerm = searchInput.value.trim();
      if (!searchTerm) return;

      exploreTitle.textContent = "Recommendations";
      const prompt = `I am looking for ${selectedToggle.toLowerCase()}s. Find me 6 ${selectedToggle.toLowerCase()}s that have a similar genre, plot, or vibe to the following search term: '${searchTerm}'. The search term itself might be a book title if I'm looking for movies, or a movie title if I'm looking for books. Respond ONLY with a valid JSON array of objects. Each object in the array MUST have exactly three properties: \"title\", \"description\", and \"mediaType\". The value for \"mediaType\" MUST be \"${selectedToggle}\". All property names MUST be enclosed in double quotes. All string values (for \"title\", \"description\", and \"mediaType\") MUST be enclosed in double quotes and properly escaped (e.g., \\\" for quotes within strings, \\\\ for backslashes, \\n for newlines). Do not include any text or explanation before or after the JSON array.`; 
      fetchAndRenderHomePageRecommendations(prompt, selectedToggle, `${selectedToggle.toLowerCase()}s`);
    });
  }

  // Initial load for home page
  const initialPrompt = "Give me a mix of 3 books and 3 movies with titles and descriptions. Respond in a JSON array of objects with 'title', 'description', and 'mediaType' fields (either 'Book' or 'Movie').";
  fetchAndRenderHomePageRecommendations(initialPrompt, 'Item', 'recommendations');
}

// --- VI. GLOBAL EVENT LISTENERS SETUP ---

function setupGlobalEventListeners() {
    const clearSavedBtn = document.getElementById('clearSavedBtn');
    if (clearSavedBtn) {
        clearSavedBtn.addEventListener('click', clearSavedItems);
    }
}

// --- VII. INITIALIZATION ---

function initializeApp() {
  loadSavedItemsFromStorage();
  setupGlobalEventListeners();
  initializeHomePageLogic(); // Sets up home page elements and initial content
  showPage('home'); // Show home page by default
}

document.addEventListener('DOMContentLoaded', initializeApp);