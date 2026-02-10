import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { signUpUser } from '../../actions/signup-actions/signup-actions';

interface User {
  uid: string;
  name: string;
  email: string;
  role: string;
}

interface SignUpState {
  user: User | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: SignUpState = {
  user: null,
  loading: false,
  error: null,
  success: false,
};

const signupSlice = createSlice({
  name: 'signup',
  initialState,
  reducers: {
    resetSignUpState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUpUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(signUpUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.success = true;
        state.error = null;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'An error occurred during signup';
        state.success = false;
      });
  },
});

export const { resetSignUpState } = signupSlice.actions;
export default signupSlice.reducer;