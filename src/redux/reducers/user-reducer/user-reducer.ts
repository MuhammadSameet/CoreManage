// User reducer slices are defined here...!

import { createSlice } from "@reduxjs/toolkit";

interface User {
  docId: string;
  uid: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  password?: string;
}

interface UserState {
  usersList: User[];
  loading: boolean;
}

const initialState: UserState = {
  usersList: [],
  loading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    START_FETCHING_USERS: (state) => {
      state.loading = true;
    },
    FETCH_ALL_USERS: (state, action) => {
      state.usersList = action.payload;
      state.loading = false;
    },
  },
});

export const { FETCH_ALL_USERS, START_FETCHING_USERS } = userSlice.actions;
export default userSlice.reducer;
export type { User };
