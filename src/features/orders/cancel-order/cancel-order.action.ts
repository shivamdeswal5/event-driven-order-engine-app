import { createAsyncThunk } from "@reduxjs/toolkit";
import { cancelOrderType } from "./cancel-order.type";
import { cancelOrderService } from "./cancel-order.service";
import { CancelOrderRequest } from "./cancel-order.interface";

export const cancelOrderAction = createAsyncThunk(
  cancelOrderType,
  async (payload: { orderId: string } & CancelOrderRequest, { rejectWithValue }) => {
    try {
      const { orderId, ...body } = payload;
      const res = await cancelOrderService(orderId, body);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);
