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
        const offset = action.payload.offset ?? 0;
        const newItems = action.payload.items;
        if (offset === 0) {
          state.notifications = newItems;
        } else {
          const existingIds = new Set(state.notifications.map((n: NotificationResponse) => n.id));
          const filteredNew = newItems.filter((n: NotificationResponse) => !existingIds.has(n.id));
          state.notifications = [...state.notifications, ...filteredNew];
        }
        state.loading = false;
      })
      .addCase(listNotificationsAction.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { selectAllNotifications, selectNotificationsLoading } = notificationsSlice.selectors;
export default notificationsSlice.reducer;
