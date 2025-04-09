import { createSlice } from "@reduxjs/toolkit";
import { performForecast } from "../../ai/forecastMethods";

const initialState = {
   data: [],
};

const forecastSlice = createSlice({
   name: "forecast",
   initialState,
   reducers: {
      setForecastData: (state, action) => {
         state.data = action.payload;
      },
   },
});

export const { setForecastData } = forecastSlice.actions;

// Асинхронный thunk для генерации прогноза
export const generateForecast = (days) => (dispatch, getState) => {
   const { all } = getState().transactions;
   // Вызываем "AI" метод, передаём транзакции и желаемый период
   const forecastResult = performForecast(all, days);
   dispatch(setForecastData(forecastResult));
};

export default forecastSlice.reducer;
