import { createAsyncThunk } from "@reduxjs/toolkit";
import { getHealthType } from "./get-health.type";
import { getHealthService } from "./get-health.service";

export const getHealthAction = createAsyncThunk(
  getHealthType,
  async (_, { rejectWithValue }) => {
    try {
      const res = await getHealthService();
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);
