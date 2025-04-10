import React from "react";
import Plot from "react-plotly.js";
import { useSelector } from "react-redux";

const BudgetPieChart = () => {
   const transactions = useSelector((state) => state.transactions.all);

   //  только фактические расходы
   const expenseTransactions = transactions.filter(
      (tx) => tx.type === "expense" && !tx.isPlanned
   );

   const categoryTotals = expenseTransactions.reduce((acc, tx) => {
      const category =
         tx.category && tx.category.trim() !== "" ? tx.category : "Other";
      acc[category] = (acc[category] || 0) + tx.amount;
      return acc;
   }, {});

   const labels = Object.keys(categoryTotals);
   const values = Object.values(categoryTotals);

   return (
      <div>
         <h2>Expense Distribution by Category</h2>
         <Plot
            data={[
               {
                  type: "pie",
                  labels: labels,
                  values: values,
                  textinfo: "label+percent",
                  insidetextorientation: "radial",
               },
            ]}
            layout={{ width: 500, height: 400, title: "Expenses by Category" }}
         />
      </div>
   );
};

export default BudgetPieChart;
