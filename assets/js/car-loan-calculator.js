/* /assets/js/car-loan-calculator.js */
/* This file contains all the logic for the Car Loan EMI Calculator. */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const carLoanAmountInput = document.getElementById('carLoanAmountInput');
    const carLoanAmountSlider = document.getElementById('carLoanAmountSlider');
    const downPaymentInput = document.getElementById('downPaymentInput');
    const downPaymentSlider = document.getElementById('downPaymentSlider');
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

    // DOM elements for amount words
    const carLoanAmountWords = document.getElementById('carLoanAmountWords');
    const downPaymentWords = document.getElementById('downPaymentWords');

    let currentEmploymentType = 'private'; // Default employment type

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

        if (crore > 0) {
            words.push(convertChunk(crore));
            words.push('Crore');
        }
        if (lakh > 0) {
            words.push(convertChunk(lakh));
            words.push('Lakh');
        }
        if (thousand > 0) {
            words.push(convertChunk(thousand));
            words.push('Thousand');
        }
        if (tempNum > 0) {
            words.push(convertChunk(tempNum));
        }

        return words.join(' ');
    }

    function calculateEMI(P, R_annual, N_years) {
        const R_monthly = R_annual / 12;
        const N_months = N_years * 12;

        let monthlyEMI = 0;
        if (R_monthly === 0) {
            monthlyEMI = P / N_months;
        } else {
            monthlyEMI = P * R_monthly * Math.pow(1 + R_monthly, N_months) / (Math.pow(1 + R_monthly, N_months) - 1);
        }

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

                if (principalForMonth > balance) {
                    principalForMonth = balance;
                }
                
                balance -= principalForMonth;
                interestPaidThisYear += interestForMonth;
                principalPaidThisYear += principalForMonth;
            }

            amortizationSchedule.push({
                year: year,
                principalPaid: principalPaidThisYear,
                interestPaid: interestPaidThisYear,
                balance: Math.max(0, balance)
            });
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

        const principalPath = [
            `M 18 18`,
            `L ${startPointPrincipal.x} ${startPointPrincipal.y}`,
            `A 18 18 0 ${largeArcFlagPrincipal} 1 ${endPointPrincipal.x} ${endPointPrincipal.y}`,
            `Z`
        ].join(' ');
        donutPrincipalPath.setAttribute('d', principalPath);

        const startPointInterest = polarToCartesian(18, 18, 18, principalAngle);
        const endPointInterest = polarToCartesian(18, 18, 18, principalAngle + interestAngle);
        const largeArcFlagInterest = interestAngle > 180 ? 1 : 0;

        const interestPath = [
            `M 18 18`,
            `L ${startPointInterest.x} ${startPointInterest.y}`,
            `A 18 18 0 ${largeArcFlagInterest} 1 ${endPointInterest.x} ${endPointInterest.y}`,
            `Z`
        ].join(' ');
        donutInterestPath.setAttribute('d', interestPath);

        totalPaymentDonutEl.textContent = formatINR(total);
    }

    function updateAffordabilityCheck(emiToIncomeRatioValue, employmentType) {
        let riskClass = '';
        let message = '';
        let fillWidth = 0;

        if (emiToIncomeRatioValue <= 20) {
            riskClass = 'very-safe';
            message = 'Very Safe: Your loan is highly affordable.';
            fillWidth = 20;
        } else if (emiToIncomeRatioValue <= 30) {
            riskClass = 'safe';
            message = 'Safe: Your loan is well within manageable limits.';
            fillWidth = 40;
        } else if (emiToIncomeRatioValue <= 40) {
            riskClass = 'moderate';
            message = 'Moderate: Manageable but monitor your expenses carefully.';
            fillWidth = 60;
        } else if (emiToIncomeRatioValue <= 50) {
            riskClass = 'caution';
            message = 'Caution: High EMI to income ratio. Reconsider loan amount or tenure.';
            fillWidth = 80;
        } else {
            riskClass = 'high-risk';
            message = 'High Risk: This loan might significantly strain your finances.';
            fillWidth = 100;
        }

        if (employmentType === 'government') {
            if (riskClass === 'moderate') {
                message = 'Moderate: Generally manageable, especially with stable government income. Still, monitor expenses.';
            } else if (riskClass === 'caution') {
                message = 'Caution: High EMI to income ratio. While government jobs offer stability, reconsider loan amount or tenure.';
            }
        }

        riskLevelFill.className = 'risk-level-fill';
        affordabilityMessage.className = 'affordability-message';

        riskLevelFill.classList.add(riskClass);
        affordabilityMessage.classList.add(riskClass);

        riskLevelFill.style.width = `${fillWidth}%`;
        affordabilityMessage.textContent = message;
    }

    function updateCalculator() {
      const carLoanAmount = parseFloat(carLoanAmountInput.value) || 0;
      const downPayment = parseFloat(downPaymentInput.value) || 0;
      const loanAmount = carLoanAmount - downPayment;
      const interestRate = parseFloat(interestRateInput.value) / 100 || 0;
      const loanTenure = parseFloat(loanTenureInput.value) || 0;
      const monthlyIncome = parseFloat(monthlyIncomeInput.value) || 0;
      const monthlyExpenses = parseFloat(monthlyExpensesInput.value) || 0;
      const otherEMIs = parseFloat(otherEMIsInput.value) || 0;

      if (carLoanAmountWords) {
          carLoanAmountWords.textContent = numberToWords(carLoanAmount) + ' Rupees';
      }
      if (downPaymentWords) {
          downPaymentWords.textContent = numberToWords(downPayment) + ' Rupees';
      }

      if (carLoanAmount <= 0 || interestRate <= 0 || loanTenure <= 0 || loanAmount <= 0) {
          monthlyEMIEl.textContent = formatINR(0);
          emiMultiplierEl.textContent = '0x your investment';
          monthlyEMISummary.textContent = formatINR(0);
          totalInterestSummary.textContent = formatINR(0);
          totalPaymentSummary.textContent = formatINR(0);
          principalAmountSummary.textContent = formatINR(0);
          
          updateAffordabilityCheck(0, currentEmploymentType);
          financialSummaryMonthlyIncome.textContent = formatINR(monthlyIncome);
          financialSummaryMonthlyExpenses.textContent = formatINR(monthlyExpenses);
          financialSummaryOtherEMIs.textContent = formatINR(otherEMIs);
          financialSummaryLoanEMI.textContent = formatINR(0);
          financialSummaryTotalEMIs.textContent = formatINR(otherEMIs + 0);
          emiToIncomeRatio.textContent = '0%';
          amortizationTableBody.innerHTML = `<tr><td colspan="4" class="text-center py-4 text-gray-500 dark:text-gray-400">Enter parameters to see schedule.</td></tr>`;
          updateDonutChart(0, 0);
          return;
      }

      const { monthlyEMI, totalInterest, totalPayment, amortizationSchedule } = calculateEMI(loanAmount, interestRate, loanTenure);

      monthlyEMIEl.textContent = formatINR(monthlyEMI);
      const emiMultiplier = loanAmount > 0 ? (totalPayment / loanAmount).toFixed(2) : 0;
      emiMultiplierEl.textContent = `${emiMultiplier}x your loan amount`;

      monthlyEMISummary.textContent = formatINR(monthlyEMI);
      totalInterestSummary.textContent = formatINR(totalInterest);
      totalPaymentSummary.textContent = formatINR(totalPayment);
      principalAmountSummary.textContent = formatINR(loanAmount);

      updateDonutChart(loanAmount, totalInterest);

      const totalEMIs = monthlyEMI + otherEMIs;
      let emiRatio = 0;
      if (monthlyIncome > 0) {
          emiRatio = (totalEMIs / monthlyIncome) * 100;
      }
      
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
    
    syncInputs(carLoanAmountInput, carLoanAmountSlider, carLoanAmountWords, 'Rupees');
    syncInputs(downPaymentInput, downPaymentSlider, downPaymentWords, 'Rupees');
    syncInputs(interestRateInput, interestRateSlider, null);
    syncInputs(loanTenureInput, loanTenureSlider, null);
    syncInputs(monthlyIncomeInput, monthlyIncomeSlider, null);
    syncInputs(monthlyExpensesInput, monthlyExpensesSlider, null);
    syncInputs(otherEMIsInput, otherEMIsSlider, null);

    employmentTypeToggle.addEventListener('click', (event) => {
        const clickedButton = event.target.closest('.toggle-button');
        if (clickedButton) {
            Array.from(employmentTypeToggle.children).forEach(btn => {
                btn.classList.remove('active');
            });
            clickedButton.classList.add('active');
            currentEmploymentType = clickedButton.dataset.type;
            updateCalculator();
        }
    });

    updateCalculator();
});
