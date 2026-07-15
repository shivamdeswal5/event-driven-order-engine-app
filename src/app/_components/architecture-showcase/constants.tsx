import {
  Cpu,
  Package,
  CreditCard,
  Truck,
  Database,
  Layers,
  Activity,
} from "lucide-react";
import type { Connection, NodeData, SimulationStep, Stage } from "./types";

export const STAGES: Stage[] = [
  { label: "Client Ingress", key: ["client"] },
  { label: "API Gateway", key: ["gateway"] },
  { label: "Order Service", key: ["saga"] },
  { label: "Message Broker", key: ["rabbitmq"] },
  { label: "Bounded Contexts", key: ["inventory", "payment", "shipping"] },
];

export const NODES: NodeData[] = [
  {
    id: "client",
    title: "Client Console",
    subtitle: "Frontend interface",
    shortDesc: "Frontend Next.js client console initiating order transactions.",
    longDesc:
      "The client console manages dashboard controls, order creations, and dynamic telemetry visualizers. It communicates via REST API for order creation and establishes full-duplex WebSocket namespaces to receive live transaction updates.",
    color: "border-cyan-500/40 bg-cyan-500/5",
    textColor: "text-cyan-400",
    glowColor: "rgba(6, 182, 212, 0.4)",
    techs: ["React 19", "Next.js", "Redux Toolkit", "Socket.io"],
    components: [
      { name: "Order Client", icon: <Cpu className="h-3.5 w-3.5 text-cyan-400" /> },
      { name: "Observability UI", icon: <Activity className="h-3.5 w-3.5 text-cyan-400" /> },
    ],
    icon: <Cpu className="h-5 w-5 text-cyan-400" />,
  },
  {
    id: "gateway",
    title: "API Gateway",
    subtitle: "Ingress Router",
    shortDesc: "Entrypoint routing order requests to the core engine.",
    longDesc:
      "Validates incoming Rest payloads, enforces JWT auth headers, handles client rate-limits, and forwards sanitized order payload events down to the transactional Outbox of the Order Service.",
    color: "border-blue-500/40 bg-blue-500/5",
    textColor: "text-blue-400",
    glowColor: "rgba(59, 130, 246, 0.4)",
    techs: ["NestJS Ingress", "WebSockets", "Rate Limiter"],
    components: [
      { name: "API Router", icon: <Activity className="h-3.5 w-3.5 text-blue-400" /> },
      { name: "Auth Interceptor", icon: <Activity className="h-3.5 w-3.5 text-blue-400" /> },
    ],
    icon: <Activity className="h-5 w-5 text-blue-400" />,
  },
  {
    id: "saga",
    title: "Order Service",
    subtitle: "Order Bounded Context",
    shortDesc: "Manages order lifecycles and triggers saga compensating events.",
    longDesc:
      "Initiates transactions by creating orders (status: PLACED) in the order_schema. Publishes OrderPlacedEvent via outbox_messages. Automatically reacts to PaymentFailedEvent or InventoryReservationFailedEvent to execute compensating actions (status: CANCELLED) and fan out OrderCancelledEvent.",
    color: "border-indigo-500/40 bg-indigo-500/5",
    textColor: "text-indigo-400",
    glowColor: "rgba(99, 102, 241, 0.4)",
    techs: ["NestJS", "MikroORM", "PostgreSQL", "Outbox Relay"],
    components: [
      { name: "Order Controller", icon: <Database className="h-3.5 w-3.5 text-indigo-400" /> },
      { name: "Outbox Relayer", icon: <Layers className="h-3.5 w-3.5 text-indigo-400" /> },
    ],
    icon: <Database className="h-5 w-5 text-indigo-400" />,
  },
  {
    id: "rabbitmq",
    title: "RabbitMQ Broker",
    subtitle: "Message Transport",
    shortDesc: "Asynchronous topic-based message distribution broker.",
    longDesc:
      "Ensures eventual consistency and loose coupling. Relays events between isolated contexts using RabbitMQ topic exchange bindings (e.g. order-exchange, payment-exchange), dead letter queues, and consumer confirmations.",
    color: "border-amber-500/40 bg-amber-500/5",
    textColor: "text-amber-400",
    glowColor: "rgba(245, 158, 11, 0.4)",
    techs: ["RabbitMQ Topic Router", "Exchange Bindings", "Dead-Letter Queues"],
    components: [
      { name: "Topic Exchanges", icon: <Layers className="h-3.5 w-3.5 text-amber-400" /> },
      { name: "Message Queues", icon: <Activity className="h-3.5 w-3.5 text-amber-400" /> },
    ],
    icon: <Layers className="h-5 w-5 text-amber-400" />,
  },
  {
    id: "inventory",
    title: "Inventory Service",
    subtitle: "Domain Context",
    shortDesc: "Manages physical stock allocation and reservation logs.",
    longDesc:
      "Listens for OrderPlacedEvent, verifies stock availability, reserves the items (status: RESERVED) in inventory_schema, and publishes InventoryReservedEvent or InventoryReservationFailedEvent via outbox.",
    color: "border-emerald-500/40 bg-emerald-500/5",
    textColor: "text-emerald-400",
    glowColor: "rgba(16, 185, 129, 0.4)",
    techs: ["Stock Reservation", "MikroORM", "RabbitMQ Consumer", "Transactional Inbox/Outbox"],
    components: [
      { name: "Stock Reservation Processor", icon: <Package className="h-3.5 w-3.5 text-emerald-400" /> },
      {
        name: "Transactional Inbox (Deduplication)",
        icon: <Database className="h-3.5 w-3.5 text-emerald-400" />,
      },
    ],
    icon: <Package className="h-5 w-5 text-emerald-400" />,
  },
  {
    id: "payment",
    title: "Payment Service",
    subtitle: "Domain Context",
    shortDesc: "Processes financial transactions and billing authorization.",
    longDesc:
      "Listens for InventoryReservedEvent, simulates payment authorization (status: COMPLETED) in payment_schema, and publishes PaymentCompletedEvent or PaymentFailedEvent via outbox.",
    color: "border-emerald-500/40 bg-emerald-500/5",
    textColor: "text-emerald-400",
    glowColor: "rgba(16, 185, 129, 0.4)",
    techs: [
      "Deterministic Payment Simulator",
      "MikroORM",
      "RabbitMQ Consumer",
      "Transactional Inbox/Outbox",
    ],
    components: [
      { name: "Payment Auth Simulator", icon: <CreditCard className="h-3.5 w-3.5 text-emerald-400" /> },
      {
        name: "Transactional Inbox (Deduplication)",
        icon: <Database className="h-3.5 w-3.5 text-emerald-400" />,
      },
    ],
    icon: <CreditCard className="h-5 w-5 text-emerald-400" />,
  },
  {
    id: "shipping",
    title: "Shipping Service",
    subtitle: "Domain Context",
    shortDesc: "Creates dispatch manifests and tracking labels.",
    longDesc:
      "Generates tracking labels and manifests the shipping dispatch once payments are confirmed. Dispatches ShipmentCreatedEvent and ShipmentDeliveredEvent to transition the Saga to completion.",
    color: "border-emerald-500/40 bg-emerald-500/5",
    textColor: "text-emerald-400",
    glowColor: "rgba(16, 185, 129, 0.4)",
    techs: ["Label Creation", "Logistics Bind", "MikroORM", "Transactional Inbox/Outbox"],
    components: [
      { name: "Shipment Dispatch Manager", icon: <Truck className="h-3.5 w-3.5 text-emerald-400" /> },
      {
        name: "Transactional Inbox (Deduplication)",
        icon: <Database className="h-3.5 w-3.5 text-emerald-400" />,
      },
    ],
    icon: <Truck className="h-5 w-5 text-emerald-400" />,
  },
];

export const CONNECTIONS: Connection[] = [
  { id: "c1", from: "client", to: "gateway", color: "#06b6d4", delay: "0s", dur: "1.5s" },
  { id: "c2", from: "gateway", to: "saga", color: "#3b82f6", delay: "1.5s", dur: "1.5s" },
  { id: "c3", from: "saga", to: "rabbitmq", color: "#6366f1", delay: "4.2s", dur: "1.3s" },
  { id: "c4", from: "rabbitmq", to: "inventory", color: "#f59e0b", delay: "6.8s", dur: "1.4s" },
  { id: "c5", from: "rabbitmq", to: "payment", color: "#10b981", delay: "6.8s", dur: "2.8s" },
  { id: "c6", from: "rabbitmq", to: "shipping", color: "#8b5cf6", delay: "6.8s", dur: "4.2s" },
];

export const SIMULATION_SEQUENCE: SimulationStep[] = [
  {
    time: 0,
    node: "client",
    stage: 0,
    log: {
      icon: "🚀",
      timestamp: "14:20:00",
      tag: "CLIENT",
      message: "Order creation request POST /api/orders initiated by Client Console",
      colorClass: "text-cyan-600 dark:text-cyan-400",
      tagClass: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25",
    },
  },
  {
    time: 1200,
    node: "gateway",
    stage: 1,
    log: {
      icon: "🔌",
      timestamp: "14:20:01",
      tag: "GATEWAY",
      message: "Ingress payload validated, route matched by API Gateway, forwarding request",
      colorClass: "text-blue-600 dark:text-blue-400",
      tagClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
    },
  },
  {
    time: 2400,
    node: "saga",
    stage: 2,
    log: {
      icon: "🧠",
      timestamp: "14:20:02",
      tag: "ORDER_SRV",
      message: "Order Service persisted new order record in order_schema (status: PLACED)",
      colorClass: "text-indigo-600 dark:text-indigo-400",
      tagClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25",
    },
  },
  {
    time: 3600,
    node: "saga",
    stage: 2,
    log: {
      icon: "💾",
      timestamp: "14:20:03",
      tag: "DB_OUTBOX",
      message: "Saved OrderPlacedEvent to order_schema.outbox_messages inside atomic db transaction",
      colorClass: "text-indigo-500 dark:text-indigo-300 font-mono text-[10.5px]",
      tagClass: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/25",
    },
  },
  {
    time: 4800,
    node: "rabbitmq",
    stage: 3,
    log: {
      icon: "📮",
      timestamp: "14:20:04",
      tag: "OUTBOX_RELAY",
      message:
        "CLI Outbox Relay polled outbox_messages, published event with routing key 'order.placed' to order-exchange",
      colorClass: "text-amber-600 dark:text-amber-400",
      tagClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    },
  },
  {
    time: 6000,
    node: "rabbitmq",
    stage: 3,
    log: {
      icon: "🔀",
      timestamp: "14:20:05",
      tag: "BROKER",
      message: "RabbitMQ Broker: Topic Exchange order-exchange routed order.placed event to bound queues",
      colorClass: "text-amber-500 dark:text-amber-300 font-mono text-[10.5px]",
      tagClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    },
  },
  {
    time: 7200,
    node: "inventory",
    stage: 4,
    log: {
      icon: "📦",
      timestamp: "14:20:06",
      tag: "INVENTORY",
      message:
        "Inventory Service consumed order.placed, checked stock, reserved items (status: RESERVED) in inventory_schema, and stored InventoryReservedEvent in outbox",
      colorClass: "text-emerald-600 dark:text-emerald-400",
      tagClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    },
  },
  {
    time: 8400,
    node: "rabbitmq",
    stage: 3,
    log: {
      icon: "📮",
      timestamp: "14:20:07",
      tag: "OUTBOX_RELAY",
      message:
        "CLI Outbox Relay published InventoryReservedEvent to inventory-exchange with key 'inventory.reserved'",
      colorClass: "text-amber-600 dark:text-amber-400",
      tagClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    },
  },
  {
    time: 9600,
    node: "payment",
    stage: 4,
    log: {
      icon: "💳",
      timestamp: "14:20:08",
      tag: "PAYMENT",
      message:
        "Payment Service consumed inventory.reserved, authorized Stripe transaction (status: COMPLETED) in payment_schema, and stored PaymentCompletedEvent in outbox",
      colorClass: "text-emerald-600 dark:text-emerald-400",
      tagClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    },
  },
  {
    time: 10800,
    node: "rabbitmq",
    stage: 3,
    log: {
      icon: "📮",
      timestamp: "14:20:09",
      tag: "OUTBOX_RELAY",
      message:
        "CLI Outbox Relay published PaymentCompletedEvent to payment-exchange with key 'payment.completed'",
      colorClass: "text-amber-600 dark:text-amber-400",
      tagClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    },
  },
  {
    time: 12000,
    node: "saga",
    stage: 2,
    log: {
      icon: "🧠",
      timestamp: "14:20:10",
      tag: "ORDER_SRV",
      message: "Order Service consumed payment.completed, updated order record status to PAID in order_schema",
      colorClass: "text-indigo-600 dark:text-indigo-400",
      tagClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25",
    },
  },
  {
    time: 13200,
    node: "shipping",
    stage: 4,
    log: {
      icon: "🚚",
      timestamp: "14:20:11",
      tag: "SHIPPING",
      message:
        "Shipping Service consumed payment.completed, created pending shipment (status: PENDING) in shipping_schema, and stored ShipmentCreatedEvent in outbox",
      colorClass: "text-purple-600 dark:text-purple-400",
      tagClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25",
    },
  },
  {
    time: 14400,
    node: "rabbitmq",
    stage: 3,
    log: {
      icon: "📮",
      timestamp: "14:20:12",
      tag: "OUTBOX_RELAY",
      message:
        "CLI Outbox Relay published ShipmentCreatedEvent to shipping-exchange with key 'shipping.created'",
      colorClass: "text-amber-600 dark:text-amber-400",
      tagClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    },
  },
  {
    time: 15600,
    node: "saga",
    stage: 2,
    log: {
      icon: "✅",
      timestamp: "14:20:13",
      tag: "ORDER_SRV",
      message:
        "Order Service consumed ShipmentCreatedEvent and updated order status to SHIPPED. Saga successfully reconciled.",
      colorClass: "text-emerald-600 dark:text-emerald-400 font-bold",
      tagClass:
        "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/35 shadow-sm",
    },
  },
];
