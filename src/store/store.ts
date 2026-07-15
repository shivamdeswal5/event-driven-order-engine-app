import { combineSlices, configureStore } from "@reduxjs/toolkit";
import {
  persistReducer,
  persistStore,
  createMigrate,
  Persistor,
} from "redux-persist";
import createWebStorage from "redux-persist/es/storage/createWebStorage";
import catalogReducer from "@/features/catalog/catalog.slice";
import ordersReducer from "@/features/orders/orders.slice";
import shipmentsReducer from "@/features/shipments/shipments.slice";
import telemetryReducer from "@/features/telemetry/telemetry.slice";
import notificationsReducer from "@/features/notifications/notifications.slice";
import healthReducer from "@/features/health/health.slice";
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
  notifications: notificationsReducer,
  health: healthReducer,
  ui: uiReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

/**
 * Bumping `version` invalidates any persisted state written under an older
 * store shape. The migration below discards stale state entirely, which
 * prevents corrupt shapes (e.g. `orders` rehydrated as a non-array) from
 * crashing the UI. Bump the version whenever a persisted slice shape changes.
 */
const PERSIST_VERSION = 1;

const migrations = {
  // Drop any pre-versioned persisted state so it re-hydrates from initialState.
  0: () => undefined,
};

const persistConfig = {
  key: "root",
  version: PERSIST_VERSION,
  storage,
  blacklist: ["telemetry", "ui", "health", "notifications"],
  migrate: createMigrate(migrations, { debug: false }),
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
