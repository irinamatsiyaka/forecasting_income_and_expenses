// src/pages/AnalyticsPage.jsx
import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import Plot from "react-plotly.js";
import { computeDailyBalances } from "../utils/budgetUtils";
import BudgetPieChart from "../components/BudgetPieChart";
import { groupExpensesByCategory } from "../utils/analyticsUtils";

const AnalyticsPage = () => {
   const allTransactions = useSelector((state) => state.transactions.all);

   // Дата «среза» для исторических данных (training)
   const [cutOffDate, setCutOffDate] = useState("2025-04-06");

   // Исторические транзакции (до cutOffDate, реальные)
   const trainingTx = useMemo(
      () =>
         allTransactions.filter((tx) => tx.date <= cutOffDate && !tx.isPlanned),
      [allTransactions, cutOffDate]
   );

   // Будущие транзакции (после cutOffDate)
   const testTx = useMemo(
      () => allTransactions.filter((tx) => tx.date > cutOffDate),
      [allTransactions, cutOffDate]
   );

   // Вычисляем балансы
   const trainingBalances = useMemo(
      () => computeDailyBalances(trainingTx, false),
      [trainingTx]
   );
   const testBalances = useMemo(
      () => computeDailyBalances(testTx, true),
      [testTx]
   );

   // Корректируем testBalances так, чтобы их первое значение совпадало с последним значением trainingBalances
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

   // Трейс для исторических данных (синий)
   const trainingTrace = {
      x: trainingBalances.map((d) => d.date),
      y: trainingBalances.map((d) => d.budget),
      type: "scatter",
      mode: "lines+markers",
      name: "Historical (Training)",
      marker: { color: "blue" },
   };

   // Трейс для будущих данных (зелёный)
   const testTrace = {
      x: adjustedTestBalances.map((d) => d.date),
      y: adjustedTestBalances.map((d) => d.budget),
      type: "scatter",
      mode: "lines+markers",
      name: "Planned / Future",
      marker: { color: "green" },
   };

   // Группировка расходов по категориям для диаграммы Actual vs. Planned
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

   // --- Новая диаграмма: Monthly Income vs. Expense + Cumulative Difference ---
   // Динамически агрегируем транзакции по месяцам
   const monthlyData = useMemo(() => {
      // Группируем по ключу "YYYY-MM"
      const groups = {};
      allTransactions.forEach((tx) => {
         const dateObj = new Date(tx.date);
         // Используем год и месяц (месяц в диапазоне 01-12)
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
      // Сортируем ключи и создаём массив с данными
      const sortedKeys = Object.keys(groups).sort();
      // Преобразуем ключ в короткое название месяца, если необходимо
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

   // Вычисляем накопленную разницу (cumulative difference) по месяцам
   const cumulativeDifference = useMemo(() => {
      let cum = 0;
      return monthlyData.map((data) => {
         cum += data.difference;
         return cum;
      });
   }, [monthlyData]);

   // Формируем данные для комбинированной диаграммы
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

   // Макет для комбинированной диаграммы – используем одну ось для всех данных
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

         {/* График балансов: исторические (синий) и будущие (зелёный) */}
         <Plot
            data={[trainingTrace, testTrace]}
            layout={{
               width: 900,
               height: 500,
               title: "Historical and Planned Balances (Continuous)",
            }}
         />

         {/* График Actual vs. Planned по категориям расходов */}
         <Plot
            data={[budgetTraceActual, budgetTracePlanned]}
            layout={{
               barmode: "group",
               width: 900,
               height: 500,
               title: "Budgets vs. Actual Spending (By Category)",
            }}
         />

         {/* Пример круговой диаграммы */}
         <BudgetPieChart />

         {/* Новая комбинированная диаграмма по месяцам */}
         <Plot data={dualAxisData} layout={dualAxisLayout} />
      </div>
   );
};

export default AnalyticsPage;
