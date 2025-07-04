/* /assets/js/personal-finance-planner.js */
/* This file contains all the logic for the Personal Finance Planner. */

document.addEventListener('DOMContentLoaded', () => {
    // --- Constants ---
    const INFLATION_RATE = 0.07; // 7%
    const PRE_RETIREMENT_RETURN = 0.12; // 12%
    const POST_RETIREMENT_RETURN = 0.08; // 8%

    // --- DOM Elements ---
    const currentAgeInput = document.getElementById('currentAgeInput');
    const currentAgeSlider = document.getElementById('currentAgeSlider');
    const retirementAgeInput = document.getElementById('retirementAgeInput');
    const retirementAgeSlider = document.getElementById('retirementAgeSlider');
    const lifeExpectancyInput = document.getElementById('lifeExpectancyInput');
    const lifeExpectancySlider = document.getElementById('lifeExpectancySlider');
    const monthlyIncomeInput = document.getElementById('monthlyIncomeInput');
    const monthlyIncomeSlider = document.getElementById('monthlyIncomeSlider');
    const yearlyIncomeInput = document.getElementById('yearlyIncomeInput');
    const yearlyIncomeSlider = document.getElementById('yearlyIncomeSlider');
    const additionalExpensesContainer = document.getElementById('additionalExpensesContainer');
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const currentSavingsInput = document.getElementById('currentSavingsInput');
    const currentSavingsSlider = document.getElementById('currentSavingsSlider');
    const postRetirementMonthlyAmountInput = document.getElementById('postRetirementMonthlyAmountInput');
    const postRetirementMonthlyAmountSlider = document.getElementById('postRetirementMonthlyAmountSlider');
    const financialPlanTableBody = document.getElementById('financialPlanTableBody');
    const fiAgeEl = document.getElementById('fiAge');
    const fundsLastAgeEl = document.getElementById('fundsLastAge');
    const planRemarksEl = document.getElementById('planRemarks');
    
    const retirementYearsLeftDisplay = document.getElementById('retirementYearsLeft');
    const totalAnnualIncomeDisplay = document.getElementById('totalAnnualIncomeDisplay');
    const totalCurrentMonthlyExpensesDisplay = document.getElementById('totalCurrentMonthlyExpensesDisplay');
    const totalCurrentAnnualExpensesDisplay = document.getElementById('totalCurrentAnnualExpensesDisplay');
    const monthlyExcessDisplay = document.getElementById('monthlyExcessDisplay');
    const yearlyExcessDisplay = document.getElementById('yearlyExcessDisplay');
    const inflatedRetirementMonthlyIncome = document.getElementById('inflatedRetirementMonthlyIncome');

    const displayInflationRate = document.getElementById('displayInflationRate');
    const displayPreRetirementRate = document.getElementById('displayPreRetirementRate');
    const displayPostRetirementRate = document.getElementById('displayPostRetirementRate');

    const monthlyIncomeWords = document.getElementById('monthlyIncomeWords');
    const yearlyIncomeWords = document.getElementById('yearlyIncomeWords');
    const currentSavingsWords = document.getElementById('currentSavingsWords');
    const postRetirementMonthlyAmountWords = document.getElementById('postRetirementMonthlyAmountWords');

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

    function inflateAmount(amount, inflationRate, years) {
      if (years < 0) return amount;
      return amount * Math.pow(1 + inflationRate, years);
    }

    function compoundAmount(principal, annualRate) {
        return principal * (1 + annualRate);
    }

    // --- Dynamic Expense Management ---
    let expenseCounter = 0;
    function addExpenseItem() {
        expenseCounter++;
        const expenseDiv = document.createElement('div');
        expenseDiv.className = 'expense-item';
        expenseDiv.setAttribute('data-id', expenseCounter);
        expenseDiv.innerHTML = `
            <div class="expense-main-row">
                <input type="text" placeholder="e.g., Rent, Utilities" class="expense-description px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                <div class="flex items-center">
                    <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400 text-sm">₹</span>
                    <input type="number" value="0" min="0" placeholder="e.g., 15000" class="expense-amount flex-1 min-w-0 px-3 py-2 rounded-none rounded-r-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                </div>
                <button class="remove-expense-btn p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 11-2 0v6a1 1 0 112 0V8z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
            <span class="expense-amount-words text-xs italic text-gray-500 dark:text-gray-400 w-full text-right"></span>
        `;
        additionalExpensesContainer.appendChild(expenseDiv);

        const expenseAmountInput = expenseDiv.querySelector('.expense-amount');
        const expenseAmountWordsSpan = expenseDiv.querySelector('.expense-amount-words');

        expenseAmountWordsSpan.textContent = numberToWords(parseFloat(expenseAmountInput.value) || 0) + ' Rupees';

        expenseDiv.querySelector('.expense-description').addEventListener('input', calculateFinancialPlan);
        expenseAmountInput.addEventListener('input', () => {
            expenseAmountWordsSpan.textContent = numberToWords(parseFloat(expenseAmountInput.value) || 0) + ' Rupees';
            calculateFinancialPlan();
        });
        expenseDiv.querySelector('.remove-expense-btn').addEventListener('click', () => {
            expenseDiv.remove();
            calculateFinancialPlan();
        });
    }

    function getTotalDynamicExpenses() {
        let total = 0;
        document.querySelectorAll('.expense-item .expense-amount').forEach(input => {
            total += parseFloat(input.value) || 0;
        });
        return total;
    }

    function calculateFinancialPlan() {
      const currentAge = parseInt(currentAgeInput.value);
      const retirementAge = parseInt(retirementAgeInput.value);
      const lifeExpectancy = parseInt(lifeExpectancyInput.value);
      const monthlyIncome = parseFloat(monthlyIncomeInput.value) || 0;
      const yearlyIncome = parseFloat(yearlyIncomeInput.value) || 0;
      const currentSavings = parseFloat(currentSavingsInput.value) || 0;
      const postRetirementMonthlyAmount = parseFloat(postRetirementMonthlyAmountInput.value) || 0;

      const totalCurrentMonthlyExpenses = getTotalDynamicExpenses();
      const totalCurrentAnnualExpenses = totalCurrentMonthlyExpenses * 12;
      const totalAnnualIncome = (monthlyIncome * 12) + yearlyIncome;
      const desiredPostRetirementAnnualAmount = postRetirementMonthlyAmount * 12;

      const monthlyExcess = (totalAnnualIncome / 12) - totalCurrentMonthlyExpenses;
      const yearlyExcess = totalAnnualIncome - totalCurrentAnnualExpenses;

      let financialPlan = [];
      let currentSavingsBalance = currentSavings;
      let fundsDepletedAge = null;
      let fiAchievedAge = null;

      financialPlanTableBody.innerHTML = '';

      if (currentAge >= retirementAge || currentAge >= lifeExpectancy || retirementAge > lifeExpectancy) {
          planRemarksEl.textContent = "Please check your age inputs for a valid plan.";
          financialPlanTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-red-500 dark:text-red-400">Invalid age inputs.</td></tr>`;
          fiAgeEl.textContent = 'N/A';
          fundsLastAgeEl.textContent = 'N/A';
          return;
      }
      
      const yearsToRetirement = retirementAge - currentAge;
      const inflatedDesiredMonthlyIncomeAtRetirement = inflateAmount(postRetirementMonthlyAmount, INFLATION_RATE, yearsToRetirement);

      for (let age = currentAge; age <= lifeExpectancy; age++) {
        let startingSavings = currentSavingsBalance;
        let annualNetCashFlow = 0;
        let status = '';
        let effectiveReturnRate = 0;
        
        let inflatedAnnualExpenses = inflateAmount(totalCurrentAnnualExpenses, INFLATION_RATE, age - currentAge);
        let inflatedPostRetirementAnnualWithdrawal = inflateAmount(desiredPostRetirementAnnualAmount, INFLATION_RATE, age - currentAge);
        let inflatedAnnualIncome = inflateAmount(totalAnnualIncome, INFLATION_RATE, age - currentAge);

        if (age < retirementAge) {
          status = 'Earning';
          effectiveReturnRate = PRE_RETIREMENT_RETURN;
          annualNetCashFlow = inflatedAnnualIncome - inflatedAnnualExpenses;
          currentSavingsBalance = compoundAmount(startingSavings + annualNetCashFlow, effectiveReturnRate);
          if (fiAchievedAge === null && currentSavingsBalance >= inflatedAnnualExpenses * 25) {
              fiAchievedAge = age;
          }
        } else {
          status = 'Retired';
          effectiveReturnRate = POST_RETIREMENT_RETURN;
          annualNetCashFlow = -inflatedPostRetirementAnnualWithdrawal;
          currentSavingsBalance = compoundAmount(startingSavings, effectiveReturnRate) + annualNetCashFlow;
          if (fundsDepletedAge === null && currentSavingsBalance < 0) {
              fundsDepletedAge = age;
          }
        }

        financialPlan.push({ age, startingSavings, annualNetCashFlow, endingSavings: currentSavingsBalance, status });
      }

      financialPlan.forEach(yearData => {
          const row = financialPlanTableBody.insertRow();
          row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150';
          row.innerHTML = `
              <td class="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">${yearData.age}</td>
              <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">${formatINR(yearData.startingSavings)}</td>
              <td class="px-3 py-2 whitespace-nowrap text-sm ${yearData.annualNetCashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'} dark:${yearData.annualNetCashFlow >= 0 ? 'text-emerald-400' : 'text-red-400'}">${formatINR(yearData.annualNetCashFlow)}</td>
              <td class="px-3 py-2 whitespace-nowrap text-sm ${yearData.endingSavings >= 0 ? 'text-gray-700 dark:text-gray-300' : 'text-red-600 dark:text-red-400'}">${formatINR(yearData.endingSavings)}</td>
              <td class="px-3 py-2 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">${yearData.status}</td>
          `;
      });

      retirementYearsLeftDisplay.textContent = `${Math.max(0, retirementAge - currentAge)} years`;
      totalAnnualIncomeDisplay.textContent = formatINR(totalAnnualIncome);
      totalCurrentMonthlyExpensesDisplay.textContent = formatINR(totalCurrentMonthlyExpenses);
      totalCurrentAnnualExpensesDisplay.textContent = formatINR(totalCurrentAnnualExpenses);
      
      monthlyExcessDisplay.textContent = formatINR(monthlyExcess);
      monthlyExcessDisplay.classList.toggle('positive', monthlyExcess >= 0);
      monthlyExcessDisplay.classList.toggle('negative', monthlyExcess < 0);

      yearlyExcessDisplay.textContent = formatINR(yearlyExcess);
      yearlyExcessDisplay.classList.toggle('positive', yearlyExcess >= 0);
      yearlyExcessDisplay.classList.toggle('negative', yearlyExcess < 0);

      inflatedRetirementMonthlyIncome.textContent = formatINR(inflatedDesiredMonthlyIncomeAtRetirement);

      fiAgeEl.textContent = fiAchievedAge !== null ? fiAchievedAge : 'Not Achieved';
      fundsLastAgeEl.textContent = fundsDepletedAge !== null ? fundsDepletedAge : 'Beyond ' + lifeExpectancy;

      if (fundsDepletedAge !== null && fundsDepletedAge <= lifeExpectancy) {
          planRemarksEl.className = 'summary-value negative';
          planRemarksEl.textContent = `Warning: Your funds may deplete by age ${fundsDepletedAge}.`;
      } else if (fiAchievedAge !== null && fiAchievedAge < retirementAge) {
          planRemarksEl.className = 'summary-value positive';
          planRemarksEl.textContent = `Excellent! You may achieve financial independence by age ${fiAchievedAge}.`;
      } else {
          planRemarksEl.className = 'summary-value';
          planRemarksEl.textContent = `Your plan looks solid. Continue saving to maintain financial health.`;
      }
    }

    function syncInputs(inputEl, sliderEl, wordsEl, unit = '') {
        const update = () => {
            if (wordsEl) wordsEl.textContent = numberToWords(parseFloat(inputEl.value) || 0) + (unit ? ' ' + unit : '');
            calculateFinancialPlan();
        };
        sliderEl.addEventListener('input', () => { inputEl.value = sliderEl.value; update(); });
        inputEl.addEventListener('input', () => { sliderEl.value = inputEl.value; update(); });
        update();
    }

    syncInputs(currentAgeInput, currentAgeSlider);
    syncInputs(retirementAgeInput, retirementAgeSlider);
    syncInputs(lifeExpectancyInput, lifeExpectancySlider);
    syncInputs(monthlyIncomeInput, monthlyIncomeSlider, monthlyIncomeWords, 'Rupees');
    syncInputs(yearlyIncomeInput, yearlyIncomeSlider, yearlyIncomeWords, 'Rupees');
    syncInputs(currentSavingsInput, currentSavingsSlider, currentSavingsWords, 'Rupees');
    syncInputs(postRetirementMonthlyAmountInput, postRetirementMonthlyAmountSlider, postRetirementMonthlyAmountWords, 'Rupees');

    addExpenseBtn.addEventListener('click', addExpenseItem);

    addExpenseItem();
    addExpenseItem();
    
    calculateFinancialPlan();

    displayInflationRate.textContent = `${(INFLATION_RATE * 100).toFixed(0)}%`;
    displayPreRetirementRate.textContent = `${(PRE_RETIREMENT_RETURN * 100).toFixed(0)}%`;
    displayPostRetirementRate.textContent = `${(POST_RETIREMENT_RETURN * 100).toFixed(0)}%`;
});
