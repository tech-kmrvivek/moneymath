/* /assets/js/fd-calculator.js */
/* This file contains all the logic for the Fixed Deposit (FD) Calculator. */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const principalAmountInput = document.getElementById('principalAmountInput');
    const principalAmountSlider = document.getElementById('principalAmountSlider');
    const interestRateInput = document.getElementById('interestRateInput');
    const interestRateSlider = document.getElementById('interestRateSlider');
    const timePeriodInput = document.getElementById('timePeriodInput');
    const timePeriodSlider = document.getElementById('timePeriodSlider');
    const compoundingFrequencyButtons = document.getElementById('compoundingFrequencyButtons');
    const adjustForInflationCheckbox = document.getElementById('adjustForInflation');
    const inflationRateFDInput = document.getElementById('inflationRateFDInput');
    const inflationRateFDSlider = document.getElementById('inflationRateFDSlider');
    const inflationRateContainer = document.getElementById('inflationRateContainer');

    const maturityAmountEl = document.getElementById('maturityAmount');
    const investmentMultiplierEl = document.getElementById('investmentMultiplier');
    const donutPrincipalPath = document.getElementById('donutPrincipal');
    const donutInterestPath = document.getElementById('donutInterest');
    const totalMaturityDonutEl = document.getElementById('totalMaturityDonut');
    const returnsTableHeader = document.getElementById('returnsTableHeader');
    const returnsTableBody = document.getElementById('returnsTableBody');

    const inflationAdjustedValueBox = document.getElementById('inflationAdjustedValueBox');
    const inflationAdjustedMaturityAmount = document.getElementById('inflationAdjustedMaturityAmount');
    const inflationAdjustedDescription = document.getElementById('inflationAdjustedDescription');
    const inflationAdjustedMultiplier = document.getElementById('inflationAdjustedMultiplier');

    const principalAmountWords = document.getElementById('principalAmountWords');

    let currentCompoundingFrequency = 'yearly'; // Default

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

    function calculateFD(principal, annualInterestRate, timePeriodYears, compoundingFrequency) {
        let yearlyData = [];
        let compoundingPeriodsPerYear;

        switch (compoundingFrequency) {
            case 'yearly': compoundingPeriodsPerYear = 1; break;
            case 'half-yearly': compoundingPeriodsPerYear = 2; break;
            case 'quarterly': compoundingPeriodsPerYear = 4; break;
            case 'monthly': compoundingPeriodsPerYear = 12; break;
            default: compoundingPeriodsPerYear = 1;
        }

        const ratePerPeriod = annualInterestRate / compoundingPeriodsPerYear;
        const totalPeriodsForFinalCalculation = timePeriodYears * compoundingPeriodsPerYear;
        let finalMaturityAmount = principal * Math.pow(1 + ratePerPeriod, totalPeriodsForFinalCalculation);
        let finalTotalInterest = finalMaturityAmount - principal;

        const numberOfFullYears = Math.floor(timePeriodYears);
        for (let year = 1; year <= numberOfFullYears; year++) {
            let balanceAtEndOfYear = principal * Math.pow(1 + ratePerPeriod, year * compoundingPeriodsPerYear);
            yearlyData.push({
                period: year,
                principal: principal,
                interestEarned: balanceAtEndOfYear - principal,
                maturityValue: balanceAtEndOfYear
            });
        }
        
        if (timePeriodYears > 0 && (yearlyData.length === 0 || yearlyData[yearlyData.length - 1].period !== timePeriodYears)) {
             yearlyData.push({
                period: timePeriodYears,
                principal: principal,
                interestEarned: finalTotalInterest,
                maturityValue: finalMaturityAmount
            });
        }

        return { maturityAmount: finalMaturityAmount, totalPrincipal: principal, totalInterest: finalTotalInterest, yearlyData };
    }

    function updateDonutChart(totalPrincipal, totalInterest) {
        const total = totalPrincipal + totalInterest;
        if (total === 0) {
            donutPrincipalPath.setAttribute('d', 'M18 18 L18 0 A18 18 0 0 1 18 0 Z');
            donutInterestPath.setAttribute('d', 'M18 18 L18 0 A18 18 0 0 1 18 0 Z');
            totalMaturityDonutEl.textContent = formatINR(0);
            return;
        }

        const principalAngle = (totalPrincipal / total) * 360;
        const interestAngle = (totalInterest / total) * 360;

        function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
            const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
            return {
                x: centerX + (radius * Math.cos(angleInRadians)),
                y: centerY + (radius * Math.sin(angleInRadians))
            };
        }

        const startPointPrincipal = polarToCartesian(18, 18, 18, 0);
        const endPointPrincipal = polarToCartesian(18, 18, 18, principalAngle);
        const largeArcFlagPrincipal = principalAngle > 180 ? 1 : 0;

        const principalPath = `M 18 18 L ${startPointPrincipal.x} ${startPointPrincipal.y} A 18 18 0 ${largeArcFlagPrincipal} 1 ${endPointPrincipal.x} ${endPointPrincipal.y} Z`;
        donutPrincipalPath.setAttribute('d', principalPath);

        const startPointInterest = polarToCartesian(18, 18, 18, principalAngle);
        const endPointInterest = polarToCartesian(18, 18, 18, principalAngle + interestAngle);
        const largeArcFlagInterest = interestAngle > 180 ? 1 : 0;

        const interestPath = `M 18 18 L ${startPointInterest.x} ${startPointInterest.y} A 18 18 0 ${largeArcFlagInterest} 1 ${endPointInterest.x} ${endPointInterest.y} Z`;
        donutInterestPath.setAttribute('d', interestPath);

        totalMaturityDonutEl.textContent = formatINR(total);
    }

    function updateCalculator() {
      const principalAmount = parseFloat(principalAmountInput.value) || 0;
      const interestRate = parseFloat(interestRateInput.value) / 100 || 0;
      const timePeriod = parseFloat(timePeriodInput.value) || 0;
      const inflationRateFD = parseFloat(inflationRateFDInput.value) / 100 || 0;
      const adjustForInflation = adjustForInflationCheckbox.checked;

      inflationRateContainer.classList.toggle('hidden', !adjustForInflation);
      inflationAdjustedValueBox.classList.toggle('hidden', !adjustForInflation);

      if (principalAmountWords) {
          principalAmountWords.textContent = numberToWords(principalAmount) + ' Rupees';
      }

      if (principalAmount <= 0 || interestRate <= 0 || timePeriod <= 0) {
          maturityAmountEl.textContent = formatINR(0);
          investmentMultiplierEl.textContent = '0x your investment';
          inflationAdjustedMaturityAmount.textContent = formatINR(0);
          inflationAdjustedDescription.textContent = `Adjusted for ${inflationRateFD * 100}% annual inflation`;
          inflationAdjustedMultiplier.textContent = `0x your investment in real terms`;
          returnsTableBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-gray-500 dark:text-gray-400">Please enter valid parameters.</td></tr>`;
          updateDonutChart(0, 0);
          return;
      }

      const nominalResults = calculateFD(principalAmount, interestRate, timePeriod, currentCompoundingFrequency);
      const realMaturityAmount = nominalResults.maturityAmount / Math.pow(1 + inflationRateFD, timePeriod);
      const realInvestmentMultiplier = nominalResults.totalPrincipal > 0 ? (realMaturityAmount / nominalResults.totalPrincipal).toFixed(2) : 0;

      if (adjustForInflation) {
          maturityAmountEl.textContent = formatINR(realMaturityAmount);
          investmentMultiplierEl.textContent = `${realInvestmentMultiplier}x your investment in real terms`;
          inflationAdjustedMaturityAmount.textContent = formatINR(realMaturityAmount);
          inflationAdjustedDescription.textContent = `Adjusted for ${inflationRateFD * 100}% annual inflation`;
          inflationAdjustedMultiplier.textContent = `${realInvestmentMultiplier}x your investment in real terms`;
      } else {
          maturityAmountEl.textContent = formatINR(nominalResults.maturityAmount);
          const nominalMultiplier = nominalResults.totalPrincipal > 0 ? (nominalResults.maturityAmount / nominalResults.totalPrincipal).toFixed(2) : 0;
          investmentMultiplierEl.textContent = `${nominalMultiplier}x your investment`;
      }

      updateDonutChart(nominalResults.totalPrincipal, nominalResults.totalInterest);

      returnsTableBody.innerHTML = '';
      const displayYearlyData = adjustForInflation ? nominalResults.yearlyData.map(data => {
          const deflatedFactor = Math.pow(1 + inflationRateFD, data.period);
          return {
              ...data,
              interestEarned: (data.maturityValue / deflatedFactor) - data.principal,
              maturityValue: data.maturityValue / deflatedFactor
          };
      }) : nominalResults.yearlyData;

      returnsTableHeader.innerHTML = `
        <tr>
            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Period</th>
            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">${adjustForInflation ? 'Real Principal (Initial)' : 'Principal'}</th>
            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">${adjustForInflation ? 'Real Interest Earned' : 'Interest Earned'}</th>
            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">${adjustForInflation ? 'Real Maturity Value' : 'Maturity Value'}</th>
        </tr>
      `;

      displayYearlyData.forEach(data => {
          const row = returnsTableBody.insertRow();
          row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150';
          row.innerHTML = `
              <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">${data.period}</td>
              <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">${formatINR(data.principal)}</td>
              <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">${formatINR(data.interestEarned)}</td>
              <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">${formatINR(data.maturityValue)}</td>
          `;
      });
    }

    function syncInputs(inputEl, sliderEl, wordsEl, unit = '') {
        const updateWords = () => {
            if (wordsEl) {
                wordsEl.textContent = numberToWords(parseFloat(inputEl.value) || 0) + (unit ? ' ' + unit : '');
            }
        };

        sliderEl.addEventListener('input', () => {
            inputEl.value = sliderEl.value;
            updateWords();
            updateCalculator();
        });
        inputEl.addEventListener('input', () => {
            sliderEl.value = inputEl.value;
            updateWords();
            updateCalculator();
        });
        updateWords();
    }
    
    syncInputs(principalAmountInput, principalAmountSlider, principalAmountWords, 'Rupees');
    syncInputs(interestRateInput, interestRateSlider, null);
    syncInputs(timePeriodInput, timePeriodSlider, null);
    syncInputs(inflationRateFDInput, inflationRateFDSlider, null);

    compoundingFrequencyButtons.addEventListener('click', (event) => {
        const clickedButton = event.target.closest('.compounding-btn');
        if (clickedButton) {
            Array.from(compoundingFrequencyButtons.children).forEach(btn => {
                btn.classList.remove('active');
            });
            clickedButton.classList.add('active');
            currentCompoundingFrequency = clickedButton.dataset.frequency;
            updateCalculator();
        }
    });

    adjustForInflationCheckbox.addEventListener('change', updateCalculator);

    updateCalculator();
});
