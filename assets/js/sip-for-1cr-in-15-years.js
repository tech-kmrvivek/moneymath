/* /assets/js/sip-for-1cr-in-15-years.js */
/* This file contains the logic for the interactive SIP calculator on the blog post page. */

function calculateRequiredSIP() {
  const targetCorpusEl = document.getElementById("targetCorpus");
  const yearsEl = document.getElementById("years");
  const rateEl = document.getElementById("rate");
  const resultEl = document.getElementById("sipResult");

  if (!targetCorpusEl || !yearsEl || !rateEl || !resultEl) {
    console.error("One or more calculator elements are missing from the DOM.");
    return;
  }

  const FV = parseFloat(targetCorpusEl.value) || 0;
  const n = parseFloat(yearsEl.value) * 12 || 0;
  const r = (parseFloat(rateEl.value) / 100) / 12 || 0;

  resultEl.classList.remove('text-red-500');

  if (FV <= 0 || n <= 0 || r <= 0) {
    resultEl.textContent = "Please enter valid, positive values.";
    resultEl.classList.add('text-red-500');
    return;
  }

  const sip = FV * r / (Math.pow(1 + r, n) - 1);
  const roundedSip = `₹ ${Math.round(sip).toLocaleString('en-IN')}`;
  resultEl.innerHTML = `Required Monthly SIP: <strong class="text-2xl">${roundedSip}</strong>`;
}

// Attach event listeners to all calculator inputs to recalculate on change.
document.addEventListener('DOMContentLoaded', () => {
    const calculatorInputs = ['targetCorpus', 'years', 'rate'];
    calculatorInputs.forEach(id => {
        const inputElement = document.getElementById(id);
        if (inputElement) {
            inputElement.addEventListener('input', calculateRequiredSIP);
        }
    });

    // Also attach the calculate function to the button for explicit clicks.
    const calcButton = document.querySelector('button[onclick="calculateSIP()"]'); // A bit fragile, better to use ID
    if(calcButton) {
        // It's better to replace the onclick attribute with a modern event listener.
        calcButton.removeAttribute('onclick');
        calcButton.addEventListener('click', calculateRequiredSIP);
    }

    // Run the calculation once on load with default values.
    calculateRequiredSIP();
});
