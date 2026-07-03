import { createAppSlice } from "@/store/create-app-slice";
import { listNotificationsAction } from "./list-notifications/list-notifications.action";
import { NotificationResponse } from "./list-notifications/list-notifications.interface";

export interface NotificationsState {
  notifications: NotificationResponse[];
  loading: boolean;
}

const initialState: NotificationsState = {
  notifications: [],
  loading: false,
};

export const notificationsSlice = createAppSlice({
  name: "notifications",
  initialState,
  reducers: {},
  selectors: {
    selectAllNotifications: (state) => state.notifications,
    selectNotificationsLoading: (state) => state.loading,
  },
  extraReducers: (builder) => {
    builder
      .addCase(listNotificationsAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(listNotificationsAction.fulfilled, (state, action) => {
        state.notifications = action.payload.items;
        state.loading = false;
      })
      .addCase(listNotificationsAction.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { selectAllNotifications, selectNotificationsLoading } = notificationsSlice.selectors;
export default notificationsSlice.reducer;
