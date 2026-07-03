import { createAppSlice } from "@/store/create-app-slice";
import { PayloadAction } from "@reduxjs/toolkit";

export interface UiState {
  chaosMonkeyState: Record<string, boolean>;
}

const initialState: UiState = {
  chaosMonkeyState: {
    inventoryDbLock: false,
    paymentTimeout: false,
    shippingException: false,
  },
};

export const uiSlice = createAppSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleChaosMonkey: (state, action: PayloadAction<string>) => {
      if (state.chaosMonkeyState[action.payload] !== undefined) {
        state.chaosMonkeyState[action.payload] = !state.chaosMonkeyState[action.payload];
      }
    },
    resetChaosMonkey: (state) => {
      state.chaosMonkeyState = {
        inventoryDbLock: false,
        paymentTimeout: false,
        shippingException: false,
      };
    },
  },
  selectors: {
    selectChaosMonkeyState: (state) => state.chaosMonkeyState,
  },
});

export const { toggleChaosMonkey, resetChaosMonkey } = uiSlice.actions;
export const { selectChaosMonkeyState } = uiSlice.selectors;
export default uiSlice.reducer;
