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

1. **Active WebSocket Subscription**:
   - The frontend connects to the Socket.io namespace `/notifications`.
   - When an order is placed, the client emits `subscribeToOrder` with the `orderId` to listen to room-specific saga phase updates.
2. **React Flow Dynamic Topology Rendering**:
   - The visualizer displays the exact backend RabbitMQ topology, including all exchanges (`order-exchange`, `inventory-exchange`, etc.), queues, and binding keys.
   - React Flow nodes and edges are mapped dynamically to state selectors. When a new WebSocket notification event arrives, the specific path (Exchange → Queue) pulses to reflect the message routing in real-time.

3. **Event-Driven Cache Invalidation**:
   - The UI does not use interval polling to fetch active orders or notifications. Instead, it uses a hybrid approach: HTTP `GET` requests on initial component mount to load existing state, followed by WebSocket updates for real-time changes. When a relevant WebSocket event is received, specific data segments are re-fetched. This is the industry-standard approach for real-time dashboards at companies like Stripe and Netflix.

---

## 3. MNC / Senior Frontend Interview Q&A

### Q1: Why did you choose Socket.io instead of native WebSockets for this console?
**Answer:**
"Socket.io was chosen for its production-grade resilience features. It provides **automatic reconnection** out of the box if connection is lost, and supports **HTTP long-polling fallback** in environments where WebSockets are blocked by corporate proxies or firewalls. Furthermore, it supports **namespaces and rooms**, allowing the client to subscribe to specific order rooms (e.g., `socket.emit('subscribeToOrder', { orderId })`) directly, reducing network chatter by only receiving events relevant to the active tracking view."

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
"Interval polling creates unnecessary load on the database and introduces latency. Instead, we use an **Event-Driven Cache Invalidation** approach. The frontend fetches the initial state via a REST HTTP `GET` call on page mount. It then subscribes to a specific order's WebSocket room. We only trigger subsequent `GET` requests when the WebSocket notifies us of a state change for that specific order. This guarantees zero-latency UI updates while minimizing backend traffic. It's the same pattern used by high-performance financial dashboards."

---

### Q4: If the RabbitMQ consumer fails mid-saga (e.g., Inventory is out of stock), how does the frontend console visualize it?
**Answer:**
"When a consumer processing step fails, the affected service (e.g. Inventory Service) writes an `inventory.reservation-failed` event to its outbox using the `shared_schema` outbox table. Once dispatched by the cron worker, this event routes through the `inventory-exchange` to the `order-queue`, triggering the Order saga to initiate compensations. 
The frontend WebSocket stream receives this exception event instantly via the `notification-queue` (which acts as a terminal listener to all exchanges). The UI updates the saga timeline to branch into the compensation path (e.g., `CANCELLED`), and the **Topology Visualizer** highlights the error routing path, providing instant visual feedback on distributed fault recovery."

---

### Q5: How is the folder structure organized, and why?
**Answer:**
"The frontend follows a strict **Vertical Slice Architecture** inspired by the backend's modular structure. Feature domains (such as `telemetry`, `catalog`, `orders`, and `ui`) have their own encapsulated directory (`src/features/<domain>/`) containing their private components, Redux slices, types, and APIs. This ensures that features are highly cohesive, easy to locate, and completely decoupled from other parts of the codebase, which scales extremely well in large MNC engineering teams."
