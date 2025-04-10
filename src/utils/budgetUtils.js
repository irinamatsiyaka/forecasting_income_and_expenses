import Arima from "arima";

export const calculateTotalIncome = (transactions) => {
   return transactions
      .filter((t) => !t.isPlanned && t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
};

export const calculateTotalExpense = (transactions) => {
   return transactions
      .filter((t) => !t.isPlanned && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
};

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

export function removeOutliers(dailyArray) {
   const arr = [...dailyArray];
   const values = arr.map((d) => d.budget);
   const mean = getMean(values);
   const sd = getStd(values, mean);
   return arr.filter(
      (d) => d.budget <= mean + 5 * sd && d.budget >= mean - 5 * sd
   );
}

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

export function forecastSarima(dailyArray, steps = 30, m = 30) {
   if (dailyArray.length < m + 1) return [];
   const sorted = [...dailyArray].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
   );
   const values = sorted.map((d) => d.budget);

   const seasonalDiff = [];
   for (let i = m; i < values.length; i++) {
      seasonalDiff.push(values[i] - values[i - m]);
   }

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

   while (stepsLeft > 0) {
      const currentChunk = Math.min(stepsLeft, chunkSize);
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

function getMean(arr) {
   const s = arr.reduce((a, b) => a + b, 0);
   return s / arr.length;
}
function getStd(arr, meanValue) {
   const m = meanValue || getMean(arr);
   const variance = arr.reduce((acc, x) => acc + (x - m) ** 2, 0) / arr.length;
   return Math.sqrt(variance);
}
