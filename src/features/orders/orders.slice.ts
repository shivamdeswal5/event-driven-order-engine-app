import { createAppSlice } from "@/store/create-app-slice";
import { PayloadAction } from "@reduxjs/toolkit";

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  status: string;
  items: OrderItem[];
  createdAt: string;
}

export interface OrdersState {
  orders: Order[];
  activeOrderId: string | null;
}

const initialState: OrdersState = {
  orders: [],
  activeOrderId: null,
};

export const ordersSlice = createAppSlice({
  name: "orders",
  initialState,
  reducers: {
    setActiveOrderId: (state, action: PayloadAction<string | null>) => {
      state.activeOrderId = action.payload;
    },
  },
  selectors: {
    selectAllOrders: (state) => state.orders,
    selectActiveOrderId: (state) => state.activeOrderId,
  },
});

export const { setActiveOrderId } = ordersSlice.actions;
export const { selectAllOrders, selectActiveOrderId } = ordersSlice.selectors;
export default ordersSlice.reducer;
