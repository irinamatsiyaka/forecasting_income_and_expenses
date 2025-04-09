// src/pages/DashboardPage.jsx
import React from "react";
import { useSelector } from "react-redux";
import CardTiles from "../components/Dashboard/CardTiles";

const DashboardPage = () => {
   const transactions = useSelector((state) => state.transactions.all);

   // Разделяем транзакции на реальные и плановые по флагу isPlanned
   const realNowTx = transactions.filter((tx) => !tx.isPlanned);
   const futureTx = transactions.filter((tx) => tx.isPlanned);

   // 1) Реальные доходы и расходы (только реальные транзакции)
   const realIncome = realNowTx
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);

   const realExpense = realNowTx
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);

   // Текущий баланс — это разница между реальными доходами и расходами
   const currentBalance = realIncome - realExpense;

   // 2) Плановые доходы и расходы (все, у которых isPlanned === true)
   const futureIncome = futureTx
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);

   const futureExpense = futureTx
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);

   // Чистая стоимость (с учётом будущего) = текущий баланс + (плановые доходы - плановые расходы)
   const netWorthProjected = currentBalance + (futureIncome - futureExpense);

   // 3) Доход - Расход за март 2025 — фильтруем реальные транзакции по дате
   const realNowMarchTx = realNowTx.filter((tx) => {
      const d = new Date(tx.date);
      return d.getFullYear() === 2025 && d.getMonth() === 2; // март (месяцы: 0 – январь)
   });
   const inMarchIncome = realNowMarchTx
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);
   const inMarchExpense = realNowMarchTx
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);
   const netInOutMarch = inMarchIncome - inMarchExpense;

   // Формируем данные для карточек (tiles)
   const tilesData = [
      {
         gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
         iconClass: "fas fa-balance-scale",
         title: "Мой текущий баланс (на сегодня)",
         value: currentBalance.toLocaleString("ru-RU", {
            style: "currency",
            currency: "RUB",
         }),
         subValue: `Доход: ${realIncome.toLocaleString(
            "ru-RU"
         )}, Расход: ${realExpense.toLocaleString("ru-RU")}`,
      },
      {
         gradient: "linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)",
         iconClass: "fas fa-calendar-check",
         title: "Плановые операции (ещё не наступили)",
         value: `+${futureIncome.toLocaleString(
            "ru-RU"
         )} / -${futureExpense.toLocaleString("ru-RU")}`,
         subValue: "Это будущие доходы и расходы",
      },
      {
         gradient: "linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)",
         iconClass: "fas fa-money-bill",
         title: "Чистая стоимость (с учётом будущего)",
         value: netWorthProjected.toLocaleString("ru-RU", {
            style: "currency",
            currency: "RUB",
         }),
         subValue: "Если все плановые операции состоятся",
      },
      {
         gradient: "linear-gradient(135deg, #c3cfe2 0%, #c3cfe2 100%)",
         iconClass: "fas fa-chart-line",
         title: "Доход - Расход (март 2025)",
         value: netInOutMarch.toLocaleString("ru-RU", {
            style: "currency",
            currency: "RUB",
         }),
         subValue: "Только реальные за март",
      },
   ];

   return (
      <div>
         <h1>Панель управления</h1>
         <p>
            Баланс рассчитывается на основе реальных транзакций, а чистая
            стоимость с учётом будущего – с учётом плановых операций.
         </p>
         <CardTiles tilesData={tilesData} />
      </div>
   );
};

export default DashboardPage;
