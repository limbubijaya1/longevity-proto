import { createSlice } from "@reduxjs/toolkit";

const tabsSlice = createSlice({
  name: "tabs",
  initialState: {
    activeTab: { key: "", label: "" },
    availableTabs: [],
    subTab: null,
  },
  reducers: {
    setActiveTab(state, action) {
      state.activeTab = action.payload;
      console.log(state.activeTab);
    },
    setAvailableTabs(state, action) {
      state.availableTabs = action.payload;
    },
    setActiveSubTab(state, action) {
      state.subTab = action.payload;
      console.log("Sub Tab:", state.subTab);
    },
  },
});

export const { setActiveTab, setActiveSubTab, setAvailableTabs } = tabsSlice.actions;
export default tabsSlice.reducer;
