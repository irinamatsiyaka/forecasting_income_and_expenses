// src/ai/metrics.js
export const calculateMAPE = (actual, predicted) => {
   let sum = 0;
   let count = 0;
   for (let i = 0; i < actual.length; i++) {
      if (actual[i] !== 0) {
         sum += Math.abs((actual[i] - predicted[i]) / actual[i]);
         count++;
      }
   }
   if (count === 0) return 0;
   return (sum / count) * 100;
};

export const calculateRMSE = (actual, predicted) => {
   let sumSq = 0;
   for (let i = 0; i < actual.length; i++) {
      const diff = actual[i] - predicted[i];
      sumSq += diff * diff;
   }
   const mse = sumSq / actual.length;
   return Math.sqrt(mse);
};
