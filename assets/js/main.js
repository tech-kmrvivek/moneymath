/* /assets/js/main.js */
/* This file contains the main script for loading partial components like nav and footer. */

/**
 * Asynchronously loads an HTML partial from a file into a specified element by its ID.
 * After loading, it finds and re-executes any scripts within the loaded content to ensure
 * they are properly initialized.
 *
 * @param {string} id The ID of the HTML element where the content will be injected.
 * @param {string} file The URL path to the HTML partial file to be loaded.
 */
async function loadPartial(id, file) {
  try {
    const response = await fetch(file);
    if (!response.ok) {
      throw new Error(`Failed to load ${file}: ${response.status} ${response.statusText}`);
    }
    const text = await response.text();
    const element = document.getElementById(id);
    if (element) {
      element.innerHTML = text;
      
      // Find all script tags in the loaded HTML and execute them
      Array.from(element.querySelectorAll("script")).forEach(oldScript => {
        const newScript = document.createElement("script");

        // Copy all attributes (like src, type, etc.) from the old script to the new one
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });

        // Copy the inline script content
        if (oldScript.innerHTML) {
          newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        }

        // Replace the old script tag with the new one. This forces the browser to execute it.
        if (oldScript.parentNode) {
            oldScript.parentNode.replaceChild(newScript, oldScript);
        }
      });
    }
  } catch (error) {
    console.error(`Error loading partial '${file}' into '#${id}':`, error);
  }
}
