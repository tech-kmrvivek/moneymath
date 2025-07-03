/* /assets/js/inflation-calculator.js */
/* This file contains all the logic for the Inflation Calculator. */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const costInput = document.getElementById('costInput');
    const costSlider = document.getElementById('costSlider');
    const costWords = document.getElementById('costWords');
    const yearsInput = document.getElementById('yearsInput');
    const yearsSlider = document.getElementById('yearsSlider');
    const inflationRateInput = document.getElementById('inflationRateInput');
    const inflationRateSlider = document.getElementById('inflationRateSlider');
    const projectionTableContainer = document.getElementById('projectionTableContainer');
    const resultSummaryEl = document.getElementById('resultSummary');

    // --- Utility Functions ---
    function formatINR(num) {
      if (isNaN(num)) return '₹0';
      const absNum = Math.abs(num);
      let formatted;
      if (absNum >= 10000000) {
        formatted = (absNum / 10000000).toFixed(2) + ' Cr';
      } else if (absNum >= 100000) {
        formatted = (absNum / 100000).toFixed(2) + ' L';
      } else {
        formatted = absNum.toLocaleString('en-IN', { maximumFractionDigits: 0 });
      }
      return (num < 0 ? '-₹' : '₹') + formatted;
    }

    function numberToWords(num) {
        if (num === 0) return 'Zero';
        if (num < 0) return 'Minus ' + numberToWords(Math.abs(num));

        const [integerPart] = num.toString().split('.');
        const words = [];
        const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        function convertChunk(n) {
            let chunkWords = [];
            if (n >= 100) {
                chunkWords.push(units[Math.floor(n / 100)]);
                chunkWords.push('Hundred');
                n %= 100;
            }
            if (n > 0) {
                if (n < 20) {
                    chunkWords.push(units[n]);
                } else {
                    chunkWords.push(tens[Math.floor(n / 10)]);
                    if (n % 10 > 0) {
                        chunkWords.push(units[n % 10]);
                    }
                }
            }
            return chunkWords.join(' ');
        }

        let tempNum = parseInt(integerPart);
        let crore = Math.floor(tempNum / 10000000);
        tempNum %= 10000000;
        let lakh = Math.floor(tempNum / 100000);
        tempNum %= 100000;
        let thousand = Math.floor(tempNum / 1000);
        tempNum %= 1000;

        if (crore > 0) words.push(convertChunk(crore) + ' Crore');
        if (lakh > 0) words.push(convertChunk(lakh) + ' Lakh');
        if (thousand > 0) words.push(convertChunk(thousand) + ' Thousand');
        if (tempNum > 0) words.push(convertChunk(tempNum));

        return words.join(' ');
    }

    function calculateInflation() {
      const presentCost = parseFloat(costInput.value) || 0;
      const years = parseInt(yearsInput.value) || 0;
      const inflationRate = parseFloat(inflationRateInput.value) / 100 || 0;
      
      const futureCost = presentCost * Math.pow(1 + inflationRate, years);

      const projection = [];
      for (let y = 1; y <= years; y++) {
        const yearEndCost = presentCost * Math.pow(1 + inflationRate, y);
        projection.push({
          year: y,
          value: yearEndCost
        });
      }

      costWords.textContent = numberToWords(presentCost) + ' Rupees';
      
      resultSummaryEl.innerHTML = `
        <p class="text-lg">An item costing <strong class="text-blue-600 dark:text-blue-400">${formatINR(presentCost)}</strong> today</p>
        <p class="text-lg">will cost approximately</p>
        <p class="text-4xl font-bold text-emerald-600 dark:text-emerald-400 my-2">${formatINR(futureCost)}</p>
        <p class="text-lg">in <strong class="text-yellow-600 dark:text-yellow-400">${years}</strong> years.</p>
      `;
      
      renderProjectionTable(projection);
    }

    function renderProjectionTable(projection) {
        let tableHTML = `
            <table class="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" class="px-6 py-3">Year</th>
                        <th scope="col" class="px-6 py-3">Future Cost</th>
                    </tr>
                </thead>
                <tbody>
        `;
        projection.forEach(item => {
            tableHTML += `
                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">${item.year}</td>
                    <td class="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">${formatINR(item.value)}</td>
                </tr>
            `;
        });
        tableHTML += `</tbody></table>`;
        projectionTableContainer.innerHTML = tableHTML;
    }

    function syncInputs(input, slider) {
        slider.addEventListener('input', () => {
            input.value = slider.value;
            calculateInflation();
        });
        input.addEventListener('input', () => {
            slider.value = input.value;
            calculateInflation();
        });
    }

    syncInputs(costInput, costSlider);
    syncInputs(yearsInput, yearsSlider);
    syncInputs(inflationRateInput, inflationRateSlider);

    calculateInflation();
});
