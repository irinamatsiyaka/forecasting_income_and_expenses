import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ForecastChart from "../components/Forecast/ForecastChart";
import { generateForecast } from "../store/slices/forecastSlice";

const ForecastPage = () => {
   const dispatch = useDispatch();
   const forecastData = useSelector((state) => state.forecast.data);
   const [period, setPeriod] = useState(30); // прогноз на 30 дней по умолчанию

   const handleForecast = () => {
      dispatch(generateForecast(period));
   };

   return (
      <div>
         <h1>Forecast</h1>
         <div style={{ marginBottom: "1rem" }}>
            <label>Forecast Period (days): </label>
            <input
               type="number"
               value={period}
               onChange={(e) => setPeriod(parseInt(e.target.value) || 30)}
            />
            <button onClick={handleForecast}>Generate Forecast</button>
         </div>
         {forecastData.length > 0 && (
            <ForecastChart forecastData={forecastData} />
         )}
      </div>
   );
};

export default ForecastPage;
