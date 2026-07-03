import { createAsyncThunk } from "@reduxjs/toolkit";
import { listOrdersType } from "./list-orders.type";
import { listOrdersService } from "./list-orders.service";
import { ListOrdersRequest } from "./list-orders.interface";

export const listOrdersAction = createAsyncThunk(
  listOrdersType,
  async (payload: ListOrdersRequest | undefined, { rejectWithValue }) => {
    try {
      const res = await listOrdersService(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);
