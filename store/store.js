import { configureStore } from "@reduxjs/toolkit";
import projectReducer from "../features/project/projectSlice";
import tabsReducer from "../features/tabs/tabsSlice";
import userReducer from "../features/user/userSlice"

const store = configureStore({
  reducer: {
    project: projectReducer,
    tabs: tabsReducer,
    user: userReducer,
  },
});

export default store;
