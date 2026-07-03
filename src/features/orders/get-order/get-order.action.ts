import { createAsyncThunk } from "@reduxjs/toolkit";
import { getOrderType } from "./get-order.type";
import { getOrderService } from "./get-order.service";

export const getOrderAction = createAsyncThunk(
  getOrderType,
  async (orderId: string, { rejectWithValue }) => {
    try {
      const res = await getOrderService(orderId);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);
