/* /assets/js/rd-calculator.js */
/* This file contains all the logic for the Recurring Deposit (RD) Calculator. */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const monthlyDepositInput = document.getElementById('monthlyDepositInput');
    const monthlyDepositSlider = document.getElementById('monthlyDepositSlider');
    const interestRateInput = document.getElementById('interestRateInput');
    const interestRateSlider = document.getElementById('interestRateSlider');
    const timePeriodInput = document.getElementById('timePeriodInput');
    const timePeriodSlider = document.getElementById('timePeriodSlider');
    const compoundingFrequencyButtons = document.getElementById('compoundingFrequencyButtons');
    const adjustForInflationCheckbox = document.getElementById('adjustForInflation');
    const inflationRateRDInput = document.getElementById('inflationRateRDInput');
    const inflationRateRDSlider = document.getElementById('inflationRateRDSlider');
    const inflationRateContainer = document.getElementById('inflationRateContainer');

    const maturityAmountEl = document.getElementById('maturityAmount');
    const investmentMultiplierEl = document.getElementById('investmentMultiplier');
    const donutPrincipalPath = document.getElementById('donutPrincipal');
    const donutInterestPath = document.getElementById('donutInterest');
    const totalMaturityDonutEl = document.getElementById('totalMaturityDonut');
    const returnsTableHeader = document.getElementById('returnsTableHeader');
    const returnsTableBody = document.getElementById('returnsTableBody');
    const totalContributionSummary = document.getElementById('totalContributionSummary');
    const interestEarnedSummary = document.getElementById('interestEarnedSummary');

    const inflationAdjustedValueBox = document.getElementById('inflationAdjustedValueBox');
    const inflationAdjustedMaturityAmount = document.getElementById('inflationAdjustedMaturityAmount');
    const inflationAdjustedDescription = document.getElementById('inflationAdjustedDescription');
    const inflationAdjustedMultiplier = document.getElementById('inflationAdjustedMultiplier');

    const monthlyDepositWords = document.getElementById('monthlyDepositWords');

    let currentCompoundingFrequency = 'quarterly'; // Default

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
    
    function calculateRD(monthlyDeposit, annualInterestRate, timePeriodYears, compoundingFrequency) {
        let yearlyData = [];
        let compoundingPeriodsPerYear;

        switch (compoundingFrequency) {
            case 'yearly': compoundingPeriodsPerYear = 1; break;
            case 'half-yearly': compoundingPeriodsPerYear = 2; break;
            case 'quarterly': compoundingPeriodsPerYear = 4; break;
            case 'monthly': compoundingPeriodsPerYear = 12; break;
            default: compoundingPeriodsPerYear = 4;
        }

        const totalMonths = timePeriodYears * 12;
        const ratePerCompoundingPeriod = annualInterestRate / compoundingPeriodsPerYear;
        
        let maturityAmount = 0;
        let totalContribution = 0;

        for (let i = 0; i < totalMonths; i++) {
            maturityAmount += monthlyDeposit;
            totalContribution += monthlyDeposit;
            // Compounding logic
            if ((i + 1) % (12 / compoundingPeriodsPerYear) === 0) {
                maturityAmount += maturityAmount * ratePerCompoundingPeriod;
            }
        }
        
        const totalInterest = maturityAmount - totalContribution;

        // For table projection (simplified yearly)
        let balance = 0;
        let cumulativeContribution = 0;
        for(let year = 1; year <= Math.floor(timePeriodYears); year++) {
            let yearlyContribution = monthlyDeposit * 12;
            cumulativeContribution += yearlyContribution;
            balance = (balance + yearlyContribution) * (1 + annualInterestRate);
            yearlyData.push({
                period: year,
                totalContribution: cumulativeContribution,
                interestEarned: balance - cumulativeContribution,
                maturityValue: balance
            });
        }


        return { maturityAmount, totalContribution, totalInterest, yearlyData };
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
        const interestAngle = 360 - principalAngle;

        function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
            const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
            return { x: centerX + (radius * Math.cos(angleInRadians)), y: centerY + (radius * Math.sin(angleInRadians)) };
        }

        const endPointPrincipal = polarToCartesian(18, 18, 18, principalAngle);
        const principalPath = `M 18 18 L 18 0 A 18 18 0 ${principalAngle > 180 ? 1 : 0} 1 ${endPointPrincipal.x} ${endPointPrincipal.y} Z`;
        donutPrincipalPath.setAttribute('d', principalPath);

        const endPointInterest = polarToCartesian(18, 18, 18, 359.99);
        const interestPath = `M 18 18 L ${endPointPrincipal.x} ${endPointPrincipal.y} A 18 18 0 ${interestAngle > 180 ? 1 : 0} 1 ${endPointInterest.x} ${endPointInterest.y} Z`;
        donutInterestPath.setAttribute('d', interestPath);

        totalMaturityDonutEl.textContent = formatINR(total);
    }

    function updateCalculator() {
      const monthlyDeposit = parseFloat(monthlyDepositInput.value) || 0;
      const interestRate = parseFloat(interestRateInput.value) / 100 || 0;
      const timePeriod = parseFloat(timePeriodInput.value) || 0;
      const inflationRateRD = parseFloat(inflationRateRDInput.value) / 100 || 0;
      const adjustForInflation = adjustForInflationCheckbox.checked;

      inflationRateContainer.classList.toggle('hidden', !adjustForInflation);
      inflationAdjustedValueBox.classList.toggle('hidden', !adjustForInflation);

      if (monthlyDepositWords) {
          monthlyDepositWords.textContent = numberToWords(monthlyDeposit) + ' Rupees';
      }

      if (monthlyDeposit <= 0 || interestRate <= 0 || timePeriod <= 0) {
          [maturityAmountEl, inflationAdjustedMaturityAmount, totalContributionSummary, interestEarnedSummary].forEach(el => el.textContent = formatINR(0));
          investmentMultiplierEl.textContent = '0x your investment';
          inflationAdjustedDescription.textContent = `Adjusted for ${inflationRateRD * 100}% annual inflation`;
          inflationAdjustedMultiplier.textContent = `0x your investment in real terms`;
          returnsTableBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-gray-500 dark:text-gray-400">Please enter valid parameters.</td></tr>`;
          updateDonutChart(0, 0);
          return;
      }

      const nominalResults = calculateRD(monthlyDeposit, interestRate, timePeriod, currentCompoundingFrequency);
      const realMaturityAmount = nominalResults.maturityAmount / Math.pow(1 + inflationRateRD, timePeriod);
      const realInvestmentMultiplier = nominalResults.totalContribution > 0 ? (realMaturityAmount / nominalResults.totalContribution).toFixed(2) : 0;

      if (adjustForInflation) {
          maturityAmountEl.textContent = formatINR(realMaturityAmount);
          investmentMultiplierEl.textContent = `${realInvestmentMultiplier}x your investment in real terms`;
          inflationAdjustedMaturityAmount.textContent = formatINR(realMaturityAmount);
          inflationAdjustedDescription.textContent = `Adjusted for ${inflationRateRD * 100}% annual inflation`;
          inflationAdjustedMultiplier.textContent = `${realInvestmentMultiplier}x your investment in real terms`;
      } else {
          maturityAmountEl.textContent = formatINR(nominalResults.maturityAmount);
          const nominalMultiplier = nominalResults.totalContribution > 0 ? (nominalResults.maturityAmount / nominalResults.totalContribution).toFixed(2) : 0;
          investmentMultiplierEl.textContent = `${nominalMultiplier}x your investment`;
      }

      updateDonutChart(nominalResults.totalContribution, nominalResults.totalInterest);
      totalContributionSummary.textContent = formatINR(nominalResults.totalContribution);
      interestEarnedSummary.textContent = formatINR(nominalResults.totalInterest);

      returnsTableBody.innerHTML = '';
      const displayYearlyData = adjustForInflation ? nominalResults.yearlyData.map(data => {
          const deflatedFactor = Math.pow(1 + inflationRateRD, data.period);
          return {
              ...data,
              totalContribution: data.totalContribution / deflatedFactor,
              interestEarned: (data.maturityValue / deflatedFactor) - (data.totalContribution / deflatedFactor),
              maturityValue: data.maturityValue / deflatedFactor
          };
      }) : nominalResults.yearlyData;

      returnsTableHeader.innerHTML = `
        <tr>
            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Period</th>
            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">${adjustForInflation ? 'Real Contribution' : 'Total Contribution'}</th>
            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">${adjustForInflation ? 'Real Interest Earned' : 'Interest Earned'}</th>
            <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">${adjustForInflation ? 'Real Maturity Value' : 'Maturity Value'}</th>
        </tr>
      `;

      displayYearlyData.forEach(data => {
          const row = returnsTableBody.insertRow();
          row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150';
          row.innerHTML = `
              <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">${data.period}</td>
              <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">${formatINR(data.totalContribution)}</td>
              <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">${formatINR(data.interestEarned)}</td>
              <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">${formatINR(data.maturityValue)}</td>
          `;
      });
    }

    function syncInputs(input, slider, wordsEl, unit) {
        const update = () => {
            if (wordsEl) wordsEl.textContent = numberToWords(parseFloat(input.value) || 0) + (unit ? ` ${unit}` : '');
            updateCalculator();
        };
        slider.addEventListener('input', () => { input.value = slider.value; update(); });
        input.addEventListener('input', () => { slider.value = input.value; update(); });
        update();
    }

    syncInputs(monthlyDepositInput, monthlyDepositSlider, monthlyDepositWords, 'Rupees');
    syncInputs(interestRateInput, interestRateSlider);
    syncInputs(timePeriodInput, timePeriodSlider);
    syncInputs(inflationRateRDInput, inflationRateRDSlider);

    compoundingFrequencyButtons.addEventListener('click', (event) => {
        const clickedButton = event.target.closest('.compounding-btn');
        if (clickedButton) {
            Array.from(compoundingFrequencyButtons.children).forEach(btn => btn.classList.remove('active'));
            clickedButton.classList.add('active');
            currentCompoundingFrequency = clickedButton.dataset.frequency;
            updateCalculator();
        }
    });

    adjustForInflationCheckbox.addEventListener('change', updateCalculator);

    updateCalculator();
});
