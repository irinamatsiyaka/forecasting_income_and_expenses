// src/ai/dataPipeline.js

/**
 * Обработка пропусков:
 *  X(t) = (X(t-1) + X(t+1)) / 2
 *
 * Мы идём по массиву data[...], где data[i] = { date, value }.
 * Если value "missing", мы берём среднее соседних.
 */
export function fillMissingValues(data) {
   const arr = [...data];
   for (let i = 0; i < arr.length; i++) {
      if (arr[i].value == null) {
         // берем среднее arr[i-1].value и arr[i+1].value
         if (i > 0 && i < arr.length - 1) {
            arr[i].value = (arr[i - 1].value + arr[i + 1].value) / 2;
         } else if (i === 0) {
            arr[i].value = arr[i + 1].value; // простейший вариант
         } else if (i === arr.length - 1) {
            arr[i].value = arr[i - 1].value;
         }
      }
   }
   return arr;
}

/**
 * Удаление выбросов (outliers):
 * Если value слишком велико / слишком мало относительно среднего - std, удаляем.
 * (Упрощённый способ: если value > mean + 3*std => выброс).
 */
export function removeOutliers(data) {
   const arr = [...data];
   const values = arr.map((d) => d.value);
   const mean = avg(values);
   const sd = std(values);

   const filtered = arr.filter((d) => {
      // простая проверка
      if (d.value > mean + 3 * sd) return false; // слишком много
      if (d.value < mean - 3 * sd) return false; // слишком мало
      return true;
   });
   return filtered;
}

/**
 * Разности (для стационарности):
 *   Y(t) = X(t) - X(t-1)
 * Возвращаем массив того же размера, предполагая Y(0) = 0 или undefined.
 */
export function makeStationaryDifferences(data) {
   if (data.length < 2) return data;
   const arr = [{ ...data[0], value: 0 }]; // Y(0)=0, можно удалить вовсе
   for (let i = 1; i < data.length; i++) {
      const y = data[i].value - data[i - 1].value;
      arr.push({
         date: data[i].date,
         value: y,
      });
   }
   return arr;
}

/**
 * Вычисляем корреляцию Пирсона между двумя массивами X, Y (одинаковой длины).
 */
export function pearsonCorrelation(X, Y) {
   const n = X.length;
   const meanX = avg(X);
   const meanY = avg(Y);
   let num = 0,
      den1 = 0,
      den2 = 0;
   for (let i = 0; i < n; i++) {
      const dx = X[i] - meanX;
      const dy = Y[i] - meanY;
      num += dx * dy;
      den1 += dx * dx;
      den2 += dy * dy;
   }
   const corr = num / Math.sqrt(den1 * den2);
   return corr;
}

// Вспомогательные функции
function avg(arr) {
   const s = arr.reduce((a, b) => a + b, 0);
   return s / arr.length;
}
function std(arr) {
   const m = avg(arr);
   const variance = arr.reduce((acc, x) => acc + (x - m) ** 2, 0) / arr.length;
   return Math.sqrt(variance);
}
