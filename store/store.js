import { configureStore } from "@reduxjs/toolkit";
import projectReducer from "../features/project/projectSlice";
import tabsReducer from "../features/tabs/tabsSlice";
import userReducer from "../features/user/userSlice";
import languageReducer from "../features/language/languageSlice";

const store = configureStore({
  reducer: {
    project: projectReducer,
    tabs: tabsReducer,
    user: userReducer,
    language: languageReducer,
  },
});

export default store;
