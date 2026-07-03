import { createAppSlice } from "@/store/create-app-slice";
import { ShipmentStatus } from "@/common/shipment-status.enum";

export interface Shipment {
  id: string;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  status: ShipmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ShipmentsState {
  shipments: Shipment[];
}

const initialState: ShipmentsState = {
  shipments: [],
};

export const shipmentsSlice = createAppSlice({
  name: "shipments",
  initialState,
  reducers: {},
  selectors: {
    selectAllShipments: (state) => state.shipments,
  },
});

export const { selectAllShipments } = shipmentsSlice.selectors;
export default shipmentsSlice.reducer;
