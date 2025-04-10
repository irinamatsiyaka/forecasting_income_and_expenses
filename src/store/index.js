// src/store/index.js
import { configureStore } from "@reduxjs/toolkit";
import transactionsReducer from "./slices/transactionsSlice";

const store = configureStore({
   reducer: {
      transactions: transactionsReducer,
   },
});

export default store;
