/* /assets/js/blog-post.js */
/* This file contains logic specific to individual blog post pages, like marking them as read. */

/**
 * Marks the current page as 'read' in the browser's localStorage.
 * This allows the blog navigation to visually indicate which articles have been viewed.
 */
function markAsRead() {
  const storageKey = 'rupeeswise_read_blogs';
  const currentPath = window.location.pathname;

  if (!currentPath || currentPath.length < 2) return; // Ignore empty or root paths

  try {
    // Get existing read blogs from localStorage
    const stored = localStorage.getItem(storageKey);
    let readBlogs = stored ? JSON.parse(stored) : [];

    // Ensure it's an array
    if (!Array.isArray(readBlogs)) {
        readBlogs = [];
    }

    // Add the current blog to the list if it's not already there
    if (!readBlogs.includes(currentPath)) {
      readBlogs.push(currentPath);
      localStorage.setItem(storageKey, JSON.stringify(readBlogs));
    }
  } catch (e) {
    console.error("Error accessing localStorage for read blogs:", e);
  }
}

// Run the function as soon as the script is loaded on a blog page.
markAsRead();
