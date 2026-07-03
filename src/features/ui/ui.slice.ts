import { createAppSlice } from "@/store/create-app-slice";
import { PayloadAction } from "@reduxjs/toolkit";

export interface UiState {
  viewMode: "monolith" | "microservices";
  chaosMonkeyState: Record<string, boolean>;
}

const initialState: UiState = {
  viewMode: "monolith",
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
    setViewMode: (state, action: PayloadAction<"monolith" | "microservices">) => {
      state.viewMode = action.payload;
    },
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
    selectViewMode: (state) => state.viewMode,
    selectChaosMonkeyState: (state) => state.chaosMonkeyState,
  },
});

export const { setViewMode, toggleChaosMonkey, resetChaosMonkey } = uiSlice.actions;
export const { selectViewMode, selectChaosMonkeyState } = uiSlice.selectors;
export default uiSlice.reducer;
