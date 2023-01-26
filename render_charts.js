window.addEventListener("load", async () => {
  Wized.request.awaitAllPageLoad(async () => {
    let [
      report,
      loanAmount,
      downPaymentAmount,
      refinanceLoanAmount,
      cashOutPotential,
    ] = await Promise.all([
      Wized.data.get("r.7.d.report"),
      Wized.data.get("r.7.d.loan_amount"),
      Wized.data.get("r.7.d.down_payment_cash"),
      Wized.data.get("r.7.d.refi_loan_amount"),
      Wized.data.get("r.7.d.cash_out_potential"),
    ]);

    let {
      purchase_price: purchasePrice,
      closing_costs: closingCosts,
      interest_rate: interestRate,
      amortization,
      rehab_costs: rehabCosts,
      rehab_in_months: rehabInMonths,
      total_monthly_rent: rentalIncome,
      other_monthly_income: otherIncome,
      annual_property_taxes: propertyTaxRate,
      monthly_insurance: propertyInsurance,
      management_fees: propertyManagementFee,
      total_utilities: utilities,
      capital_expenses: maintenanceCapExRate,
      other_monthly_costs: otherExpenses,
      vacancy: vacancyRate,
      refinance,
      arv,
      refi_ltv: ltv,
      refi_interest_rate: refinanceInterestRate,
      refi_amortization: refinanceAmortization,
      months_to_refinance: timeToRefinance,
      income_growth: incomeGrowth,
      pv_growth: propertyValueGrowth,
      expense_growth: expenseGrowth,
      property_tax_growth: propertyTaxGrowth,
    } = report;

    let pmi = 1.0;

    // Initialize calculator
    const returnsCashFlowCalculator = new ReturnsCashFlowCalculator()
      .setPurchasePrice(purchasePrice)
      .setClosingCosts(closingCosts)
      .setDownPaymentAmount(downPaymentAmount)
      .setLoanAmount(loanAmount)
      .setInterestRate(interestRate)
      .setAmortization(amortization)
      .setRehabCosts(rehabCosts)
      .setRehabInMonths(rehabInMonths)
      .setRentalIncome(rentalIncome)
      .setOtherIncome(otherIncome)
      .setPropertyTaxRate(propertyTaxRate)
      .setPropertyInsurance(propertyInsurance)
      .setPmi(pmi)
      .setPropertyManagementFee(propertyManagementFee)
      .setUtilities(utilities)
      .setMaintenanceCapExRate(maintenanceCapExRate)
      .setOtherExpenses(otherExpenses)
      .setVacancyRate(vacancyRate)
      .setRefinance(refinance)
      .setArv(arv)
      .setLtv(ltv)
      .setRefinanceLoanAmount(refinanceLoanAmount)
      .setCashOutPotential(cashOutPotential)
      .setRefinanceInterestRate(refinanceInterestRate)
      .setRefinanceAmortization(refinanceAmortization)
      .setTimeToRefinance(timeToRefinance)
      .setIncomeGrowth(incomeGrowth)
      .setPropertyValueGrowth(propertyValueGrowth)
      .setExpenseGrowth(expenseGrowth)
      .setPropertyTaxGrowth(propertyTaxGrowth);

    const data = returnsCashFlowCalculator.calculate();
    console.log("data", data);

    // Keep track of selected chart type
    let selectedChartType = "returns";
    // Initialize chart
    const returnsCashFlowChart = new ReturnsCashFlowChart(
      document.querySelector("#returnsCashFlowChart")
    );
    returnsCashFlowChart.setData(data).setChartType(selectedChartType).update();
    updateMobileReturnsCashFlowChartContent();

    // Set up chart type control
    document
      .querySelectorAll("input[name='chartTypeControl']")
      .forEach((input) => {
        input.addEventListener("input", (event) => {
          selectedChartType = event.target.value;
          returnsCashFlowChart.setChartType(selectedChartType).update();
          updateMobileReturnsCashFlowChartContent();
        });
      });

    // Set up datum change listener for mobile rendering
    document
      .querySelector("#returnsCashFlowChart")
      .addEventListener("datumchange", (event) => {
        const d = event.detail;
        updateMobileReturnsCashFlowChartContent(d);
      });

    function updateMobileReturnsCashFlowChartContent(d) {
      if (!d) {
        // If no data is passed in, it's because this is triggered by chart type change, and there's no active data.
        // Assume when no active data, the default one is used
        d = returnsCashFlowChart.displayData[returnsCashFlowChart.iActive];
      }
      console.log(d);
      const formatValue = d3.format("$,");
      switch (selectedChartType) {
        case "returns":
          {
            // Returns chart code goes here
          }
          break;
        case "cashFlow":
          {
            // Cash flow chart code goes here
          }
          break;
        case "cashInDeal":
          {
            // Cash in deal chart code goes here
          }
          break;
        default:
          break;
      }

      // These are your original codes, you should put these the three code blocks according to the current selected chart type

      //  document.querySelector("#chartName").textContent = d.total.name;
      //  document.querySelector("#chartTotal").textContent = formatValue(
      //    d.total.value
      //  );

      //  document.querySelector("#chartYear").textContent = d.year;
      //  document.querySelector("#atYear").textContent = "at year";
      //  document.querySelector("#chartValue0").textContent = `${
      //    d.values[0].name
      //  }: ${formatValue(d.values[0].value)}`;
      //  document.querySelector("#chartValue1").textContent = `${
      //    d.values[1].name
      //  }: ${formatValue(d.values[1].value)}`;
      //  document.querySelector("#circle_0").textContent = "circle";
      //  document.querySelector("#circle_1").textContent = "circle";
      //  document.querySelector("#chartLTV").style.display = "none";

      
    }

    const kpiDataArray = await Wized.data.get("r.7.d.kpi_array");
    kpiDataArray.forEach((kpiData, i) => {
      new KPIGaugeChart(document.querySelector(`#kpiGaugeChart${i}`))
        .setData(kpiData.score)
        .update();
        console.log(kpiData.score);
    });

    const ratioDataArray = await Wized.data.get("r.7.d.ratio_array");
    ratioDataArray.forEach((ratioData, i) => {
      new KPIGaugeChart(document.querySelector(`#ratioGaugeChart${i}`))
        .setData(ratioData.score)
        .update();
    });
  });
});
