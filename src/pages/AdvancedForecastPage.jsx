// src/pages/AdvancedForecastPage.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Plot from "react-plotly.js";
import {
   computeDailyBalances,
   fillMissingBalances,
   removeOutliers,
   pearsonCorrelation,
   forecastArima,
   forecastSarima,
   forecastSarimaIterative,
} from "../utils/budgetUtils";
import { generateAIRecommendations } from "../ai/recommendations";

const AdvancedForecastPage = () => {
   const transactions = useSelector((state) => state.transactions.all);
   const [dailyData, setDailyData] = useState([]);
   const [forecastData, setForecastData] = useState([]);
   const [forecastSteps, setForecastSteps] = useState(60); // Например, 60 дней
   const [useSeasonal, setUseSeasonal] = useState(true);
   const [useIterative, setUseIterative] = useState(true);
   const [recommendations, setRecommendations] = useState([]);
   const [correlation, setCorrelation] = useState(0);

   useEffect(() => {
      if (!transactions || transactions.length === 0) {
         console.warn("Нет транзакций в Redux");
         return;
      }

      // 1) Вычисляем ежедневный бюджет
      const computed = computeDailyBalances(transactions, false);
      if (!computed || computed.length === 0) {
         console.warn("computeDailyBalances вернул пустой массив");
         return;
      }

      // 2) Заполняем пропуски
      const noMissing = fillMissingBalances(computed);

      // 3) Удаляем выбросы
      let processedData = removeOutliers(noMissing);
      if (processedData.length === 0) {
         processedData = noMissing;
      }
      setDailyData(processedData);

      // 4) Прогноз:
      let preds = [];
      if (useSeasonal) {
         if (useIterative) {
            preds = forecastSarimaIterative(
               processedData,
               forecastSteps,
               30,
               30
            );
            console.log("Iterative SARIMA:", preds);
         } else {
            preds = forecastSarima(processedData, forecastSteps, 30);
            console.log("One-chunk SARIMA:", preds);
         }
      } else {
         preds = forecastArima(processedData, forecastSteps);
         console.log("Simple ARIMA:", preds);
      }
      if (!preds || preds.length < forecastSteps) {
         console.warn("Прогноз вернул недостаточное количество значений.");
         return;
      }
      setForecastData(preds);

      // 5) Корреляция (пример)
      const factorX = processedData.map(() => Math.random() * 100);
      const factorY = processedData.map((d) => d.budget);
      const corr = pearsonCorrelation(factorX, factorY);
      setCorrelation(corr);

      // 6) AI-рекомендации (упрощённо)
      const realIncome = transactions
         .filter((tx) => tx.type === "income" && !tx.isPlanned)
         .reduce((s, tx) => s + tx.amount, 0);
      const realExpense = transactions
         .filter((tx) => tx.type === "expense" && !tx.isPlanned)
         .reduce((s, tx) => s + tx.amount, 0);
      const recs = generateAIRecommendations(realIncome, realExpense, 500, 300);
      setRecommendations(recs);
   }, [transactions, forecastSteps, useSeasonal, useIterative]);

   if (dailyData.length === 0) {
      return (
         <div style={{ padding: "1rem" }}>
            <h1>Расширенный прогноз и анализ</h1>
            <p>Нет данных для отображения.</p>
         </div>
      );
   }

   const realTrace = {
      x: dailyData.map((d) => d.date),
      y: dailyData.map((d) => d.budget),
      type: "scatter",
      mode: "lines+markers",
      name: "Фактический бюджет",
   };

   const forecastTrace = {
      x: forecastData.map((d) => d.date),
      y: forecastData.map((d) => d.budget),
      type: "scatter",
      mode: "lines+markers",
      name: useSeasonal
         ? useIterative
            ? "Iterative SARIMA"
            : "One-chunk SARIMA"
         : "Simple ARIMA",
   };

   return (
      <div style={{ padding: "1rem" }}>
         <h1>Расширенный прогноз и анализ</h1>
         <p>
            Формула (1): B(t)=B(t-1)+∑(доходы)-∑(расходы) <br />
            Заполнение пропусков: X(t)=(X(t-1)+X(t+1))/2 <br />
            Удаление выбросов и итеративный сезонный прогноз.
         </p>

         <div style={{ marginBottom: "1rem" }}>
            <label>
               Период прогноза (дней):
               <select
                  value={forecastSteps}
                  onChange={(e) => setForecastSteps(Number(e.target.value))}
                  style={{ marginLeft: "0.5rem" }}
               >
                  <option value={30}>30</option>
                  <option value={60}>60</option>
                  <option value={90}>90</option>
                  <option value={180}>180</option>
                  <option value={365}>365</option>
               </select>
            </label>
            <label style={{ marginLeft: "2rem" }}>
               Сезонный прогноз:
               <input
                  type="checkbox"
                  checked={useSeasonal}
                  onChange={(e) => setUseSeasonal(e.target.checked)}
                  style={{ marginLeft: "0.5rem" }}
               />
            </label>
            <label style={{ marginLeft: "2rem" }}>
               Итеративный:
               <input
                  type="checkbox"
                  checked={useIterative}
                  onChange={(e) => setUseIterative(e.target.checked)}
                  style={{ marginLeft: "0.5rem" }}
               />
            </label>
         </div>

         <Plot
            data={[realTrace, forecastTrace]}
            layout={{
               width: 900,
               height: 500,
               title: "Ежедневный бюджет и прогноз",
            }}
         />

         <div style={{ marginTop: "1rem" }}>
            <h2>Корреляция (пример)</h2>
            <p>
               Корреляция с неким фактором X:{" "}
               <strong>{correlation.toFixed(3)}</strong>
            </p>
         </div>

         <div style={{ marginTop: "1rem" }}>
            <h2>AI-рекомендации</h2>
            {recommendations.map((r, i) => (
               <p key={i}>- {r}</p>
            ))}
         </div>
      </div>
   );
};

export default AdvancedForecastPage;
