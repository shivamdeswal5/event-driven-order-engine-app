# Frontend Architecture & Coding Patterns Guidelines

This document serves as the single source of truth for code structure, React/Next.js components, SOLID design rules, and Redux state management patterns. It is modeled directly after the `residency-frontend` codebase.

---

## 1. Folder Structure & Routing Architecture

* Use `src/app` only for routing, layouts, pages, loading/error/not-found boundaries, and route-local components.
* Use `src/features` for domain/feature logic (vertical slices).
* Use `src/components` for shared, reusable UI components not tied to any single route.
* Use `src/auth`, `src/config`, `src/store`, `src/theme`, `src/localization`, and `src/common` as cross-cutting platform layers.

### Feature Vertical Slices (`src/features/`)
Each domain model has its own directory inside `features/`. Every operation (e.g., placing an order, listing notifications) is separated into its own folder containing exactly four dedicated files:
```text
features/
  <domain>/
    <operation>/
      <operation>.service.ts    # Executes the Axios network request
      <operation>.action.ts     # Redux Async Thunk wrapper
      <operation>.type.ts       # Action type string constant
      <operation>.interface.ts  # Request and response interfaces/types
    <domain>.slice.ts           # The Redux slice for the domain
```

### Operation Code Templates

#### A. Type File (`<operation>.type.ts`)
```typescript
export const createOrderType = "POST/CREATE_ORDER";
```

#### B. Interface File (`<operation>.interface.ts`)
```typescript
export type CreateOrderRequest = {
  productId: string;
  quantity: number;
  customerName: string;
};

export type CreateOrderResponse = {
  id: string;
  status: string;
  createdAt: string;
};
```

#### C. Service File (`<operation>.service.ts`)
```typescript
import { axiosInterceptorInstanceClient } from "@/config/axios";
import { CreateOrderRequest } from "./create-order.interface";

export const createOrderService = (payload: CreateOrderRequest) =>
  axiosInterceptorInstanceClient.post("/orders", payload);
```

#### D. Action File (`<operation>.action.ts`)
```typescript
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { CreateOrderRequest } from "./create-order.interface";
import { createOrderService } from "./create-order.service";
import { createOrderType } from "./create-order.type";

export const createOrderAction = createAsyncThunk(
  createOrderType,
  async (payload: CreateOrderRequest, { rejectWithValue }) => {
    try {
      const res = await createOrderService(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err as AxiosError);
    }
  }
);
```

---

## 2. Redux Slice & Setup Patterns

All slices are built using the `createAppSlice` utility to integrate standard RTK async thunks.

### A. The `createAppSlice` Utility (`store/create-app-slice.ts`)
```typescript
import { asyncThunkCreator, buildCreateSlice } from "@reduxjs/toolkit";

export const createAppSlice = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});
```

### B. Domain Slices (`features/<domain>/<domain>.slice.ts`)
* Hold **data state only**. No generic loading or error flags.
- Define selectors inside the `selectors` property of the `createAppSlice` and export them.
```typescript
import { createAppSlice } from "@/store/create-app-slice";
import { PayloadAction } from "@reduxjs/toolkit";
import { createOrderAction } from "./create-order/create-order.action";

type InitialStateProps = {
  orders: any[];
};

const initialState: InitialStateProps = {
  orders: [],
};

export const orderSlice = createAppSlice({
  name: "order",
  initialState,
  reducers: {},
  selectors: {
    selectAllOrders: (state) => state.orders,
  },
  extraReducers: (builder) => {
    builder.addCase(createOrderAction.fulfilled, (state, action) => {
      state.orders.push(action.payload);
    });
  },
});

export default orderSlice.reducer;
export const { selectAllOrders } = orderSlice.selectors;
```

### C. Redux Store & Persist Setup (`store/store.ts`)
- Use `combineSlices` from Redux Toolkit to merge domain slices.
- Use `redux-persist` to save state that must survive refresh.
- Blacklist temporary/transient states (e.g. notifications, loading markers, permissions).
```typescript
import { combineSlices, configureStore } from "@reduxjs/toolkit";
import { Persistor, persistReducer, persistStore } from "redux-persist";
import createWebStorage from "redux-persist/es/storage/createWebStorage";
import orderReducer from "@/features/order/order.slice";

const storage = createWebStorage("local");

const rootReducer = combineSlices({
  order: orderReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const persistConfig = {
  key: "root",
  storage,
  blacklist: [], // Add temporary/transient slices here
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const makeStore = () => {
  return configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  });
};

export const store = makeStore();
export const persistor: Persistor = persistStore(store);

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
```

### D. Typed Hooks (`store/hooks.ts`)
```typescript
import { useDispatch, useSelector, useStore } from "react-redux";
import type { AppDispatch, AppStore, RootState } from "./store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
```

---

## 3. Component & Form Guidelines

* **Component Size**: Keep components small (`< 300` lines). Break large JSX structures into subcomponents inside a local `_components/` directory.
* **Modals & Dialogs**: Create modal and dialog components in separate files rather than declaring inline.
* **Separation of Logic**: Keep JSX free of business logic. Move logic into handler functions or custom hooks.
* **Form Validation**: Always use **React Hook Form + Zod resolver**. Define schemas outside of the component file. Use error messages returned from Zod rather than hardcoded string messages.

---

## 4. SOLID Principles

* **S (Single Responsibility)**: Split business logic, data fetching, and rendering. Each custom hook must have a single focused purpose.
* **O (Open/Closed)**: Add visual variations via class-variance-authority (`cva`) variants rather than modifying base components.
* **L (Liskov Substitution)**: Ensure custom wrappers inherit and respect all props, event handlers, and refs of their underlying UI primitives.
* **I (Interface Segregation)**: Prop interfaces should be lean, passing only what is explicitly utilized by the child.
* **D (Dependency Inversion)**: Components must depend on props and custom hooks, not inline store dispatches or API calls.
