import { createAppSlice } from "@/store/create-app-slice";
import { PayloadAction } from "@reduxjs/toolkit";

export interface LogMessage {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  correlationId: string;
  causationId: string;
  payload: Record<string, any>;
  status: "success" | "pending" | "failed";
}

export interface TelemetryState {
  eventLog: LogMessage[];
  connectionStatus: "connected" | "disconnected" | "connecting";
  activeSagasCount: number;
  completedSagasCount: number;
  failedSagasCount: number;
}

const initialState: TelemetryState = {
  eventLog: [],
  connectionStatus: "disconnected",
  activeSagasCount: 0,
  completedSagasCount: 0,
  failedSagasCount: 0,
};

export const telemetrySlice = createAppSlice({
  name: "telemetry",
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<"connected" | "disconnected" | "connecting">) => {
      state.connectionStatus = action.payload;
    },
    addLogMessage: (state, action: PayloadAction<LogMessage>) => {
      state.eventLog.unshift(action.payload);
      if (state.eventLog.length > 100) {
        state.eventLog.pop();
      }
    },
    updateMetrics: (state, action: PayloadAction<{ active: number; completed: number; failed: number }>) => {
      state.activeSagasCount = action.payload.active;
      state.completedSagasCount = action.payload.completed;
      state.failedSagasCount = action.payload.failed;
    },
  },
  selectors: {
    selectEventLog: (state) => state.eventLog,
    selectConnectionStatus: (state) => state.connectionStatus,
    selectTelemetryMetrics: (state) => ({
      active: state.activeSagasCount,
      completed: state.completedSagasCount,
      failed: state.failedSagasCount,
    }),
  },
});

export const { setConnectionStatus, addLogMessage, updateMetrics } = telemetrySlice.actions;
export const { selectEventLog, selectConnectionStatus, selectTelemetryMetrics } = telemetrySlice.selectors;
export default telemetrySlice.reducer;
