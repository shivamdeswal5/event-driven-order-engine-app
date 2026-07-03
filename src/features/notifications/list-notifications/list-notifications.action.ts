import { createAsyncThunk } from "@reduxjs/toolkit";
import { listNotificationsType } from "./list-notifications.type";
import { listNotificationsService } from "./list-notifications.service";
import { ListNotificationsRequest } from "./list-notifications.interface";

export const listNotificationsAction = createAsyncThunk(
  listNotificationsType,
  async (payload: ListNotificationsRequest | undefined, { rejectWithValue }) => {
    try {
      const res = await listNotificationsService(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);
