// src/ai/forecastArima.js

import Arima from "arima";

/**
 * forecastArima – Прогнозирование ARIMA.
 * Здесь мы используем простую авторегрессионную модель ARIMA с параметрами (p=1, d=0, q=0).
 * Если модель возвращает NaN, то мы заполняем прогноз последним значением ряда.
 *
 * @param {Array} dailyArray - Массив объектов [{ date, budget }, ...]
 * @param {number} steps - Количество дней для прогноза.
 * @returns {Array} - Массив объектов [{ date, budget }, ...] с прогнозными значениями.
 */
export function forecastArima(dailyArray, steps = 7) {
   if (dailyArray.length < 2) return [];
   // Сортируем по дате (на всякий случай)
   const sorted = [...dailyArray].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
   );
   // Извлекаем числовой ряд
   const values = sorted.map((d) => d.budget);
   console.log("Значения для ARIMA:", values);

   // Если ряд постоянный, предсказываем то же значение для всех будущих дней
   const isConstant = values.every((v) => v === values[0]);
   if (isConstant) {
      const lastValue = values[values.length - 1];
      const lastDate = new Date(sorted[sorted.length - 1].date);
      const result = [];
      for (let i = 0; i < steps; i++) {
         const futureDate = new Date(lastDate.getTime() + 86400000 * (i + 1));
         result.push({
            date: futureDate.toISOString().split("T")[0],
            budget: lastValue,
         });
      }
      return result;
   }

   // Инициализируем ARIMA с параметрами: p=1, d=0, q=0 (простая AR модель)
   const arima = new Arima({
      p: 1,
      d: 0,
      q: 0,
      verbose: false,
   }).train(values);

   // Получаем прогноз
   let [predictions, errors] = arima.predict(steps);
   console.log("Исходный прогноз ARIMA:", predictions);

   // Если хотя бы одно значение NaN, заменяем все прогнозные значения на последнее известное значение
   if (predictions.some((p) => isNaN(p))) {
      console.warn(
         "Предсказания содержат NaN, заменяем на последнее известное значение."
      );
      const lastValue = values[values.length - 1];
      predictions = Array(steps).fill(lastValue);
   }

   // Генерируем прогнозные данные с датами
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
