# Console Redesign Plan — Apex Observability Console (Final)

> **Status (2026-07-14):** This was the redesign plan; the console has since been built and
> the fake-saga/dead-toggle problems below are resolved. A few items landed differently from
> this plan and are flagged inline with **[Current:]** notes:
> - The console is a **responsive stacked layout** in a `max-w-[1600px]` container
>   (`Header` → `StatsRibbon` → `OrderPlayground` → `ObservabilityDeck`), not the header +
>   left/right + full-width layout drawn below.
> - `SagaTimeline` and `NotificationFeed` were **not** built as separate panels — the saga
>   stepper is a tab inside `OrderPlayground`, and the topology + notification ledger are now
>   the two tabs of the **`ObservabilityDeck`** (`_components/observability-deck`), with the
>   ledger extracted into its own **`EventStream`** component (`_components/event-stream`).
> - A **3-second polling fallback** currently runs alongside WebSocket invalidation.
> - Live WebSocket delivery works via a **Redis Socket.io backplane** (backend
>   `docs/redis-setup.md`); before this, events from the separate notification consumer
>   process never reached the browser.
> - Shipping manual steps use **`POST /api/shipments/:orderId/ship`** and
>   **`.../deliver`**, not `PATCH .../status`.
> - The order status model is **coarse** (`PENDING, PLACED, PAID, SHIPPED, DELIVERED,
>   CANCELLED`) — the finer `INVENTORY_RESERVED / PAYMENT_PROCESSING / SHIPPING /
>   CANCELLING` states in this doc are not real backend statuses.

## The Core Problem With The Current Console

The current console is architecturally dishonest:
- **Fake saga flow**: clicking "Submit Saga Transaction" runs a local `setTimeout` loop — no real API call
- **Dead Monolith/Microservices toggle**: your backend is a **modular monolith** — removing this entirely
- **Chaos Monkey controls**: fire and forget with no backend integration
- **WebSocket subscribed to namespace but never joined a room** — so no events ever arrive
- **OutboxConveyor polls `/api/outbox/messages`** — this endpoint doesn't exist
- **TelemetryLedger** shows Redux-stored fake events

---

## Ground Truth: What The Backend Actually Does

### 1. Real API Contracts (all at `http://localhost:8080`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/health` | Database + RabbitMQ health check (note: not under `/api`) |
| `POST` | `/api/orders` | Place order → triggers whole saga |
| `GET` | `/api/orders` | List orders (`?status=&limit=&offset=`; returns `{ items, total }`) |
| `GET` | `/api/orders/:id` | Get single order |
| `POST` | `/api/orders/:id/cancel` | Cancel order → triggers compensation saga |
| `GET` | `/api/products` | List products (Inventory module) |
| `POST` | `/api/products` | Add product |
| `PATCH` | `/api/products/:id/stock` | Adjust stock |
| `GET` | `/api/payments` | List payments |
| `GET` | `/api/payments/:orderId` | Get payment for an order |
| `GET` | `/api/shipments` | List shipments |
| `GET` | `/api/shipments/:orderId` | Get shipment for an order |
| `POST` | `/api/shipments/:orderId/ship` | Mark shipment SHIPPED (body: `{ carrier, trackingNumber }`) |
| `POST` | `/api/shipments/:orderId/deliver` | Mark shipment DELIVERED (no body) |
| `GET` | `/api/notifications` | List notifications (`?orderId=&limit=&offset=`; `orderId` filters by order) |

### 2. Real WebSocket Contract (Socket.io)

```
Server: http://localhost:8080
Namespace: /notifications

CLIENT → SERVER:
  event: "subscribeToOrder"
  data:  { orderId: string }

SERVER → CLIENT (acknowledgement):
  event: "subscribed"
  data:  { room: "order:<id>", success: true }

SERVER → CLIENT (real-time saga push, from NotificationBroadcaster.broadcastToOrder via the Redis backplane):

  # Targeted — order-scoped toasts only
  event: "notification"
  data:  {
    orderId:   string,
    eventType: string,    // e.g. "OrderPlacedEvent", "PaymentCompletedEvent"
    message:   string,
    occurredAt: Date
  }

  # Observability firehose — drives topology + Event Flow Log (auto-joined on connect)
  event: "saga-event"
  data:  { orderId, eventType, message, occurredAt }   // same payload shape
```

**Critical flow**: When `POST /api/orders` succeeds → immediately call
`socket.emit("subscribeToOrder", { orderId: createdOrder.id })` to join the room.

### 3. Real Order Status Progression

The **order** entity has a coarse status set; the intermediate saga steps (inventory
reserved, payment processing, etc.) live in the other modules' own entities/events, not on
the order status.

```
PENDING → PLACED → PAID → SHIPPED → DELIVERED
             ↘        ↘
         CANCELLED  CANCELLED
    (compensation on inventory/payment failure or user cancel;
     not allowed once SHIPPED/DELIVERED)
```

Order status enum (`OrderStatus`): `PENDING, PLACED, PAID, CANCELLED, SHIPPED, DELIVERED`.

### 4. Complete RabbitMQ Topology — Exact Naming from Backend Source

#### Exchanges (exact names from `*.message-destination.ts`)

| Exchange Name | Type | Publisher Module | Events Routed Through |
|---|---|---|---|
| `order-exchange` | **topic** | Order | `OrderPlacedEvent`, `OrderCancelledEvent` |
| `inventory-exchange` | **topic** | Inventory | `InventoryReservedEvent`, `InventoryReservationFailedEvent`, `InventoryReleasedEvent` |
| `payment-exchange` | **topic** | Payment | `PaymentCompletedEvent`, `PaymentFailedEvent` |
| `shipping-exchange` | **topic** | Shipping | `ShipmentCreatedEvent`, `ShipmentShippedEvent`, `ShipmentDeliveredEvent` |
| `order-fanout-exchange` | **fanout** | Order | `OrderCancelledEvent` (broadcast to ALL) |
| `*-retry-exchange` (per module) | **direct** | Internal retry | Dead-letter re-queuing |

#### Queues + Bindings (exact from `*SignatureTypes`)

| Queue | Module | Binds to Exchange | Binding/Routing Key |
|---|---|---|---|
| `order-queue` | Order | `inventory-exchange` | `inventory.reservation-failed` |
| `order-queue` | Order | `payment-exchange` | `payment.completed` |
| `order-queue` | Order | `payment-exchange` | `payment.failed` |
| `order-queue` | Order | `shipping-exchange` | `shipping.shipped` |
| `order-queue` | Order | `shipping-exchange` | `shipping.delivered` |
| `inventory-queue` | Inventory | `order-exchange` | `order.placed` |
| `inventory-queue` | Inventory | `order-fanout-exchange` | — (fanout, no key) |
| `payment-queue` | Payment | `inventory-exchange` | `inventory.reserved` |
| `payment-queue` | Payment | `order-fanout-exchange` | — (fanout, no key) |
| `shipping-queue` | Shipping | `payment-exchange` | `payment.completed` |
| `shipping-queue` | Shipping | `order-fanout-exchange` | — (fanout, no key) |
| `notification-queue` | **Notification** | **ALL exchanges** | `order.placed`, `inventory.reserved`, `inventory.reservation-failed`, `payment.completed`, `payment.failed`, `shipping.created`, `shipping.shipped`, `shipping.delivered`, `order.cancelled`, `inventory.released` |

> **Important**: The Notification module is a **terminal consumer** — it subscribes to EVERY event in the system and broadcasts them over WebSocket. It does NOT publish any events back. This is why the WebSocket works end-to-end.

#### Per-Module Inbox/Outbox Tables (Schema-Level Isolation)

Each module has its own `outbox_messages` and `inbox_messages` tables in its own PostgreSQL schema:

| Module | Schema | Outbox Table | Inbox Table |
|---|---|---|---|
| Order | `order_schema` | `order_schema.outbox_messages` | `order_schema.inbox_messages` |
| Inventory | `inventory_schema` | `inventory_schema.outbox_messages` | `inventory_schema.inbox_messages` |
| Payment | `payment_schema` | `payment_schema.outbox_messages` | `payment_schema.inbox_messages` |
| Shipping | `shipping_schema` | `shipping_schema.outbox_messages` | `shipping_schema.inbox_messages` |
| Notification | `notification_schema` | `notification_schema.outbox_messages` | `notification_schema.inbox_messages` |

> **Key insight for the console**: When a module writes a domain event, it writes to **its own** `outbox_messages` table (inside that module's schema) in the same DB transaction as the entity update. Each module has its own outbox/inbox pair — there is no central `shared_schema` table. The `OutboxMessage`/`InboxMessage` classes are defined in the `shared` module but the tables are created per-module by each module's migrations.

#### CLI Commands (what runs in production as cronjobs/daemons)

```bash
# Outbox Relay (runs as a cronjob — dispatches DB outbox → RabbitMQ)
npx ts-node ... dispatch-messages --module order
npx ts-node ... dispatch-messages --module inventory
npx ts-node ... dispatch-messages --module payment
npx ts-node ... dispatch-messages --module shipping

# Event Consumers (run as long-running daemons)
npx ts-node ... handle-messages --module order      # listens on order-queue
npx ts-node ... handle-messages --module inventory  # listens on inventory-queue
npx ts-node ... handle-messages --module payment    # listens on payment-queue
npx ts-node ... handle-messages --module shipping   # listens on shipping-queue
npx ts-node ... handle-messages --module notification # listens on notification-queue
```

### 5. Payment Simulation — Must Be Clear in Console

The Payment module simulates payment processing. The rule to surface in the UI:

> **Deterministic simulation:** a payment **fails if and only if the amount ends in `.99`**
> (e.g. `29.99`, `99.99`) — implemented as `Math.round(amount * 100) % 100 === 99` in
> `InventoryReservedProcessor`. Every other amount succeeds. When it fails, the saga
> compensation runs (stock released, order cancelled).

This is NOT Stripe. There is no external payment gateway, and there is no random/percentage
component — it is purely the `.99` rule. The simulation lives in the Payment module's
`inventory-reserved` processor.

### 6. Manual Steps — Triggerable From Console

After `PaymentCompletedEvent`, the Shipping module creates a shipment with status `PENDING`. The order stays **PAID**. The saga does **not** auto-ship or auto-deliver. These manual API calls must be exposed as buttons in the console:

- **"Dispatch Shipment"** → `POST /api/shipments/:orderId/ship` body: `{ "carrier": "DHL Express", "trackingNumber": "..." }` → emits `ShipmentShippedEvent` → Order module → order `SHIPPED`
- **"Confirm Delivery"** → `POST /api/shipments/:orderId/deliver` (no body) → emits `ShipmentDeliveredEvent` → Order module → order `DELIVERED`

> `ShipmentCreatedEvent` (emitted automatically after payment) is consumed by **Notification only** — it does not change order status.

The console must label these clearly as **"Manual step — simulates courier update"** so the viewer understands why it's manual.

---

## Senior Engineer Answer: Polling vs WebSocket

**Your question**: Do we really need polling if we have WebSocket?

**Short answer**: You don't need polling for real-time updates. But you still need it for one specific case — initial data load.

**Here's the full professional breakdown:**

| Concern | WebSocket Alone | Polling Alone | Hybrid (Best) |
|---|---|---|---|
| Initial page load (see existing orders) | ❌ Socket only pushes future events | ✅ Can fetch all existing data | ✅ Use HTTP GET on mount |
| Real-time saga updates | ✅ Instant push, zero latency | ❌ 5s+ delay, DB hammering | ✅ Use WebSocket for this |
| Order status refresh after WS event | ✅ Re-fetch the specific order | ❌ Re-fetches everything unnecessarily | ✅ Re-fetch on WS trigger |
| Connection recovery after WS drop | ❌ Miss events during downtime | ✅ Catches up on reconnect | ✅ Re-fetch on reconnect |

**What Google, Netflix, Stripe, Uber all do** (the industry standard):
- **Initial render**: REST (HTTP GET) — load existing state
- **Real-time updates**: WebSocket/SSE push — no polling while connected
- **On reconnect**: Short reconciliation HTTP fetch to catch missed events
- **Fallback**: HTTP polling ONLY if WebSocket is unavailable (Socket.io handles this automatically with long-polling fallback)

**Target implementation**:
```
1. Page mount → GET /api/orders (load existing orders)
2. WebSocket connect → auto-join saga:firehose (saga-event) for topology; subscribeToOrder per active order (notification) for toasts
3. socket.on("saga-event") → append to telemetry log → re-fetch order/products/notifications
4. socket.on("notification") → show toast only
5. No interval polling while WebSocket is connected
6. On socket disconnect → trigger a single reconciliation GET /api/notifications
```

This is what a senior architect calls **"event-driven cache invalidation"** — your REST data is the source of truth, your WebSocket events tell you *when* to refresh it. This is exactly how Stripe's dashboard works.

> **[Current:]** Implemented in `useTelemetrySocket`: `saga-event` drives the telemetry log
> (topology + Event Flow Log) and triggers re-fetches; `notification` drives toasts only.
> Room subscription for targeted toasts happens when orders enter Redux. However,
> `console/page.tsx` **also runs a 3-second `setInterval`** re-fetching orders +
> notifications as a fallback, so step 5 ("no interval polling while connected") is not yet
> true.

---

## What to Remove

1. ❌ Monolith/Microservices toggle — doesn't represent your backend
2. ❌ ConsoleSidebar chaos controls — "Inject Latency", "Kill Worker" have no backend
3. ❌ `outbox-conveyor` component — endpoint doesn't exist
4. ❌ `topology-visualizer` (current version) — generic, inaccurate
5. ❌ Fake `setTimeout`-based saga simulation

## What to Add / Rework

---

## Final Console Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ConsoleHeader                                                           │
│  [● DB: healthy] [● RabbitMQ: healthy] [◉ WS: connected]               │
│  Orders: 12 | Active Sagas: 3 | Notifications Today: 47                 │
├────────────────────────────┬─────────────────────────────────────────────┤
│  OrderPlayground (left)    │  SagaTimeline (right)                       │
│  ─────────────────────     │  ──────────────────────────────             │
│  [ Place Order Form ]      │  Selected order stepper:                    │
│  • customerEmail field     │  PLACED → INVENTORY_RESERVED →              │
│  • Product selector        │   PAYMENT_PROCESSING → PAID →               │
│  • Quantity + price calc   │   SHIPPING → DELIVERED                      │
│  • "Note: total ending     │                                             │
│    in .99 will fail        │  ↳ Or: CANCELLED (out of stock)            │
│    payment (saga           │  ↳ Or: PAYMENT_FAILED → CANCELLED           │
│    compensation runs!)"    │                                             │
│  [ Submit Order ]          │  [ Real-time WS notifications below ]       │
│                            │  InventoryReservedProcessor ✓ 10:24:01     │
│  [ Active Orders List ]    │  PaymentCompletedProcessor ✓ 10:24:03      │
│  • Order #abc (PAID)       │                                             │
│  • Order #def (PLACED)     │  Manual Actions (shown only when relevant): │
│  • [Cancel] [Ship][Deliver]│  [Mark as Shipped] [Mark as Delivered]      │
│  [ Cancel eligible orders ]│  "Simulates courier status update"          │
├────────────────────────────┴─────────────────────────────────────────────┤
│  RabbitMqTopology (full width, animated)                                 │
│  ─────────────────────────────────────────────────────────────────────   │
│  [Order Module] ──order.placed──► [order-exchange (topic)]              │
│                                         ├──► [inventory-queue]          │
│                                         └──► [notification-queue]       │
│  [Inventory Module] ─inventory.reserved─► [inventory-exchange (topic)]  │
│                                         ├──► [payment-queue]            │
│                                         └──► [notification-queue]       │
│  ... (all exchanges, queues, routing keys, fanout shown accurately)     │
│  + Per-module schema note: order_schema, inventory_schema, etc.         │
│  + Highlighted path pulses green when WS event arrives                  │
├──────────────────────────────────────────────────────────────────────────┤
│  NotificationFeed (bottom full width)                                   │
│  [ All Events ] [ Selected Order ]                                      │
│  InventoryReservedProcessor  |  order #abc  |  10:24:01  |  "reserved"  │
│  PaymentCompletedProcessor   |  order #abc  |  10:24:03  |  "paid"     │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Exact Panel Specs

### Panel 1: `ConsoleHeader` (rework)
- Polls `GET /api/health` every 10s → `{ database: { status }, rabbitmq: { status } }`
- WebSocket connection status indicator (connected/reconnecting/disconnected)
- Real aggregate stats: total orders count, active sagas count, today's notifications count
- No fake "saga transactions submitted" counter

### Panel 2: `OrderPlayground` (rework)
> **[Current:]** Built as a single full-width panel with tabs (place order + active orders + a saga tracker). The separate `SagaTimeline` panel below was folded into this component's saga tracker tab.

**Place Order Form:**
- `customerId` (UUID input, required — pre-filled with a debug UUID)
- Product multi-select from `GET /api/products`
- Quantity per product (number input)
- Auto-calculated total price
- Prominent callout: **"⚠ Payment Simulation: a total ending in .99 → payment fails and saga compensation runs (stock released, order cancelled). All other totals succeed."**
- Submit → `POST /api/orders` → the order enters Redux and the telemetry hook emits `subscribeToOrder`

**Active Orders:**
- Loads `GET /api/orders` on mount; re-fetches when a WebSocket notification arrives (plus current 3s polling fallback)
- Each order row: truncated ID, colored status badge, total, relative timestamp
- Click row → select order (updates the saga tracker)
- Context-aware action buttons:
  - `PENDING` | `PLACED` | `PAID` → **[Cancel]** → `POST /api/orders/:id/cancel`
  - `PAID` (shipment is PENDING) → **[Mark as Shipped]** → `POST /api/shipments/:orderId/ship` `{ carrier, trackingNumber }`
  - `SHIPPED` → **[Mark as Delivered]** → `POST /api/shipments/:orderId/deliver`

### Panel 3: `SagaTimeline` (new — replaces TopologyVisualizer)
- Shows the selected order's saga state as an animated stepper
- Happy path: `PLACED` → `INVENTORY_RESERVED` → `PAYMENT_PROCESSING` → `PAID` → `SHIPPING` → `DELIVERED`
- Branch paths shown as alternate lanes (not hidden):
  - Out-of-stock: `INVENTORY_RESERVED` → `CANCELLED`
  - Payment failed: `PAYMENT_PROCESSING` → `PAYMENT_FAILED` → `CANCELLING` → `CANCELLED`
- Active step pulses, completed steps check-marked, future steps dimmed
- Below stepper: scrollable real-time WebSocket notification cards

### Panel 4: `RabbitMqTopology` (new — static accurate + animated)
- SVG/canvas-based (or XYFlow) static diagram reflecting exact backend topology:
  - All 4 topic exchanges with exact names: `order-exchange`, `inventory-exchange`, `payment-exchange`, `shipping-exchange`
  - `order-fanout-exchange` (fanout type, labelled "FANOUT — OrderCancelled broadcast")
  - Per-module retry exchanges (direct type)
  - All 5 queues: `order-queue`, `inventory-queue`, `payment-queue`, `shipping-queue`, `notification-queue`
  - All binding keys as edge labels (exact: `order.placed`, `inventory.reserved`, etc.)
  - `notification-queue` shown as subscriber to ALL exchanges (star pattern)
- Schema-level isolation callout: "Each module owns its own PostgreSQL schema (`order_schema`, `inventory_schema`…). Business tables are isolated. Inbox/outbox are shared via `shared_schema`."
- CLI worker callout: shows the `dispatch-messages` / `handle-messages` commands and explains the role of each
- **Animation**: When a WebSocket `notification` event arrives with `eventType`, the corresponding path lights up for 2s (e.g., `PaymentCompletedEvent` → `payment-exchange` → `order-queue` + `shipping-queue` + `notification-queue` all pulse)

### Panel 5: `NotificationFeed` (rework of TelemetryLedger)
> **[Current:]** Implemented as the **`EventStream` component** (`_components/event-stream`), surfaced as the **"Event Ledger" tab of the `ObservabilityDeck`**, with ALL / SUCCESS / ERRORS filter pills and infinite scroll. There is no "Selected Order" tab yet.

- Tabs (target): **"All Events"** | **"Selected Order"**
- "All Events" → fetches `GET /api/notifications` on mount + on each WS notification event
- "Selected Order" → fetches `GET /api/notifications?orderId=<id>` when an order is selected + on WS events for that orderId
- Each row: `eventType` colored badge | `orderId` (clickable) | relative timestamp | `message` text

---

## Redux Slice Changes (per `architecture-patterns.md`)

### Remove
- `ui.slice.ts` → remove `viewMode` (Monolith/Microservices toggle)
- Fake `telemetry.slice.ts` events

### New/Updated Feature Slices (all follow vertical slice pattern exactly)

**`features/orders/`** → `orders.slice.ts`
```
orders/
  place-order/   → place-order.service.ts | .action.ts | .type.ts | .interface.ts
  cancel-order/  → cancel-order.service.ts | .action.ts | .type.ts | .interface.ts
  list-orders/   → list-orders.service.ts | .action.ts | .type.ts | .interface.ts
  get-order/     → get-order.service.ts | .action.ts | .type.ts | .interface.ts
  orders.slice.ts
```

**`features/catalog/`** → `catalog.slice.ts` (already exists, needs `listProducts` operation)
```
catalog/
  list-products/ → list-products.service.ts | .action.ts | .type.ts | .interface.ts
  catalog.slice.ts
```

**`features/shipments/`** → `shipments.slice.ts`
```
shipments/
  update-shipment-status/ → update-shipment-status.service.ts | .action.ts | .type.ts | .interface.ts
  list-shipments/         → list-shipments.service.ts | .action.ts | .type.ts | .interface.ts
  shipments.slice.ts
```

**`features/notifications/`** (new) → `notifications.slice.ts`
```
notifications/
  list-notifications/        → list-notifications.service.ts | .action.ts | .type.ts | .interface.ts
  list-order-notifications/  → list-order-notifications.service.ts | .action.ts | .type.ts | .interface.ts
  notifications.slice.ts
```

**`features/telemetry/`** → `telemetry.slice.ts` (rework: stores real WS events)
```
telemetry/
  socket/
    telemetry.socket.ts     # Socket.io singleton (already planned in arch doc)
  telemetry.slice.ts
```

**`features/health/`** (new) → `health.slice.ts`
```
health/
  get-health/  → get-health.service.ts | .action.ts | .type.ts | .interface.ts
  health.slice.ts
```

### Common Enums/Types

**`common/order-status.enum.ts`** (as built — matches the backend order status)
```typescript
export enum OrderStatus {
  PENDING = "PENDING",
  PLACED = "PLACED",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
}
```

**`common/saga-event.enum.ts`** (new) — exact processor names as WS `eventType` values
```typescript
export enum SagaEventType {
  ORDER_PLACED = 'OrderPlacedProcessor',
  INVENTORY_RESERVED = 'InventoryReservedProcessor',
  INVENTORY_RESERVATION_FAILED = 'InventoryReservationFailedProcessor',
  PAYMENT_COMPLETED = 'PaymentCompletedProcessor',
  PAYMENT_FAILED = 'PaymentFailedProcessor',
  SHIPMENT_CREATED = 'ShipmentCreatedProcessor',
  SHIPMENT_DELIVERED = 'ShipmentDeliveredProcessor',
  ORDER_CANCELLED = 'OrderCancelledProcessor',
  INVENTORY_RELEASED = 'InventoryReleasedProcessor',
}
```

---

## Console Component Files (final)

```
app/console/
  page.tsx                     # Layout wiring only
  _components/
    console-header/index.tsx   # Rework: real health + WS status
    order-playground/index.tsx # Rework: real form + orders list + actions
    saga-timeline/index.tsx    # New: order status stepper + WS events
    rabbitmq-topology/index.tsx # New: accurate static diagram + animation
    notification-feed/index.tsx # Rework: real polling + WS driven
```

**Delete:**
- `console-sidebar/` — chaos monkey, no backend
- `topology-visualizer/` — inaccurate, replaced by `rabbitmq-topology`
- `outbox-conveyor/` — endpoint doesn't exist
- `telemetry-ledger/` — replaced by `notification-feed`

---

## Open Questions (Resolved)

- ✅ **Outbox Monitor** → Option B: Use `GET /api/notifications` as observable proxy (no backend changes)
- ✅ **Product Seeding** → Backend seeder handles it; no console seeding needed
- ✅ **Redux pattern** → Exact `architecture-patterns.md` pattern (vertical slices, `createAppSlice`, service/action/type/interface files)
- ✅ **Polling vs WebSocket** → Hybrid: HTTP on mount, WebSocket for real-time, no interval polling while connected
- ✅ **Implementation approach** → One panel at a time, not all at once

---

## Implementation Order (One Panel at a Time)

```
Phase 1: Foundation (Redux + Services)
  → common/ enums + types
  → features/orders/ slices + operations
  → features/catalog/ list-products operation
  → features/shipments/ slices + operations
  → features/notifications/ slices + operations
  → features/health/ slice
  → features/telemetry/ slice rework + socket singleton

Phase 2: ConsoleHeader
  → Real health polling
  → Real WS status indicator

Phase 3: OrderPlayground
  → Place Order form (real API)
  → Active Orders list (real API)
  → Cancel / Ship / Deliver actions

Phase 4: SagaTimeline
  → Order status stepper
  → WebSocket live events panel

Phase 5: RabbitMqTopology
  → Static accurate diagram
  → WS-triggered path animation

Phase 6: NotificationFeed
  → All Events + Selected Order tabs
  → REST on mount, WS-triggered refresh

Phase 7: Wiring + Cleanup
  → console/page.tsx layout
  → Delete dead components
  → Remove Monolith/Microservices toggle from ui.slice
```
