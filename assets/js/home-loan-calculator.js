/* /assets/js/home-loan-calculator.js */
/* This file contains all the logic for the Home Loan EMI Calculator. */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const loanAmountInput = document.getElementById('loanAmountInput');
    const loanAmountSlider = document.getElementById('loanAmountSlider');
    const interestRateInput = document.getElementById('interestRateInput');
    const interestRateSlider = document.getElementById('interestRateSlider');
    const loanTenureInput = document.getElementById('loanTenureInput');
    const loanTenureSlider = document.getElementById('loanTenureSlider');

    const monthlyIncomeInput = document.getElementById('monthlyIncomeInput');
    const monthlyIncomeSlider = document.getElementById('monthlyIncomeSlider');
    const monthlyExpensesInput = document.getElementById('monthlyExpensesInput');
    const monthlyExpensesSlider = document.getElementById('monthlyExpensesSlider');
    const otherEMIsInput = document.getElementById('otherEMIsInput');
    const otherEMIsSlider = document.getElementById('otherEMIsSlider');
    const employmentTypeToggle = document.getElementById('employmentTypeToggle');

    const monthlyEMIEl = document.getElementById('monthlyEMI');
    const emiMultiplierEl = document.getElementById('emiMultiplier');
    const donutPrincipalPath = document.getElementById('donutPrincipal');
    const donutInterestPath = document.getElementById('donutInterest');
    const totalPaymentDonutEl = document.getElementById('totalPaymentDonut');

    const monthlyEMISummary = document.getElementById('monthlyEMISummary');
    const totalInterestSummary = document.getElementById('totalInterestSummary');
    const totalPaymentSummary = document.getElementById('totalPaymentSummary');
    const principalAmountSummary = document.getElementById('principalAmountSummary');

    const riskLevelFill = document.getElementById('riskLevelFill');
    const affordabilityMessage = document.getElementById('affordabilityMessage');
    const financialSummaryMonthlyIncome = document.getElementById('financialSummaryMonthlyIncome');
    const financialSummaryMonthlyExpenses = document.getElementById('financialSummaryMonthlyExpenses');
    const financialSummaryOtherEMIs = document.getElementById('financialSummaryOtherEMIs');
    const financialSummaryLoanEMI = document.getElementById('financialSummaryLoanEMI');
    const financialSummaryTotalEMIs = document.getElementById('financialSummaryTotalEMIs');
    const emiToIncomeRatio = document.getElementById('emiToIncomeRatio');

    const amortizationTableBody = document.getElementById('amortizationTableBody');
    const loanAmountWords = document.getElementById('loanAmountWords');

    let currentEmploymentType = 'private';

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

    function calculateEMI(P, R_annual, N_years) {
        const R_monthly = R_annual / 12;
        const N_months = N_years * 12;
        let monthlyEMI = R_monthly === 0 ? P / N_months : (P * R_monthly * Math.pow(1 + R_monthly, N_months)) / (Math.pow(1 + R_monthly, N_months) - 1);
        const totalPayment = monthlyEMI * N_months;
        const totalInterest = totalPayment - P;
        let amortizationSchedule = [];
        let balance = P;

        for (let year = 1; year <= N_years; year++) {
            let interestPaidThisYear = 0;
            let principalPaidThisYear = 0;
            for (let month = 1; month <= 12; month++) {
                if (balance <= 0) break;
                const interestForMonth = balance * R_monthly;
                let principalForMonth = monthlyEMI - interestForMonth;
                if (principalForMonth > balance) principalForMonth = balance;
                balance -= principalForMonth;
                interestPaidThisYear += interestForMonth;
                principalPaidThisYear += principalForMonth;
            }
            amortizationSchedule.push({ year, principalPaid: principalPaidThisYear, interestPaid: interestPaidThisYear, balance: Math.max(0, balance) });
            if (balance <= 0) break;
        }
        return { monthlyEMI, totalInterest, totalPayment, amortizationSchedule };
    }

    function updateDonutChart(principal, totalInterest) {
        const total = principal + totalInterest;
        if (total === 0) {
            donutPrincipalPath.setAttribute('d', 'M18 18 L18 0 A18 18 0 0 1 18 0 Z');
            donutInterestPath.setAttribute('d', 'M18 18 L18 0 A18 18 0 0 1 18 0 Z');
            totalPaymentDonutEl.textContent = formatINR(0);
            return;
        }
        const principalAngle = (principal / total) * 360;
        const interestAngle = 360 - principalAngle;

        function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
            const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
            return { x: centerX + (radius * Math.cos(angleInRadians)), y: centerY + (radius * Math.sin(angleInRadians)) };
        }

        const endPointPrincipal = polarToCartesian(18, 18, 18, principalAngle);
        const principalPath = `M 18 18 L 18 0 A 18 18 0 ${principalAngle > 180 ? 1 : 0} 1 ${endPointPrincipal.x} ${endPointPrincipal.y} Z`;
        donutPrincipalPath.setAttribute('d', principalPath);

        const endPointInterest = polarToCartesian(18, 18, 18, 359.99); // Close to full circle
        const interestPath = `M 18 18 L ${endPointPrincipal.x} ${endPointPrincipal.y} A 18 18 0 ${interestAngle > 180 ? 1 : 0} 1 ${endPointInterest.x} ${endPointInterest.y} Z`;
        donutInterestPath.setAttribute('d', interestPath);

        totalPaymentDonutEl.textContent = formatINR(total);
    }

    function updateAffordabilityCheck(emiToIncomeRatioValue, employmentType) {
        let riskClass = '', message = '', fillWidth = 0;
        if (emiToIncomeRatioValue <= 20) { riskClass = 'very-safe'; message = 'Very Safe: Your loan is highly affordable.'; fillWidth = 20; }
        else if (emiToIncomeRatioValue <= 30) { riskClass = 'safe'; message = 'Safe: Your loan is well within manageable limits.'; fillWidth = 40; }
        else if (emiToIncomeRatioValue <= 40) { riskClass = 'moderate'; message = 'Moderate: Manageable but monitor your expenses carefully.'; fillWidth = 60; }
        else if (emiToIncomeRatioValue <= 50) { riskClass = 'caution'; message = 'Caution: High EMI to income ratio. Reconsider loan amount or tenure.'; fillWidth = 80; }
        else { riskClass = 'high-risk'; message = 'High Risk: This loan might significantly strain your finances.'; fillWidth = 100; }

        if (employmentType === 'government') {
            if (riskClass === 'moderate') message = 'Moderate: Generally manageable with stable government income. Still, monitor expenses.';
            else if (riskClass === 'caution') message = 'Caution: High EMI to income ratio. Even with job stability, reconsider loan terms.';
        }

        riskLevelFill.className = 'risk-level-fill ' + riskClass;
        affordabilityMessage.className = 'affordability-message ' + riskClass;
        riskLevelFill.style.width = `${fillWidth}%`;
        affordabilityMessage.textContent = message;
    }

    function updateCalculator() {
        const loanAmount = parseFloat(loanAmountInput.value) || 0;
        const interestRate = parseFloat(interestRateInput.value) / 100 || 0;
        const loanTenure = parseFloat(loanTenureInput.value) || 0;
        const monthlyIncome = parseFloat(monthlyIncomeInput.value) || 0;
        const monthlyExpenses = parseFloat(monthlyExpensesInput.value) || 0;
        const otherEMIs = parseFloat(otherEMIsInput.value) || 0;

        if (loanAmountWords) loanAmountWords.textContent = numberToWords(loanAmount) + ' Rupees';

        if (loanAmount <= 0 || interestRate <= 0 || loanTenure <= 0) {
            // Reset UI to zero
            [monthlyEMIEl, monthlyEMISummary, totalInterestSummary, totalPaymentSummary, principalAmountSummary].forEach(el => el.textContent = formatINR(0));
            emiMultiplierEl.textContent = '0x your investment';
            updateAffordabilityCheck(0, currentEmploymentType);
            financialSummaryMonthlyIncome.textContent = formatINR(monthlyIncome);
            financialSummaryMonthlyExpenses.textContent = formatINR(monthlyExpenses);
            financialSummaryOtherEMIs.textContent = formatINR(otherEMIs);
            financialSummaryLoanEMI.textContent = formatINR(0);
            financialSummaryTotalEMIs.textContent = formatINR(otherEMIs);
            emiToIncomeRatio.textContent = '0%';
            amortizationTableBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-gray-500 dark:text-gray-400">Enter parameters to see schedule.</td></tr>`;
            updateDonutChart(0, 0);
            return;
        }

        const { monthlyEMI, totalInterest, totalPayment, amortizationSchedule } = calculateEMI(loanAmount, interestRate, loanTenure);
        
        monthlyEMIEl.textContent = formatINR(monthlyEMI);
        emiMultiplierEl.textContent = `${(totalPayment / loanAmount).toFixed(2)}x your loan`;
        monthlyEMISummary.textContent = formatINR(monthlyEMI);
        totalInterestSummary.textContent = formatINR(totalInterest);
        totalPaymentSummary.textContent = formatINR(totalPayment);
        principalAmountSummary.textContent = formatINR(loanAmount);

        updateDonutChart(loanAmount, totalInterest);

        const totalEMIs = monthlyEMI + otherEMIs;
        const emiRatio = monthlyIncome > 0 ? (totalEMIs / monthlyIncome) * 100 : 0;
        
        financialSummaryMonthlyIncome.textContent = formatINR(monthlyIncome);
        financialSummaryMonthlyExpenses.textContent = formatINR(monthlyExpenses);
        financialSummaryOtherEMIs.textContent = formatINR(otherEMIs);
        financialSummaryLoanEMI.textContent = formatINR(monthlyEMI);
        financialSummaryTotalEMIs.textContent = formatINR(totalEMIs);
        emiToIncomeRatio.textContent = `${emiRatio.toFixed(2)}%`;

        updateAffordabilityCheck(emiRatio, currentEmploymentType);

        amortizationTableBody.innerHTML = '';
        amortizationSchedule.forEach(data => {
            const row = amortizationTableBody.insertRow();
            row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150';
            row.innerHTML = `
                <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">${data.year}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">${formatINR(data.principalPaid)}</td>
                <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">${formatINR(data.interestPaid)}</td>
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

    syncInputs(loanAmountInput, loanAmountSlider, loanAmountWords, 'Rupees');
    syncInputs(interestRateInput, interestRateSlider);
    syncInputs(loanTenureInput, loanTenureSlider);
    syncInputs(monthlyIncomeInput, monthlyIncomeSlider);
    syncInputs(monthlyExpensesInput, monthlyExpensesSlider);
    syncInputs(otherEMIsInput, otherEMIsSlider);

    employmentTypeToggle.addEventListener('click', (event) => {
        const clickedButton = event.target.closest('.toggle-button');
        if (clickedButton) {
            Array.from(employmentTypeToggle.children).forEach(btn => btn.classList.remove('active'));
            clickedButton.classList.add('active');
            currentEmploymentType = clickedButton.dataset.type;
            updateCalculator();
        }
    });

    updateCalculator();
});
