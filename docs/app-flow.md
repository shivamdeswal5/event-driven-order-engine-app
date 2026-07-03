# Apex Console — App Flow Specification

This document defines the screen-by-screen flows, user interactions, real-time WebSocket state mapping, and responsive behaviour for all pages of the Apex Console.

---

## 1. Page Directory

| Route      | Type              | Description                                                                                      |
| :--------- | :---------------- | :----------------------------------------------------------------------------------------------- |
| `/`        | Public · Landing  | Interactive, scroll-driven landing page. Explains the system, showcases architecture, converts to the console. |
| `/console` | Public · App      | The full-screen Engineering Console. Real-time topology visualizer, order playground, and telemetry panels. |

---

## 2. Page 1: Landing Page (`/`)

### Purpose
This page is the **first impression for interviewers and hiring managers**. It must communicate the complexity and depth of the system in under 30 seconds without any prior context. It is scroll-driven, animated, and fully interactive.

### Responsive Behaviour
- **Desktop (≥1024px)**: Full multi-column layouts, 3D card effects, side-by-side panels.
- **Tablet (768px–1023px)**: Collapsed to single-column, 3D effects preserved, horizontal scrolls replaced with vertical stacks.
- **Mobile (<768px)**: Fully single-column, all animations simplified (respects `prefers-reduced-motion`), sticky navbar with hamburger menu.

---

### Section 1: Navbar
- **Logo**: `Cpu` icon + wordmark `APEX CONSOLE`.
- **Center links** (desktop only): `Architecture`, `Patterns`, `Tech Stack`, `Console`.
- **Right**: Live connection badge — pulsing green dot + `Engine Online` text (driven by a WebSocket ping to `/health`). On mobile: hamburger menu sheet (shadcn `Sheet`).
- **Behaviour**: On scroll past 80px, navbar background transitions to `bg-background/80 backdrop-blur-md` with a bottom border.

---

### Section 2: Hero
- **Eyebrow tag**: `Event-Driven · DDD · CQRS · Choreography Saga`
- **Main headline**: Large, bold, animated character-by-character reveal using Framer Motion `motion.span` with staggered children.
  - Line 1: `"Distributed Order Fulfillment"`
  - Line 2: Gradient text — `"Visualized in Real-Time"`
- **Subtext**: One-line description of the project.
- **CTAs**:
  - Primary: `"Open Engineering Console"` → navigates to `/console`.
  - Secondary: `"View Architecture"` → smooth-scrolls to Section 3.
- **Background**: Animated particle-mesh canvas (`<canvas>`) — nodes connected by thin lines, subtle movement. Performance: `requestAnimationFrame`, max 60 particles, respects `prefers-reduced-motion`.
- **3D Code Card** (desktop right-side, mobile: below CTAs):
  - Tilts 15° on mouse move using `onMouseMove` + CSS `transform: perspective(800px) rotateX() rotateY()`.
  - Displays syntax-highlighted JSON of a real `OrderPlacedEvent` envelope — showing `eventType`, `correlationId`, `causationId`, `payload`.
  - Subtle glowing border in cyan.

---

### Section 3: Live Event Ticker
- A full-width horizontal ticker bar.
- Streams **real WebSocket events** from the backend `/notifications` namespace.
- Falls back to animated mock events if backend is offline.
- Each pill shows: event icon + event type (e.g. `OrderPlaced`, `InventoryReserved`, `PaymentCompleted`) + timestamp.
- Speed: slow auto-scroll with CSS `animation: scroll linear infinite`. Pauses on hover.
- **Why this matters**: This is the first thing that proves the system is actually live, not a mockup.

---

### Section 4: Architecture Showcase
- **Headline**: `"One Process. Five Bounded Contexts."`
- **Subtext**: Explains the Modular Monolith with schema isolation and event-driven communication.
- **Interactive 3D diagram** (desktop): Five bounded context cards arranged in a pentagon layout around a central RabbitMQ Exchange card. Cards connected by animated dashed SVG lines. Hovering a card highlights its connected edges and shows a tooltip with the events it produces/consumes.
- **Mobile**: Vertical stack of cards with left border accent color per context.

| Context | Color | Events Produced |
|---|---|---|
| Order | Cyan | `OrderPlaced`, `OrderCancelled` |
| Inventory | Emerald | `InventoryReserved`, `InventoryReservationFailed` |
| Payment | Violet | `PaymentCompleted`, `PaymentFailed` |
| Shipping | Amber | `ShipmentCreated`, `ShipmentDelivered` |
| Notification | Rose | `NotificationSent` |

---

### Section 5: Pattern Deep-Dive
- **Headline**: `"Engineering Patterns That Matter"`
- Tab-based or horizontal-scroll card carousel (shadcn `Tabs` on desktop, horizontal scroll on mobile).
- Each card shows: pattern name, icon, one-line description, and a minimal code/diagram snippet.

| Pattern | What It Shows |
|---|---|
| **Transactional Outbox** | Event stored atomically in same DB transaction. No dual-write problem. |
| **Choreography Saga** | State machine diagram: `PLACED → PAID → SHIPPED → DELIVERED` with compensation paths. |
| **Inbox Idempotency** | `UNIQUE(messageId, handlerName)` prevents duplicate event processing. |
| **DDD Vertical Slices** | Feature folder tree diagram — one handler, one service, one test per use case. |
| **SELECT FOR UPDATE SKIP LOCKED** | PostgreSQL lock for concurrent-safe outbox relay polling. |

---

### Section 6: Tech Stack
- Grid of technology badges.
- Each badge on hover shows a tooltip with the **reason for choosing that technology** (not just what it does).
- Technologies: NestJS, Next.js 15, PostgreSQL 16, MikroORM 6, RabbitMQ 4, Socket.io, Redux Toolkit, React Flow, shadcn/ui, TypeScript, Docker.

---

### Section 7: Stats Counter Row
- Animated `CountUp` number reveal on scroll-into-view (Intersection Observer).
- Stats:
  - `5` Bounded Contexts
  - `12+` Domain Event Types
  - `3` Resilience Layers (Retry · DLQ · Inbox Dedup)
  - `~0ms` Message Loss (Transactional Outbox guarantee)

---

### Section 8: Footer CTA
- Headline: `"Ready to trace a live Saga?"`
- Single large CTA button: `"Open Engineering Console"` → `/console`.
- Footer links: GitHub, Architecture Docs, Backend Repo.

---

## 3. Page 2: Engineering Console (`/console`)

### Purpose
The full-screen engineering observatory. Developers and interviewers can place real orders, watch the choreography saga flow through all 5 bounded contexts in real-time, inject faults, and observe the system recover.

### Responsive Layout Strategy

**Desktop (≥1280px)**: 3-column fixed-height layout. No scrolling within the viewport.
```
[ Left Panel 28% ] [ Center Canvas 44% ] [ Right Panel 28% ]
```

**Tablet (768px–1279px)**: Top header + tabbed layout. Canvas is Tab 1, Playground is Tab 2, Telemetry is Tab 3.

**Mobile (<768px)**: Full-screen tabs with bottom tab bar. Canvas view is simplified (no React Flow — replaced with a vertical step-indicator showing the saga state). Playground and Telemetry are full-screen tab panels.

---

### Console Header (Fixed Top Bar)
- **Left**: Logo + `APEX CONSOLE` wordmark.
- **Center**: Three metric pills (shadcn `Badge`):
  - `Active Sagas: N` (live count)
  - `Completed: N` (session count)
  - `Failed: N` (session count)
- **Right**:
  - WebSocket status indicator: `●` dot (Green/Amber/Red) + status text.
  - Theme selector (Obsidian / Midnight / Steel).

---

### Left Panel: Interactive Playground

#### Tab 1: Product Catalog
- Source: `GET /api/products`
- Each product card shows: name, SKU, unit price, available stock gauge bar.
- **Stock Adjustment**: `+5` / `-5` buttons → `PATCH /api/products/:id/stock`.
- **Empty State**: Full-panel empty state asking the user to run backend seeders to populate the catalog.

#### Tab 2: Place Order
- **Form** (React Hook Form + Zod):
  - Product multi-select with quantity inputs per item.
  - Customer ID field (pre-filled with a debug UUID, editable).
  - Prominent callout: **"⚠ Payment Simulation: 80% success. If total ends in .99 → Payment fails, saga compensation runs (stock released, order cancelled)"**
- **Submit `"Initiate Saga"`** → `POST /api/orders`.
  - On success: returned `orderId` is stored in Redux and the canvas centers on that saga.
  - WebSocket room joined: `subscribeToOrder` event sent to backend with the `orderId`.

#### Tab 3: Manual Controls
- Context-aware action buttons. Each button is disabled unless the current tracked saga is in the required state:
  - `"Mark as Shipped"` → Active when `status === PAID` → Opens bottom sheet with Carrier + Tracking Number fields → `POST /api/shipments/:orderId/ship`.
  - `"Confirm Delivery"` → Active when `status === SHIPPED` → `POST /api/shipments/:orderId/deliver`.
  - `"Cancel Order"` → Active when `status` is `PLACED` or `PAID` → Opens reason input dialog → `POST /api/orders/:id/cancel`.
- **Current Saga Status card**: Shows the active `orderId`, current `status`, and a mini saga timeline progress bar.

---

### Center Panel: Real-Time Topology Canvas

Built with `@xyflow/react`. Full-height, no scroll.

**Mobile replacement**: A vertical `SagaStepIndicator` component — a vertical timeline of 5 steps (Order → Inventory → Payment → Shipping → Notification) with icons and status colors. Updates in real-time from WebSocket events.

#### Nodes
| Node | Type | Color State |
|---|---|---|
| `[Order]` | Service Node | Cyan when active |
| `[RabbitMQ Exchange]` | Exchange Node | Amber + spinning icon when routing |
| `[Inventory]` | Service Node | Emerald when active |
| `[Payment]` | Service Node | Violet when active |
| `[Shipping]` | Service Node | Amber when active |
| `[Notification]` | Service Node | Rose when active |
| `[DLQ]` | Dead Letter Node | Crimson, appears only during Chaos Monkey faults |

#### Node Visual States
- **Idle**: Thin border, muted background, no glow.
- **Active/Processing**: Glowing border (color-coded per context), pulsing status dot, `shadow` glow CSS.
- **Retrying**: Amber glow + retry counter badge overlay.
- **Failed / DLQ**: Crimson glow + shake animation.

#### Animated Edges
- Edges use React Flow's `animated` prop.
- Edge color changes based on the event type currently traversing it.
- Shows real RabbitMQ topology (exchanges, queues, routing keys).
- Highlights the path when a WebSocket `notification` event arrives.

#### Saga State Machine Overlay
- A compact state machine diagram overlaying the bottom-left corner of the canvas.
- Shows all valid transitions: `PLACED → INVENTORY_RESERVED → PAYMENT_PROCESSING → PAID → SHIPPING → DELIVERED` + compensation paths.
- The active state is highlighted in the theme's primary color.

---

### Right Panel: Telemetry & Controls

#### Section 1: Notification Feed (Tabs: All Events / Selected Order)
- Fetches `GET /api/notifications` on mount and uses WebSocket events to trigger subsequent data fetches ("event-driven cache invalidation" – no interval polling while connected).
- Monospace terminal-style log panel for real-time events.
- Each log line: timestamp + event type + `orderId` (clickable) + status badge.
- Clicking a log line opens a **shadcn `Sheet` (right drawer)** containing:
  - Full JSON event envelope (syntax-highlighted using `shiki` or `highlight.js`).
  - `correlationId` and `causationId` relationship diagram.

#### Section 3: Chaos Monkey Controls
- Toggle switches (shadcn `Switch`) per service:
  - `"Inventory DB Lock"` — simulates reservation failure.
  - `"Payment Timeout"` — simulates payment processing failure.
  - `"Shipping Exception"` — simulates delivery failure.
- When active: target service node glows Amber, retry counter increments on the canvas.
- After 3 retries (backend `RABBITMQ_MAX_RETRIES`): node turns Crimson, DLQ node appears.

---

## 4. WebSocket Event → UI State Mapping

| Backend Event | Saga Status Set To | Canvas Effect |
|---|---|---|
| `order.saga.placed` | `PLACED` | Order node glows cyan |
| `order.saga.inventory-reserved` | `PAID` (inventory step) | Inventory node glows emerald |
| `order.saga.payment-completed` | `PAID` | Payment node glows violet |
| `order.saga.shipment-created` | `SHIPPED` | Shipping node glows amber |
| `order.saga.delivered` | `DELIVERED` | All nodes briefly pulse green |
| `order.saga.cancelled` | `CANCELLED` | All nodes dim, Order node pulses red |
| `order.saga.payment-failed` | `FAILED` | Payment node glows crimson |

---

## 5. Theme System

Three themes, switchable from the console header. Implemented via CSS custom properties and `next-themes`.

| Theme | Background | Primary Accent | Feel |
|---|---|---|---|
| **Obsidian** (default dark) | `zinc-950` | Cyan | Engineering terminal |
| **Midnight** (dark warm) | `slate-950` | Violet | Premium dark |
| **Steel** (light) | `slate-50` | Slate blue | Clean SaaS |
