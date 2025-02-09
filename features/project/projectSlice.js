import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  project: null,
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    setProject: (state, action) => {
      state.project = action.payload;
      console.log(state.project)
    },
    clearProject: (state) => {
      state.project = null;
    },
  },
});

export const { setProject, clearProject } = projectSlice.actions;

export default projectSlice.reducer;
