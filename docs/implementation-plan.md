# Console Redesign Plan — Apex Observability Console (Final)

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
| `GET` | `/api/health` | Database + RabbitMQ health check |
| `POST` | `/api/orders` | Place order → triggers whole saga |
| `GET` | `/api/orders` | List orders (paginated, filterable by status) |
| `GET` | `/api/orders/:id` | Get single order |
| `POST` | `/api/orders/:id/cancel` | Cancel order → triggers compensation saga |
| `GET` | `/api/products` | List products (Inventory module) |
| `POST` | `/api/products` | Add product |
| `PATCH` | `/api/products/:id/stock` | Adjust stock |
| `GET` | `/api/payments` | List payments |
| `GET` | `/api/shipments` | List shipments |
| `PATCH` | `/api/shipments/:id/status` | Mark shipment SHIPPED or DELIVERED (manual step) |
| `GET` | `/api/notifications` | List all notifications |
| `GET` | `/api/notifications/:orderId` | Get notifications for a specific order |

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

SERVER → CLIENT (real-time saga push, from NotificationGateway.broadcastToOrder):
  event: "notification"
  data:  {
    orderId:   string,
    eventType: string,    // e.g. "OrderPlacedProcessor", "PaymentCompletedProcessor"
    message:   string,    // e.g. "Payment processed successfully!"
    occurredAt: Date
  }
```

**Critical flow**: When `POST /api/orders` succeeds → immediately call
`socket.emit("subscribeToOrder", { orderId: createdOrder.id })` to join the room.

### 3. Real Order Status Progression

```
PLACED → INVENTORY_RESERVED → PAYMENT_PROCESSING → PAID → SHIPPING → DELIVERED
              ↘                       ↘
         CANCELLED              PAYMENT_FAILED → CANCELLING → CANCELLED
       (out of stock)
```

### 4. Complete RabbitMQ Topology — Exact Naming from Backend Source

#### Exchanges (exact names from `*.message-destination.ts`)

| Exchange Name | Type | Publisher Module | Events Routed Through |
|---|---|---|---|
| `order-exchange` | **topic** | Order | `OrderPlacedEvent`, `OrderCancelledEvent` |
| `inventory-exchange` | **topic** | Inventory | `InventoryReservedEvent`, `InventoryReservationFailedEvent`, `InventoryReleasedEvent` |
| `payment-exchange` | **topic** | Payment | `PaymentCompletedEvent`, `PaymentFailedEvent` |
| `shipping-exchange` | **topic** | Shipping | `ShipmentCreatedEvent`, `ShipmentDeliveredEvent` |
| `order-fanout-exchange` | **fanout** | Order | `OrderCancelledEvent` (broadcast to ALL) |
| `*-retry-exchange` (per module) | **direct** | Internal retry | Dead-letter re-queuing |

#### Queues + Bindings (exact from `*SignatureTypes`)

| Queue | Module | Binds to Exchange | Binding/Routing Key |
|---|---|---|---|
| `order-queue` | Order | `inventory-exchange` | `inventory.reservation-failed` |
| `order-queue` | Order | `payment-exchange` | `payment.completed` |
| `order-queue` | Order | `payment-exchange` | `payment.failed` |
| `order-queue` | Order | `shipping-exchange` | `shipping.created` |
| `order-queue` | Order | `shipping-exchange` | `shipping.delivered` |
| `inventory-queue` | Inventory | `order-exchange` | `order.placed` |
| `inventory-queue` | Inventory | `order-fanout-exchange` | — (fanout, no key) |
| `payment-queue` | Payment | `inventory-exchange` | `inventory.reserved` |
| `payment-queue` | Payment | `order-fanout-exchange` | — (fanout, no key) |
| `shipping-queue` | Shipping | `payment-exchange` | `payment.completed` |
| `shipping-queue` | Shipping | `order-fanout-exchange` | — (fanout, no key) |
| `notification-queue` | **Notification** | **ALL exchanges** | `order.placed`, `inventory.reserved`, `inventory.reservation-failed`, `payment.completed`, `payment.failed`, `shipping.created`, `shipping.delivered`, `order.cancelled`, `inventory.released` |

> **Important**: The Notification module is a **terminal consumer** — it subscribes to EVERY event in the system and broadcasts them over WebSocket. It does NOT publish any events back. This is why the WebSocket works end-to-end.

#### Per-Module Inbox/Outbox Tables (Schema-Level Isolation)

Each module has its own `outbox_messages` and `inbox_messages` tables in its own PostgreSQL schema:

| Module | Schema | Outbox Table | Inbox Table |
|---|---|---|---|
| Shared | `shared_schema` | `outbox_messages` | `inbox_messages` |
| Order | `order_schema` | (uses shared) | (uses shared) |
| Inventory | `inventory_schema` | (uses shared) | (uses shared) |
| Payment | `payment_schema` | (uses shared) | (uses shared) |
| Shipping | `shipping_schema` | (uses shared) | (uses shared) |
| Notification | `notification_schema` | (none — terminal) | (uses shared) |

> **Key insight for the console**: When a module writes a domain event, it writes to the shared `outbox_messages` table in the same DB transaction as the entity update. The schema-level isolation means each module's business tables are physically separated even though they share the outbox relay.

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

The Payment module simulates payment processing. These rules must be visible in the UI:

> **80% of orders succeed** (payment completed automatically)
> **20% of orders fail** — specifically: if `totalAmount` ends in `.99` (e.g., `29.99`, `99.99`) → payment FAILS and the saga compensation runs

This is NOT Stripe. There is no external payment gateway. The simulation lives in the Payment module's handler.

### 6. Manual Steps — Triggerable From Console

After `PaymentCompletedEvent`, the Shipping module creates a shipment with status `PENDING`. The saga does **not** auto-deliver. These manual API calls must be exposed as buttons in the console:

- **"Mark as Shipped"** → `PATCH /api/shipments/:id/status` body: `{ "status": "SHIPPED" }` → triggers `ShipmentCreatedEvent` → Order → `SHIPPING`
- **"Mark as Delivered"** → `PATCH /api/shipments/:id/status` body: `{ "status": "DELIVERED" }` → triggers `ShipmentDeliveredEvent` → Order → `DELIVERED`

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

**Our implementation**:
```
1. Page mount → GET /api/orders (load existing orders)
2. POST /api/orders succeeds → socket.emit("subscribeToOrder", { orderId })
3. socket.on("notification") → dispatch to Redux → re-fetch that specific order
4. No interval polling while WebSocket is connected
5. On socket disconnect → trigger a single reconciliation GET /api/notifications
```

This is what a senior architect calls **"event-driven cache invalidation"** — your REST data is the source of truth, your WebSocket events tell you *when* to refresh it. This is exactly how Stripe's dashboard works.

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
**Left sub-panel — Place Order Form:**
- `customerEmail` (email input, required)
- Product multi-select from `GET /api/products`
- Quantity per product (number input)
- Auto-calculated `totalAmount`
- Prominent callout: **"⚠ Payment Simulation: 80% success. If total ends in .99 → Payment fails, saga compensation runs (stock released, order cancelled)"**
- Submit → `POST /api/orders` → on success: `socket.emit("subscribeToOrder", { orderId })`

**Right sub-panel — Active Orders:**
- Polls `GET /api/orders` on mount; re-fetches when WebSocket notification arrives
- Each order row: truncated ID, colored status badge, total, relative timestamp
- Click row → select order (updates SagaTimeline)
- Context-aware action buttons:
  - `PLACED` | `INVENTORY_RESERVED` | `PAYMENT_PROCESSING` → **[Cancel]** → `POST /api/orders/:id/cancel`
  - `PAID` (shipment is PENDING) → **[Mark as Shipped]** → `PATCH /api/shipments/:id/status` `{ status: "SHIPPED" }`
  - `SHIPPING` (shipment is SHIPPED) → **[Mark as Delivered]** → `PATCH /api/shipments/:id/status` `{ status: "DELIVERED" }`

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
- Tabs: **"All Events"** | **"Selected Order"**
- "All Events" → fetches `GET /api/notifications` on mount + on each WS notification event (no interval polling while connected)
- "Selected Order" → fetches `GET /api/notifications/:orderId` when order is selected + on WS events for that orderId
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

**`common/order-status.enum.ts`** (new)
```typescript
export enum OrderStatus {
  PLACED = 'PLACED',
  INVENTORY_RESERVED = 'INVENTORY_RESERVED',
  PAYMENT_PROCESSING = 'PAYMENT_PROCESSING',
  PAID = 'PAID',
  SHIPPING = 'SHIPPING',
  DELIVERED = 'DELIVERED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  CANCELLING = 'CANCELLING',
  CANCELLED = 'CANCELLED',
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
