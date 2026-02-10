import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { fetchStatsData } from '../../actions/stats-actions/stats-actions';

export interface StatsState {
  stats: {
    paymentsReceived: number;
    currentBalance: number;
    totalPayments: number;
    paidUsers: number;
    unpaidUsers: number;
    totalUsers: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: StatsState = {
  stats: {
    paymentsReceived: 0,
    currentBalance: 0,
    totalPayments: 0,
    paidUsers: 0,
    unpaidUsers: 0,
    totalUsers: 0,
  },
  loading: false,
  error: null,
};

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStatsData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStatsData.fulfilled, (state, action: PayloadAction<StatsState['stats']>) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchStatsData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch stats data';
      });
  },
});

export const selectStats = (state: RootState) => state.stats.stats;
export const selectStatsLoading = (state: RootState) => state.stats.loading;

export default statsSlice.reducer;