import { createAsyncThunk } from "@reduxjs/toolkit";
import { listProductsType } from "./list-products.type";
import { listProductsService } from "./list-products.service";

export const listProductsAction = createAsyncThunk(
  listProductsType,
  async (_, { rejectWithValue }) => {
    try {
      const res = await listProductsService();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);
