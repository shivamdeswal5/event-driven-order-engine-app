# Apex Console — Architecture & Coding Patterns

This document is the single source of truth for folder structure, naming conventions, Redux patterns, component rules, and Docker setup. All code must strictly follow these patterns — they mirror the `residency-frontend` codebase conventions.

---

## 1. Technology Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Server Components, streaming, file-based routing |
| **Language** | TypeScript (strict mode) | Type safety, better IDE support, self-documenting interfaces |
| **UI Library** | shadcn/ui + Tailwind CSS 4 | Headless, accessible, fully themeable, no runtime overhead |
| **State Management** | Redux Toolkit + redux-persist | Predictable state, DevTools, persistence across refreshes |
| **Form Handling** | Manual controlled state (React Hook Form + Zod available as deps but not yet used) | Simple forms in the current console |
| **HTTP Client** | Axios | Interceptors, instance-based config, error handling |
| **WebSocket** | Socket.io-client | Namespace + room support (matches backend NestJS Gateway). Live events reach the browser via a **Redis Socket.io backplane** on the backend — see backend `docs/redis-setup.md` |
| **Topology Visualizer** | @xyflow/react (React Flow) | Node/edge graph, custom nodes, animation support |
| **Animations** | Framer Motion | Declarative spring physics, layout transitions |
| **Charts** | Recharts (dependency; not yet used) | Reserved for future telemetry charts |
| **Theming** | Custom `ThemeProvider` (`src/theme/theme-provider.tsx`) | Light/dark toggle via `data-theme` + CSS vars. `next-themes` is installed but not used |
| **Icons** | lucide-react | Tree-shakeable, consistent icon set |
| **Syntax Highlighting** | highlight.js (dependency; not yet used) | Reserved for event payload JSON viewer |

---

## 2. Folder Structure

```
src/
├── app/                          # Next.js App Router — routing only
│   ├── layout.tsx                # Root layout: StoreProvider, ThemeProvider
│   ├── page.tsx                  # Landing page (/)
│   ├── store-provider.tsx        # Client-side Redux + PersistGate wrapper
│   └── console/
│       ├── layout.tsx            # Console layout (header + panels)
│       ├── page.tsx              # Engineering Console (/console)
│       └── _components/         # Private components for /console route only
│           ├── console-header/
│           │   └── index.tsx
│           ├── left-panel/
│           │   └── index.tsx
│           ├── center-panel/
│           │   └── index.tsx
│           └── right-panel/
│               └── index.tsx
│
├── features/                     # Domain feature slices (vertical slice architecture)
│   ├── catalog/                  # Inventory/product domain
│   │   ├── list-products/
│   │   │   ├── list-products.service.ts
│   │   │   ├── list-products.action.ts
│   │   │   ├── list-products.type.ts
│   │   │   └── list-products.interface.ts
│   │   ├── add-product/
│   │   │   ├── add-product.service.ts
│   │   │   ├── add-product.action.ts
│   │   │   ├── add-product.type.ts
│   │   │   └── add-product.interface.ts
│   │   ├── update-stock/
│   │   │   ├── update-stock.service.ts
│   │   │   ├── update-stock.action.ts
│   │   │   ├── update-stock.type.ts
│   │   │   └── update-stock.interface.ts
│   │   └── catalog.slice.ts
│   │
│   ├── orders/                   # Order domain
│   │   ├── place-order/
│   │   │   ├── place-order.service.ts
│   │   │   ├── place-order.action.ts
│   │   │   ├── place-order.type.ts
│   │   │   └── place-order.interface.ts
│   │   ├── cancel-order/
│   │   │   ├── cancel-order.service.ts
│   │   │   ├── cancel-order.action.ts
│   │   │   ├── cancel-order.type.ts
│   │   │   └── cancel-order.interface.ts
│   │   ├── get-order/
│   │   │   ├── get-order.service.ts
│   │   │   ├── get-order.action.ts
│   │   │   ├── get-order.type.ts
│   │   │   └── get-order.interface.ts
│   │   └── orders.slice.ts
│   │
│   ├── shipments/                # Shipping domain
│   │   ├── ship-order/
│   │   │   ├── ship-order.service.ts
│   │   │   ├── ship-order.action.ts
│   │   │   ├── ship-order.type.ts
│   │   │   └── ship-order.interface.ts
│   │   ├── deliver-order/
│   │   │   ├── deliver-order.service.ts
│   │   │   ├── deliver-order.action.ts
│   │   │   ├── deliver-order.type.ts
│   │   │   └── deliver-order.interface.ts
│   │   └── shipments.slice.ts
│   │
│   ├── telemetry/                # WebSocket event stream + saga state
│   │   ├── socket/
│   │   │   └── telemetry.socket.ts   # Socket.io-client singleton
│   │   └── telemetry.slice.ts
│   │
│   └── ui/                       # Cross-cutting UI state (theme, panels, toggles)
│       └── ui.slice.ts
│
├── components/                   # Shared reusable UI components
│   ├── ui/                       # shadcn/ui generated components (DO NOT edit manually)
│   ├── form/
│   │   ├── text-field/
│   │   │   └── index.tsx
│   │   └── select-field/
│   │       └── index.tsx
│   ├── topology/
│   │   ├── service-node/
│   │   │   └── index.tsx
│   │   ├── exchange-node/
│   │   │   └── index.tsx
│   │   └── topology-canvas/
│   │       └── index.tsx
│   └── theme-toggle/
│       └── index.tsx
│
├── config/
│   └── axios.ts                  # Axios instance (axiosInstance)
│
├── common/                       # Shared enums, types, utils not tied to any feature
│   ├── order-status.enum.ts
│   ├── saga-event.enum.ts
│   └── api-response.type.ts
│
├── store/
│   ├── store.ts                  # configureStore, makeStore, persistReducer
│   ├── hooks.ts                  # useAppDispatch, useAppSelector, useAppStore
│   ├── create-app-slice.ts       # createAppSlice utility (buildCreateSlice)
│   └── index.ts                  # barrel export
│
└── theme/
    └── theme-provider.tsx        # custom light/dark ThemeProvider (data-theme + CSS vars)
```

> **Note (current vs target):** The tree above is the target convention. The current
> implementation differs in a few places: there is no `console/layout.tsx`, no
> `components/form/`, `components/topology/`, `components/theme-toggle/`, or
> `theme/tokens.ts`; `catalog/add-product` and `catalog/update-stock` are not built; and
> route-private console panels live under `src/app/console/_components/`
> (`order-playground/`, `topology-visualizer/`, `stats-ribbon/`, `awaiting-events-deck/`,
> plus an unused `console-header/`). Additional persisted slices exist: `notifications`
> and `health`. See [implementation-plan.md](implementation-plan.md) for the built-vs-planned status.

---

## 3. Feature Vertical Slice Pattern

Every API operation lives in its own subfolder inside the feature domain. Each subfolder contains exactly these files:

```
features/<domain>/<operation>/
  <operation>.service.ts    → Axios network call
  <operation>.action.ts     → createAsyncThunk wrapper
  <operation>.type.ts       → Action type string constant
  <operation>.interface.ts  → Request/response TypeScript interfaces
```

### A. Type File (`<operation>.type.ts`)
A single exported constant — the Redux action type string.
```typescript
export const placeOrderType = "orders/placeOrder";
```

### B. Interface File (`<operation>.interface.ts`)
Request and response TypeScript interfaces. No logic.
```typescript
export interface PlaceOrderRequest {
  customerId: string;
  items: { productId: string; quantity: number; price: number }[];
}

export interface PlaceOrderResponse {
  message: string;
  id: string; // backend returns { message, id }
}
```

### C. Service File (`<operation>.service.ts`)
Pure Axios call. No Redux. No error handling.
```typescript
import { axiosInstance } from "@/config/axios";
import { PlaceOrderRequest } from "./place-order.interface";

export const placeOrderService = (payload: PlaceOrderRequest) =>
  axiosInstance.post("/api/orders", payload);
```

### D. Action File (`<operation>.action.ts`)
`createAsyncThunk` that calls the service and handles errors with `rejectWithValue`.
```typescript
import { createAsyncThunk } from "@reduxjs/toolkit";
import { placeOrderType } from "./place-order.type";
import { placeOrderService } from "./place-order.service";
import { PlaceOrderRequest } from "./place-order.interface";

export const placeOrderAction = createAsyncThunk(
  placeOrderType,
  async (payload: PlaceOrderRequest, { rejectWithValue }) => {
    try {
      const res = await placeOrderService(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);
```

---

## 4. Redux Slice Pattern

### A. `createAppSlice` Utility (`store/create-app-slice.ts`)
```typescript
import { asyncThunkCreator, buildCreateSlice } from "@reduxjs/toolkit";

export const createAppSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});
```

### B. Domain Slice (`features/<domain>/<domain>.slice.ts`)
- Use `createAppSlice`, not the raw `createSlice`.
- Define `selectors` inside the slice config — export them from the slice.
- Hold data state only. No generic `isLoading` unless the feature truly needs it.

```typescript
import { createAppSlice } from "@/store/create-app-slice";
import { placeOrderAction } from "./place-order/place-order.action";
import { Order } from "@/common/order-status.enum";

type OrdersState = {
  activeOrderId: string | null;
  orders: Order[];
};

const initialState: OrdersState = {
  activeOrderId: null,
  orders: [],
};

export const ordersSlice = createAppSlice({
  name: "orders",
  initialState,
  reducers: {
    setActiveOrderId: (state, action) => {
      state.activeOrderId = action.payload;
    },
  },
  selectors: {
    selectActiveOrderId: (state) => state.activeOrderId,
    selectAllOrders: (state) => state.orders,
  },
  extraReducers: (builder) => {
    builder.addCase(placeOrderAction.fulfilled, (state, action) => {
      state.activeOrderId = action.payload.id;
    });
  },
});

export default ordersSlice.reducer;
export const { setActiveOrderId } = ordersSlice.actions;
export const { selectActiveOrderId, selectAllOrders } = ordersSlice.selectors;
```

### C. Store (`store/store.ts`)

Two implementation details matter here:

1. **SSR-safe storage** — a noop storage is returned on the server (no `localStorage`), the
   real `localStorage` on the client, avoiding the redux-persist sync-storage warning.
2. **Versioned persistence** — `version` + `migrate` invalidate any stale persisted shape.
   Bump `PERSIST_VERSION` whenever a persisted slice's shape changes so old data can't
   rehydrate into a broken shape (this is what previously caused `orders.filter is not a function`).

```typescript
import { combineSlices, configureStore } from "@reduxjs/toolkit";
import {
  persistReducer,
  persistStore,
  createMigrate,
  Persistor,
} from "redux-persist";
import createWebStorage from "redux-persist/es/storage/createWebStorage";
// ...slice imports

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

const PERSIST_VERSION = 1;
const migrations = {
  0: () => undefined, // drop any pre-versioned persisted state
};

const persistConfig = {
  key: "root",
  version: PERSIST_VERSION,
  storage,
  // Blacklist transient state — never persist live event streams or loading flags
  blacklist: ["telemetry", "ui", "health", "notifications"],
  migrate: createMigrate(migrations, { debug: false }),
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () =>
  configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });

export const store = makeStore();
export const persistor: Persistor = persistStore(store);

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
```

> **Defensive selectors:** Because `catalog`, `orders`, and `shipments` are persisted,
> their array selectors guard against a corrupt rehydrated value, e.g.
> `selectAllOrders: (state) => Array.isArray(state.orders) ? state.orders : []`.

### D. Typed Hooks (`store/hooks.ts`)
```typescript
import { useDispatch, useSelector, useStore } from "react-redux";
import type { AppDispatch, AppStore, RootState } from "./store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
```

---

## 5. Component Rules

- **Shared components** → `src/components/<category>/<component-name>/index.tsx`
- **Page-private components** → `src/app/<route>/_components/<component-name>/index.tsx`
- **Max component length**: 200 lines. If longer, extract into `_components/`.
- **JSX must be clean**: No inline business logic. Move to a custom hook in the same folder.
- **Forms**: React Hook Form + Zod is the target convention (schema outside the component). The current console forms (e.g. `OrderPlayground`) still use manual controlled state — migrate them to RHF + Zod when touched.
- **shadcn components**: Live in `src/components/ui/`. Never edit them directly — extend via wrapper components in `src/components/`.

---

## 6. Axios Configuration (`config/axios.ts`)

Single named instance. No auth interceptors needed (this project has no authentication).

```typescript
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);
```

---

## 7. WebSocket Socket Configuration (`features/telemetry/socket/telemetry.socket.ts`)

The Socket.io namespace is part of the connection URL (not a `namespace` option), and the
server URL comes from `NEXT_PUBLIC_WS_URL`:

```typescript
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getTelemetrySocket(): Socket {
  if (socket?.connected) return socket;

  const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:8080";
  socket = io(`${WS_URL}/notifications`, {
    transports: ["websocket"],
    autoConnect: false,
  });

  return socket;
}

export function closeTelemetrySocket(): void {
  socket?.disconnect();
  socket = null;
}
```

---

## 8. File Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Feature operation folders | `kebab-case` | `place-order/` |
| Feature files | `<operation>.<role>.ts` | `place-order.action.ts` |
| Slice files | `<domain>.slice.ts` | `orders.slice.ts` |
| Component folders | `kebab-case` | `service-node/` |
| Component files | `index.tsx` | `index.tsx` |
| Enum files | `<name>.enum.ts` | `order-status.enum.ts` |
| Interface files | `<name>.interface.ts` | `place-order.interface.ts` |
| Type string files | `<name>.type.ts` | `place-order.type.ts` |
| Page files | Next.js convention | `page.tsx`, `layout.tsx` |

---

## 9. Docker Setup

### Development
```
Dockerfile.dev   → Lightweight Alpine image, mounts local volume, runs `next dev`
docker-compose.yml → Joins `order-engine-shared-network` (same network as backend containers)
```

### Production
```
Dockerfile       → Multi-stage build: builder stage + lightweight runner stage (standalone output)
```

### Environment Variables
```bash
# .env.example
PORT=3000
NODE_ENV=development
APP_FORWARD_PORT=3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080   # When running locally
NEXT_PUBLIC_WS_URL=http://localhost:8080        # Socket.io server URL
```

---

## 10. SOLID Principles

| Principle | Rule |
|---|---|
| **Single Responsibility** | One file = one concern. Service files only call APIs. Action files only wrap thunks. |
| **Open/Closed** | Extend shadcn components via wrapper components, never by modifying `src/components/ui/` files. |
| **Liskov Substitution** | Wrapper components must forward all props and refs from their underlying primitive. |
| **Interface Segregation** | Props interfaces contain only what the component actually uses. No "catch-all" prop objects. |
| **Dependency Inversion** | Components depend on custom hooks and props — not on inline store dispatches or API calls. |
