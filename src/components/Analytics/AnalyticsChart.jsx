import React from "react";
import Plot from "react-plotly.js";

const AnalyticsChart = ({ dataPoints }) => {
   // dataPoints – массив вида: [{date: '2025-01-01', balance: 1000}, ...]
   const dates = dataPoints.map((dp) => dp.date);
   const balances = dataPoints.map((dp) => dp.balance);

   return (
      <div className="analytics-chart">
         <h2>Analytics Chart (Historical Balance)</h2>
         <Plot
            data={[
               {
                  x: dates,
                  y: balances,
                  type: "scatter",
                  mode: "lines+markers",
                  marker: { color: "blue" },
                  name: "Balance",
               },
            ]}
            layout={{ width: 700, height: 400, title: "Budget Over Time" }}
         />
      </div>
   );
};

export default AnalyticsChart;
