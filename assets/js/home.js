/* /assets/js/home.js */
/* This file contains the logic for the 'View All' button on the home page. */

function setupViewAllButton() {
    const viewAllBtn = document.getElementById('view-all-btn');
    const extraPosts = document.querySelectorAll('.extra-post');
    const viewAllContainer = document.getElementById('view-all-container');

    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            let delay = 0;
            extraPosts.forEach(post => {
                setTimeout(() => {
                    post.classList.add('visible');
                }, delay);
                delay += 100; // Stagger the animation
            });
            if(viewAllContainer) {
                viewAllContainer.style.display = 'none';
            }
        });
    }
}

// This function will be called by the main script after the partials are loaded.
// We wrap it to ensure it's available globally but doesn't run immediately.
window.initializeHomePage = setupViewAllButton;
