import { createAsyncThunk } from "@reduxjs/toolkit";
import { placeOrderType } from "./place-order.type";
import { placeOrderService } from "./place-order.service";
import { PlaceOrderRequest } from "./place-order.interface";

export const placeOrderAction = createAsyncThunk(
  placeOrderType,
  async (payload: PlaceOrderRequest, { rejectWithValue }) => {
    try {
      const res = await placeOrderService(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);
