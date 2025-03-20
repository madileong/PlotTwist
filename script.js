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
