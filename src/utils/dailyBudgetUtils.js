// src/utils/dailyBudgetUtils.js

/**
 * Вычисляет ежедневный бюджет по формуле (1):
 *    B(t) = B(t-1) + ∑(доходы за день) - ∑(расходы за день)
 *
 * @param {Array} transactions - Массив транзакций. Каждый объект должен иметь поля:
 *   - date (строка в формате "YYYY-MM-DD")
 *   - amount (число)
 *   - type ("income" или "expense")
 *   - isPlanned (булево, если true – плановая, если false – реальная)
 * @returns {Array} - Массив объектов вида { date, budget }
 */
export function computeDailyBudget(transactions) {
   if (!transactions || transactions.length === 0) return [];

   // Сортируем транзакции по дате
   const sorted = [...transactions].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
   );

   let budgetYesterday = 0; // Начинаем с 0; можно добавить начальный баланс, если нужно.
   const result = [];

   // Группируем транзакции по дате
   const transactionsByDate = {};
   sorted.forEach((tx) => {
      const date = tx.date;
      if (!transactionsByDate[date]) {
         transactionsByDate[date] = [];
      }
      transactionsByDate[date].push(tx);
   });

   // Проходим по датам в порядке возрастания
   const dates = Object.keys(transactionsByDate).sort(
      (a, b) => new Date(a) - new Date(b)
   );

   dates.forEach((date) => {
      const txs = transactionsByDate[date];
      let sumIncome = 0;
      let sumExpense = 0;
      txs.forEach((tx) => {
         if (tx.type === "income") sumIncome += tx.amount;
         else if (tx.type === "expense") sumExpense += tx.amount;
      });
      // Формула (1): бюджет на текущий день = бюджет предыдущего дня + доходы - расходы
      const budgetToday = budgetYesterday + sumIncome - sumExpense;
      result.push({ date, budget: budgetToday });
      budgetYesterday = budgetToday;
   });

   return result;
}
