# Apex Console — Complete App Flow Specification

This document defines the screen-by-screen flows, user actions, real-time WebSocket state mapping, and physical animations of the Apex Console dashboard.

---

## 1. Directory of Screens & Pages

| Route | Page Type | Component / Core Layout | Description |
| :--- | :--- | :--- | :--- |
| `/` | Public Static | `LandingPage` (Parallax Scroll) | Public entry point with interactive 3D event panels and scroll parallax. |
| `/dashboard` | Protected Layout | `DashboardLayout` (Glassmorphic Deck) | The Master engineering console. A single-screen dashboard. |

---

## 2. Screen 1: Landing Page (`/`)

### A. Layout Structure
* **Top Navigation Bar**:
  - Logo (`Cpu` icon + text "APEX CONSOLE") in Geist Sans, bold tracking.
  - Active monolith badge: Green pulse tag showing "Engine Connection Online".
  - Action Button: "Launch Visualizer" in solid neon-cyan border.
* **Hero Content**:
  - Subtitle: "Choreographed Event Engine Telemetry".
  - Main Title: "Visualize Distributed Event-Driven Sagas".
  - Call to Action: "Enter Control Deck" button with spring hover feedback.
* **3D Isometric Event Panel**:
  - A mock code window displaying a live-looking JSON representation of `OrderPlacedEvent`. Hovering causes the panel to tilt in 3D coordinates.

### B. User Actions & Navigation
* **Click "Enter Control Deck" or "Launch Visualizer"**:
  - Routes to `/dashboard` with a slide-left transition using Framer Motion.
* **Scroll down**:
  - Transforms heading size down and shifts the grid mesh background vertically to create depth.

---

## 3. Screen 2: Dashboard Control Deck (`/dashboard`)

The dashboard is a single-screen, fixed-height viewport dashboard partitioned into a Header and three column panels.

### A. Header Panel (10% Height)
* **Visual Elements**:
  - Connection status pill: Shows WebSocket status with a colored dot (`Green` = Connected, `Orange` = Retrying, `Red` = Disconnected).
  - Metrics Gauges: Active Sagas (counter), Completed Sagas (counter), Failed Sagas (counter).
  - **Monolith vs. Microservice Toggle**: A slider button labeled: **[Monolith Architecture]** vs **[Microservices Architecture]**.
  - Theme Toggle Switch: Toggles dark mode obsidian theme and light mode pristine steel theme.
* **User Actions**:
  - **Toggle Monolith vs. Microservices**:
    - **Monolith Mode (Default)**: Renders a single unified glowing bounding box wrapping all 5 service nodes on the canvas.
    - **Microservices Mode**: The boundary box dissolves, and nodes animate outwards (increasing spacing). Edges lengthen and particles slow down by 150ms to simulate physical network hops.

### B. Left Panel: Interactive Playground (30% Width)
This panel lets developers act as customers placing orders and administrators managing stock.

#### Tab 1: Product Catalog & Stock adjustments
* **Product Cards**: Sourced from `GET /api/products`.
  - Displays Product Name, SKU, price, and stock indicators.
  - **Stock Adjustment Action**: User clicks `+` or `-` buttons to trigger `PATCH /api/products/:id/stock` with `{ adjustment: 5 }` or `{ adjustment: -5 }`.
* **Empty State**: Shows a "No products found in database" banner with a prominent "Seed Sample Catalog" button that calls `POST /api/products` to generate default products.

#### Tab 2: Create Order Form & Manual Override Deck
* **Initiate Order Saga**:
  - Dropdown selector for catalog items, quantity input, and Customer UUID field (pre-filled with debug UUID).
  - Click **"Initiate Order Saga"**:
    - Triggers `POST /api/orders`.
    - Generates a UUID, clears checkout, and focuses the Center Visualizer on the new `orderId`.
* **Manual Override Action Panel**:
  - Displays context action buttons that light up based on the current focused saga state:
    - **"Mark Shipped"** (Active only when order is paid): Triggers `POST /api/shipments/:orderId/ship` with form input for carrier & tracking number.
    - **"Confirm Delivery"** (Active only when order is shipped): Triggers `POST /api/shipments/:orderId/deliver`.
    - **"Cancel Order"** (Active during pre-shipping states): Triggers `POST /api/orders/:id/cancel` with a cancellation reason.

---

## 4. Center Panel: Real-Time Topology Canvas (45% Width)
Built using **React Flow**, this canvas maps our modular contexts.

### A. Core Topology Nodes
The canvas displays 6 visual nodes:
1. `[Order Context]` (Producer of `OrderPlacedEvent`)
2. `[RabbitMQ Exchange]` (Central router)
3. `[Inventory Queue]` (Consumer of placed, producer of reserved/failed events)
4. `[Payment Gateway]` (Consumer of reserved, producer of completed/failed events)
5. `[Shipping Coordinator]` (Consumer of completed, producer of created/delivered events)
6. `[Notification Space]` (Global observer)

### B. Node Visual States (Choreography State Machine)
* **Default State**: Thin bordered gray box with custom icons and low-intensity background.
* **Active Event Processing (Glow State)**:
  - **Success / Healthy**: Glows Emerald Green (`shadow-[0_0_15px_rgba(16,185,129,0.4)]`).
  - **In-Progress / Retry**: Glows Amber (`shadow-[0_0_15px_rgba(245,158,11,0.4)]`).
  - **Poison Message / DLQ**: Glows Crimson (`shadow-[0_0_15px_rgba(244,63,94,0.4)]`).
* **Interactive Database Icons**:
  - Small database disks overlaying the **Order**, **Inventory**, **Payment**, and **Shipping** nodes:
    - **Outbox DB Icon**: Blinks Cyan when an event is saved (processed = false).
    - **Inbox DB Icon**: Blinks Green when checking message deduplication before execution.

### C. Event Particle Edge Animations
* When an event is published:
  1. A glowing dot (color-coded to event type) spawns from the source node.
  2. The particle travels along the path connection line to the `[RabbitMQ Exchange]`.
  3. The `[RabbitMQ Exchange]` splits the particle, sending copies in parallel along the edge connections to bound queues.
  4. The particle reaches the destination node, lighting up the Inbox DB Icon for a brief deduplication check.

### D. DLQ Node & Message Surgeon Overlay
* If a poison message is sent or all 5 retries fail during a Chaos Monkey simulation, a red particle enters the **[Dead Letter Queue (DLQ)]** node, causing it to flash red.
* **User Action**: Clicking the pulsing DLQ node opens the **DLQ Message Surgeon** modal:
  - Displays the JSON message envelope containing headers, causationId, correlationId, and payload.
  - Allows the user to edit the JSON body in a live code editor (e.g., fixing an invalid price like `100.99` to `100.00`).
  - Click **"Resubmit to Message Bus"**: Re-enqueues the corrected message back into the main exchange, allowing the Saga to resume successfully.

---

## 5. Right Panel: Ledger, Conveyor & Chaos Panel (25% Width)

### A. Performance Optimizer Toggles & Conveyor Belt
* **Outbox Batch Conveyor**: Displays horizontal track containing boxes representing outbox records.
* **Outbox Mode Selector**: A switch to toggle:
  - **Sequential Mode**: Poller processes outbox messages one by one. The conveyor belt moves slowly, package-by-package.
  - **Batching Mode**: Poller groups messages in batches (size 10) and publishes them in parallel. The conveyor belt rushes and processes packages in bundles.
* **Dispatcher Trigger**: Click **"Run Dispatcher"** to manually sweep boxes off the belt and watch them convert into event particles on the visualizer canvas.

### B. Live Monospace Ledger Logs & Gantt Trace Tree
* Streams outbox/inbox records in real-time.
* **Gantt Trace Lineage Tree**: Clicking any log record opens a drawer containing a trace diagram:
  - Displays each message hop timeline (Order -> Inventory -> Payment -> Shipping).
  - Shows processing latency offsets (e.g., "RabbitMQ Routing: 15ms", "Payment Processing: 92ms").
  - Identifies causationId and correlationId relationships.

### C. Chaos Monkey Injection Switches
* Toggles (with skull icons) placed beside each service node:
  1. **Simulate Inventory Database Lock**
  2. **Simulate Payment API Timeout**
  3. **Simulate Shipping Delivery Exception**
* **Behavior when toggle is active**:
  - The target service fails processing.
  - The node glows Orange, displaying retry count: `"Retrying Event (Attempt 1/5)"`.
  - A countdown timer (TTL) displays over the retry exchange link.
  - If all 5 retries fail, the node flashes Crimson and a red event particle is routed into the `[Dead Letter Queue (DLQ)]` node.

---

## 6. Time-Travel Scrubber (Saga Replay)
* A scrubber slider component placed at the bottom of the viewport.
* **Flow**:
  1. When a Saga completes (successfully or compensation rollback), it is recorded as a session history block.
  2. Dragging the scrubber timeline back and forth pauses real-time WebSocket ingestion and replays the visual canvas events in slow motion.
  3. Clicking **"Resume Live Feed"** returns the canvas to active WebSocket listening.
