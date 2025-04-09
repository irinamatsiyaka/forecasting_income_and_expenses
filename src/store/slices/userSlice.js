import { createSlice } from "@reduxjs/toolkit";

const initialState = {
   name: "Demo User",
   // прочие настройки
};

const userSlice = createSlice({
   name: "user",
   initialState,
   reducers: {
      setUserName: (state, action) => {
         state.name = action.payload;
      },
   },
});

export const { setUserName } = userSlice.actions;
export default userSlice.reducer;
