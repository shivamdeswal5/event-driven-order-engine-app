import { createAppSlice } from "@/store/create-app-slice";
import { getHealthAction } from "./get-health/get-health.action";
import { HealthResponse } from "./get-health/get-health.interface";

export interface HealthState {
  data: HealthResponse | null;
  loading: boolean;
}

const initialState: HealthState = {
  data: null,
  loading: false,
};

export const healthSlice = createAppSlice({
  name: "health",
  initialState,
  reducers: {},
  selectors: {
    selectHealthData: (state) => state.data,
    selectHealthLoading: (state) => state.loading,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getHealthAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(getHealthAction.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(getHealthAction.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { selectHealthData, selectHealthLoading } = healthSlice.selectors;
export default healthSlice.reducer;
