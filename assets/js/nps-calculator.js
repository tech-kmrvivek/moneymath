/* /assets/js/nps-calculator.js */
/* This file contains all the logic for the National Pension System (NPS) Calculator. */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const currentAgeInput = document.getElementById('currentAgeInput');
    const currentAgeSlider = document.getElementById('currentAgeSlider');
    const monthlyInvestmentInput = document.getElementById('monthlyInvestmentInput');
    const monthlyInvestmentSlider = document.getElementById('monthlyInvestmentSlider');
    const returnRateInput = document.getElementById('returnRateInput');
    const returnRateSlider = document.getElementById('returnRateSlider');
    const annuityRateInput = document.getElementById('annuityRateInput');
    const annuityRateSlider = document.getElementById('annuityRateSlider');
    const annuityReinvestmentInput = document.getElementById('annuityReinvestmentInput');
    const annuityReinvestmentSlider = document.getElementById('annuityReinvestmentSlider');
    const adjustForInflationCheckbox = document.getElementById('adjustForInflation');
    const inflationRateNPSInput = document.getElementById('inflationRateNPSInput');
    const inflationRateNPSSlider = document.getElementById('inflationRateNPSSlider');
    const inflationRateContainer = document.getElementById('inflationRateContainer');

    const totalCorpusEl = document.getElementById('totalCorpus');
    const corpusMultiplierEl = document.getElementById('corpusMultiplier');
    const monthlyPensionEl = document.getElementById('monthlyPension');
    const lumpsumAmountEl = document.getElementById('lumpsumAmount');
    const donutInvestmentPath = document.getElementById('donutInvestment');
    const donutInterestPath = document.getElementById('donutInterest');
    const totalCorpusDonutEl = document.getElementById('totalCorpusDonut');
    const returnsTableHeader = document.getElementById('returnsTableHeader');
    const returnsTableBody = document.getElementById('returnsTableBody');
    const totalContributionSummary = document.getElementById('totalContributionSummary');
    const totalInterestSummary = document.getElementById('totalInterestSummary');

    const inflationAdjustedValueBox = document.getElementById('inflationAdjustedValueBox');
    const inflationAdjustedCorpus = document.getElementById('inflationAdjustedCorpus');
    const inflationAdjustedDescription = document.getElementById('inflationAdjustedDescription');
    const inflationAdjustedMultiplier = document.getElementById('inflationAdjustedMultiplier');

    const monthlyInvestmentWords = document.getElementById('monthlyInvestmentWords');

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

    function calculateNPS(currentAge, monthlyInvestment, expectedReturnRate, annuityPurchaseRate, annuityReinvestmentPercentage) {
        const retirementAge = 60;
        const yearsToRetirement = retirementAge - currentAge;
        let finalCorpus = 0;
        let totalContribution = 0;
        let yearlyData = [];
        let currentCorpus = 0;
        let cumulativeContribution = 0;

        for (let year = 1; year <= yearsToRetirement; year++) {
            cumulativeContribution += monthlyInvestment * 12;
            currentCorpus = (currentCorpus + (monthlyInvestment * 12)) * (1 + expectedReturnRate);
            yearlyData.push({
                age: currentAge + year,
                totalContribution: cumulativeContribution,
                interestEarned: currentCorpus - cumulativeContribution,
                corpusValue: currentCorpus
            });
        }

        finalCorpus = currentCorpus;
        totalContribution = monthlyInvestment * 12 * yearsToRetirement;
        const totalInterestEarned = finalCorpus - totalContribution;
        const annuityAmount = finalCorpus * (annuityReinvestmentPercentage / 100);
        const lumpsumAmount = finalCorpus - annuityAmount;
        const monthlyPension = (annuityAmount * annuityPurchaseRate) / 12;

        return { totalCorpus: finalCorpus, totalContribution, totalInterestEarned, monthlyPension, lumpsumAmount, yearlyData };
    }

    function updateDonutChart(totalInvestment, totalInterest) {
        const total = totalInvestment + totalInterest;
        if (total === 0) {
            donutInvestmentPath.setAttribute('d', 'M18 18 L18 0 A18 18 0 0 1 18 0 Z');
            donutInterestPath.setAttribute('d', 'M18 18 L18 0 A18 18 0 0 1 18 0 Z');
            totalCorpusDonutEl.textContent = formatINR(0);
            return;
        }
        const investmentAngle = (totalInvestment / total) * 360;
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

        totalCorpusDonutEl.textContent = formatINR(total);
    }

    function updateCalculator() {
        const currentAge = parseInt(currentAgeInput.value) || 0;
        const monthlyInvestment = parseFloat(monthlyInvestmentInput.value) || 0;
        const returnRate = parseFloat(returnRateInput.value) / 100 || 0;
        const annuityRate = parseFloat(annuityRateInput.value) / 100 || 0;
        const annuityReinvestmentPercentage = parseFloat(annuityReinvestmentInput.value) || 0;
        const inflationRateNPS = parseFloat(inflationRateNPSInput.value) / 100 || 0;
        const adjustForInflation = adjustForInflationCheckbox.checked;

        inflationRateContainer.classList.toggle('hidden', !adjustForInflation);
        inflationAdjustedValueBox.classList.toggle('hidden', !adjustForInflation);

        if (monthlyInvestmentWords) {
            monthlyInvestmentWords.textContent = numberToWords(monthlyInvestment) + ' Rupees';
        }

        if (currentAge <= 0 || monthlyInvestment <= 0 || returnRate <= 0 || annuityRate <= 0 || annuityReinvestmentPercentage < 0 || currentAge >= 60) {
            [totalCorpusEl, monthlyPensionEl, lumpsumAmountEl, inflationAdjustedCorpus, totalContributionSummary, totalInterestSummary].forEach(el => el.textContent = formatINR(0));
            corpusMultiplierEl.textContent = '0x your investment';
            inflationAdjustedDescription.textContent = `Adjusted for ${inflationRateNPS * 100}% annual inflation`;
            inflationAdjustedMultiplier.textContent = `0x your investment in real terms`;
            returnsTableBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-gray-500 dark:text-gray-400">Please enter valid parameters.</td></tr>`;
            updateDonutChart(0, 0);
            return;
        }

        const nominalResults = calculateNPS(currentAge, monthlyInvestment, returnRate, annuityRate, annuityReinvestmentPercentage);
        const yearsToRetirement = 60 - currentAge;
        const realTotalCorpus = nominalResults.totalCorpus / Math.pow(1 + inflationRateNPS, yearsToRetirement);
        const realCorpusMultiplier = nominalResults.totalContribution > 0 ? (realTotalCorpus / nominalResults.totalContribution).toFixed(2) : 0;
        const realMonthlyPension = nominalResults.monthlyPension / Math.pow(1 + inflationRateNPS, yearsToRetirement);
        const realLumpsumAmount = nominalResults.lumpsumAmount / Math.pow(1 + inflationRateNPS, yearsToRetirement);

        if (adjustForInflation) {
            totalCorpusEl.textContent = formatINR(realTotalCorpus);
            corpusMultiplierEl.textContent = `${realCorpusMultiplier}x your investment in real terms`;
            monthlyPensionEl.textContent = formatINR(realMonthlyPension);
            lumpsumAmountEl.textContent = formatINR(realLumpsumAmount);
            inflationAdjustedCorpus.textContent = formatINR(realTotalCorpus);
            inflationAdjustedDescription.textContent = `Adjusted for ${inflationRateNPS * 100}% annual inflation`;
            inflationAdjustedMultiplier.textContent = `${realCorpusMultiplier}x your investment in real terms`;
        } else {
            totalCorpusEl.textContent = formatINR(nominalResults.totalCorpus);
            const nominalMultiplier = nominalResults.totalContribution > 0 ? (nominalResults.totalCorpus / nominalResults.totalContribution).toFixed(2) : 0;
            corpusMultiplierEl.textContent = `${nominalMultiplier}x your investment`;
            monthlyPensionEl.textContent = formatINR(nominalResults.monthlyPension);
            lumpsumAmountEl.textContent = formatINR(nominalResults.lumpsumAmount);
        }

        updateDonutChart(nominalResults.totalContribution, nominalResults.totalInterestEarned);
        totalContributionSummary.textContent = formatINR(nominalResults.totalContribution);
        totalInterestSummary.textContent = formatINR(nominalResults.totalInterestEarned);

        returnsTableBody.innerHTML = '';
        const displayYearlyData = adjustForInflation ? nominalResults.yearlyData.map(data => {
            const deflatedFactor = Math.pow(1 + inflationRateNPS, data.age - currentAge);
            return { ...data, totalContribution: data.totalContribution / deflatedFactor, interestEarned: (data.corpusValue / deflatedFactor) - (data.totalContribution / deflatedFactor), corpusValue: data.corpusValue / deflatedFactor };
        }) : nominalResults.yearlyData;

        returnsTableHeader.innerHTML = `
            <tr>
                <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Age</th>
                <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">${adjustForInflation ? 'Real Contribution' : 'Total Contribution'}</th>
                <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">${adjustForInflation ? 'Real Interest Earned' : 'Interest Earned'}</th>
                <th scope="col" class="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">${adjustForInflation ? 'Real Corpus Value' : 'Corpus Value'}</th>
            </tr>
        `;

        displayYearlyData.forEach(data => {
            const row = returnsTableBody.insertRow();
            row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150';
            row.innerHTML = `
                <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">${data.age}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">${formatINR(data.totalContribution)}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">${formatINR(data.interestEarned)}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">${formatINR(data.corpusValue)}</td>
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

    syncInputs(currentAgeInput, currentAgeSlider);
    syncInputs(monthlyInvestmentInput, monthlyInvestmentSlider, monthlyInvestmentWords, 'Rupees');
    syncInputs(returnRateInput, returnRateSlider);
    syncInputs(annuityRateInput, annuityRateSlider);
    syncInputs(annuityReinvestmentInput, annuityReinvestmentSlider);
    syncInputs(inflationRateNPSInput, inflationRateNPSSlider);

    adjustForInflationCheckbox.addEventListener('change', updateCalculator);

    updateCalculator();
});
