class ReturnsCashFlowCalculator {
  calculate() {
    let monthlyData = d3.range(this.amortization * 12).map((i) => ({
      month: i + 1,
      year: Math.ceil((i + 1) / 12),
      isYearEnd: (i + 1) % 12 === 0,
    }));

    monthlyData.forEach((d, i) => {
      const currentMonth = d.month;
      const currentYear = d.year;

      /* —————— Total Returns Graph  —————— */
      if (this.rehabInMonths && currentMonth >= this.rehabInMonths) {
        d.sweatEquity = this.arv - this.purchasePrice;
      } else {
        d.sweatEquity = 0;
      }

      if (this.refinance === false) {
        d.propertyValueOverTime =
          (this.purchasePrice + d.sweatEquity) *
          formulajs.POWER(
            formulajs.POWER(1 + this.propertyValueGrowth, 1 / 12),
            currentMonth
          );
        d.loanBalanceOverTime =
          this.loanAmount +
          formulajs.CUMPRINC(
            this.interestRate / 12,
            this.amortization * 12,
            this.loanAmount,
            1,
            currentMonth,
            0
          );
          d.mortgagePaymentOverTime = -formulajs.PMT(
            this.interestRate / 12,
            this.amortization * 12,
            this.loanAmount
          );
          
      } else if (currentMonth < this.timeToRefinance) {
        d.propertyValueOverTime =
          this.purchasePrice *
          formulajs.POWER(
            formulajs.POWER(1 + this.propertyValueGrowth, 1 / 12),
            currentMonth
          );
        d.loanBalanceOverTime =
          this.loanAmount +
          formulajs.CUMPRINC(
            this.interestRate / 12,
            this.amortization * 12,
            this.loanAmount,
            1,
            currentMonth,
            0
          );
      } else {
        d.propertyValueOverTime =
          this.arv *
          formulajs.POWER(
            formulajs.POWER(1 + this.propertyValueGrowth, 1 / 12),
            (currentMonth - this.timeToRefinance + 1)
          );
        d.loanBalanceOverTime =
          this.refinanceLoanAmount +
          formulajs.CUMPRINC(
            this.refinanceInterestRate / 12,
            this.refinanceAmortization * 12,
            this.refinanceLoanAmount,
            1,
            currentMonth - this.timeToRefinance + 1,
            0
          );
          d.mortgagePaymentOverTime = -formulajs.PMT(
            this.refinanceInterestRate / 12,
            this.refinanceAmortization * 12,
            this.refinanceLoanAmount
          );
      }

      d.accruedEquityOverTime = d.propertyValueOverTime - d.loanBalanceOverTime;
      d.accruedEquityPercentageOverTime =
        d.accruedEquityOverTime / d.propertyValueOverTime;

      /* —————— Cashflow Graph —————— */
      d.rentalIncomeOverTime = -formulajs.FV(
        this.incomeGrowth,
        currentYear - 1,
        0,
        this.rentalIncome,
        0
      );
      d.otherIncomeOverTime = -formulajs.FV(
        this.incomeGrowth,
        currentYear - 1,
        0,
        this.otherIncome,
        0
      );
      d.totalMonthlyIncomeOverTime =
        d.rentalIncomeOverTime + d.otherIncomeOverTime;

      d.taxesOverTime =
        ((this.purchasePrice * this.propertyTaxRate) / 12) *
        formulajs.POWER(1 + this.propertyTaxGrowth, currentYear - 1);
      d.insuranceOverTime =
        this.propertyInsurance *
        formulajs.POWER(1 + this.expenseGrowth, currentYear - 1);
      if (this.pmi && d.accruedEquityPercentageOverTime < 0.2) {
        d.pmiOverTime = (this.loanAmount * this.pmi)/12;
      } else {
        d.pmiOverTime = 0;
      }
      d.utilitiesOverTime =
        this.utilities *
        formulajs.POWER(1 + this.expenseGrowth, currentYear - 1);
      d.otherExpensesOverTime =
        this.otherExpenses *
        formulajs.POWER(1 + this.expenseGrowth, currentYear - 1);
      d.propertyManagementOverTime =
        this.propertyManagementFee * d.rentalIncomeOverTime;
      d.maintenanceCapExOverTime =
        this.maintenanceCapExRate *
        d.rentalIncomeOverTime *
        formulajs.POWER(1 + this.expenseGrowth, currentYear - 1);
      
      d.vacancyOverTime = d.rentalIncomeOverTime * this.vacancyRate;
      d.totalMonthlyExpensesOverTime =
        d.mortgagePaymentOverTime +
        d.taxesOverTime +
        d.insuranceOverTime +
        d.pmiOverTime +
        d.utilitiesOverTime +
        d.otherExpensesOverTime +
        d.propertyManagementOverTime +
        d.maintenanceCapExOverTime +
        d.vacancyOverTime;

      d.rentalCashflowOverTime =
        d.rentalIncomeOverTime - d.totalMonthlyExpensesOverTime;
      d.totalCashflowOverTime =
        d.rentalCashflowOverTime + d.otherIncomeOverTime;

      d.cumulativeCashflowOverTime = d3.sum(
        monthlyData.slice(0, i + 1),
        (d) => d.totalCashflowOverTime
      );
      d.totalReturnsOverTime =
        d.accruedEquityOverTime + d.cumulativeCashflowOverTime;
    });

    /* —————— Cash in Deal —————— */
    let cashToClose = this.downPaymentAmount + this.closingCosts;

    let holdingCosts = 0;
    if (this.refinance === true) {
      holdingCosts = d3.sum(
        monthlyData.slice(0, this.timeToRefinance),
        (d) => d.totalMonthlyExpensesOverTime
      );
    }
    let cashToStabilize = holdingCosts + this.rehabCosts;

    let cashInDealAfterRefinance = null;
    if (this.refinance === true) {
      cashInDealAfterRefinance =
        this.refinanceLoanAmount -
        (this.loanAmount +
          holdingCosts +
          this.downPaymentAmount +
          this.rehabCosts);
    }
    console.log(monthlyData)
    /* —————— Yearly data for charts —————— */
    let yearlyData = monthlyData
      .filter((d) => d.isYearEnd)
      .map((d) => ({
        year: d.year,
        cumulativeTotalCashflow: Math.round(d.cumulativeCashflowOverTime),
        accruedEquity: Math.round(d.accruedEquityOverTime),
        totalReturns: Math.round(d.totalReturnsOverTime),
        rentalCashflow: Math.round(d.rentalCashflowOverTime),
        otherIncome: Math.round(d.otherIncomeOverTime),
        totalCashflow: Math.round(d.totalCashflowOverTime),
      }));
    yearlyData.cashInDealAfterRefinance =
      cashInDealAfterRefinance === null
        ? cashInDealAfterRefinance
        : Math.round(cashInDealAfterRefinance);
    yearlyData.cashToClose = -Math.round(cashToClose);
    yearlyData.cashToStabilize = -Math.round(cashToStabilize);
    return yearlyData;
  }

  setPurchasePrice(_) {
    this.purchasePrice = +_;
    return this;
  }

  setClosingCosts(_) {
    this.closingCosts = +_;
    return this;
  }

  setDownPaymentAmount(_) {
    this.downPaymentAmount = +_;
    return this;
  }

  setLoanAmount(_) {
    this.loanAmount = +_;
    return this;
  }

  setInterestRate(_) {
    this.interestRate = +_ / 100;
    return this;
  }

  setAmortization(_) {
    this.amortization = +_;
    return this;
  }

  setRehabCosts(_) {
    this.rehabCosts = +_;
    return this;
  }

  setRehabInMonths(_) {
    this.rehabInMonths = +_;
    return this;
  }

  setRentalIncome(_) {
    this.rentalIncome = +_;
    return this;
  }

  setOtherIncome(_) {
    this.otherIncome = +_;
    return this;
  }

  setPropertyTaxRate(_) {
    this.propertyTaxRate = +_ / 100;
    return this;
  }

  setPropertyInsurance(_) {
    this.propertyInsurance = +_;
    return this;
  }

  setPmi(_) {
    this.pmi = +_ / 100;
    return this;
  }

  setPropertyManagementFee(_) {
    this.propertyManagementFee = +_ / 100;
    return this;
  }

  setUtilities(_) {
    this.utilities = +_;
    return this;
  }

  setMaintenanceCapExRate(_) {
    this.maintenanceCapExRate = +_ / 100;
    return this;
  }

  setOtherExpenses(_) {
    this.otherExpenses = +_;
    return this;
  }

  setVacancyRate(_) {
    this.vacancyRate = +_ / 100;
    return this;
  }

  setRefinance(_) {
    this.refinance = _;
    return this;
  }

  setArv(_) {
    this.arv = +_;
    return this;
  }

  setRefinanceLoanAmount(_) {
    this.refinanceLoanAmount = +_;
    return this;
  }
  
  setLtv(_) {
    this.ltv = +_;
    return this;
  }

  setCashOutPotential(_) {
    this.cashOutPotential = +_;
    return this;
  }

  setRefinanceInterestRate(_) {
    this.refinanceInterestRate = +_ / 100;
    return this;
  }

  setRefinanceAmortization(_) {
    this.refinanceAmortization = +_;
    return this;
  }

  setTimeToRefinance(_) {
    this.timeToRefinance = +_;
    return this;
  }

  setIncomeGrowth(_) {
    this.incomeGrowth = +_ / 100;
    return this;
  }

  setPropertyValueGrowth(_) {
    this.propertyValueGrowth = +_ / 100;
    return this;
  }

  setExpenseGrowth(_) {
    this.expenseGrowth = +_ / 100;
    return this;
  }

  setPropertyTaxGrowth(_) {
    this.propertyTaxGrowth = +_ / 100;
    return this;
  }
}
