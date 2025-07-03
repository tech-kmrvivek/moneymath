/* /assets/js/sip-calculator.js */
/* This file contains all the logic for the SIP Calculator. */

document.addEventListener('DOMContentLoaded', () => {
    // --- Chart instance ---
    let sipPieChart;

    // --- DOM Elements ---
    const sipAmountInput = document.getElementById('sipAmountInput');
    const sipAmountSlider = document.getElementById('sipAmountSlider');
    const sipAmountWords = document.getElementById('sipAmountWords');
    const sipYearsInput = document.getElementById('sipYearsInput');
    const sipYearsSlider = document.getElementById('sipYearsSlider');
    const sipRateInput = document.getElementById('sipRateInput');
    const sipRateSlider = document.getElementById('sipRateSlider');
    const stepUpCheck = document.getElementById('stepUpCheck');
    const stepUpSection = document.getElementById('stepUpSection');
    const stepUpInput = document.getElementById('stepUpInput');
    const stepUpSlider = document.getElementById('stepUpSlider');
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
                    if (n % 10 > 0) chunkWords.push(units[n % 10]);
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

    function calculateSIP() {
      const P = parseFloat(sipAmountInput.value) || 0;
      const years = parseInt(sipYearsInput.value) || 0;
      const rate = parseFloat(sipRateInput.value) || 0;
      const stepUpEnabled = stepUpCheck.checked;
      const stepUpPercent = parseFloat(stepUpInput.value) || 0;

      let totalInvested = 0;
      let maturity = 0;
      const projection = [];
      const monthlyRate = rate / 100 / 12;
      let currentMonthlyInvestment = P;

      for (let y = 1; y <= years; y++) {
        for (let m = 1; m <= 12; m++) {
          maturity = (maturity + currentMonthlyInvestment) * (1 + monthlyRate);
          totalInvested += currentMonthlyInvestment;
        }
        projection.push({ 
          year: y, 
          invested: totalInvested,
          interest: maturity - totalInvested,
          value: maturity 
        });
        if (stepUpEnabled) {
          currentMonthlyInvestment *= (1 + stepUpPercent / 100);
        }
      }
      
      const finalGain = maturity - totalInvested;

      investedAmountEl.textContent = formatINR(totalInvested);
      wealthGainedEl.textContent = formatINR(finalGain);
      maturityValueEl.textContent = formatINR(maturity);
      sipAmountWords.textContent = numberToWords(P) + ' Rupees';
      
      renderProjectionTable(projection);
      renderPieChart(totalInvested, finalGain);
    }

    function renderProjectionTable(projection) {
        let tableHTML = `
            <table class="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" class="px-6 py-3">Year</th>
                        <th scope="col" class="px-6 py-3">Invested</th>
                        <th scope="col" class="px-6 py-3">Interest</th>
                        <th scope="col" class="px-6 py-3">Year End Value</th>
                    </tr>
                </thead>
                <tbody>
        `;
        projection.forEach(item => {
            tableHTML += `
                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">${item.year}</td>
                    <td class="px-6 py-4">${formatINR(item.invested)}</td>
                    <td class="px-6 py-4">${formatINR(item.interest)}</td>
                    <td class="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">${formatINR(item.value)}</td>
                </tr>
            `;
        });
        tableHTML += `</tbody></table>`;
        projectionTableContainer.innerHTML = tableHTML;
    }

    function renderPieChart(invested, gain) {
      const pieCtx = document.getElementById('sipPieChart').getContext('2d');
      if (sipPieChart) sipPieChart.destroy();
      sipPieChart = new Chart(pieCtx, {
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
              labels: {
                  color: document.body.classList.contains('dark') ? '#fff' : '#333'
              }
            } 
          } 
        }
      });
    }

    function syncInputs(input, slider, wordsEl, unit) {
        const update = () => {
            if (wordsEl) wordsEl.textContent = numberToWords(parseFloat(input.value) || 0) + (unit ? ` ${unit}` : '');
            calculateSIP();
        };
        slider.addEventListener('input', () => { input.value = slider.value; update(); });
        input.addEventListener('input', () => { slider.value = input.value; update(); });
        update();
    }

    syncInputs(sipAmountInput, sipAmountSlider, sipAmountWords, 'Rupees');
    syncInputs(sipYearsInput, sipYearsSlider);
    syncInputs(sipRateInput, sipRateSlider);
    syncInputs(stepUpInput, stepUpSlider);

    stepUpCheck.addEventListener('change', () => {
        stepUpSection.classList.toggle('hidden', !stepUpCheck.checked);
        calculateSIP();
    });

    calculateSIP();
});
