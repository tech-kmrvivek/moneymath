/* /assets/js/goal-sip-calculator.js */
/* This file contains all the logic for the Goal SIP Calculator. */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const targetAmountInput = document.getElementById('targetAmountInput');
    const targetAmountSlider = document.getElementById('targetAmountSlider');
    const targetAmountWords = document.getElementById('targetAmountWords');
    const initialInvestmentInput = document.getElementById('initialInvestmentInput');
    const initialInvestmentSlider = document.getElementById('initialInvestmentSlider');
    const initialInvestmentWords = document.getElementById('initialInvestmentWords');
    const yearsInput = document.getElementById('yearsInput');
    const yearsSlider = document.getElementById('yearsSlider');
    const rateInput = document.getElementById('rateInput');
    const rateSlider = document.getElementById('rateSlider');
    const projectionTableContainer = document.getElementById('projectionTableContainer');

    // --- Output Elements ---
    const lumpsumFutureValueEl = document.getElementById('lumpsumFutureValue');
    const amountRemainingEl = document.getElementById('amountRemaining');
    const requiredSipEl = document.getElementById('requiredSip');

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

    function calculateGoalSip() {
      const targetAmount = parseFloat(targetAmountInput.value) || 0;
      const initialInvestment = parseFloat(initialInvestmentInput.value) || 0;
      const years = parseInt(yearsInput.value) || 0;
      const rate = parseFloat(rateInput.value) / 100 || 0;

      const lumpsumFv = initialInvestment * Math.pow(1 + rate, years);
      const shortfall = targetAmount - lumpsumFv;
      const monthlyRate = rate / 12;
      const n = years * 12;
      let requiredSip = 0;
      if (shortfall > 0 && n > 0 && monthlyRate > 0) {
        requiredSip = (shortfall * monthlyRate) / (Math.pow(1 + monthlyRate, n) - 1);
      }

      lumpsumFutureValueEl.textContent = formatINR(lumpsumFv);
      amountRemainingEl.textContent = formatINR(shortfall > 0 ? shortfall : 0);
      requiredSipEl.textContent = formatINR(requiredSip);
      targetAmountWords.textContent = numberToWords(targetAmount) + ' Rupees';
      initialInvestmentWords.textContent = numberToWords(initialInvestment) + ' Rupees';
      
      renderProjectionTable(initialInvestment, requiredSip, years, rate);
    }

    function renderProjectionTable(lumpsum, sip, years, rate) {
        const monthlyRate = rate / 12;
        let lumpsumBalance = lumpsum;
        let sipBalance = 0;
        const projection = [];

        for (let y = 1; y <= years; y++) {
            lumpsumBalance *= (1 + rate);
            for (let m = 1; m <= 12; m++) {
                sipBalance = (sipBalance + sip) * (1 + monthlyRate);
            }
            projection.push({
                year: y,
                totalValue: lumpsumBalance + sipBalance
            });
        }

        let tableHTML = `
            <table class="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" class="px-6 py-3">Year</th>
                        <th scope="col" class="px-6 py-3">Year End Value</th>
                    </tr>
                </thead>
                <tbody>
        `;
        projection.forEach(item => {
            tableHTML += `
                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">${item.year}</td>
                    <td class="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">${formatINR(item.totalValue)}</td>
                </tr>
            `;
        });
        tableHTML += `</tbody></table>`;
        projectionTableContainer.innerHTML = tableHTML;
    }

    function syncInputs(input, slider) {
        slider.addEventListener('input', () => {
            input.value = slider.value;
            calculateGoalSip();
        });
        input.addEventListener('input', () => {
            slider.value = input.value;
            calculateGoalSip();
        });
    }

    syncInputs(targetAmountInput, targetAmountSlider);
    syncInputs(initialInvestmentInput, initialInvestmentSlider);
    syncInputs(yearsInput, yearsSlider);
    syncInputs(rateInput, rateSlider);

    calculateGoalSip();
});
