# Architectural Observability & Interview Preparation Guide

This guide details the technical design of the **Apex Console** frontend observability interface, outlines how it integrates with the event-driven order engine backend, and provides a set of senior/MNC level interview questions and answers to help you explain these systems during hiring loops.

---

## 1. Architectural Concepts & End-to-End Workflow

### The Transactional Outbox Pattern
In traditional microservice architectures, developers often write to a database and then immediately publish an event to a message broker (like RabbitMQ) in the same API request. This is an anti-pattern. If the database write succeeds but the network call to RabbitMQ fails, the system enters an inconsistent state.

The **Transactional Outbox Pattern** resolves this by saving the event directly to a local `outbox_message` table in the database within the *same* database transaction as the business entity (the `Order`). 

```
[ POST /api/orders ]
         │
         ▼
 ┌─────────────── Database Transaction ───────────────┐
 │ 1. Save Order (PENDING)                            │
 │ 2. Save OutboxMessage (dispatched = false)         │
 └────────────────────────────────────────────────────┘
         │
         ▼ (Transaction Commits)
 [ Cron Sweeper / Dispatcher API ]
         │
         ▼
 ┌────────────────────────────────────────────────────┐
 │ 1. Query undispatched messages                     │
 │ 2. Publish to RabbitMQ exchange                   │
 │ 3. On Publisher Confirm -> Set dispatched = true   │
 └────────────────────────────────────────────────────┘
```

Because database transactions are ACID-compliant, the event is guaranteed to be saved if and only if the order is saved. This eliminates dual-write failures and forms the foundation of **eventual consistency**.

---

## 2. Frontend Design & Observability Console

The Apex Console is designed to visualize this distributed event lifecycle in real time:

```
                  ┌───────────────────────┐
                  │   NestJS Gateway      │
                  └──────────┬────────────┘
                             │ (WebSockets via Namespace "/notifications")
                             ▼
                  ┌───────────────────────┐
                  │ Redux Telemetry Slice │
                  └──────────┬────────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌───────────────────────┐         ┌───────────────────────┐
│ Topology Visualizer   │         │ Telemetry Ledger      │
│ (React Flow Nodes)    │         │ (Chronological logs)  │
└───────────────────────┘         └───────────────────────┘
```

1. **Two-channel WebSocket delivery**:
   - The frontend connects to the Socket.io namespace `/notifications`.
   - On connect, the server auto-joins every client to the **`saga:firehose`** room. Events on the **`saga-event`** channel drive the **topology visualizer** and **Event Flow Log** — the complete saga stream with no per-order join race.
   - For order-scoped UX, the client additionally emits `subscribeToOrder` with an `orderId`; events on the **`notification`** channel in room `order:<id>` drive **toasts only**.
   - **Cross-process delivery:** both channels are produced by the notification consumer in a **separate backend process** from the WebSocket server. They reach the browser through a **Redis Socket.io backplane** (`@socket.io/redis-adapter` / `-emitter`). Without Redis, live events are silently dropped. Full write-up: backend `docs/redis-setup.md` and `docs/websocket-setup.md`.
2. **React Flow Dynamic Topology Rendering**:
   - The visualizer displays the backend RabbitMQ topology: exchanges, queues, routing keys, and consumer swimlanes.
   - When a `saga-event` arrives, matching edges pulse for ~1.8s and an entry is appended to the Event Flow Log sidebar. Event keys strip the `Event` suffix before lookup (e.g. `OrderPlacedEvent` → `orderplaced`).

3. **Event-Driven Cache Invalidation**:
   - On each `saga-event`, `useTelemetrySocket` re-fetches the affected order, product catalog, and notification feed. Toasts fire on `notification` only.
   - **[Current implementation note]** A **3-second polling fallback** (`listOrdersAction` + `listNotificationsAction`) still runs alongside WebSocket invalidation as a safety net.

---

## 3. MNC / Senior Frontend Interview Q&A

### Q1: Why did you choose Socket.io instead of native WebSockets for this console?
**Answer:**
"Socket.io was chosen for its production-grade resilience features: automatic reconnection, HTTP long-polling fallback behind corporate proxies, and first-class **namespaces and rooms**. We use two delivery patterns on the same namespace: a **`saga:firehose` room** (auto-joined on connect) that streams every saga event to the observability console via `saga-event`, and **per-order rooms** (`order:<id>`) for targeted `notification` toasts. That split keeps the topology complete without racing the saga's first events, while still allowing order-scoped UX."

---

### Q2: High-frequency telemetry streams can degrade React performance. How did you optimize state updates and rendering on the console?
**Answer:**
"High-frequency websocket messages can cause severe rendering bottlenecks. To optimize this:
1. **Redux Persist Blacklisting**: Telemetry state is blacklisted from Redux-Persist. This prevents blocking disk-write operations to `localStorage` on every telemetry event.
2. **Queue Throttling / Capping**: The telemetry slice limits the event log queue to a maximum of 100 entries (`state.eventLog.pop()`), ensuring memory usage remains constant.
3. **Component Memoization**: React Flow nodes and details expansion logs are decoupled. State selectors are highly specific (using Reselect-like select state properties) so that only affected sub-components re-render when a new event arrives, preventing a full console component tree layout recalculation."

---

### Q3: Why don't you use regular interval polling to check for saga updates?
**Answer:**
"Interval polling creates unnecessary load and latency. Our design is **event-driven cache invalidation**: REST on mount for initial state, then **`saga-event`** WebSocket pushes to drive the topology and trigger targeted re-fetches (order, catalog, notifications). Per-order **`notification`** events handle toasts only. A short 3-second polling fallback still runs as a safety net, but the primary path is push-based — the same pattern used by high-performance financial dashboards."

---

### Q4: If the RabbitMQ consumer fails mid-saga (e.g., Inventory is out of stock), how does the frontend console visualize it?
**Answer:**
"When a consumer processing step fails, the affected service (e.g. Inventory Service) writes an `inventory.reservation-failed` event to **its own** `outbox_messages` table inside its module schema (`inventory_schema`) — each module owns its own outbox/inbox tables rather than sharing a central one. Once dispatched by the cron worker, this event routes through the `inventory-exchange` to the `order-queue`, triggering the Order saga to initiate compensations. 
The frontend **`saga-event`** firehose receives this exception event instantly via the `notification-queue`. The UI updates the saga timeline to branch into the compensation path (e.g., `CANCELLED`), and the **Topology Visualizer** highlights the error routing path.

---

### Q5: Why does the order stay PAID after shipment is created? When does it become SHIPPED?
**Answer:**
"This is intentional saga choreography. `PaymentCompletedEvent` causes Shipping to create a shipment in `PENDING` state and emit `ShipmentCreatedEvent`, but the **Order module does not consume that event** — the order stays `PAID` awaiting operator dispatch. When the operator calls `POST /api/shipments/:orderId/ship`, Shipping emits `ShipmentShippedEvent`, which the Order module consumes to transition to `SHIPPED`. Deliver works the same way via `ShipmentDeliveredEvent`. This keeps shipment state and order state synchronized and mirrors how real courier updates arrive asynchronously."

---

### Q6: How is the folder structure organized, and why?
**Answer:**
"The frontend follows a strict **Vertical Slice Architecture** inspired by the backend's modular structure. Feature domains (such as `telemetry`, `catalog`, `orders`, and `ui`) have their own encapsulated directory (`src/features/<domain>/`) containing their private components, Redux slices, types, and APIs. This ensures that features are highly cohesive, easy to locate, and completely decoupled from other parts of the codebase, which scales extremely well in large MNC engineering teams."
