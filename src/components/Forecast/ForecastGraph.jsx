import React from "react";
import AnalyticsChart from "../Analytics/AnalyticsChart";

const ForecastGraph = ({ forecastData }) => {
   const data = {
      labels: forecastData.map((item) => item.date),
      datasets: [
         {
            label: "Forecast",
            data: forecastData.map((item) => item.value),
            borderColor: "blue",
            fill: false,
         },
      ],
   };

   const options = {
      responsive: true,
      plugins: { legend: { display: true } },
   };

   return (
      <div>
         <h3>Forecast</h3>
         <AnalyticsChart data={data} options={options} />
      </div>
   );
};

export default ForecastGraph;
