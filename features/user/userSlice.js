import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    fullName: "",
    userId: "",
    companyId: "",
  },
  reducers: {
    setUser(state, action) {
      state.fullName = action.payload.fullName;
      state.userId = action.payload.userId;
      state.companyId = action.payload.companyId;
    },
    clearUser(state) {
      state.fullName = "";
      state.userId = "";
      state.companyId = "";
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
