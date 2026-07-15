import { MarkerType, type Edge, type Node } from "@xyflow/react";
import { EDGE_MARKER } from "./tones.styles";
import type { Graph, LearnNodeData } from "./types";

export function n(
  id: string,
  x: number,
  y: number,
  label: string,
  sublabel?: string,
  tone?: LearnNodeData["tone"],
): Node<LearnNodeData> {
  return {
    id,
    type: "learnNode",
    position: { x, y },
    data: { label, sublabel, tone },
    draggable: false,
    selectable: false,
  };
}

export function e(
  source: string,
  target: string,
  label?: string,
  opts?: { sourceHandle?: string; targetHandle?: string; animated?: boolean },
): Edge {
  return {
    id: `${source}-${target}-${label ?? ""}`,
    type: "learnEdge",
    source,
    target,
    sourceHandle: opts?.sourceHandle,
    targetHandle: opts?.targetHandle,
    label,
    data: { animated: opts?.animated ?? true },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 14,
      height: 14,
      color: EDGE_MARKER,
    },
  };
}

export const GRAPHS: Record<string, Graph> = {
  orientation: {
    nodes: [
      n("mq", 280, 120, "Message bus", "RabbitMQ topic", "orange"),
      n("order", 80, 40, "Order", "creates orders", "cyan"),
      n("inv", 480, 40, "Inventory", "reserves stock", "amber"),
      n("pay", 80, 200, "Payment", "charges card", "emerald"),
      n("ship", 480, 200, "Shipping", "ship & deliver", "violet"),
      n("notif", 280, 260, "Notify", "UI + ledger", "rose"),
    ],
    edges: [
      e("order", "mq", "events"),
      e("inv", "mq", "events"),
      e("pay", "mq", "events"),
      e("ship", "mq", "events"),
      e("mq", "notif", "subscribe"),
      e("mq", "order", "react"),
      e("mq", "inv", "react"),
    ],
  },
  architecture: {
    nodes: [
      n("mono", 40, 40, "Monolith", "shared DB · soft borders", "slate"),
      n("mod", 280, 40, "Modular monolith", "schemas · events", "blue"),
      n("ms", 520, 40, "Microservices", "many deployables", "orange"),
      n("port", 160, 160, "Port", "RealtimeBroadcaster", "cyan"),
      n("redisA", 360, 120, "Redis adapter", "workers publish", "amber"),
      n("sioA", 360, 200, "Socket.io adapter", "HTTP delivers", "violet"),
      n("slice", 560, 160, "Vertical slice", "one use case folder", "emerald"),
    ],
    edges: [
      e("mono", "mod", "evolve"),
      e("mod", "ms", "extract later"),
      e("port", "redisA", "implements"),
      e("port", "sioA", "implements"),
      e("mod", "slice", "features"),
      e("mod", "port", "depends on"),
    ],
  },
  rabbitmq: {
    nodes: [
      n("pub", 40, 80, "Publisher", "Order module", "cyan"),
      n("ex", 220, 80, "Exchange", "topic · apex.events", "orange"),
      n("q1", 400, 40, "Queue", "inventory.q", "amber"),
      n("q2", 400, 120, "Queue", "payment.q", "emerald"),
      n("c1", 580, 40, "Consumer", "inventory worker", "amber"),
      n("c2", 580, 120, "Consumer", "payment worker", "emerald"),
    ],
    edges: [
      e("pub", "ex", "routing key"),
      e("ex", "q1", "inventory.*"),
      e("ex", "q2", "payment.*"),
      e("q1", "c1", "pull"),
      e("q2", "c2", "pull"),
    ],
  },
  "outbox-inbox": {
    nodes: [
      n("svc", 40, 90, "Service", "business logic", "cyan"),
      n("db", 200, 90, "PostgreSQL", "entity + outbox row", "slate"),
      n("relay", 380, 90, "Outbox relay", "poll & publish", "blue"),
      n("mq", 540, 90, "RabbitMQ", "durable queue", "orange"),
      n("worker", 700, 50, "Consumer", "inbox dedup", "amber"),
      n("inbox", 700, 130, "Inbox table", "processed ids", "slate"),
    ],
    edges: [
      e("svc", "db", "1 txn"),
      e("db", "relay", "SKIP LOCKED"),
      e("relay", "mq", "publish"),
      e("mq", "worker", "deliver"),
      e("worker", "inbox", "record"),
    ],
  },
  "events-saga": {
    nodes: [
      n("o1", 40, 100, "Order", "OrderPlaced", "cyan"),
      n("i1", 200, 100, "Inventory", "Reserved", "amber"),
      n("p1", 360, 100, "Payment", "Completed", "emerald"),
      n("o2", 520, 60, "Order", "→ PAID", "cyan"),
      n("s1", 520, 140, "Shipping", "Created", "violet"),
      n("n1", 680, 100, "Notify", "toast + ledger", "rose"),
    ],
    edges: [
      e("o1", "i1", "event"),
      e("i1", "p1", "event"),
      e("p1", "o2", "event"),
      e("p1", "s1", "event"),
      e("o2", "n1", "emit"),
      e("s1", "n1", "emit"),
    ],
  },
  "happy-path": {
    nodes: [
      n("s1", 30, 100, "① Place", "POST /orders", "cyan"),
      n("s2", 170, 100, "② Reserve", "stock held", "amber"),
      n("s3", 310, 100, "③ Pay", ".99 rule", "emerald"),
      n("s4", 450, 100, "④ Ship", "operator /ship", "violet"),
      n("s5", 590, 100, "⑤ Deliver", "operator /deliver", "violet"),
      n("ui", 750, 100, "Console", "live updates", "rose"),
    ],
    edges: [
      e("s1", "s2", "OrderPlaced"),
      e("s2", "s3", "InventoryReserved"),
      e("s3", "s4", "PaymentCompleted"),
      e("s4", "s5", "ShipmentShipped"),
      e("s5", "ui", "ShipmentDelivered"),
    ],
  },
  redis: {
    nodes: [
      n("w1", 40, 60, "Worker", "inventory CLI", "amber"),
      n("w2", 40, 140, "Worker", "payment CLI", "emerald"),
      n("redis", 260, 100, "Redis", "pub/sub backplane", "orange"),
      n("api", 480, 100, "API process", "Socket.io adapter", "blue"),
      n("browser", 680, 100, "Browser", "multiple tabs OK", "rose"),
    ],
    edges: [
      e("w1", "redis", "PUBLISH"),
      e("w2", "redis", "PUBLISH"),
      e("redis", "api", "SUBSCRIBE"),
      e("api", "browser", "emit to room"),
    ],
  },
  websockets: {
    nodes: [
      n("tab", 40, 100, "Browser tab", "React Console", "rose"),
      n("gw", 260, 100, "Gateway", "Socket.io", "blue"),
      n("room1", 480, 60, "Room", "saga:firehose", "violet"),
      n("room2", 480, 140, "Room", "order:{id}", "cyan"),
      n("notif", 680, 100, "Notification", "persist + push", "rose"),
    ],
    edges: [
      e("tab", "gw", "connect"),
      e("gw", "room1", "join"),
      e("gw", "room2", "join"),
      e("room1", "notif", "topology"),
      e("room2", "notif", "toasts"),
      e("notif", "tab", "push", { animated: true }),
    ],
  },
  "frontend-console": {
    nodes: [
      n("ws", 40, 100, "WebSocket", "real-time feed", "blue"),
      n("topo", 220, 40, "Topology", "React Flow graph", "violet"),
      n("ledger", 220, 100, "Event ledger", "scrollable log", "cyan"),
      n("ops", 220, 160, "Operator", "ship / deliver", "amber"),
      n("redux", 420, 100, "Redux store", "telemetry slice", "slate"),
      n("ui", 580, 100, "UI panels", "synced state", "rose"),
    ],
    edges: [
      e("ws", "redux", "saga-event"),
      e("redux", "topo", "animate"),
      e("redux", "ledger", "append"),
      e("ops", "ledger", "REST"),
      e("redux", "ui", "render"),
    ],
  },
  "hands-on": {
    nodes: [
      n("d", 40, 100, "Docker", "postgres + rabbit + redis", "slate"),
      n("w", 180, 100, "Workers", "./start-workers.sh", "orange"),
      n("o", 320, 100, "Place order", "Console UI", "cyan"),
      n("v", 460, 100, "Verify", "topology + ledger", "violet"),
      n("s", 600, 100, "Ship & deliver", "operator buttons", "emerald"),
    ],
    edges: [
      e("d", "w", "start"),
      e("w", "o", "ready"),
      e("o", "v", "watch events"),
      e("v", "s", "complete saga"),
    ],
  },
};

export const CAPTIONS: Record<string, string> = {
  orientation:
    "Five bounded contexts — no direct DB peeks. They talk only through the message bus.",
  architecture:
    "Evolve from monolith → modular monolith → microservices. Ports stay stable; adapters (Redis, Socket.io) plug in.",
  rabbitmq:
    "Publishers never call consumers. The exchange routes by key; queues buffer until workers are ready.",
  "outbox-inbox":
    "Business write and outbox insert share one transaction — so you never lose an event.",
  "events-saga":
    "Choreography: no central orchestrator. Each service listens, acts, and publishes the next event.",
  "happy-path":
    "One order’s golden path — the same sequence you will replay in the Console.",
  redis:
    "Workers run in separate processes; Redis fans out emits so every API instance reaches every browser.",
  websockets:
    "Persistent connection + rooms: global topology stream and per-order notification channels.",
  "frontend-console":
    "The Console is a teaching instrument — topology, ledger, and controls driven by the same event stream.",
  "hands-on":
    "Your lab checklist: infra up → workers running → place order → verify → complete shipment.",
};
