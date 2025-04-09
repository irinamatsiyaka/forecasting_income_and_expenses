import { configureStore } from "@reduxjs/toolkit";
import transactionsReducer from "./slices/transactionsSlice";
import forecastReducer from "./slices/forecastSlice";
import userReducer from "./slices/userSlice";

const store = configureStore({
   reducer: {
      transactions: transactionsReducer,
      forecast: forecastReducer,
      user: userReducer,
   },
});

export default store;
