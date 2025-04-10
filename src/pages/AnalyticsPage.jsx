import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import Plot from "react-plotly.js";
import { computeDailyBalances } from "../utils/budgetUtils";
import BudgetPieChart from "../components/BudgetPieChart";
import { groupExpensesByCategory } from "../utils/analyticsUtils";

const AnalyticsPage = () => {
   const allTransactions = useSelector((state) => state.transactions.all);

   const [cutOffDate, setCutOffDate] = useState("2025-04-06");

   const trainingTx = useMemo(
      () =>
         allTransactions.filter((tx) => tx.date <= cutOffDate && !tx.isPlanned),
      [allTransactions, cutOffDate]
   );

   // будущие транзакции (после cutOffDate)
   const testTx = useMemo(
      () => allTransactions.filter((tx) => tx.date > cutOffDate),
      [allTransactions, cutOffDate]
   );

   const trainingBalances = useMemo(
      () => computeDailyBalances(trainingTx, false),
      [trainingTx]
   );
   const testBalances = useMemo(
      () => computeDailyBalances(testTx, true),
      [testTx]
   );

   const adjustedTestBalances = useMemo(() => {
      if (!testBalances.length) return [];
      const lastTraining =
         trainingBalances.length > 0
            ? trainingBalances[trainingBalances.length - 1].budget
            : 0;
      const testOffset = testBalances[0].budget;
      return testBalances.map((d) => ({
         date: d.date,
         budget: lastTraining + (d.budget - testOffset),
      }));
   }, [testBalances, trainingBalances]);

   // history (blue)
   const trainingTrace = {
      x: trainingBalances.map((d) => d.date),
      y: trainingBalances.map((d) => d.budget),
      type: "scatter",
      mode: "lines+markers",
      name: "Historical (Training)",
      marker: { color: "blue" },
   };

   // future
   const testTrace = {
      x: adjustedTestBalances.map((d) => d.date),
      y: adjustedTestBalances.map((d) => d.budget),
      type: "scatter",
      mode: "lines+markers",
      name: "Planned / Future",
      marker: { color: "green" },
   };

   // Actual vs Planned
   const categoriesBudgetArray = useMemo(
      () => groupExpensesByCategory(allTransactions),
      [allTransactions]
   );
   const budgetTraceActual = {
      x: categoriesBudgetArray.map((c) => c.category),
      y: categoriesBudgetArray.map((c) => c.actual),
      name: "Actual",
      type: "bar",
   };
   const budgetTracePlanned = {
      x: categoriesBudgetArray.map((c) => c.category),
      y: categoriesBudgetArray.map((c) => c.planned),
      name: "Planned",
      type: "bar",
   };

   //Monthly Income vs. Expense + Cumulative Difference
   const monthlyData = useMemo(() => {
      const groups = {};
      allTransactions.forEach((tx) => {
         const dateObj = new Date(tx.date);
         const key =
            dateObj.getFullYear() +
            "-" +
            (dateObj.getMonth() + 1).toString().padStart(2, "0");
         if (!groups[key]) {
            groups[key] = { income: 0, expense: 0 };
         }
         if (tx.type === "income") {
            groups[key].income += tx.amount;
         } else if (tx.type === "expense") {
            groups[key].expense += tx.amount;
         }
      });
      const sortedKeys = Object.keys(groups).sort();
      const monthNames = [
         "Jan",
         "Feb",
         "Mar",
         "Apr",
         "May",
         "Jun",
         "Jul",
         "Aug",
         "Sep",
         "Oct",
         "Nov",
         "Dec",
      ];
      return sortedKeys.map((key) => {
         const [year, monthNum] = key.split("-");
         return {
            month: monthNames[parseInt(monthNum, 10) - 1] + " " + year,
            income: groups[key].income,
            expense: groups[key].expense,
            difference: groups[key].income - groups[key].expense,
         };
      });
   }, [allTransactions]);

   const cumulativeDifference = useMemo(() => {
      let cum = 0;
      return monthlyData.map((data) => {
         cum += data.difference;
         return cum;
      });
   }, [monthlyData]);

   const dualAxisData = [
      {
         x: monthlyData.map((d) => d.month),
         y: monthlyData.map((d) => d.income),
         name: "Income",
         type: "bar",
      },
      {
         x: monthlyData.map((d) => d.month),
         y: monthlyData.map((d) => d.expense),
         name: "Expense",
         type: "bar",
      },
      {
         x: monthlyData.map((d) => d.month),
         y: cumulativeDifference,
         name: "Cumulative Difference",
         type: "scatter",
         mode: "lines+markers",
      },
   ];

   const dualAxisLayout = {
      title: "Monthly Income vs. Expense + Cumulative Difference",
      barmode: "group",
      yaxis: { title: "Amount (Rubles)" },
      width: 900,
      height: 500,
   };

   return (
      <div style={{ padding: "1rem" }}>
         <h1>Future Forecast Analysis</h1>
         <p>
            Исторические данные (до {cutOffDate}) отображаются синим графиком, а
            транзакции после {cutOffDate} – зелёным, начиная с конечного
            значения синего.
         </p>
         <div style={{ margin: "1rem 0" }}>
            <label>Cut-off date: </label>
            <input
               type="date"
               value={cutOffDate}
               onChange={(e) => setCutOffDate(e.target.value)}
            />
         </div>

         <Plot
            data={[trainingTrace, testTrace]}
            layout={{
               width: 900,
               height: 500,
               title: "Historical and Planned Balances (Continuous)",
            }}
         />

         <Plot
            data={[budgetTraceActual, budgetTracePlanned]}
            layout={{
               barmode: "group",
               width: 900,
               height: 500,
               title: "Budgets vs. Actual Spending (By Category)",
            }}
         />

         <BudgetPieChart />

         <Plot data={dualAxisData} layout={dualAxisLayout} />
      </div>
   );
};

export default AnalyticsPage;
