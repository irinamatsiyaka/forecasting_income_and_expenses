// src/pages/AdvancedAnalyticsPage.jsx
import React, { useMemo } from "react";
import Plot from "react-plotly.js";
import transactions from "../data/defaultTransactions.json";
import {
   getRealAndPlannedBalances,
   groupExpensesByCategory,
   groupRealExpensesByCategory,
   groupIncomeByDescription,
} from "../utils/analyticsUtils";

const AdvancedAnalyticsPage = () => {
   // Получаем реальные и плановые транзакции и рассчитываем балансы
   const { realBalances, plannedBalances } = useMemo(
      () => getRealAndPlannedBalances(transactions),
      []
   );

   // Корректируем плановые балансы – если их начало отличается от последнего реального баланса,
   // смещаем их так, чтобы первый пункт зеленого графика совпадал с последним значением синего.
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

   // Трейс для реального баланса (синий график)
   const realBalanceTrace = {
      x: realBalances.map((item) => item.date),
      y: realBalances.map((item) => item.budget),
      type: "scatter",
      mode: "lines+markers",
      name: "Real Balance",
   };

   // Трейс для планового баланса (зелёный график)
   const plannedBalanceTrace = {
      x: adjustedPlannedBalances.map((item) => item.date),
      y: adjustedPlannedBalances.map((item) => item.budget),
      type: "scatter",
      mode: "lines+markers",
      name: "Planned Balance",
   };

   // Группировка расходов по категориям для бюджета vs. actual spending
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

   // Группируем реальные расходы по категориям
   const realExpensesByCategory = useMemo(
      () => groupRealExpensesByCategory(transactions),
      [transactions]
   );
   const catTrace = {
      x: Object.keys(realExpensesByCategory),
      y: Object.values(realExpensesByCategory),
      type: "bar",
   };

   // Группируем доходы по описанию
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

         {/* 1) Балансы: Real vs. Planned */}
         <h2>Balances Over Time</h2>
         <Plot
            data={[realBalanceTrace, plannedBalanceTrace]}
            layout={{
               title: "Real vs. Planned Balance",
               width: 700,
               height: 400,
            }}
         />

         {/* 2) Budgets vs. Actual Spending (по категориям расходов) */}
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

         {/* 3) Расходы по категориям (только реальные) */}
         <h2>Real Expenses by Category</h2>
         <Plot
            data={[catTrace]}
            layout={{
               title: "Real Expenses by Category",
               width: 700,
               height: 400,
            }}
         />

         {/* 4) Piggy Banks (Stacked) – Заглушка */}
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
                  y: [800 - 200, 500 - 333, 735],
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

         {/* 5) Revenue Accounts (Sources of Income) */}
         <h2>Income by Description</h2>
         <Plot
            data={[revenueTrace]}
            layout={{
               title: "Real Income Sources",
               width: 700,
               height: 400,
            }}
         />
      </div>
   );
};

export default AdvancedAnalyticsPage;
