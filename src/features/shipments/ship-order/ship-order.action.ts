import { createAsyncThunk } from "@reduxjs/toolkit";
import { shipOrderType } from "./ship-order.type";
import { shipOrderService } from "./ship-order.service";
import { ShipOrderRequest } from "./ship-order.interface";

export const shipOrderAction = createAsyncThunk(
  shipOrderType,
  async (payload: ShipOrderRequest, { rejectWithValue }) => {
    try {
      const res = await shipOrderService(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);
