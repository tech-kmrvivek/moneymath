/* /assets/js/ppf-calculator.js */
/* This file contains all the logic for the Public Provident Fund (PPF) Calculator. */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const yearlyInvestmentInput = document.getElementById('yearlyInvestmentInput');
    const yearlyInvestmentSlider = document.getElementById('yearlyInvestmentSlider');
    const interestRateInput = document.getElementById('interestRateInput');
    const interestRateSlider = document.getElementById('interestRateSlider');
    const timePeriodInput = document.getElementById('timePeriodInput');
    const timePeriodSlider = document.getElementById('timePeriodSlider');
    const inflationRatePPFInput = document.getElementById('inflationRatePPFInput');
    const inflationRatePPFSlider = document.getElementById('inflationRatePPFSlider');
    const inflationRateContainer = document.getElementById('inflationRateContainer');
    const adjustForInflationCheckbox = document.getElementById('adjustForInflation');

    const maturityAmountEl = document.getElementById('maturityAmount');
    const investmentMultiplierEl = document.getElementById('investmentMultiplier');
    const donutInvestmentPath = document.getElementById('donutInvestment');
    const donutInterestPath = document.getElementById('donutInterest');
    const totalInvestmentDonutEl = document.getElementById('totalInvestmentDonut');
    const returnsTableHeader = document.getElementById('returnsTableHeader');
    const returnsTableBody = document.getElementById('returnsTableBody');

    const inflationAdjustedValueBox = document.getElementById('inflationAdjustedValueBox');
    const inflationAdjustedMaturityAmount = document.getElementById('inflationAdjustedMaturityAmount');
    const inflationAdjustedDescription = document.getElementById('inflationAdjustedDescription');
    const inflationAdjustedMultiplier = document.getElementById('inflationAdjustedMultiplier');

    const yearlyInvestmentWords = document.getElementById('yearlyInvestmentWords');

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

    function calculatePPF(yearlyInvestment, interestRate, timePeriod) {
        let totalInvested = 0;
        let currentBalance = 0;
        let yearlyData = [];

        for (let year = 1; year <= timePeriod; year++) {
            totalInvested += yearlyInvestment;
            currentBalance += yearlyInvestment;
            let interestForYear = currentBalance * interestRate;
            currentBalance += interestForYear;

            yearlyData.push({
                year: year,
                invested: totalInvested,
                interest: currentBalance - totalInvested,
                balance: currentBalance
            });
        }
        const maturityAmount = currentBalance;
        const totalInterest = maturityAmount - totalInvested;
        return { maturityAmount, totalInvested, totalInterest, yearlyData };
    }

    function updateDonutChart(totalInvested, totalInterest) {
        const total = totalInvested + totalInterest;
        if (total === 0) {
            donutInvestmentPath.setAttribute('d', 'M18 18 L18 0 A18 18 0 0 1 18 0 Z');
            donutInterestPath.setAttribute('d', 'M18 18 L18 0 A18 18 0 0 1 18 0 Z');
            totalInvestmentDonutEl.textContent = formatINR(0);
            return;
        }
        const investmentAngle = (totalInvested / total) * 360;
        const interestAngle = 360 - investmentAngle;

        function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
            const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
            return { x: centerX + (radius * Math.cos(angleInRadians)), y: centerY + (radius * Math.sin(angleInRadians)) };
        }

        const endPointInvestment = polarToCartesian(18, 18, 18, investmentAngle);
        const investmentPath = `M 18 18 L 18 0 A 18 18 0 ${investmentAngle > 180 ? 1 : 0} 1 ${endPointInvestment.x} ${endPointInvestment.y} Z`;
        donutInvestmentPath.setAttribute('d', investmentPath);

        const endPointInterest = polarToCartesian(18, 18, 18, 359.99);
        const interestPath = `M 18 18 L ${endPointInvestment.x} ${endPointInvestment.y} A 18 18 0 ${interestAngle > 180 ? 1 : 0} 1 ${endPointInterest.x} ${endPointInterest.y} Z`;
        donutInterestPath.setAttribute('d', interestPath);

        totalInvestmentDonutEl.textContent = formatINR(total);
    }

    function updateCalculator() {
        const yearlyInvestment = parseFloat(yearlyInvestmentInput.value) || 0;
        const interestRate = parseFloat(interestRateInput.value) / 100 || 0;
        const timePeriod = parseInt(timePeriodInput.value) || 0;
        const inflationRatePPF = parseFloat(inflationRatePPFInput.value) / 100 || 0;
        const adjustForInflation = adjustForInflationCheckbox.checked;

        inflationRateContainer.classList.toggle('hidden', !adjustForInflation);
        inflationAdjustedValueBox.classList.toggle('hidden', !adjustForInflation);

        if (yearlyInvestmentWords) {
            yearlyInvestmentWords.textContent = numberToWords(yearlyInvestment) + ' Rupees';
        }

        if (yearlyInvestment <= 0 || interestRate <= 0 || timePeriod <= 0) {
            [maturityAmountEl, inflationAdjustedMaturityAmount].forEach(el => el.textContent = formatINR(0));
            investmentMultiplierEl.textContent = '0x your investment';
            inflationAdjustedDescription.textContent = `Adjusted for ${inflationRatePPF * 100}% annual inflation`;
            inflationAdjustedMultiplier.textContent = `0x your investment in real terms`;
            returnsTableBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-gray-500 dark:text-gray-400">Please enter valid parameters.</td></tr>`;
            updateDonutChart(0, 0);
            return;
        }

        const nominalResults = calculatePPF(yearlyInvestment, interestRate, timePeriod);
        const realMaturityAmount = nominalResults.maturityAmount / Math.pow(1 + inflationRatePPF, timePeriod);
        const realInvestmentMultiplier = nominalResults.totalInvested > 0 ? (realMaturityAmount / nominalResults.totalInvested).toFixed(2) : 0;

        if (adjustForInflation) {
            maturityAmountEl.textContent = formatINR(realMaturityAmount);
            investmentMultiplierEl.textContent = `${realInvestmentMultiplier}x your investment in real terms`;
            inflationAdjustedMaturityAmount.textContent = formatINR(realMaturityAmount);
            inflationAdjustedDescription.textContent = `Adjusted for ${inflationRatePPF * 100}% annual inflation`;
            inflationAdjustedMultiplier.textContent = `${realInvestmentMultiplier}x your investment in real terms`;
        } else {
            maturityAmountEl.textContent = formatINR(nominalResults.maturityAmount);
            const nominalMultiplier = nominalResults.totalInvested > 0 ? (nominalResults.maturityAmount / nominalResults.totalInvested).toFixed(2) : 0;
            investmentMultiplierEl.textContent = `${nominalMultiplier}x your investment`;
        }

        updateDonutChart(nominalResults.totalInvested, nominalResults.totalInterest);

        returnsTableBody.innerHTML = '';
        const displayYearlyData = adjustForInflation ? nominalResults.yearlyData.map(data => {
            const deflatedFactor = Math.pow(1 + inflationRatePPF, data.year);
            return {
                ...data,
                invested: nominalResults.yearlyData[data.year - 1].invested / deflatedFactor,
                interest: (data.balance / deflatedFactor) - (nominalResults.yearlyData[data.year - 1].invested / deflatedFactor),
                balance: data.balance / deflatedFactor
            };
        }) : nominalResults.yearlyData;

        returnsTableHeader.innerHTML = `
            <tr>
                <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Year</th>
                <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">${adjustForInflation ? 'Real Invested' : 'Invested'}</th>
                <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">${adjustForInflation ? 'Real Interest' : 'Interest'}</th>
                <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">${adjustForInflation ? 'Real Balance' : 'Balance'}</th>
            </tr>
        `;

        displayYearlyData.forEach(data => {
            const row = returnsTableBody.insertRow();
            row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150';
            row.innerHTML = `
                <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">${data.year}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">${formatINR(data.invested)}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">${formatINR(data.interest)}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">${formatINR(data.balance)}</td>
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

    syncInputs(yearlyInvestmentInput, yearlyInvestmentSlider, yearlyInvestmentWords, 'Rupees');
    syncInputs(interestRateInput, interestRateSlider);
    syncInputs(timePeriodInput, timePeriodSlider);
    syncInputs(inflationRatePPFInput, inflationRatePPFSlider);

    adjustForInflationCheckbox.addEventListener('change', updateCalculator);

    updateCalculator();
});
