import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    fullName: "",
    userId: "",
  },
  reducers: {
    setUser(state, action) {
      state.fullName = action.payload.fullName;
      state.userId = action.payload.userId;
    },
    clearUser(state) {
      state.fullName = "";
      state.userId = "";
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
