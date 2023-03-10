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
      hoa,
      utilities,
      months_to_refinance: timeToRefinance,
      income_growth: incomeGrowth,
      pv_growth: propertyValueGrowth,
      expense_growth: expenseGrowth,
      property_tax_growth: propertyTaxGrowth,
    } = report;

    let refinanceLoanAmount = arv * ltv / 100;
    let downPaymentAmount = downPayment / 100 * purchasePrice;
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
      },
      arv: {
        numericality: {
          onlyInteger: true,
          greaterThan: 0,
        },
      },
      interestRate: {
        numericality: {
          greaterThan: 0,
          lessThanOrEqualTo: 20,
          format: {
            pattern: /^\d+(\.\d{1,2})?$/,
            message:
              "must be a positive number with up to 2 decimal places and less than or equal to 20",
          },
        },
      },
      closingCosts: {
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: 0,
        }
      },
      rehabCosts: {
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: 0,
        }
      },
      rehabInMonths: {
        numericality: {
          onlyInteger: true,
          greaterThan: 0,
          lessThan: 360,
        }
      },
      timeToRefinance: {
        numericality: {
          onlyInteger: true,
          greaterThan: 0,
          lessThan: 360,
        }
      },
      ltv: {
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: 0,
          lessThan: 100,
        }
      },
      refiInterestRate: {
        numericality: {
          greaterThan: 0,
          lessThanOrEqualTo: 20,
          format: {
            pattern: /^\d+(\.\d{1,2})?$/,
            message:
              "must be a positive number with up to 2 decimal places and less than or equal to 20",
          },
        },
      },
      refiClosingCosts: {
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: 0,
        }
      },
      rentalIncome: {
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: 0,
        }
      },
      otherIncome: {
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: 0,
        }
      },
      vacancy: {
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: 0,
          lessThan: 100,
        }
      },
      repairsMaintenance: {
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: 0,
          lessThan: 100,
        }
      },
      capEx: {
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: 0,
          lessThan: 100,
        }
      },
      management: {
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: 0,
          lessThan: 100,
        }
      },
      utilities: {
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: 0,
        }
      },
      hoa: {
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: 0,
        }
      },
      propertyTaxRate: {
        numericality: {
          onlyInteger: true,
          greaterThan: 0,
          lessThan: 100,
        }
      },
      propertyInsurance: {
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: 0,
        }
      },
      otherExpenses: {
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: 0,
        }
      },
      incomeGrowth: {
        numericality: {
          onlyInteger: true,
          greaterThan: 0,
          lessThan: 100,
        }
      },
      propertyValueGrowth: {
        numericality: {
          onlyInteger: true,
          greaterThan: 0,
          lessThan: 100,
        }
      },
      expenseGrowth: {
        numericality: {
          onlyInteger: true,
          greaterThan: 0,
          lessThan: 100,
        }
      },
      propertyTaxGrowth: {
        numericality: {
          onlyInteger: true,
          greaterThanOrEqualTo: 0,
          lessThan: 100,
        }
      }
    };
    // Setup Input Controls
    const inputPurchasePrice = document.querySelector("input[w-el='inputPurchasePrice']");
    const inputArv = document.querySelector("input[w-el='inputArv']");
    const inputMortgage = document.querySelector("input[w-el='inputMortgage']");
    const inputDownPaymentAmount = document.querySelectorAll('input[type="radio"][name="downPaymentAmount"]');
    const inputAmortization = document.querySelector("select[w-el='inputAmortizationValue']");
    const inputInterestRate = document.querySelector("input[w-el='inputInterestRate']");
    const inputClosingCosts = document.querySelector("input[w-el='inputClosingCosts']");
    const inputRehabCosts = document.querySelector("input[w-el='inputRehabCosts']");
    const inputRehabInMonths = document.querySelector("input[w-el='inputRehabInMonths']");
    const inputRefinance = document.querySelector("input[w-el='inputRefinance']");
    const inputTimeToRefinance = document.querySelector("input[w-el='inputTimeToRefinance']");
    const inputLtv = document.querySelector("input[w-el='inputLtv']");
    const inputRefinanceAmortization = document.querySelector("select[w-el='inputRefiAmortizationValue']");
    const inputRefinanceInterestRate = document.querySelector("input[w-el='inputRefiInterestRate']");
    const inputRefinanceClosingCosts = document.querySelector("input[w-el='inputRefiClosingCosts']");
    const inputRentalIncome = document.querySelector("input[w-el='inputRentalIncome']");
    const inputOtherIncome = document.querySelector("input[w-el='inputOtherIncome']");
    const inputVacancy = document.querySelector("input[w-el='inputVacancy']");
    const inputRepairsMaintenance = document.querySelector("input[w-el='inputRepairsMaintenance']");
    const inputCapEx = document.querySelector("input[w-el='inputCapEx']");
    const inputManagement = document.querySelector("input[w-el='inputManagement']");
    const inputUtilities = document.querySelector("input[w-el='inputUtilities']");
    const inputHoa = document.querySelector("input[w-el='inputHoa']");
    const inputPropertyTaxRate = document.querySelector("input[w-el='inputPropertyTaxRate']");
    const inputPropertyInsurance = document.querySelector("input[w-el='inputPropertyInsurance']");
    const inputOtherExpenses = document.querySelector("input[w-el='inputOtherExpenses']");
    const inputIncomeGrowth = document.querySelector("input[w-el='inputIncomeGrowth']");
    const inputPropertyValueGrowth = document.querySelector("input[w-el='inputPropertyValueGrowth']");
    const inputExpenseGrowth = document.querySelector("input[w-el='inputExpenseGrowth']");
    const inputPropertyTaxGrowth = document.querySelector("input[w-el='inputPropertyTaxGrowth']");


    // Setup Event Listeners
    inputPurchasePrice.addEventListener("change", updateCashFlow);
    inputArv.addEventListener("change", updateCashFlow);
    inputMortgage.addEventListener("input", updateCashFlow);
    inputDownPaymentAmount.forEach(button => { button.addEventListener('click', updateCashFlow); });
    inputAmortization.addEventListener("input", updateCashFlow);
    inputInterestRate.addEventListener("change", updateCashFlow);
    inputClosingCosts.addEventListener("change", updateCashFlow);
    inputRehabCosts.addEventListener("change", updateCashFlow);
    inputRehabInMonths.addEventListener("change", updateCashFlow);
    inputRefinance.addEventListener("input", updateCashFlow);
    inputTimeToRefinance.addEventListener("change", updateCashFlow);
    inputLtv.addEventListener("change", updateCashFlow);
    inputRefinanceAmortization.addEventListener("input", updateCashFlow);
    inputRefinanceInterestRate.addEventListener("change", updateCashFlow);
    inputRefinanceClosingCosts.addEventListener("change", updateCashFlow);
    inputRentalIncome.addEventListener("change", updateCashFlow);
    inputOtherIncome.addEventListener("change", updateCashFlow);
    inputVacancy.addEventListener("change", updateCashFlow);
    inputRepairsMaintenance.addEventListener("change", updateCashFlow);
    inputCapEx.addEventListener("change", updateCashFlow);
    inputManagement.addEventListener("change", updateCashFlow);
    inputUtilities.addEventListener("change", updateCashFlow);
    inputHoa.addEventListener("change", updateCashFlow);
    inputPropertyTaxRate.addEventListener("change", updateCashFlow);
    inputPropertyInsurance.addEventListener("change", updateCashFlow);
    inputOtherExpenses.addEventListener("change", updateCashFlow);
    inputIncomeGrowth.addEventListener("change", updateCashFlow);
    inputPropertyValueGrowth.addEventListener("change", updateCashFlow);
    inputExpenseGrowth.addEventListener("change", updateCashFlow);
    inputPropertyTaxGrowth.addEventListener("change", updateCashFlow);


    function updateCashFlow(event) {
      const purchasePrice = parseInt(inputPurchasePrice.value);
      const arv = parseInt(inputArv.value);
      const mortgage = inputMortgage.checked;
      const amortization = parseInt(inputAmortization.value);
      const interestRate = parseFloat(inputInterestRate.value);
      const closingCosts = parseInt(inputClosingCosts.value);
      const rehabCosts = parseInt(inputRehabCosts.value);
      const rehabInMonths = parseInt(inputRehabInMonths.value);
      const refinance = inputRefinance.checked;
      const timeToRefinance = parseInt(inputTimeToRefinance.value);
      const ltv = parseInt(inputLtv.value);
      const refinanceAmortization = parseInt(inputRefinanceAmortization.value);
      const refinanceInterestRate = parseFloat(inputRefinanceInterestRate.value);
      const refinanceClosingCosts = parseInt(inputRefinanceClosingCosts.value);
      const rentalIncome = parseInt(inputRentalIncome.value);
      const otherIncome = parseInt(inputOtherIncome.value);
      const vacancy = parseFloat(inputVacancy.value);
      const repairsMaintenance = parseFloat(inputRepairsMaintenance.value);
      const capEx = parseFloat(inputCapEx.value);
      const management = parseFloat(inputManagement.value);
      const utilities = parseInt(inputUtilities.value);
      const hoa = parseInt(inputHoa.value);
      const propertyTaxRate = parseFloat(inputPropertyTaxRate.value);
      const propertyInsurance = parseInt(inputPropertyInsurance.value);
      const otherExpenses = parseInt(inputOtherExpenses.value);
      const incomeGrowth = parseFloat(inputIncomeGrowth.value);
      const propertyValueGrowth = parseFloat(inputPropertyValueGrowth.value);
      const expenseGrowth = parseFloat(inputExpenseGrowth.value);
      const propertyTaxGrowth = parseFloat(inputPropertyTaxGrowth.value);

      // Get the down payment value from the checked radio button
      const inputDownPaymentAmount = document.querySelector('input[name="downPaymentAmount"]:checked');
      downPaymentAmount = inputDownPaymentAmount.value / 100 * purchasePrice;
      loanAmount = purchasePrice - downPaymentAmount; // Re-calculate the loan amount

      if (inputMortgage.checked) {
        loanAmount = purchasePrice - downPaymentAmount; // Calculate the loan amount
      } else {
        loanAmount = 0; // Set loanAmount to zero if inputMortgage is checked
      }

      if (inputRefinance.checked) {
        refinanceLoanAmount = arv * ltv / 100; // Set loanAmount to zero if inputMortgage is checked
      } else {
        refinanceLoanAmount = 0; // Calculate the loan amount
      }

      // Reset the previous UI error state
      inputPurchasePrice.classList.remove("has-error");
      inputArv.classList.remove("has-error");
      inputInterestRate.classList.remove("has-error");
      inputClosingCosts.classList.remove("has-error");
      inputRehabCosts.classList.remove("has-error");
      inputRehabInMonths.classList.remove("has-error");
      inputTimeToRefinance.classList.remove("has-error");
      inputLtv.classList.remove("has-error");
      inputRefinanceInterestRate.classList.remove("has-error");
      inputRefinanceClosingCosts.classList.remove("has-error");
      inputRentalIncome.classList.remove("has-error");
      inputOtherIncome.classList.remove("has-error");
      inputVacancy.classList.remove("has-error");
      inputRepairsMaintenance.classList.remove("has-error");
      inputCapEx.classList.remove("has-error");
      inputManagement.classList.remove("has-error");
      inputUtilities.classList.remove("has-error");
      inputHoa.classList.remove("has-error");
      inputPropertyTaxRate.classList.remove("has-error");
      inputPropertyInsurance.classList.remove("has-error");
      inputOtherExpenses.classList.remove("has-error");
      inputIncomeGrowth.classList.remove("has-error");
      inputPropertyValueGrowth.classList.remove("has-error");
      inputExpenseGrowth.classList.remove("has-error");
      inputPropertyTaxGrowth.classList.remove("has-error");

      // Validate the input values using validate.js
      const validation = validate({
        purchasePrice,
        arv,
        interestRate,
        closingCosts,
        rehabCosts,
        rehabInMonths,
        timeToRefinance,
        ltv,
        refinanceInterestRate,
        refinanceClosingCosts,
        rentalIncome,
        otherIncome,
        vacancy,
        repairsMaintenance,
        capEx,
        management,
        utilities,
        hoa,
        propertyTaxRate,
        propertyInsurance,
        otherExpenses,
        incomeGrowth,
        propertyValueGrowth,
        expenseGrowth,
        propertyTaxGrowth
      }, constraints);

      if (validation) {
        if (validation.purchasePrice) {
          inputPurchasePrice.classList.add("has-error");
        }
        if (validation.arv) {
          inputArv.classList.add("has-error");
        }
        if (validation.interestRate) {
          inputInterestRate.classList.add("has-error");
        }
        if (validation.closingCosts) {
          inputClosingCosts.classList.add("has-error");
        }
        if (validation.rehabCosts) {
          inputRehabCosts.classList.add("has-error");
        }
        if (validation.rehabInMonths) {
          inputRehabInMonths.classList.add("has-error");
        }
        if (validation.timeToRefinance) {
          inputTimeToRefinance.classList.add("has-error");
        }
        if (validation.ltv) {
          inputLtv.classList.add("has-error");
        }
        if (validation.refinanceInterestRate) {
          inputRefinanceInterestRate.classList.add("has-error");
        }
        if (validation.refinanceClosingCosts) {
          inputRefinanceClosingCosts.classList.add("has-error");
        }
        if (validation.rentalIncome) {
          inputRentalIncome.classList.add("has-error");
        }
        if (validation.otherIncome) {
          inputOtherIncome.classList.add("has-error");
        }
        if (validation.vacancy) {
          inputVacancy.classList.add("has-error");
        }
        if (validation.repairsMaintenance) {
          inputRepairsMaintenance.classList.add("has-error");
        }
        if (validation.capEx) {
          inputCapEx.classList.add("has-error");
        }
        if (validation.management) {
          inputManagement.classList.add("has-error");
        }
        if (validation.utilities) {
          inputUtilities.classList.add("has-error");
        }
        if (validation.hoa) {
          inputHoa.classList.add("has-error");
        }
        if (validation.propertyTaxRate) {
          inputPropertyTaxRate.classList.add("has-error");
        }
        if (validation.propertyInsurance) {
          inputPropertyInsurance.classList.add("has-error");
        }
        if (validation.otherExpenses) {
          inputOtherExpenses.classList.add("has-error");
        }
        if (validation.incomeGrowth) {
          inputIncomeGrowth.classList.add("has-error");
        }
        if (validation.propertyValueGrowth) {
          inputPropertyValueGrowth.classList.add("has-error");
        }
        if (validation.expenseGrowth) {
          inputExpenseGrowth.classList.add("has-error");
        }
        if (validation.propertyTaxGrowth) {
          inputPropertyTaxGrowth.classList.add("has-error");
        }

      } else {
        console.log({
          mortgage,
          refinance,
          downPaymentAmount,
          amortization,
          refinanceAmortization,
          purchasePrice,
          arv,
          interestRate,
          closingCosts,
          rehabCosts,
          rehabInMonths,
          timeToRefinance,
          ltv,
          refinanceInterestRate,
          refinanceClosingCosts,
          rentalIncome,
          otherIncome,
          vacancy,
          repairsMaintenance,
          capEx,
          management,
          utilities,
          hoa,
          propertyTaxRate,
          propertyInsurance,
          otherExpenses,
          incomeGrowth,
          propertyValueGrowth,
          expenseGrowth,
          propertyTaxGrowth
        });
        const [data, monthlyData] = returnsCashFlowCalculator
          .setPurchasePrice(purchasePrice)
          .setArv(arv)
          .setMortgage(mortgage)
          .setLoanAmount(loanAmount)
          .setDownPaymentAmount(downPaymentAmount)
          .setAmortization(amortization)
          .setInterestRate(interestRate)
          .setClosingCosts(closingCosts)
          .setRehabCosts(rehabCosts)
          .setRehabInMonths(rehabInMonths)
          .setRefinance(refinance)
          .setTimeToRefinance(timeToRefinance)
          .setLtv(ltv)
          .setRefinanceAmortization(refinanceAmortization)
          .setRefinanceInterestRate(refinanceInterestRate)
          .setRentalIncome(rentalIncome)
          .setOtherIncome(otherIncome)
          .setVacancyRate(vacancy)
          .setMaintenanceRepairsRate(repairsMaintenance)
          .setCapExRate(capEx)
          .setPropertyManagementFee(management)
          .setUtilities(utilities)
          //.setHoa(hoa)
          .setPropertyTaxRate(propertyTaxRate)
          .setPropertyInsurance(propertyInsurance)
          .setOtherExpenses(otherExpenses)
          .setIncomeGrowth(incomeGrowth)
          .setPropertyValueGrowth(propertyValueGrowth)
          .setExpenseGrowth(expenseGrowth)
          .setPropertyTaxGrowth(propertyTaxGrowth)
          // Not referenced in calculator .setRefinanceClosingCosts(refinanceClosingCosts)
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
            document.querySelector("#chartValue0").textContent = `${d.values[0].name
              }: ${formatValue(d.values[0].value)}`;
            document.querySelector("#chartValue1").textContent = `${d.values[1].name
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
            document.querySelector("#chartValue0").textContent = `${d.values[0].name
            }: ${formatValue(d.values[0].value)}`;
          document.querySelector("#chartValue1").textContent = `${d.values[1].name
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
