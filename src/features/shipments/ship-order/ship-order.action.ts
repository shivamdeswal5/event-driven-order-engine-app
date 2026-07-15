import { createAsyncThunk } from "@reduxjs/toolkit";
import { shipOrderType } from "./ship-order.type";
import { shipOrderService } from "./ship-order.service";
import { ShipOrderRequest } from "./ship-order.interface";
import axios from "axios";

export const shipOrderAction = createAsyncThunk(
  shipOrderType,
  async (payload: ShipOrderRequest, { rejectWithValue }) => {
    try {
      const res = await shipOrderService(payload);
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
