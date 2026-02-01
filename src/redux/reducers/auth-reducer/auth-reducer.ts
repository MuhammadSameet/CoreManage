// Auth reducer slices are defined here...!

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserPayload {
    email: string | null;
    uid: string;
    name: string | null;
    dp?: string | null;
}

const initialState: { isAuthenticated: UserPayload | null } = {
  isAuthenticated: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    LOGIN_USER: (state, action: PayloadAction<UserPayload>) => {
      console.log("User in redux: ", action.payload);
      state.isAuthenticated = action.payload;
    },

    LOG_OUT_USER: (state) => {
      state.isAuthenticated = null;
    }
  },
});

export const { LOGIN_USER, LOG_OUT_USER } = authSlice.actions;
export default authSlice.reducer;
