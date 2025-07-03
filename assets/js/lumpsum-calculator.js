/* /assets/js/lumpsum-calculator.js */
/* This file contains all the logic for the Lumpsum Calculator. */

document.addEventListener('DOMContentLoaded', () => {
    // --- Chart instance ---
    let lumpPieChart;

    // --- DOM Elements ---
    const lumpAmountInput = document.getElementById('lumpAmountInput');
    const lumpAmountSlider = document.getElementById('lumpAmountSlider');
    const lumpAmountWords = document.getElementById('lumpAmountWords');
    const lumpYearsInput = document.getElementById('lumpYearsInput');
    const lumpYearsSlider = document.getElementById('lumpYearsSlider');
    const lumpRateInput = document.getElementById('lumpRateInput');
    const lumpRateSlider = document.getElementById('lumpRateSlider');
    const projectionTableContainer = document.getElementById('projectionTableContainer');

    // --- Output Elements ---
    const investedAmountEl = document.getElementById('investedAmount');
    const wealthGainedEl = document.getElementById('wealthGained');
    const maturityValueEl = document.getElementById('maturityValue');

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

    function calculateLumpsum() {
      const P = parseFloat(lumpAmountInput.value) || 0;
      const years = parseInt(lumpYearsInput.value) || 0;
      const rate = parseFloat(lumpRateInput.value) / 100 || 0;
      
      const projection = [];
      for (let y = 1; y <= years; y++) {
        const maturity = P * Math.pow(1 + rate, y);
        projection.push({
          year: y,
          interest: maturity - P,
          value: maturity
        });
      }
      
      const finalMaturity = P * Math.pow(1 + rate, years);
      const gain = finalMaturity - P;

      investedAmountEl.textContent = formatINR(P);
      wealthGainedEl.textContent = formatINR(gain);
      maturityValueEl.textContent = formatINR(finalMaturity);
      lumpAmountWords.textContent = numberToWords(P) + ' Rupees';
      
      renderProjectionTable(projection);
      renderPieChart(P, gain);
    }

    function renderProjectionTable(projection) {
        let tableHTML = `
            <table class="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" class="px-6 py-3">Year</th>
                        <th scope="col" class="px-6 py-3">Interest Gained</th>
                        <th scope="col" class="px-6 py-3">Year End Value</th>
                    </tr>
                </thead>
                <tbody>
        `;
        projection.forEach(item => {
            tableHTML += `
                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">${item.year}</td>
                    <td class="px-6 py-4">${formatINR(item.interest)}</td>
                    <td class="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">${formatINR(item.value)}</td>
                </tr>
            `;
        });
        tableHTML += `</tbody></table>`;
        projectionTableContainer.innerHTML = tableHTML;
    }

    function renderPieChart(invested, gain) {
      const pieCtx = document.getElementById('lumpPieChart').getContext('2d');
      if (lumpPieChart) lumpPieChart.destroy();
      lumpPieChart = new Chart(pieCtx, {
        type: 'doughnut',
        data: {
          labels: ['Invested Amount', 'Wealth Gained'],
          datasets: [{ 
            data: [invested, gain > 0 ? gain : 0], 
            backgroundColor: ['#3b82f6', '#10b981'],
            borderColor: ['#ffffff', '#ffffff'],
            borderWidth: 2,
          }]
        },
        options: { 
          responsive: true, 
          plugins: { 
            legend: { 
              position: 'bottom',
              labels: { color: document.body.classList.contains('dark') ? '#fff' : '#333' }
            } 
          } 
        }
      });
    }

    function syncInputs(input, slider, wordsEl, unit) {
        const update = () => {
            if (wordsEl) wordsEl.textContent = numberToWords(parseFloat(input.value) || 0) + (unit ? ` ${unit}` : '');
            calculateLumpsum();
        };
        slider.addEventListener('input', () => { input.value = slider.value; update(); });
        input.addEventListener('input', () => { slider.value = input.value; update(); });
        update();
    }

    syncInputs(lumpAmountInput, lumpAmountSlider, lumpAmountWords, 'Rupees');
    syncInputs(lumpYearsInput, lumpYearsSlider);
    syncInputs(lumpRateInput, lumpRateSlider);
    
    calculateLumpsum();
});
