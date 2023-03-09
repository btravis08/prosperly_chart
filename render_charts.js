window.addEventListener("load", async () => {
  Wized.request.awaitAllPageLoad(async () => {
    let [
      report,
      cashOutPotential,
    ] = await Promise.all([
      Wized.data.get("r.7.d.report"),
      Wized.data.get("r.7.d.cash_out_potential"),
    ]);

    let {
      mortgage,
      down_payment: downPayment,
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
      repairs_maintenance: maintenanceRepairsRate,
      capital_expenses: capExRate,
      other_monthly_costs: otherExpenses,
      vacancy: vacancyRate,
      refinance,
      arv,
      refi_ltv: ltv,
      refi_interest_rate: refinanceInterestRate,
      refi_amortization: refinanceAmortization,
      gas,
      hoa,
      water_sewer: waterSewer,
      electricity,
      trash, 
      months_to_refinance: timeToRefinance,
      income_growth: incomeGrowth,
      pv_growth: propertyValueGrowth,
      expense_growth: expenseGrowth,
      property_tax_growth: propertyTaxGrowth,
    } = report;

    let utilities = gas + waterSewer + electricity + trash;
    let refinanceLoanAmount = arv*ltv/100;
    let downPaymentAmount = downPayment/100*purchasePrice;
    let loanAmount = purchasePrice - downPaymentAmount;
    let pmi = 1.0;

    // Initialize calculator
    const returnsCashFlowCalculator = new ReturnsCashFlowCalculator()
      .setPurchasePrice(purchasePrice)
      .setMortgage(mortgage)
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
      .setMaintenanceRepairsRate(maintenanceRepairsRate)
      .setCapExRate(capExRate)
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

      const [data, monthlyData, otherdata] = returnsCashFlowCalculator.calculate();
      console.log("data", data);
      console.log("monthlyData", monthlyData);
      console.log("otherdata", otherdata);

      await Promise.all([
  	Wized.data.setVariable("otherdata", otherdata),
  	Wized.data.setVariable("data", data),
	]);	

    // Keep track of selected chart type
    let selectedChartType = "returns";
    // Initialize chart
    const returnsCashFlowChart = new ReturnsCashFlowChart(
      document.querySelector("#returnsCashFlowChart")
    );
    returnsCashFlowChart.setData(data).setChartType(selectedChartType).update();
    updateMobileReturnsCashFlowChartContent();


    // Define the validation constraints
      const constraints = {
        purchasePrice: {
          numericality: {
            onlyInteger: true,
            greaterThan: 0,
          },
        }
      };
    // Setup Input Controls
    const inputPurchasePrice = document.querySelector("input[w-el='inputPurchasePrice']");
    console.log("recorded input change", inputPurchasePrice)
    // const radioButtons = document.querySelectorAll('input[type="radio"][name="downPaymentAmount"]');

    inputPurchasePrice.addEventListener("input", updateCashFlow);
    /*radioButtons.forEach(button => {
      button.addEventListener('click', updateCashFlow);
    });*/

    function updateCashFlow(event) {
      const purchasePrice = parseInt(inputPurchasePrice.value);

      // Get the down payment value from the checked radio button
      // const checkedRadioButton = document.querySelector('input[name="downPaymentAmount"]:checked');
      // const downPaymentAmount = checkedRadioButton.value / 100 * purchasePrice;
      // const loanAmount = purchasePrice - downPaymentAmount; // Re-calculate the loan amount

      // Reset the previous UI error state
      inputPurchasePrice.classList.remove("has-error");

      // Validate the input values using validate.js
      const validation = validate({ purchasePrice: purchasePrice }, constraints);

      if (validation) {
        if (validation.purchasePrice) {
          // Set the UI error state for inputPurchasePrice
          inputPurchasePrice.classList.add("has-error");
        }

      } else {
        const [data, monthlyData] = returnsCashFlowCalculator
          .setPurchasePrice(purchasePrice)
          //.setDownPaymentAmount(downPaymentAmount)
          //.setLoanAmount(loanAmount)
          .calculate();
        returnsCashFlowChart.setData(data).update();
	Wized.data.setVariable("data", data); 
        console.log("New data populated from user input", data)
      }
    }

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
            //document.querySelector("#chartName").textContent = d.total.name;
            document.querySelector("#chartTotal").textContent = formatValue(d.total.value);
            document.querySelector("#chartYear").textContent = d.year;
      document.querySelector("#atYear").textContent = "at year";
      document.querySelector("#chartValue0").textContent = `${
      d.values[0].name
      }: ${formatValue(d.values[0].value)}`;
      document.querySelector("#chartValue1").textContent = `${
      d.values[1].name
      }: ${formatValue(d.values[1].value)}`;
      document.querySelector("#circle_0").textContent = "circle";
      document.querySelector("#circle_1").textContent = "circle";
      document.querySelector("#chartLTV").style.display = "none";
          }
          break;
        case "cashFlow":
          {
            document.querySelector("#chartName").textContent = d.total.name;
            document.querySelector("#chartTotal").textContent = formatValue(d.total.value);
            document.querySelector("#chartYear").textContent = d.year;
      document.querySelector("#atYear").textContent = "at year";
      document.querySelector("#chartValue0").textContent = `${
      d.values[0].name
      }: ${formatValue(d.values[0].value)}`;
      document.querySelector("#chartValue1").textContent = `${
      d.values[1].name
      }: ${formatValue(d.values[1].value)}`;
      document.querySelector("#circle_0").textContent = "circle";
      document.querySelector("#circle_1").textContent = "circle";
      document.querySelector("#chartLTV").style.display = "none";
          }
          break;
        case "cashInDeal":
          {
            document.querySelector("#chartYear").textContent = "";
                            if (data.cashInDealAfterRefinance === null || data.cashInDealAfterRefinance < 0) {
                                document.querySelector("#chartLTV").style.display = 'none';
                                document.querySelector("#chartName").textContent = "Cash In deal";
                                document.querySelector("#atYear").textContent = "after stabilizing";
                                document.querySelector("#chartTotal").textContent = `${formatValue((data.cashToClose + data.cashToStabilize))}`;
                            } else {
                                document.querySelector("#atYear").textContent = "after refinance";
                                document.querySelector("#chartTotal").textContent = `${formatValue(data.cashInDealAfterRefinance)}`;
                                document.querySelector("#chartName").textContent = "Cash out";
                            };
                            document.querySelector("#chartLTV").style.display = 'block';
                            document.querySelector("#chartLTV").textContent = `Max cash out amount with ${(ltv)}% LTV`;
                            document.querySelector("#chartValue0").textContent = "";
                            document.querySelector("#chartValue1").textContent = "";
                            document.querySelector("#circle_0").textContent = "";
                            document.querySelector("#circle_1").textContent = "";
          }
          break;
        default:
          break;
      }

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

