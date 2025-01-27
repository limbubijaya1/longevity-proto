import { createSlice } from "@reduxjs/toolkit";

const languageSlice = createSlice({
  name: "language",
  initialState: {
    language: "en", // Default language
  },
  reducers: {
    setLanguage(state, action) {
      state.language = action.payload;
      console.log(state.language);
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
