import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore, Persistor } from "redux-persist";
import createWebStorage from "redux-persist/es/storage/createWebStorage";
import catalogReducer from "@/features/catalog/catalog.slice";
import ordersReducer from "@/features/orders/orders.slice";
import shipmentsReducer from "@/features/shipments/shipments.slice";
import telemetryReducer from "@/features/telemetry/telemetry.slice";
import uiReducer from "@/features/ui/ui.slice";

/**
 * Returns a noop storage object during SSR (server has no localStorage),
 * and the real localStorage-backed storage on the client.
 * This prevents the "redux-persist failed to create sync storage" warning.
 */
function createClientStorage() {
  if (typeof window === "undefined") {
    return {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    };
  }
  return createWebStorage("local");
}

const storage = createClientStorage();

const rootReducer = combineSlices({
  catalog: catalogReducer,
  orders: ordersReducer,
  shipments: shipmentsReducer,
  telemetry: telemetryReducer,
  ui: uiReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const persistConfig = {
  key: "root",
  storage,
  blacklist: ["telemetry", "ui"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () =>
  configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });

export const store = makeStore();
export const persistor: Persistor = persistStore(store);

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
