import { createAsyncThunk } from "@reduxjs/toolkit";
import { placeOrderType } from "./place-order.type";
import { placeOrderService } from "./place-order.service";
import { PlaceOrderRequest } from "./place-order.interface";
import axios from "axios";

export const placeOrderAction = createAsyncThunk(
  placeOrderType,
  async (payload: PlaceOrderRequest, { rejectWithValue }) => {
    try {
      const res = await placeOrderService(payload);
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
