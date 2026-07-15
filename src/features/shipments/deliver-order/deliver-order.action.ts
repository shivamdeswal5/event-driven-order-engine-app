import { createAsyncThunk } from "@reduxjs/toolkit";
import { deliverOrderType } from "./deliver-order.type";
import { deliverOrderService } from "./deliver-order.service";
import axios from "axios";

export const deliverOrderAction = createAsyncThunk(
  deliverOrderType,
  async (orderId: string, { rejectWithValue }) => {
    try {
      const res = await deliverOrderService(orderId);
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
