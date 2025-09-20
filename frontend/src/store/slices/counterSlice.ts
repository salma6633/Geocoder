import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

// Define a type for the slice state
interface CounterState {
  value: number;
  status: 'idle' | 'loading' | 'failed';
}

// Define the initial state using that type
const initialState: CounterState = {
  value: 0,
  status: 'idle',
};

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
    setStatus: (state, action: PayloadAction<CounterState['status']>) => {
      state.status = action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount, setStatus } = counterSlice.actions;

// Other code such as selectors can use the imported `RootState` type
export const selectCount = (state: RootState) => state.counter.value;
export const selectStatus = (state: RootState) => state.counter.status;

export default counterSlice.reducer;
