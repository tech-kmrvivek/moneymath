/* /assets/js/main.js */
/* This file contains the main script for loading partial components like nav and footer. */

async function loadPartial(id, file) {
  try {
    const response = await fetch(file);
    if (!response.ok) {
      throw new Error(`Failed to load ${file}: ${response.statusText}`);
    }
    const text = await response.text();
    const element = document.getElementById(id);
    if (element) {
      element.innerHTML = text;
      // Re-execute scripts from the loaded partial if any
      Array.from(element.querySelectorAll("script")).forEach(oldScript => {
        const newScript = document.createElement("script");
        // Copy all attributes
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        // Copy inline script content
        if (oldScript.innerHTML) {
          newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        }
        // Replace the old script tag with the new one
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
    }
  } catch (error) {
    console.error(`Error loading partial: ${error}`);
  }
}
