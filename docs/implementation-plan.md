# Apex Console — Implementation Plan

This implementation plan details the phase-wise development of the Apex Console frontend, aligning it with the PostgreSQL schemas and RabbitMQ setup in `/home/shivam/Deswal/order-engine/event-driven-order-engine`.

---

## Phase Overview & Roadmap

| Phase | Title | Key Deliverables | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Foundation & Theme Setup | Package configs, Tailwind tokens, Redux store layout, Providers. | **[DONE]** |
| **Phase 2** | Platform API & Catalog Slices | Axios & WebSockets client instances, Product Catalog thunks, Checkout Redux slice. | **[PENDING]** |
| **Phase 3** | Bento Panel Interfaces | Sidebar Catalog/Cart forms, Ledger logs terminal, Conveyor belt & "Run Dispatcher" button. | **[PENDING]** |
| **Phase 4** | Topology Visualizer Canvas | React Flow graph, animated edges, outbox/inbox database node indicator lights, Monolith border. | **[PENDING]** |
| **Phase 5** | Chaos Monkey & DLQ Surgeon | Fault injection toggles, node retry counters, DLQ node, Message Surgeon code editor. | **[PENDING]** |
| **Phase 6** | Observability & Time-Travel | Gantt Trace Lineage Tree drawer, timeline scrubber, canvas frame recording. | **[PENDING]** |
| **Phase 7** | Polish & Verification | Bundle checks, state optimization, animation tuning, production build. | **[PENDING]** |

---

## Phase 1: Foundation & Theme Setup (Completed)
* **Goal**: Establish build tools, styling structures, and state management.
* **Deliverables**:
  - `package.json` with Next.js 15, React 19, RTK, React Flow, and Framer Motion.
  - `tsconfig.json`, `tailwind.config.ts`, and `postcss.config.js`.
  - `src/app/globals.css` containing light/dark HSL token variables.
  - SSR-safe Redux store configuration (`store.ts`, `hooks.ts`, `create-app-slice.ts`).
  - Font settings (Geist + JetBrains Mono) in the Root Layout.

---

## Phase 2: Platform API & Catalog Slices
* **Goal**: Connect frontend state to backend HTTP and WebSockets connections.
* **Steps**:
  1. **Axios Client**: Create `src/config/axios.ts` with error interceptors.
  2. **WebSocket Gateway Client**: Create `src/config/socket.ts` to establish socket connections on the `/notifications` namespace.
  3. **Product Catalog Redux Slice**:
     - Write thunks for `fetchProducts` (`GET /api/products`), `seedProducts` (`POST /api/products`), and `updateStock` (`PATCH /api/products/:id/stock`).
  4. **Orders Slice**:
     - Write thunks for `placeOrder` (`POST /api/orders`), `cancelOrder` (`POST /api/orders/:id/cancel`), and `fetchOrderDetails` (`GET /api/orders/:id`).
* **Deliverables**:
  - Working Axios and Socket.io clients.
  - Completed Redux slices for catalog, checkout, and order histories.

---

## Phase 3: Bento Panel Interfaces
* **Goal**: Build sidebar controllers, logs, and outbox conveyor.
* **Steps**:
  1. **Dashboard Page Route**: Create `src/app/dashboard/page.tsx` with a responsive 3-column layout.
  2. **Product Catalog Component**: Render cards showing products, stock, price, and adjust buttons.
  3. **Order Form & Checkout System**: Item selection drawer, debug UUID auto-populator, and checkout submit actions.
  4. **Ledger Logs Monospace Console**: Streams incoming socket frames.
  5. **Outbox Batch Conveyor Belt Component**:
     - A UI component showing a physical conveyor track.
     - Add **"Run Dispatcher"** button: Triggers background dispatcher actions.
* **Deliverables**:
  - Interactive Left Panel (Forms & Catalog) and Right Panel (Conveyor & Logs).
  - Clean transition loaders for API actions.

---

## Phase 4: Topology Visualizer Canvas
* **Goal**: Map modular monolith queue topologies.
* **Steps**:
  1. **React Flow Integration**: Install nodes: Order Service, RabbitMQ, Inventory, Payment, Shipping, and Notification.
  2. **Custom Bounded Context Node**:
     - Add database indicator lights (Outbox DB / Inbox DB) that blink during database operations.
  3. **Monolith Boundary Toggle**:
     - Implement CSS/SVG layout transition between unified monolith and microservice pod states.
  4. **Edge Traversal Animations**:
     - Custom edge lines representing event buses.
     - Program glowing event particles that fly along edges.
* **Deliverables**:
  - Working topology map rendering live event states.
  - Custom nodes with database indicators and monolith boundary switches.

---

## Phase 5: Chaos Monkey & DLQ Surgeon
* **Goal**: Simulate failure states, retries, and recover message flows.
* **Steps**:
  1. **Fault Injection Switches**: Add toggles next to nodes (e.g. database lock, gateway drop).
  2. **Simulate Retry Handlers**:
     - Active toggles render nodes in orange with label `"Retrying (Attempt 1-5)"`.
     - Render countdown timers (TTL) over the queue paths.
  3. **DLQ Node & Surgeon Editor**:
     - Red event particles route to the `[Dead Letter Queue]` node on failure.
     - Click DLQ node to open message surgeon JSON editor.
     - Resubmit message trigger to fire a replay back into the main exchange.
* **Deliverables**:
  - Chaos toggles panel.
  - Interactive retry loops, DLQ routing, and message surgeon resubmit functionality.

---

## Phase 6: Observability & Time-Travel
* **Goal**: Trace latency spans and scrub completed saga logs.
* **Steps**:
  1. **Gantt Trace Drawer**:
     - Render horizontal timeline trace spans detailing time metrics (e.g. queue time vs processing time).
     - Pull correlationId/causationId properties.
  2. **Saga State Recorder**: Create a slice helper that caches all event transitions of an active Saga.
  3. **Scrubber UI Component**: Slider track indicating event sequence frames.
  4. **Replay Controller**:
     - Dragging scrubber disconnects the live socket stream and feeds recorded frames back into the canvas.
* **Deliverables**:
  - Latency trace drawer interface.
  - Viewport scrubber track with Saga sequence caching and replay handlers.

---

## Phase 7: Polish & Verification
* **Goal**: Optimize states and bundle code.
* **Steps**:
  1. **State Persistence Configuration**: Add blacklists for loaders.
  2. **Accessibility Audit**: Check WCAG AA compliance (4.5:1 contrast, keyboard controls).
  3. **Production Validation**: Build bundles via `npm run build` and run lint checks.
* **Deliverables**:
  - Production-ready compiled build.
  - Zero compilation and hydration errors.
