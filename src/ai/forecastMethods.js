// src/ai/forecastMethods.js
import { fillMissingValues, makeStationary } from "./dataPreprocessing";

const pseudoArimaForecast = (historical, days) => {
   if (historical.length === 0) return [];
   const lastBalance = historical[historical.length - 1].balance;
   const forecast = [];
   let current = lastBalance;
   for (let i = 1; i <= days; i++) {
      current = current + Math.random() * 100 - 50;
      const futureDate = new Date(historical[historical.length - 1].date);
      futureDate.setDate(futureDate.getDate() + i);
      forecast.push({
         date: futureDate.toISOString().split("T")[0],
         predictedBalance: Math.round(current),
      });
   }
   return forecast;
};

const simpleLinearRegression = (historical, days) => {
   if (historical.length < 2) return [];
   const n = historical.length;
   let sumX = 0,
      sumY = 0,
      sumXY = 0,
      sumX2 = 0;
   historical.forEach((point, i) => {
      const x = i + 1;
      const y = point.balance;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
   });
   const b = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
   const a = (sumY - b * sumX) / n;
   const lastDate = new Date(historical[historical.length - 1].date);
   const forecast = [];
   for (let i = 1; i <= days; i++) {
      const x = n + i;
      const predicted = a + b * x;
      const futureDate = new Date(lastDate);
      futureDate.setDate(futureDate.getDate() + i);
      forecast.push({
         date: futureDate.toISOString().split("T")[0],
         predictedBalance: Math.round(predicted),
      });
   }
   return forecast;
};

export const performForecast = (transactions, days) => {
   const actualTx = transactions.filter((t) => !t.isPlanned);
   const sorted = [...actualTx].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
   );
   let balance = 0;
   const historical = [];
   sorted.forEach((tx) => {
      if (tx.type === "income") balance += tx.amount;
      else balance -= tx.amount;
      historical.push({ date: tx.date, balance });
   });
   const noMissing = fillMissingValues
      ? fillMissingValues(historical)
      : historical;
   const stationaryData = makeStationary
      ? makeStationary(noMissing)
      : noMissing;
   const forecastResult = pseudoArimaForecast(stationaryData, days);
   const plannedTx = transactions.filter((t) => t.isPlanned);
   forecastResult.forEach((fPoint) => {
      const sameDatePlanned = plannedTx.filter((t) => t.date === fPoint.date);
      if (sameDatePlanned.length > 0) {
         let totalIncome = 0;
         let totalExpense = 0;
         sameDatePlanned.forEach((tx) => {
            if (tx.type === "income") totalIncome += tx.amount;
            else totalExpense += tx.amount;
         });
         fPoint.predictedBalance += totalIncome - totalExpense;
      }
   });
   return forecastResult;
};
