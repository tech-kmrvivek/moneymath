/* /assets/js/blog-nav.js */
/* This file contains the logic for the blog side navigation, including styling links and the toggle functionality. */

(() => {
  const toggleButton = document.getElementById("blog-nav-toggle");
  const arrow = document.getElementById("blog-nav-arrow");
  const linksContainer = document.getElementById("blog-links-container");
  const linksList = document.getElementById("blogLinks");

  if (!toggleButton || !linksContainer || !linksList) return;

  // Function to style the links
  const styleLinks = () => {
      const links = linksList.querySelectorAll("a.blog-link");
      const currentPath = window.location.pathname;
      const storageKey = 'rupeeswise_read_blogs';
      
      let readBlogs = [];
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) readBlogs = JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing read blogs from localStorage", e);
      }

      links.forEach(link => {
        const linkPath = link.getAttribute("href");
        const isRead = readBlogs.includes(linkPath);
        const isActive = linkPath === currentPath;

        // Reset classes
        link.className = 'blog-link group flex items-center justify-between text-sm px-3 py-2.5 rounded-lg transition-all duration-200 font-medium';
        
        let iconHTML = '';
        if (isActive) {
          link.classList.add('bg-emerald-600', 'text-white', 'font-semibold', 'shadow-lg', 'shadow-emerald-500/30');
          iconHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="opacity-100"><path d="m9 18 6-6-6-6"/></svg>`;
        } else {
          link.classList.add('text-gray-500', 'dark:text-gray-400', 'hover:bg-gray-100', 'dark:hover:bg-gray-700/50', 'hover:text-gray-900', 'dark:hover:text-white');
          if (isRead) {
            link.classList.add('text-emerald-800', 'dark:text-emerald-500');
            iconHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="text-emerald-500"><path d="M20 6 9 17l-5-5"/></svg>`;
          } else {
            iconHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400"><path d="m9 18 6-6-6-6"/></svg>`;
          }
        }
        
        const originalText = link.textContent;
        link.innerHTML = `<span class="truncate pr-2">${originalText}</span><span class="flex-shrink-0">${iconHTML}</span>`;
      });
  };

  // Toggle functionality
  toggleButton.addEventListener('click', () => {
      const isExpanded = linksContainer.style.maxHeight && linksContainer.style.maxHeight !== "0px";
      if (isExpanded) {
          linksContainer.style.maxHeight = "0px";
          arrow.classList.remove('rotate-180');
      } else {
          linksContainer.style.maxHeight = linksContainer.scrollHeight + "px";
          arrow.classList.add('rotate-180');
      }
  });

  // Initial setup
  styleLinks();
  
  // Start expanded by default on desktop and handle resize
  const setInitialHeight = () => {
      if (window.innerWidth < 640) { // sm breakpoint
          linksContainer.style.maxHeight = "0px";
          arrow.classList.remove('rotate-180');
      } else {
          linksContainer.style.maxHeight = linksContainer.scrollHeight + "px";
          arrow.classList.add('rotate-180');
      }
  };
  
  setInitialHeight();
  window.addEventListener('resize', () => {
      // Only adjust if it was previously expanded
      if (linksContainer.style.maxHeight !== "0px") {
         linksContainer.style.maxHeight = linksContainer.scrollHeight + "px";
      }
  });
})();
