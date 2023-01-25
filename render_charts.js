window.onload = async () => {
  Wized.request.awaitAllPageLoad(async () => {

      /* Purchase Loan */
      let purchasePrice = await Wized.data.get("r.7.d.report.purchase_price");
      let closingCosts = await Wized.data.get("r.7.d.report.closing_costs");
      let downPaymentAmount = await Wized.data.get("r.7.d.down_payment_cash");
      let loanAmount = await Wized.data.get("r.7.d.loan_amount");
      let interestRate = await Wized.data.get("r.7.d.report.interest_rate"); /*percentage*/
      let amortization = await Wized.data.get("r.7.d.report.amortization"); /* Value can be 30, 25, 20, 15, or 10 */

      /* Rehab Details */
      let rehabCosts = await Wized.data.get("r.7.d.report.rehab_costs");
      let rehabInMonths = await Wized.data.get("r.7.d.report.rehab_in_months");

      /* Income */
      let rentalIncome = await Wized.data.get("r.7.d.report.total_monthly_rent");
      let otherIncome = await Wized.data.get("r.7.d.report.other_monthly_income");

      /* Expenses */
      let propertyTaxRate = await Wized.data.get("r.7.d.report.annual_property_taxes"); /*percentage*/
      let propertyInsurance = await Wized.data.get("r.7.d.report.monthly_insurance");
      let pmi = 1.0; /*percentage*/
      let propertyManagementFee = await Wized.data.get("r.7.d.report.management_fees"); /*percentage*/
      let utilities = await Wized.data.get("r.7.d.total_utilities");
      let maintenanceCapExRate = await Wized.data.get("r.7.d.report.capital_expenses"); /*percentage*/
      let otherExpenses = await Wized.data.get("r.7.d.report.other_monthly_costs");
      let vacancyRate = await Wized.data.get("r.7.d.report.vacancy"); /*percentage*/

      /* Refinance Loan */
      let refinance = await Wized.data.get("r.7.d.report.refinance");
      console.log(typeof refinance);
      let arv = await Wized.data.get("r.7.d.report.arv");
      let refinanceLoanAmount = await Wized.data.get("r.7.d.refi_loan_amount");
      let ltv = await Wized.data.get("r.7.d.report.refi_ltv");
      let cashOutPotential = await Wized.data.get("r.7.d.cash_out_potential");
      let refinanceInterestRate = await Wized.data.get("r.7.d.report.refi_interest_rate");
      let refinanceAmortization = await Wized.data.get("r.7.d.report.refi_amortization");
      let timeToRefinance = await Wized.data.get("r.7.d.report.months_to_refinance");

      /* Projections */
      let incomeGrowth = await Wized.data.get("r.7.d.report.income_growth"); /*percentage*/
      let propertyValueGrowth = await Wized.data.get("r.7.d.report.pv_growth"); /*percentage*/
      let expenseGrowth = await Wized.data.get("r.7.d.report.expense_growth"); /*percentage*/
      let propertyTaxGrowth = await Wized.data.get("r.7.d.report.property_tax_growth"); /*percentage*/

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
      
      // Initialize chart
      const returnsCashFlowChart = new ReturnsCashFlowChart(
          document.querySelector("#returnsCashFlowChart")
      );
      returnsCashFlowChart.setData(data).setChartType("returns").update();

      // Set up chart type control
      document
          .querySelectorAll("input[name='chartTypeControl']")
          .forEach((input) => {
              input.addEventListener("input", (event) => {
                  returnsCashFlowChart.setChartType(event.target.value).update();

                  // Set up datum change listener for mobile rendering
                  const formatValue = d3.format("$,");
                  document
                      .querySelector("#returnsCashFlowChart")
                      .addEventListener("datumchange", (event) => {
                          const d = event.detail;
                          console.log("---------------------------------------");
                          console.log(
                              `${d.total.name} projection of ${formatValue(
                                  d.total.value
                              )} at year ${d.year}`
                          );
                          console.log(`${d.values[0].name}: ${formatValue(d.values[0].value)}`);
                          console.log(`${d.values[1].name}: ${formatValue(d.values[1].value)}`);
                          console.log("---------------------------------------");
                          document.querySelector("#chartName").textContent = d.total.name;
                          document.querySelector("#chartTotal").textContent = formatValue(
                              d.total.value
                          );

                          document.querySelector("#chartYear").textContent = d.year;
                          document.querySelector("#atYear").textContent = "at year";
                          document.querySelector("#chartValue0").textContent = `${d.values[0].name}: ${formatValue(d.values[0].value)}`;
                          document.querySelector("#chartValue1").textContent = `${d.values[1].name}: ${formatValue(d.values[1].value)}`;
                          document.querySelector("#circle_0").textContent = "circle";
                          document.querySelector("#circle_1").textContent = "circle";
                          document.querySelector("#chartLTV").style.display = 'none';
                      });
                  // Set up chart type control
                  document
                      .getElementById('chartTypeControl3').addEventListener('click', function () {

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
                      });

              });
              
          });
          const [kpi1goal] = await Promise.all([
            Wized.data.get("r.3.d.result_1._goals_of_user[0].cash_on_cash_return_goal")
        ]);
        const [kpi1, kpi2, kpi3, kpi4] = await Promise.all([
            Wized.data.get("r.7.d.purchase_cap_rate"),
            Wized.data.get("r.7.d.capital_expenses"),
            Wized.data.get("r.7.d.purchase_cap_rate"),
            Wized.data.get("r.7.d.purchase_cap_rate")
        ]);
        const kpi1g = kpi1*100/kpi1goal*100;
        const kpiGaugeChart1 = new KPIGaugeChart(document.querySelector("#kpiGaugeChart1"));
        const kpiGaugeChart2 = new KPIGaugeChart(document.querySelector("#kpiGaugeChart2"));
        const kpiGaugeChart3 = new KPIGaugeChart(document.querySelector("#kpiGaugeChart3"));
      	const kpiGaugeChart4 = new KPIGaugeChart(document.querySelector("#kpiGaugeChart4"));
        kpiGaugeChart1.setData(kpi1g).update();
        kpiGaugeChart2.setData(kpi2).update();
        kpiGaugeChart3.setData(kpi3).update();
        kpiGaugeChart4.setData(kpi4).update();
  });
};


