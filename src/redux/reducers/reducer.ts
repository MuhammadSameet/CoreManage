// Main reducer file...!

import { combineReducers } from "redux";
import authReducer from "./auth-reducer/auth-reducer";
import userReducer from "./user-reducer/user-reducer";

const rootReducer = combineReducers({
  authStates: authReducer,
  userStates: userReducer,
});

export default rootReducer;
