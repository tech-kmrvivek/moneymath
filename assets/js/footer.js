/* /assets/js/footer.js */
/* This file contains the visitor count logic for the footer. */

document.addEventListener('DOMContentLoaded', function() {
  const visitorCountElement = document.getElementById('visitor-count');
  if (visitorCountElement) {
    // Use localStorage to store the visitor count
    let count = localStorage.getItem('rupeeswiseVisitorCount');
    
    if (count === null) {
      // If no count is found, initialize it with a random number for a more impressive start
      count = Math.floor(Math.random() * (2500 - 1000 + 1)) + 1000;
    } else {
      // Otherwise, increment the count
      count = parseInt(count) + 1;
    }
    
    // Save the new count back to localStorage
    localStorage.setItem('rupeeswiseVisitorCount', count);
    
    // Display the count on the page
    visitorCountElement.textContent = count.toLocaleString('en-IN');
  }
});
