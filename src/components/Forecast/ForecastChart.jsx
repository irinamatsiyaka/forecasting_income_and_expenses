//src/components/Forecast/ForecastChart
import React from "react";
import Plot from "react-plotly.js";

const ForecastChart = ({ forecastData }) => {
   const dates = forecastData.map((dp) => dp.date);
   const predictions = forecastData.map((dp) => dp.predictedBalance);

   return (
      <div className="forecast-chart">
         <h2>Forecast Chart</h2>
         <Plot
            data={[
               {
                  x: dates,
                  y: predictions,
                  type: "scatter",
                  mode: "lines+markers",
                  marker: { color: "orange" },
                  name: "Forecast",
               },
            ]}
            layout={{ width: 700, height: 400, title: "Forecasted Budget" }}
         />
      </div>
   );
};

export default ForecastChart;
