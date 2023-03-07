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

    const [data, monthlyData] = returnsCashFlowCalculator.calculate();
      console.log("data", data);
      console.log("monthlyData", monthlyData);

    	


    // Keep track of selected chart type
    let selectedChartType = "returns";
    // Initialize chart
    const returnsCashFlowChart = new ReturnsCashFlowChart(
      document.querySelector("#returnsCashFlowChart")
    );
    returnsCashFlowChart.setData(data).setChartType(selectedChartType).update();
    updateMobileReturnsCashFlowChartContent();

    // Listen for form input changes and re-render chart
    Wized.data.listen("i.input_mortgage", async () => {    
      const mortgage = await Wized.data.get("i.input_mortgage");   
      console.log("Value of i.input_mortgage changed to: ", mortgage);
      const [data, monthlyData] = returnsCashFlowCalculator
      .setMortgage(mortgage)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });

    Wized.data.listen("i.input_purchase_price", async () => {    
      const purchasePrice = await Wized.data.get("i.input_purchase_price");   
      console.log("Value of i.input_purchase_price changed to: ", purchasePrice);
      const [data, monthlyData] = returnsCashFlowCalculator
      .setPurchasePrice(purchasePrice)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });

    Wized.data.listen("i.input_arv", async () => {    
  	const arv = await Wized.data.get("i.input_arv");   
  	console.log("Value of i.input_arv changed to: ", arv);
  	const [data, monthlyData] = returnsCashFlowCalculator
    	.setArv(arv)
    	.calculate();
	returnsCashFlowChart.setData(data).update();
	Wized.data.setVariable("data", data);   
    });
    
    Wized.data.listen("i.input_amortization_value", async () => {    
      const amortization = await Wized.data.get("i.input_amortization_value");   
      console.log("Value of i.input_amortization_value changed to: ", amortization);
      const [data, monthlyData] = returnsCashFlowCalculator
      .setAmortization(amortization)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });

    Wized.data.listen("i.input_interest_rate", async () => {    
      const interestRate = await Wized.data.get("i.input_interest_rate");   
      console.log("Value of i.input_amortization changed to: ", interestRate);
      const [data, monthlyData] = returnsCashFlowCalculator
      .setInterestRate(interestRate)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });
	  
    Wized.data.listen("i.input_closing_costs", async () => {    
      const closingCosts = await Wized.data.get("i.input_closing_costs");   
      console.log("Value of i.input_closing_costs changed to: ", closingCosts);
      const [data, monthlyData] = returnsCashFlowCalculator
      .setClosingCosts(closingCosts)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });
	  
    Wized.data.listen("i.input_rehab_costs", async () => {    
      const rehabCosts = await Wized.data.get("i.input_rehab_costs");   
      console.log("Value of i.input_rehab_costs changed to: ", rehabCosts);
      const [data, monthlyData] = returnsCashFlowCalculator
      .setRehabCosts(rehabCosts)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });

    Wized.data.listen("i.input_rehab_in_months", async () => {    
      const rehabInMonths = await Wized.data.get("i.input_rehab_in_months");   
      console.log("Value of i.input_rehab_in_months changed to: ", rehabInMonths);
      const [data, monthlyData] = returnsCashFlowCalculator
      .setRehabInMonths(rehabInMonths)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });
      
    Wized.data.listen("i.input_down_payment_30", async () => {
      const downPaymentAmount = await Wized.data.get("i.input_down_payment_30") / 100 * purchasePrice;
      const loanAmount = purchasePrice - downPaymentAmount;
      console.log("Down Payment Amount:", downPaymentAmount);
      console.log("Loan Amount:", loanAmount);        
      const [data, monthlyData] = returnsCashFlowCalculator
      .setDownPaymentAmount(downPaymentAmount)
      .setLoanAmount(loanAmount)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });

    Wized.data.listen("i.input_refinance", async () => {
      const refinance = await Wized.data.get("i.input_refinance");
      console.log("Refinance:", refinance);       
      const [data, monthlyData] = returnsCashFlowCalculator
      .setRefinance(refinance)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });
	  
    Wized.data.listen("i.input_time_to_refinance", async () => {
      const timeToRefinance = await Wized.data.get("i.input_time_to_refinance");
      console.log("Value of i.input_time_to_refinance changed to: ", timeToRefinance);       
      const [data, monthlyData] = returnsCashFlowCalculator
      .setTimeToRefinance(timeToRefinance)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });
	  
    Wized.data.listen("i.input_ltv", async () => {
      const ltv = await Wized.data.get("i.input_ltv");
      console.log("Value of i.input_ltv changed to: ", ltv);       
      const [data, monthlyData] = returnsCashFlowCalculator
      .setLtv(ltv)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });

    Wized.data.listen("i.input_refi_amortization_value", async () => {
      const refinanceAmortization = await Wized.data.get("i.input_refi_amortization_value");
      console.log("Value of i.input_refi_amortization_value changed to: ", refinanceAmortization);       
      const [data, monthlyData] = returnsCashFlowCalculator
      .setRefinanceAmortization(refinanceAmortization)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });
	  
    Wized.data.listen("i.input_refi_interest_rate", async () => {
      const refinanceInterestRate = await Wized.data.get("i.input_refi_interest_rate");
      console.log("Value of i.input_refi_interest_rate changed to: ", refinanceInterestRate);       
      const [data, monthlyData] = returnsCashFlowCalculator
      .setRefinanceInterestRate(refinanceInterestRate)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });
	  
    Wized.data.listen("i.input_rental_income", async () => {
      const rentalIncome = await Wized.data.get("i.input_rental_income");
      console.log("Value of i.input_rental_income changed to: ", rentalIncome);       
      const [data, monthlyData] = returnsCashFlowCalculator
      .setRentalIncome(rentalIncome)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });
	  
    Wized.data.listen("i.input_other_income", async () => {
      const otherIncome = await Wized.data.get("i.input_other_income");
      console.log("Value of i.input_other_income changed to: ", otherIncome);       
      const [data, monthlyData] = returnsCashFlowCalculator
      .setOtherIncome(otherIncome)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });
	  
    Wized.data.listen("i.input_vacancy", async () => {
      const vacancyRate = await Wized.data.get("i.input_vacancy");
      console.log("Value of i.input_vacancy changed to: ", vacancyRate);       
      const [data, monthlyData] = returnsCashFlowCalculator
      .setVacancyRate(vacancyRate)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });
	  
    Wized.data.listen("i.input_repairs_maintenance", async () => {
      const maintenanceRepairsRate = await Wized.data.get("i.input_repairs_maintenance");
      console.log("Value of i.input_repairs_maintenance changed to: ", maintenanceRepairsRate);       
      const [data, monthlyData] = returnsCashFlowCalculator
      .setMaintenanceRepairsRate(maintenanceRepairsRate)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });	  

    Wized.data.listen("i.input_cap_ex", async () => {
      const capExRate = await Wized.data.get("i.input_cap_ex");
      console.log("Value of i.input_cap_ex changed to: ", capExRate);       
      const [data, monthlyData] = returnsCashFlowCalculator
      .setCapExRate(capExRate)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });	

    Wized.data.listen("i.input_management", async () => {
      const propertyManagementFee = await Wized.data.get("i.input_management");
      console.log("Value of i.input_management changed to: ", propertyManagementFee);       
      const [data, monthlyData] = returnsCashFlowCalculator
      .setPropertyManagementFee(propertyManagementFee)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });	  

    Wized.data.listen("i.input_electricity", async () => {
      const electricity = await Wized.data.get("i.input_electricity");
      console.log("Value of i.input_electricity changed to: ", electricity);       
      const [data, monthlyData] = returnsCashFlowCalculator
      .setElectricity(electricity)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });	  

    Wized.data.listen("i.input_water_sewer", async () => {
      const waterSewer = await Wized.data.get("i.input_electricity");
      console.log("Value of i.input_electricity changed to: ", waterSewer);       
      const [data, monthlyData] = returnsCashFlowCalculator
      .setElectricity(electricity)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });	  	

    Wized.data.listen("i.input_gas", async () => {
      const gas = await Wized.data.get("i.input_gas");
      console.log("Value of i.input_gas changed to: ", gas);       
      const [data, monthlyData] = returnsCashFlowCalculator
      .setGas(gas)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });	 


    Wized.data.listen("i.input_trash", async () => {
      const trash = await Wized.data.get("i.input_trash");
      console.log("Value of i.input_trash changed to: ", trash);       
      const [data, monthlyData] = returnsCashFlowCalculator
      .setTrash(trash)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });	
    
    Wized.data.listen("i.input_property_insurance", async () => {
      const propertyInsurance = await Wized.data.get("i.input_property_insurance");
      console.log("Value of i.input_property_insurance changed to: ", propertyInsurance);       
      const [data, monthlyData] = returnsCashFlowCalculator
      .setPropertyInsurance(propertyInsurance)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });	

    Wized.data.listen("i.input_other_expenses", async () => {
      const otherExpenses = await Wized.data.get("i.input_other_expenses");
      console.log("Value of i.input_other_expenses changed to: ", otherExpenses);       
      const [data, monthlyData] = returnsCashFlowCalculator
      .setOtherExpenses(otherExpenses)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });	

    Wized.data.listen("i.input_property_tax_rate", async () => {
      const propertyTaxRate = await Wized.data.get("i.input_property_tax_rate");
      console.log("Value of i.input_property_tax_rate changed to: ", propertyTaxRate);       
      const [data, monthlyData] = returnsCashFlowCalculator
      .setPropertyTaxRate(propertyTaxRate)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });	

    Wized.data.listen("i.input_hoa", async () => {
      const hoa = await Wized.data.get("i.input_hoa");
      console.log("Value of i.input_hoa changed to: ", hoa);       
      const [data, monthlyData] = returnsCashFlowCalculator
      .setHoa(hoa)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });	

    Wized.data.listen("i.input_income_growth", async () => {
      const incomeGrowth = await Wized.data.get("i.input_income_growth");
      console.log("Value of i.input_income_growth changed to: ", incomeGrowth);       
      const [data, monthlyData] = returnsCashFlowCalculator
      .setIncomeGrowth(incomeGrowth)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });	

    Wized.data.listen("i.input_property_value_growth", async () => {
      const propertyValueGrowth = await Wized.data.get("i.input_property_value_growth");
      console.log("Value of i.input_property_value_growth changed to: ", propertyValueGrowth);       
      const [data, monthlyData] = returnsCashFlowCalculator
      .setPropertyValueGrowth(propertyValueGrowth)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });	

    Wized.data.listen("i.input_expense_growth", async () => {
      const expenseGrowth = await Wized.data.get("i.input_expense_growth");
      console.log("Value of i.input_expense_growth changed to: ", expenseGrowth);       
      const [data, monthlyData] = returnsCashFlowCalculator
      .setExpenseGrowth(expenseGrowth)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });	

    Wized.data.listen("i.property_tax_growth", async () => {
      const propertyTaxGrowth = await Wized.data.get("i.property_tax_growth");
      console.log("Value of i.property_tax_growth changed to: ", propertyTaxGrowth);       
      const [data, monthlyData] = returnsCashFlowCalculator
      .setPropertyTaxGrowth(propertyTaxGrowth)
      .calculate();
      returnsCashFlowChart.setData(data).update();
    });	

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

	  Wized.data.setVariable("data", data);
  });
	
});

