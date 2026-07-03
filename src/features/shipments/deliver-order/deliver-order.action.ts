import { createAsyncThunk } from "@reduxjs/toolkit";
import { deliverOrderType } from "./deliver-order.type";
import { deliverOrderService } from "./deliver-order.service";

export const deliverOrderAction = createAsyncThunk(
  deliverOrderType,
  async (orderId: string, { rejectWithValue }) => {
    try {
      const res = await deliverOrderService(orderId);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);
