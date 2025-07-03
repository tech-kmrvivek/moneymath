/* /assets/js/fire-calculator.js */
/* This file contains all the logic for the FIRE Calculator. */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const currentAgeInput = document.getElementById('currentAgeInput');
    const currentAgeSlider = document.getElementById('currentAgeSlider');
    const retirementAgeInput = document.getElementById('retirementAgeInput');
    const retirementAgeSlider = document.getElementById('retirementAgeSlider');
    const coastAgeInput = document.getElementById('coastAgeInput');
    const coastAgeSlider = document.getElementById('coastAgeSlider');
    const monthlyExpenseInput = document.getElementById('monthlyExpenseInput');
    const monthlyExpenseSlider = document.getElementById('monthlyExpenseSlider');
    const monthlyExpenseWords = document.getElementById('monthlyExpenseWords');
    const preRetirementRateInput = document.getElementById('preRetirementRateInput');
    const preRetirementRateSlider = document.getElementById('preRetirementRateSlider');
    const postRetirementRateInput = document.getElementById('postRetirementRateInput');
    const postRetirementRateSlider = document.getElementById('postRetirementRateSlider');
    const inflationRateInput = document.getElementById('inflationRateInput');
    const inflationRateSlider = document.getElementById('inflationRateSlider');

    // --- Output Elements ---
    const fireNumberEl = document.getElementById('fireNumber');
    const fireSipEl = document.getElementById('fireSip');
    const coastFireNumberEl = document.getElementById('coastFireNumber');
    const coastSipEl = document.getElementById('coastSip');
    const planDetailsEl = document.getElementById('planDetails');

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

    function calculateFIRE() {
      const currentAge = parseInt(currentAgeInput.value);
      const retirementAge = parseInt(retirementAgeInput.value);
      const coastAge = parseInt(coastAgeInput.value);
      const monthlyExpense = parseFloat(monthlyExpenseInput.value);
      const preRate = parseFloat(preRetirementRateInput.value) / 100;
      const postRate = parseFloat(postRetirementRateInput.value) / 100;
      const inflation = parseFloat(inflationRateInput.value) / 100;

      const yearsToRetire = retirementAge - currentAge;
      const inflatedAnnualExpense = (monthlyExpense * 12) * Math.pow(1 + inflation, yearsToRetire);
      
      const fireCorpus = inflatedAnnualExpense * 25;

      const monthlyPreRate = preRate / 12;
      const n_fire = yearsToRetire * 12;
      const fireSip = n_fire > 0 ? (fireCorpus * monthlyPreRate) / (Math.pow(1 + monthlyPreRate, n_fire) - 1) : 0;
      const fireTotalInvested = fireSip * n_fire;
      
      const yearsToCoast = coastAge - currentAge;
      const coastingPeriod = retirementAge - coastAge;
      const coastCorpusTarget = coastingPeriod > 0 ? fireCorpus / Math.pow(1 + preRate, coastingPeriod) : fireCorpus;

      const n_coast = yearsToCoast * 12;
      const coastSip = n_coast > 0 ? (coastCorpusTarget * monthlyPreRate) / (Math.pow(1 + monthlyPreRate, n_coast) - 1) : 0;
      const coastTotalInvested = coastSip * n_coast;

      fireNumberEl.textContent = formatINR(fireCorpus);
      fireSipEl.textContent = formatINR(fireSip);
      coastFireNumberEl.textContent = formatINR(coastCorpusTarget);
      coastSipEl.textContent = formatINR(coastSip);
      monthlyExpenseWords.textContent = numberToWords(monthlyExpense) + ' Rupees';
      
      planDetailsEl.innerHTML = `
        <div class="space-y-2">
            <h4 class="font-semibold text-md text-emerald-700 dark:text-emerald-400">Standard FIRE Plan</h4>
            <div class="text-sm grid grid-cols-2 gap-2 border-t border-gray-200 dark:border-gray-700 pt-2">
                <span class="text-gray-600 dark:text-gray-400">Retirement Expenses (Annual):</span>
                <span class="font-medium text-right">${formatINR(inflatedAnnualExpense)}</span>
                <span class="text-gray-600 dark:text-gray-400">Years to Invest:</span>
                <span class="font-medium text-right">${yearsToRetire} Years</span>
                <span class="text-gray-600 dark:text-gray-400">Total Amount Invested:</span>
                <span class="font-medium text-right">${formatINR(fireTotalInvested)}</span>
            </div>
        </div>
        <div class="space-y-2">
            <h4 class="font-semibold text-md text-yellow-600 dark:text-yellow-400">Coast FIRE Plan</h4>
            <div class="text-sm grid grid-cols-2 gap-2 border-t border-gray-200 dark:border-gray-700 pt-2">
                <span class="text-gray-600 dark:text-gray-400">Target Coast Age:</span>
                <span class="font-medium text-right">${coastAge}</span>
                <span class="text-gray-600 dark:text-gray-400">Years to Invest:</span>
                <span class="font-medium text-right">${yearsToCoast} Years</span>
                <span class="text-gray-600 dark:text-gray-400">Total Amount Invested:</span>
                <span class="font-medium text-right">${formatINR(coastTotalInvested)}</span>
                <span class="text-gray-600 dark:text-gray-400">Coasting Period:</span>
                <span class="font-medium text-right">${coastingPeriod} Years</span>
            </div>
        </div>
      `;
    }

    function syncInputs(input, slider) {
        slider.addEventListener('input', () => {
            input.value = slider.value;
            calculateFIRE();
        });
        input.addEventListener('input', () => {
            slider.value = input.value;
            calculateFIRE();
        });
    }

    syncInputs(currentAgeInput, currentAgeSlider);
    syncInputs(retirementAgeInput, retirementAgeSlider);
    syncInputs(coastAgeInput, coastAgeSlider);
    syncInputs(monthlyExpenseInput, monthlyExpenseSlider);
    syncInputs(preRetirementRateInput, preRetirementRateSlider);
    syncInputs(postRetirementRateInput, postRetirementRateSlider);
    syncInputs(inflationRateInput, inflationRateSlider);

    calculateFIRE(); // Initial calculation
});
