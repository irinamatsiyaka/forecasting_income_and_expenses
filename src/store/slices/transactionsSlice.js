import { createSlice } from "@reduxjs/toolkit";

const initialState = {
   all: [],
};

export const fetchTransactionsFromJsonbin = () => async (dispatch) => {
   try {
      const res = await fetch(
         "https://api.jsonbin.io/v3/qs/67f6ee7b8a456b796685ffd5"
      );
      const json = await res.json();
      dispatch(setTransactions(json.record));
   } catch (e) {
      console.error("Ошибка при загрузке JSON:", e);
   }
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
