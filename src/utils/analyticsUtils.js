// src/utils/analyticsUtils.js
import { computeDailyBalances } from "./budgetUtils";

/**
 * getRealAndPlannedBalances – Разделяет транзакции на реальные (isPlanned=false)
 * и плановые (isPlanned=true), при этом для плановых транзакций выбираются только те,
 * дата которых равна или позже даты последней реальной транзакции.
 *
 * @param {Array} transactions - Массив всех транзакций.
 * @returns {Object} - { realBalances, plannedBalances }
 */
export function getRealAndPlannedBalances(transactions) {
   const realTx = transactions.filter((tx) => !tx.isPlanned);
   // Находим последнюю дату среди реальных транзакций
   const lastRealDate =
      realTx.length > 0
         ? realTx.reduce(
              (max, tx) => (new Date(tx.date) > new Date(max.date) ? tx : max),
              realTx[0]
           ).date
         : null;
   // Для плановых выбираем только те транзакции, дата которых >= последней реальной
   const plannedTx = lastRealDate
      ? transactions.filter(
           (tx) => tx.isPlanned && new Date(tx.date) >= new Date(lastRealDate)
        )
      : transactions.filter((tx) => tx.isPlanned);
   const realBalances = computeDailyBalances(realTx, false);
   const plannedBalances = computeDailyBalances(plannedTx, true);
   return { realBalances, plannedBalances };
}

/**
 * groupExpensesByCategory – Группирует все расходы (type="expense")
 * по категориям, суммируя реальные и плановые траты.
 *
 * @param {Array} transactions - Массив транзакций.
 * @returns {Array} - Массив объектов вида { category, actual, planned }.
 */
export function groupExpensesByCategory(transactions) {
   const expenses = transactions.filter((tx) => tx.type === "expense");
   const categoryMap = {};
   expenses.forEach((tx) => {
      const cat = tx.category || "Other";
      if (!categoryMap[cat]) {
         categoryMap[cat] = { actual: 0, planned: 0 };
      }
      if (tx.isPlanned) {
         categoryMap[cat].planned += tx.amount;
      } else {
         categoryMap[cat].actual += tx.amount;
      }
   });
   return Object.keys(categoryMap).map((cat) => ({
      category: cat,
      actual: categoryMap[cat].actual,
      planned: categoryMap[cat].planned,
   }));
}

/**
 * groupRealExpensesByCategory – Группирует реальные (isPlanned=false) расходы по категориям.
 *
 * @param {Array} transactions - Массив транзакций.
 * @returns {Object} - Объект, где ключ – категория, значение – сумма расходов.
 */
export function groupRealExpensesByCategory(transactions) {
   const realExpenses = transactions.filter(
      (tx) => tx.type === "expense" && !tx.isPlanned
   );
   const totals = {};
   realExpenses.forEach((tx) => {
      const cat = tx.category || "Other";
      totals[cat] = (totals[cat] || 0) + tx.amount;
   });
   return totals;
}

/**
 * groupIncomeByDescription – Группирует реальные доходы (isPlanned=false) по описанию.
 *
 * @param {Array} transactions - Массив транзакций.
 * @returns {Object} - Объект, где ключ – описание, значение – сумма доходов.
 */
export function groupIncomeByDescription(transactions) {
   const realIncomes = transactions.filter(
      (tx) => tx.type === "income" && !tx.isPlanned
   );
   const incomeMap = {};
   realIncomes.forEach((tx) => {
      const desc = tx.description || "Unnamed Income";
      incomeMap[desc] = (incomeMap[desc] || 0) + tx.amount;
   });
   return incomeMap;
}
