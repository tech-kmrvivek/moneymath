/* /assets/js/swp-calculator.js */
/* This file contains all the logic for the Systematic Withdrawal Plan (SWP) Calculator. */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const principalInput = document.getElementById('principalInput');
    const principalSlider = document.getElementById('principalSlider');
    const principalWords = document.getElementById('principalWords');
    const withdrawalInput = document.getElementById('withdrawalInput');
    const withdrawalSlider = document.getElementById('withdrawalSlider');
    const withdrawalWords = document.getElementById('withdrawalWords');
    const withdrawalPeriodInput = document.getElementById('withdrawalPeriodInput');
    const withdrawalPeriodSlider = document.getElementById('withdrawalPeriodSlider');
    const rateInput = document.getElementById('rateInput');
    const rateSlider = document.getElementById('rateSlider');
    const inflationInput = document.getElementById('inflationInput');
    const inflationSlider = document.getElementById('inflationSlider');
    const projectionTableContainer = document.getElementById('projectionTableContainer');

    // --- Output Elements ---
    const finalBalanceEl = document.getElementById('finalBalance');
    const totalWithdrawnEl = document.getElementById('totalWithdrawn');
    const totalInterestEl = document.getElementById('totalInterest');
    const swpMessageEl = document.getElementById('swpMessage');

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

    function calculateSWP() {
      const P = parseFloat(principalInput.value) || 0;
      const W = parseFloat(withdrawalInput.value) || 0;
      const withdrawalPeriod = parseInt(withdrawalPeriodInput.value) || 0;
      const r = parseFloat(rateInput.value) || 0;
      const inflation = parseFloat(inflationInput.value) || 0;

      const monthlyRate = r / 100 / 12;
      const annualInflation = inflation / 100;
      
      let balance = P;
      let totalWithdrawn = 0;
      const projection = [];
      const withdrawalPeriodInMonths = withdrawalPeriod * 12;

      let yearStartBalance = P;
      let yearlyWithdrawn = 0;

      for (let month = 1; month <= withdrawalPeriodInMonths; month++) {
        let currentWithdrawal = W * Math.pow(1 + annualInflation, Math.floor((month - 1) / 12));
        
        if (balance < currentWithdrawal) {
            currentWithdrawal = balance;
        }
        
        balance -= currentWithdrawal;
        totalWithdrawn += currentWithdrawal;
        yearlyWithdrawn += currentWithdrawal;

        balance *= (1 + monthlyRate);
        
        if (month % 12 === 0 || month === withdrawalPeriodInMonths) {
            const year = Math.ceil(month / 12);
            const interestThisYear = balance - yearStartBalance + yearlyWithdrawn;
            projection.push({ 
                year: year, 
                withdrawn: yearlyWithdrawn,
                interest: interestThisYear,
                value: balance > 0 ? balance : 0 
            });
            yearStartBalance = balance;
            yearlyWithdrawn = 0;
        }
      }

      const finalBalance = balance > 0 ? balance : 0;
      const interestEarned = totalWithdrawn + finalBalance - P;
      
      let message = `After ${withdrawalPeriod} years, your final balance will be ${formatINR(finalBalance)}.`;
      if (finalBalance <= 0) {
          let exhaustedMonth = 0;
          let tempBalance = P;
          while(tempBalance > 0 && exhaustedMonth <= withdrawalPeriodInMonths) {
              let currentWithdrawal = W * Math.pow(1 + annualInflation, Math.floor(exhaustedMonth / 12));
              if (tempBalance < currentWithdrawal) { currentWithdrawal = tempBalance; }
              tempBalance -= currentWithdrawal;
              tempBalance *= (1 + monthlyRate);
              exhaustedMonth++;
          }
          const exhaustedYears = Math.floor((exhaustedMonth - 1) / 12);
          const exhaustedMonths = (exhaustedMonth - 1) % 12;
          message = `Your corpus will be exhausted in approximately ${exhaustedYears} years and ${exhaustedMonths} months.`;
      }

      finalBalanceEl.textContent = formatINR(finalBalance);
      totalWithdrawnEl.textContent = formatINR(totalWithdrawn);
      totalInterestEl.textContent = formatINR(interestEarned);
      swpMessageEl.textContent = message;
      principalWords.textContent = numberToWords(P) + ' Rupees';
      withdrawalWords.textContent = numberToWords(W) + ' Rupees';

      renderProjectionTable(projection);
    }

    function renderProjectionTable(projection) {
        let tableHTML = `
            <table class="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" class="px-6 py-3">Year</th>
                        <th scope="col" class="px-6 py-3">Yearly Withdrawal</th>
                        <th scope="col" class="px-6 py-3">Interest Earned</th>
                        <th scope="col" class="px-6 py-3">End Balance</th>
                    </tr>
                </thead>
                <tbody>
        `;
        projection.forEach(item => {
            tableHTML += `
                <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                    <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">${item.year}</td>
                    <td class="px-6 py-4">${formatINR(item.withdrawn)}</td>
                    <td class="px-6 py-4">${formatINR(item.interest)}</td>
                    <td class="px-6 py-4 font-semibold text-emerald-600 dark:text-emerald-400">${formatINR(item.value)}</td>
                </tr>
            `;
        });
        tableHTML += `</tbody></table>`;
        projectionTableContainer.innerHTML = tableHTML;
    }

    function syncInputs(input, slider, wordsEl, unit) {
        const update = () => {
            if (wordsEl) wordsEl.textContent = numberToWords(parseFloat(input.value) || 0) + (unit ? ` ${unit}` : '');
            calculateSWP();
        };
        slider.addEventListener('input', () => { input.value = slider.value; update(); });
        input.addEventListener('input', () => { slider.value = input.value; update(); });
        update();
    }

    syncInputs(principalInput, principalSlider, principalWords, 'Rupees');
    syncInputs(withdrawalInput, withdrawalSlider, withdrawalWords, 'Rupees');
    syncInputs(withdrawalPeriodInput, withdrawalPeriodSlider);
    syncInputs(rateInput, rateSlider);
    syncInputs(inflationInput, inflationSlider);

    calculateSWP();
});
