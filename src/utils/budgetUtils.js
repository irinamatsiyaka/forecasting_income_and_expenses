// src/utils/budgetUtils.js

import Arima from "arima";

/**
 * calculateTotalIncome – Считает сумму всех реальных (isPlanned=false) доходов.
 */
export const calculateTotalIncome = (transactions) => {
   return transactions
      .filter((t) => !t.isPlanned && t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
};

/**
 * calculateTotalExpense – Считает сумму всех реальных (isPlanned=false) расходов.
 */
export const calculateTotalExpense = (transactions) => {
   return transactions
      .filter((t) => !t.isPlanned && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
};

/**
 * computeDailyBalances – Вычисляет баланс для каждого дня по формуле (1):
 *   B(t) = B(t-1) + ∑(доходы) - ∑(расходы)
 *
 * Если includePlanned=true, учитываются плановые транзакции.
 *
 * @param {Array} transactions - Массив транзакций.
 * @param {Boolean} includePlanned - Если true, включаются плановые.
 * @returns {Array} - [{ date, budget }]
 */
export const computeDailyBalances = (transactions, includePlanned = false) => {
   const filtered = includePlanned
      ? transactions
      : transactions.filter((t) => !t.isPlanned);
   if (filtered.length === 0) return [];

   const sorted = [...filtered].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
   );

   let balance = 0;
   const balanceByDate = {};
   sorted.forEach((tx) => {
      if (tx.type === "income") balance += tx.amount;
      else balance -= tx.amount;
      balanceByDate[tx.date] = balance;
   });

   const startDate = new Date(sorted[0].date);
   const endDate = new Date(sorted[sorted.length - 1].date);
   const result = [];
   let currentBalance = 0;
   for (
      let d = new Date(startDate);
      d <= endDate;
      d = new Date(d.getTime() + 86400000)
   ) {
      const dateStr = d.toISOString().split("T")[0];
      if (balanceByDate.hasOwnProperty(dateStr)) {
         currentBalance = balanceByDate[dateStr];
      }
      result.push({ date: dateStr, budget: currentBalance });
   }
   return result;
};

/* ===============================
   Дополнительные функции для обработки данных
   =============================== */

/**
 * fillMissingBalances – Заполнение пропусков.
 * Если для какого-то дня значение budget отсутствует,
 * заполняем его средним соседних значений: X(t) = (X(t-1)+X(t+1))/2.
 */
export function fillMissingBalances(dailyArray) {
   const arr = [...dailyArray];
   for (let i = 0; i < arr.length; i++) {
      if (arr[i].budget == null) {
         if (i > 0 && i < arr.length - 1) {
            arr[i].budget = (arr[i - 1].budget + arr[i + 1].budget) / 2;
         } else if (i === 0 && arr.length > 1) {
            arr[i].budget = arr[i + 1].budget;
         } else if (i === arr.length - 1 && arr.length > 1) {
            arr[i].budget = arr[i - 1].budget;
         } else {
            arr[i].budget = 0;
         }
      }
   }
   return arr;
}

/**
 * removeOutliers – Удаление выбросов (mean ± 5*std).
 */
export function removeOutliers(dailyArray) {
   const arr = [...dailyArray];
   const values = arr.map((d) => d.budget);
   const mean = getMean(values);
   const sd = getStd(values, mean);
   return arr.filter(
      (d) => d.budget <= mean + 5 * sd && d.budget >= mean - 5 * sd
   );
}

/**
 * makeDifferences – Вычисляет разности: Y(t)=X(t)-X(t-1).
 */
export function makeDifferences(dailyArray) {
   if (dailyArray.length < 2) return dailyArray;
   const res = [];
   res.push({ date: dailyArray[0].date, budget: 0 });
   for (let i = 1; i < dailyArray.length; i++) {
      const diff = dailyArray[i].budget - dailyArray[i - 1].budget;
      res.push({
         date: dailyArray[i].date,
         budget: diff,
      });
   }
   return res;
}

/**
 * pearsonCorrelation – Вычисляет коэффициент корреляции Пирсона между двумя массивами.
 */
export function pearsonCorrelation(arrX, arrY) {
   if (arrX.length !== arrY.length) return 0;
   const n = arrX.length;
   const meanX = getMean(arrX);
   const meanY = getMean(arrY);
   let num = 0,
      den1 = 0,
      den2 = 0;
   for (let i = 0; i < n; i++) {
      const dx = arrX[i] - meanX;
      const dy = arrY[i] - meanY;
      num += dx * dy;
      den1 += dx * dx;
      den2 += dy * dy;
   }
   return num / Math.sqrt(den1 * den2);
}

/* ===========================================================
   Сезонный прогноз
   =========================================================== */

/**
 * forecastSarima – Прогнозирование с сезонным дифференцированием (SARIMA) на один блок (chunk).
 * Рассчитывает сезонные разности с периодом m и восстанавливает прогноз:
 * X[t] = X[t-m] + Y_hat[t]. В этом варианте не добавляется дополнительный тренд.
 *
 * @param {Array} dailyArray - Массив объектов [{ date, budget }, ...]
 * @param {number} steps - Количество дней для прогноза (один блок).
 * @param {number} m - Сезонный период (например, 30).
 * @returns {Array} - Массив объектов [{ date, budget }, ...]
 */
export function forecastSarima(dailyArray, steps = 30, m = 30) {
   if (dailyArray.length < m + 1) return [];
   const sorted = [...dailyArray].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
   );
   const values = sorted.map((d) => d.budget);

   // Вычисляем сезонные разности: diff[t] = X[t] - X[t-m] для t = m...N-1
   const seasonalDiff = [];
   for (let i = m; i < values.length; i++) {
      seasonalDiff.push(values[i] - values[i - m]);
   }

   // Обучаем AR модель на сезонных разностях (p=1, d=0, q=0)
   const arima = new Arima({
      p: 1,
      d: 0,
      q: 0,
      verbose: false,
   }).train(seasonalDiff);

   let [predDiff, errors] = arima.predict(steps);
   if (predDiff.some((p) => isNaN(p))) {
      console.warn("Прогноз сезонных разностей содержит NaN, заменяем на 0.");
      predDiff = Array(steps).fill(0);
   }

   // Восстанавливаем прогнозные значения: X[t] = X[t-m] + diff[t]
   const result = [];
   const N = values.length;
   const lastDate = new Date(sorted[N - 1].date);
   for (let i = 0; i < steps; i++) {
      let baseIndex = N - m + i;
      if (baseIndex >= N) baseIndex = N - 1;
      const base = values[baseIndex];
      const forecastValue = base + predDiff[i];
      const futureDate = new Date(lastDate.getTime() + 86400000 * (i + 1));
      result.push({
         date: futureDate.toISOString().split("T")[0],
         budget: forecastValue,
      });
   }
   return result;
}

/**
 * forecastSarimaIterative – Итеративный сезонный прогноз на totalSteps дней.
 * Делит прогноз на блоки (chunks) по chunkSize дней и для каждого блока обучает модель
 * на базе текущего ряда (фактические данные + уже спрогнозированные значения).
 *
 * @param {Array} dailyArray - [{ date, budget }, ...] (отсортированный ряд)
 * @param {number} totalSteps - Общее число дней для прогноза.
 * @param {number} chunkSize - Размер одного блока (например, 30).
 * @param {number} m - Сезонный период (например, 30).
 * @returns {Array} - Итоговый прогноз [{ date, budget }, ...] на totalSteps дней.
 */
export function forecastSarimaIterative(
   dailyArray,
   totalSteps = 60,
   chunkSize = 30,
   m = 30
) {
   const sorted = [...dailyArray].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
   );
   let baseValues = sorted.map((d) => d.budget);
   let lastDate = new Date(sorted[sorted.length - 1].date);
   let stepsLeft = totalSteps;
   const finalForecast = [];

   // Итеративно прогнозируем каждый блок
   while (stepsLeft > 0) {
      const currentChunk = Math.min(stepsLeft, chunkSize);
      // Прогнозируем текущий блок с помощью forecastSarimaOneChunk
      const chunkPred = forecastSarimaOneChunk(baseValues, currentChunk, m);
      for (let i = 0; i < currentChunk; i++) {
         const futureDate = new Date(lastDate.getTime() + 86400000 * (i + 1));
         finalForecast.push({
            date: futureDate.toISOString().split("T")[0],
            budget: chunkPred[i],
         });
      }
      baseValues = baseValues.concat(chunkPred);
      lastDate = new Date(lastDate.getTime() + 86400000 * currentChunk);
      stepsLeft -= currentChunk;
   }
   return finalForecast;
}

/**
 * forecastSarimaOneChunk – Локальная функция для прогнозирования одного блока (chunk) дней.
 * Использует AR модель на сезонных разностях.
 *
 * @param {Array<number>} baseValues - Исходный ряд чисел (budget).
 * @param {number} steps - Количество дней в блоке.
 * @param {number} m - Сезонный период.
 * @returns {Array<number>} - Массив спрогнозированных значений длиной steps.
 */
function forecastSarimaOneChunk(baseValues, steps, m = 30) {
   if (baseValues.length < m + 1) {
      const lastVal = baseValues[baseValues.length - 1] || 0;
      return Array(steps).fill(lastVal);
   }
   const seasonalDiff = [];
   for (let i = m; i < baseValues.length; i++) {
      seasonalDiff.push(baseValues[i] - baseValues[i - m]);
   }
   const arima = new Arima({
      p: 1,
      d: 0,
      q: 0,
      verbose: false,
   }).train(seasonalDiff);
   let [predDiff, errors] = arima.predict(steps);
   if (predDiff.some((p) => isNaN(p))) {
      predDiff = Array(steps).fill(0);
   }
   const resultVals = [];
   const N = baseValues.length;
   for (let i = 0; i < steps; i++) {
      let baseIndex = N - m + i;
      if (baseIndex >= N) baseIndex = N - 1;
      const base = baseValues[baseIndex];
      const val = base + predDiff[i];
      resultVals.push(val);
   }
   return resultVals;
}

/**
 * forecastArima – Простой прогноз ARIMA без сезонности.
 * Использует модель ARIMA (p=1, d=0, q=0). Если NaN, заменяет на последнее известное значение.
 *
 * @param {Array} dailyArray - [{ date, budget }, ...]
 * @param {number} steps - Количество дней для прогноза.
 * @returns {Array} - [{ date, budget }, ...]
 */
export function forecastArima(dailyArray, steps = 7) {
   if (dailyArray.length < 2) return [];
   const sorted = [...dailyArray].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
   );
   const values = sorted.map((d) => d.budget);
   const isConstant = values.every((v) => v === values[0]);
   if (isConstant) {
      const lastVal = values[values.length - 1];
      const lastDate = new Date(sorted[sorted.length - 1].date);
      const result = [];
      for (let i = 0; i < steps; i++) {
         const futureDate = new Date(lastDate.getTime() + 86400000 * (i + 1));
         result.push({
            date: futureDate.toISOString().split("T")[0],
            budget: lastVal,
         });
      }
      return result;
   }
   const arima = new Arima({
      p: 1,
      d: 0,
      q: 0,
      verbose: false,
   }).train(values);
   let [predictions, errors] = arima.predict(steps);
   if (predictions.some((p) => isNaN(p))) {
      const lastVal = values[values.length - 1];
      predictions = Array(steps).fill(lastVal);
   }
   const lastDate = new Date(sorted[sorted.length - 1].date);
   const result = [];
   for (let i = 0; i < steps; i++) {
      const futureDate = new Date(lastDate.getTime() + 86400000 * (i + 1));
      result.push({
         date: futureDate.toISOString().split("T")[0],
         budget: predictions[i],
      });
   }
   return result;
}

// Вспомогательные функции
function getMean(arr) {
   const s = arr.reduce((a, b) => a + b, 0);
   return s / arr.length;
}
function getStd(arr, meanValue) {
   const m = meanValue || getMean(arr);
   const variance = arr.reduce((acc, x) => acc + (x - m) ** 2, 0) / arr.length;
   return Math.sqrt(variance);
}
