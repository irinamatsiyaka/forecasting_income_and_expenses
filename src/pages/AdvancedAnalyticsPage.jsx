import React, { useMemo, useEffect, useState } from "react";
import Plot from "react-plotly.js";
import {
   getRealAndPlannedBalances,
   groupExpensesByCategory,
   groupRealExpensesByCategory,
   groupIncomeByDescription,
} from "../utils/analyticsUtils";

const AdvancedAnalyticsPage = () => {
   const [transactions, setTransactions] = useState([]);

   const fetchData = () => {
      fetch("https://api.jsonbin.io/v3/qs/67f6ee7b8a456b796685ffd5")
         .then((res) => res.json())
         .then((json) => {
            const data = Array.isArray(json.record)
               ? json.record
               : json.record?.record || [];
            setTransactions(data);
         });
   };

   useEffect(() => {
      fetchData();
   }, []);

   const { realBalances, plannedBalances } = useMemo(
      () => getRealAndPlannedBalances(transactions),
      [transactions]
   );

   const adjustedPlannedBalances = useMemo(() => {
      if (!plannedBalances.length) return [];
      const lastReal = realBalances.length
         ? realBalances[realBalances.length - 1].budget
         : 0;
      const firstPlanned = plannedBalances[0].budget;
      return plannedBalances.map((item) => ({
         date: item.date,
         budget: lastReal + (item.budget - firstPlanned),
      }));
   }, [plannedBalances, realBalances]);

   const realBalanceTrace = {
      x: realBalances.map((item) => item.date),
      y: realBalances.map((item) => item.budget),
      type: "scatter",
      mode: "lines+markers",
      name: "Real Balance",
   };

   const plannedBalanceTrace = {
      x: adjustedPlannedBalances.map((item) => item.date),
      y: adjustedPlannedBalances.map((item) => item.budget),
      type: "scatter",
      mode: "lines+markers",
      name: "Planned Balance",
   };

   const categoriesBudgetArray = useMemo(
      () => groupExpensesByCategory(transactions),
      [transactions]
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

   const realExpensesByCategory = useMemo(
      () => groupRealExpensesByCategory(transactions),
      [transactions]
   );
   const catTrace = {
      x: Object.keys(realExpensesByCategory),
      y: Object.values(realExpensesByCategory),
      type: "bar",
   };

   const incomeByDescription = useMemo(
      () => groupIncomeByDescription(transactions),
      [transactions]
   );
   const revenueTrace = {
      x: Object.keys(incomeByDescription),
      y: Object.values(incomeByDescription),
      type: "bar",
   };

   return (
      <div style={{ padding: "1rem" }}>
         <h1>Advanced Analytics (Real JSON Data)</h1>

         <button onClick={fetchData} style={{ marginBottom: "1rem" }}>
            🔄 Обновить данные
         </button>

         <h2>Balances Over Time</h2>
         <Plot
            data={[realBalanceTrace, plannedBalanceTrace]}
            layout={{
               title: "Real vs. Planned Balance",
               width: 700,
               height: 400,
            }}
         />

         <h2>Budgets vs. Actual Spending (By Category)</h2>
         <Plot
            data={[budgetTraceActual, budgetTracePlanned]}
            layout={{
               barmode: "group",
               title: "Expense: Actual vs. Planned",
               width: 700,
               height: 400,
            }}
         />

         <h2>Real Expenses by Category</h2>
         <Plot
            data={[catTrace]}
            layout={{
               title: "Real Expenses by Category",
               width: 700,
               height: 400,
            }}
         />

         <h2>Piggy Banks</h2>
         <Plot
            data={[
               {
                  x: ["New couch", "New phone", "New camera"],
                  y: [200, 333, 0],
                  name: "Saved",
                  type: "bar",
               },
               {
                  x: ["New couch", "New phone", "New camera"],
                  y: [600, 167, 735],
                  name: "Remaining",
                  type: "bar",
               },
            ]}
            layout={{
               barmode: "stack",
               title: "Piggy Bank Goals",
               width: 700,
               height: 400,
            }}
         />

         <h2>Income by Description</h2>
         <Plot
            data={[revenueTrace]}
            layout={{ title: "Real Income Sources", width: 700, height: 400 }}
         />
      </div>
   );
};

export default AdvancedAnalyticsPage;
