import { createSlice } from "@reduxjs/toolkit";
import { loadTransactions } from "../../utils/localStorage";
import defaultTransactions from "../../data/defaultTransactions.json";

const initialTransactions = loadTransactions() || defaultTransactions;

const initialState = {
   all: initialTransactions,
};

const transactionsSlice = createSlice({
   name: "transactions",
   initialState,
   reducers: {
      addTransaction: (state, action) => {
         state.all.push(action.payload);
      },
      removeTransaction: (state, action) => {
         state.all = state.all.filter((t) => t.id !== action.payload);
      },
      setTransactions: (state, action) => {
         state.all = action.payload;
      },
   },
});

export const { addTransaction, removeTransaction, setTransactions } =
   transactionsSlice.actions;
export default transactionsSlice.reducer;
