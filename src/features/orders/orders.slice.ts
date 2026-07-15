import { createAppSlice } from "@/store/create-app-slice";
import { PayloadAction } from "@reduxjs/toolkit";
import { OrderStatus } from "@/common/order-status.enum";
import { placeOrderAction } from "./place-order/place-order.action";
import { listOrdersAction } from "./list-orders/list-orders.action";
import { getOrderAction } from "./get-order/get-order.action";
import { cancelOrderAction } from "./cancel-order/cancel-order.action";
import { OrderResponse } from "./list-orders/list-orders.interface";

export interface OrdersState {
  orders: OrderResponse[];
  activeOrderId: string | null;
  loading: boolean;
}

const initialState: OrdersState = {
  orders: [],
  activeOrderId: null,
  loading: false,
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
    selectAllOrders: (state) =>
      Array.isArray(state.orders) ? state.orders : [],
    selectActiveOrderId: (state) => state.activeOrderId,
    selectActiveOrder: (state) =>
      Array.isArray(state.orders)
        ? state.orders.find((o) => o.id === state.activeOrderId) ?? null
        : null,
    selectOrdersLoading: (state) => state.loading,
  },
  extraReducers: (builder) => {
    // List Orders
    builder
      .addCase(listOrdersAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(listOrdersAction.fulfilled, (state, action) => {
        state.orders = action.payload.items;
        state.loading = false;
      })
      .addCase(listOrdersAction.rejected, (state) => {
        state.loading = false;
      });

    // Get single order — upsert into orders array
    builder.addCase(getOrderAction.fulfilled, (state, action) => {
      const index = state.orders.findIndex((o) => o.id === action.payload.id);
      if (index >= 0) {
        state.orders[index] = action.payload;
      } else {
        state.orders.unshift(action.payload);
      }
    });

    // Cancel order — trigger a re-fetch via the component, no state update needed here
    builder.addCase(cancelOrderAction.fulfilled, () => {
      // Intentionally empty — the component will dispatch listOrdersAction or getOrderAction
    });
  },
});

export const { setActiveOrderId } = ordersSlice.actions;
export const { selectAllOrders, selectActiveOrderId, selectActiveOrder, selectOrdersLoading } = ordersSlice.selectors;
export default ordersSlice.reducer;
