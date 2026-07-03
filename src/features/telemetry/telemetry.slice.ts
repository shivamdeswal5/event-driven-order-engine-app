import { createAppSlice } from "@/store/create-app-slice";
import { PayloadAction } from "@reduxjs/toolkit";

/**
 * Shape of real-time WebSocket notification events
 * from the backend NotificationGateway.broadcastToOrder().
 */
export interface WebSocketNotification {
  orderId: string;
  eventType: string;
  message: string;
  occurredAt: string;
}

export interface TelemetryState {
  /** Real-time WebSocket events, capped at 100 entries */
  eventLog: WebSocketNotification[];
  /** Socket.io connection state */
  connectionStatus: "connected" | "disconnected" | "connecting";
}

const initialState: TelemetryState = {
  eventLog: [],
  connectionStatus: "disconnected",
};

const MAX_EVENT_LOG_SIZE = 100;

export const telemetrySlice = createAppSlice({
  name: "telemetry",
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<"connected" | "disconnected" | "connecting">) => {
      state.connectionStatus = action.payload;
    },
    addNotification: (state, action: PayloadAction<WebSocketNotification>) => {
      state.eventLog.unshift(action.payload);
      if (state.eventLog.length > MAX_EVENT_LOG_SIZE) {
        state.eventLog.pop();
      }
    },
    clearEventLog: (state) => {
      state.eventLog = [];
    },
  },
  selectors: {
    selectEventLog: (state) => state.eventLog,
    selectConnectionStatus: (state) => state.connectionStatus,
    selectEventLogByOrderId: (state, orderId: string) =>
      state.eventLog.filter((e) => e.orderId === orderId),
  },
});

export const { setConnectionStatus, addNotification, clearEventLog } = telemetrySlice.actions;
export const { selectEventLog, selectConnectionStatus } = telemetrySlice.selectors;
export default telemetrySlice.reducer;
