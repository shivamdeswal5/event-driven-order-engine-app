# Apex Console — UI/UX Design Brief

This brief defines the aesthetic rules, typography scale, component layouts, and visual motion patterns for the Apex Console frontend.

---

## 1. Aesthetic Direction & Theme Style
The design system is styled as an **Obsidian Developer Cockpit** (Cyberpunk/Industrial Terminal style) with translucent, glowing interfaces.

### Core Style Rules:
* **Background Layer**: Deep charcoal slate (`#09090b`) with a glowing radial gradient mask overlay.
* **Dividers & Borders**: Ultra-thin (`1px`) semi-transparent borders with subtle white/gray opacity (`rgba(255, 255, 255, 0.08)`) to keep layouts structured.
* **Glow Accents**: Neon accents highlight functional statuses:
  - Cyan: Message routing and exchange edges.
  - Emerald Green: Healthy processes.
  - Amber: In-progress retry and delay states.
  - Crimson: Dead Letter Queue (DLQ) and failure events.
* **Typography**: Geist Sans for UI elements and JetBrains Mono for terminal panels.

---

## 2. Dynamic HSL Tokens

```css
:root {
  /* Pristine Steel (Light Mode) */
  --background: 240 5% 96%;
  --foreground: 240 10% 4%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 4%;
  --border: 240 5.9% 90%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;

  /* Node state tokens */
  --healthy: 142 76% 40%;
  --warning-state: 38 92% 45%;
  --critical: 346 84% 45%;
  --bus-route: 199 89% 43%;
  --radius: 0.75rem;
}

.dark {
  /* Obsidian (Dark Mode) */
  --background: 240 10% 4%;
  --foreground: 240 5% 96%;
  --card: 240 10% 9%;
  --card-foreground: 240 5% 96%;
  --border: 240 3.7% 15.9%;
  --primary: 0 0% 98%;
  --primary-foreground: 240 5.9% 10%;

  /* Node state tokens */
  --healthy: 142 76% 45%;
  --warning-state: 38 92% 50%;
  --critical: 346 84% 50%;
  --bus-route: 199 89% 48%;
  --radius: 0.75rem;
}
```

---

## 3. UI/UX Bento Box Structure
The single-screen dashboard is organized inside a 3-column bento-grid:

* **Header (10% height)**: Glassmorphic bar spanning 100% width containing:
  - Connected server pill, active metrics, theme controls, and the Monolith vs. Microservice slider.
* **Left Column (30% width)**: Control panel. Tabs for Catalog Management and checkout forms.
* **Center Column (45% width)**: React Flow canvas.
* **Right Column (25% width)**: Split panel containing the Conveyor Belt simulator on top and log ledger on the bottom.
* **Footer Timeline (5% height)**: Time-Travel Scrubber bar for Saga replays.

---

## 4. Visual Components & Animations

### A. React Flow Custom Nodes & Boundaries
- Custom nodes use rounded corners (`var(--radius)`) and semi-transparent backgrounds.
- Nodes have dynamic colored borders that glow depending on the focused Saga state.
- **Monolith Bounding Box**: Renders as a dashed, glowing border box surrounding all service nodes, fading out smoothly when transitioning to microservices mode.
- **Database Icons**: Inline database disk icon badges flash to represent local outbox/inbox database table entries.

### B. Animated Connection Edges
- Connections are drawn as curved paths.
- Edges pulse with traveling dash animations (`stroke-dasharray: 6`) representing active events.

### C. Live Outbox Batch Conveyor
- Structured like a conveyor track with floating cargo boxes representing outbox messages.
- Uses Framer Motion for physical slide transitions. Clicking "Run Dispatcher" plays a sweep animation that shoots particles onto the canvas.

### D. DLQ Message Surgeon Modal
- Renders as a dark frosted overlay modal with a monospace JSON text editor.
- The editor features line numbers, syntax coloring (key/value styles), and validation status flags.

### E. Gantt Trace Lineage Tree Drawer
- Displays horizontal latency bars color-coded by service module.
- Features connecting guidelines indicating causationId dependencies.

### F. Time-Travel Scrubber
- Minimalist track bar with a glowing thumb handle. Hovering displays timeline stamps.

---

## 5. UI/UX Anti-Patterns Checklist
- [ ] No static, text-only empty states. Provide a "Seed Data" prompt button.
- [ ] No abrupt state shifts. Use Framer Motion `AnimatePresence` for all list insertions and removals.
- [ ] Clickable targets must have `cursor-pointer` classes, hover transition timings (150-300ms), and spring click scales (`scale: 0.98`).
- [ ] Maintain consistent color-status mappings (never mix green/red status states).
