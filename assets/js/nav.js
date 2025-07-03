/* /assets/js/nav.js */
/* This file contains all the logic for the navigation component, including dropdowns and mobile menu. */

// Self-invoking function to avoid polluting the global scope
(() => {
  // --- Mobile Menu Toggle ---
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // --- Desktop Dropdown Logic ---
  const setupDesktopDropdown = (dropdownId, menuId) => {
    const dropdown = document.getElementById(dropdownId);
    const menu = document.getElementById(menuId);
    if(dropdown && menu) {
      dropdown.addEventListener('mouseenter', () => {
        menu.classList.remove('hidden');
        setTimeout(() => { // Timeout to allow display property to apply before transitioning
          menu.classList.remove('opacity-0', 'scale-95');
          menu.classList.add('opacity-100', 'scale-100');
        }, 10);
      });
      dropdown.addEventListener('mouseleave', () => {
        menu.classList.remove('opacity-100', 'scale-100');
        menu.classList.add('opacity-0', 'scale-95');
        setTimeout(() => {
          menu.classList.add('hidden');
        }, 200); // Match transition duration
      });
    }
  };
  setupDesktopDropdown('investment-calculators-dropdown-desktop', 'investment-calculators-menu-desktop');
  setupDesktopDropdown('loan-calculators-dropdown-desktop', 'loan-calculators-menu-desktop');

  // --- Mobile Dropdown Logic ---
  const setupMobileDropdown = (buttonId, menuId, arrowId) => {
      const button = document.getElementById(buttonId);
      const menu = document.getElementById(menuId);
      const arrow = document.getElementById(arrowId);
      if(button && menu && arrow) {
          button.addEventListener('click', (e) => {
              e.preventDefault();
              menu.classList.toggle('hidden');
              arrow.classList.toggle('rotate-180');
          });
      }
  };
  setupMobileDropdown('investment-calculators-btn-mobile', 'investment-calculators-menu-mobile', 'investment-mobile-arrow');
  setupMobileDropdown('loan-calculators-btn-mobile', 'loan-calculators-menu-mobile', 'loan-mobile-arrow');

  // --- Active Link Highlighting ---
  const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.replace(/\/+$/, '') === currentPath) {
      link.classList.add('active');
    }
  });
})();
