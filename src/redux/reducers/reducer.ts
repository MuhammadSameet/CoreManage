// Main reducer file...!

import { combineReducers } from "redux";
import authReducer from "./auth-reducer/auth-reducer";
import userReducer from "./user-reducer/user-reducer";
import signupReducer from "./signup-reducer/signup-reducer";
import statsReducer from "./stats-reducer/stats-reducer";

const rootReducer = combineReducers({
  authStates: authReducer,
  userStates: userReducer,
  signupStates: signupReducer,
  stats: statsReducer,
});

export default rootReducer;
