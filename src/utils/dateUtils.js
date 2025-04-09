// src/utils/budgetUtils.js
export const computeDailyBalances = (txArray) => {
   if (txArray.length === 0) return [];

   // Сортируем транзакции по дате
   const sorted = [...txArray].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
   );
   let balance = 0;
   const resultByDate = {};
   sorted.forEach((tx) => {
      if (tx.type === "income") balance += tx.amount;
      else if (tx.type === "expense") balance -= tx.amount;
      resultByDate[tx.date] = balance;
   });

   // Заполняем все промежутки
   const start = new Date(sorted[0].date);
   const end = new Date(sorted[sorted.length - 1].date);
   const result = [];
   let currentBalance = 0;
   for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dStr = d.toISOString().split("T")[0];
      if (resultByDate[dStr] !== undefined) {
         currentBalance = resultByDate[dStr];
      }
      result.push({ date: dStr, balance: currentBalance });
   }
   return result;
};
