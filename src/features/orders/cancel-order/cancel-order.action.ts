import { createAsyncThunk } from "@reduxjs/toolkit";
import { cancelOrderType } from "./cancel-order.type";
import { cancelOrderService } from "./cancel-order.service";
import { CancelOrderRequest } from "./cancel-order.interface";
import axios from "axios";

export const cancelOrderAction = createAsyncThunk(
  cancelOrderType,
  async (payload: { orderId: string } & CancelOrderRequest, { rejectWithValue }) => {
    try {
      const { orderId, ...body } = payload;
      const res = await cancelOrderService(orderId, body);
      return res.data;
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return rejectWithValue({
          message: err.response?.data?.message ?? err.message,
          status: err.response?.status ?? 500,
        });
      }
      return rejectWithValue({ message: "An unexpected error occurred.", status: 500 });
    }
  }
);
