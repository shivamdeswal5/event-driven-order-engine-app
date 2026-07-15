import { createAppSlice } from "@/store/create-app-slice";
import { PayloadAction } from "@reduxjs/toolkit";

export interface ToastInfo {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
}

export interface UiState {
  chaosMonkeyState: Record<string, boolean>;
  toasts: ToastInfo[];
}

const initialState: UiState = {
  chaosMonkeyState: {
    inventoryDbLock: false,
    paymentTimeout: false,
    shippingException: false,
  },
  toasts: [],
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
    addToast: (state, action: PayloadAction<Omit<ToastInfo, "id"> & { id?: string }>) => {
      const id = action.payload.id || (typeof window !== "undefined" && window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 9));
      state.toasts.push({
        id,
        type: action.payload.type,
        title: action.payload.title,
        message: action.payload.message,
      });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
  },
  selectors: {
    selectChaosMonkeyState: (state) => state.chaosMonkeyState,
    selectToasts: (state) => state.toasts,
  },
});

export const { toggleChaosMonkey, resetChaosMonkey, addToast, removeToast } = uiSlice.actions;
export const { selectChaosMonkeyState, selectToasts } = uiSlice.selectors;
export default uiSlice.reducer;
