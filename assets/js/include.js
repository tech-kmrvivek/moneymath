// This script fetches the content of nav.html and footer.html 
// and injects them into the main page.

document.addEventListener('DOMContentLoaded', () => {
    const loadComponent = (url, placeholderId) => {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${url}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(data => {
                const placeholder = document.getElementById(placeholderId);
                if (placeholder) {
                    placeholder.innerHTML = data;
                } else {
                    console.error(`Placeholder element with id '${placeholderId}' not found.`);
                }
            })
            .catch(error => console.error(`Error loading component from ${url}:`, error));
    };

    // Load the navigation bar and the footer
    loadComponent('nav.html', 'navbar-placeholder');
    loadComponent('footer.html', 'footer-placeholder');
});
