"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  Package,
  CreditCard,
  Truck,
  Database,
  Layers,
  HelpCircle,
  Activity,
  Play,
  Terminal as TerminalIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NodeData {
  id: string;
  title: string;
  subtitle: string;
  shortDesc: string;
  longDesc: string;
  color: string;
  textColor: string;
  glowColor: string;
  techs: string[];
  components: { name: string; icon: React.ReactNode }[];
  icon: React.ReactNode;
}

export function ArchitectureShowcase() {
  const [selectedLayer, setSelectedLayer] = useState<number>(2); // Default to Order Service
  const [isSimulating, setIsSimulating] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<number>(-1);
  
  // State to force redraw of connections on mount/resize
  const [resizeKey, setResizeKey] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const stages = [
    { label: "Client Ingress", key: ["client"] },
    { label: "API Gateway", key: ["gateway"] },
    { label: "Order Service", key: ["saga"] },
    { label: "Message Broker", key: ["rabbitmq"] },
    { label: "Bounded Contexts", key: ["inventory", "payment", "shipping"] }
  ];

  const nodes: NodeData[] = [
    {
      id: "client",
      title: "Client Console",
      subtitle: "Frontend interface",
      shortDesc: "Frontend Next.js client console initiating order transactions.",
      longDesc: "The client console manages dashboard controls, order creations, and dynamic telemetry visualizers. It communicates via REST API for order creation and establishes full-duplex WebSocket namespaces to receive live transaction updates.",
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
      longDesc: "Validates incoming Rest payloads, enforces JWT auth headers, handles client rate-limits, and forwards sanitized order payload events down to the transactional Outbox of the Order Service.",
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
      longDesc: "Initiates transactions by creating orders (status: PLACED) in the order_schema. Publishes OrderPlacedEvent via outbox_messages. Automatically reacts to PaymentFailedEvent or InventoryReservationFailedEvent to execute compensating actions (status: CANCELLED) and fan out OrderCancelledEvent.",
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
      longDesc: "Ensures eventual consistency and loose coupling. Relays events between isolated contexts using RabbitMQ topic exchange bindings (e.g. order-exchange, payment-exchange), dead letter queues, and consumer confirmations.",
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
      longDesc: "Listens for OrderPlacedEvent, verifies stock availability, reserves the items (status: RESERVED) in inventory_schema, and publishes InventoryReservedEvent or InventoryReservationFailedEvent via outbox.",
      color: "border-emerald-500/40 bg-emerald-500/5",
      textColor: "text-emerald-400",
      glowColor: "rgba(16, 185, 129, 0.4)",
      techs: ["Stock Reservation", "MikroORM", "RabbitMQ Consumer", "Transactional Inbox/Outbox"],
      components: [
        { name: "Stock Reservation Processor", icon: <Package className="h-3.5 w-3.5 text-emerald-400" /> },
        { name: "Transactional Inbox (Deduplication)", icon: <Database className="h-3.5 w-3.5 text-emerald-400" /> },
      ],
      icon: <Package className="h-5 w-5 text-emerald-400" />,
    },
    {
      id: "payment",
      title: "Payment Service",
      subtitle: "Domain Context",
      shortDesc: "Processes financial transactions and billing authorization.",
      longDesc: "Listens for InventoryReservedEvent, simulates payment authorization (status: COMPLETED) in payment_schema, and publishes PaymentCompletedEvent or PaymentFailedEvent via outbox.",
      color: "border-emerald-500/40 bg-emerald-500/5",
      textColor: "text-emerald-400",
      glowColor: "rgba(16, 185, 129, 0.4)",
      techs: ["Deterministic Payment Simulator", "MikroORM", "RabbitMQ Consumer", "Transactional Inbox/Outbox"],
      components: [
        { name: "Payment Auth Simulator", icon: <CreditCard className="h-3.5 w-3.5 text-emerald-400" /> },
        { name: "Transactional Inbox (Deduplication)", icon: <Database className="h-3.5 w-3.5 text-emerald-400" /> },
      ],
      icon: <CreditCard className="h-5 w-5 text-emerald-400" />,
    },
    {
      id: "shipping",
      title: "Shipping Service",
      subtitle: "Domain Context",
      shortDesc: "Creates dispatch manifests and tracking labels.",
      longDesc: "Generates tracking labels and manifests the shipping dispatch once payments are confirmed. Dispatches ShipmentCreatedEvent and ShipmentDeliveredEvent to transition the Saga to completion.",
      color: "border-emerald-500/40 bg-emerald-500/5",
      textColor: "text-emerald-400",
      glowColor: "rgba(16, 185, 129, 0.4)",
      techs: ["Label Creation", "Logistics Bind", "MikroORM", "Transactional Inbox/Outbox"],
      components: [
        { name: "Shipment Dispatch Manager", icon: <Truck className="h-3.5 w-3.5 text-emerald-400" /> },
        { name: "Transactional Inbox (Deduplication)", icon: <Database className="h-3.5 w-3.5 text-emerald-400" /> },
      ],
      icon: <Truck className="h-5 w-5 text-emerald-400" />,
    },
  ];

  // Force updating path positions when window size changes
  useEffect(() => {
    const handleResize = () => setResizeKey((prev) => prev + 1);
    window.addEventListener("resize", handleResize);
    // Timeout to make sure DOM is fully painted
    const timer = setTimeout(() => handleResize(), 200);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Autoscroll terminal logs container internally
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTo({
        top: terminalRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [logs]);

  const startSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setLogs([]);
    setActiveNode("client");
    setCurrentStage(0);

    const sequence = [
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
          tagClass: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/25"
        }
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
          tagClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25"
        }
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
          tagClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25"
        }
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
          tagClass: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/25"
        }
      },
      {
        time: 4800,
        node: "rabbitmq",
        stage: 3,
        log: {
          icon: "📮",
          timestamp: "14:20:04",
          tag: "OUTBOX_RELAY",
          message: "CLI Outbox Relay polled outbox_messages, published event with routing key 'order.placed' to order-exchange",
          colorClass: "text-amber-600 dark:text-amber-400",
          tagClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25"
        }
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
          tagClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25"
        }
      },
      {
        time: 7200,
        node: "inventory",
        stage: 4,
        log: {
          icon: "📦",
          timestamp: "14:20:06",
          tag: "INVENTORY",
          message: "Inventory Service consumed order.placed, checked stock, reserved items (status: RESERVED) in inventory_schema, and stored InventoryReservedEvent in outbox",
          colorClass: "text-emerald-600 dark:text-emerald-400",
          tagClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
        }
      },
      {
        time: 8400,
        node: "rabbitmq",
        stage: 3,
        log: {
          icon: "📮",
          timestamp: "14:20:07",
          tag: "OUTBOX_RELAY",
          message: "CLI Outbox Relay published InventoryReservedEvent to inventory-exchange with key 'inventory.reserved'",
          colorClass: "text-amber-600 dark:text-amber-400",
          tagClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25"
        }
      },
      {
        time: 9600,
        node: "payment",
        stage: 4,
        log: {
          icon: "💳",
          timestamp: "14:20:08",
          tag: "PAYMENT",
          message: "Payment Service consumed inventory.reserved, authorized Stripe transaction (status: COMPLETED) in payment_schema, and stored PaymentCompletedEvent in outbox",
          colorClass: "text-emerald-600 dark:text-emerald-400",
          tagClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25"
        }
      },
      {
        time: 10800,
        node: "rabbitmq",
        stage: 3,
        log: {
          icon: "📮",
          timestamp: "14:20:09",
          tag: "OUTBOX_RELAY",
          message: "CLI Outbox Relay published PaymentCompletedEvent to payment-exchange with key 'payment.completed'",
          colorClass: "text-amber-600 dark:text-amber-400",
          tagClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25"
        }
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
          tagClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25"
        }
      },
      {
        time: 13200,
        node: "shipping",
        stage: 4,
        log: {
          icon: "🚚",
          timestamp: "14:20:11",
          tag: "SHIPPING",
          message: "Shipping Service consumed payment.completed, created pending shipment (status: PENDING) in shipping_schema, and stored ShipmentCreatedEvent in outbox",
          colorClass: "text-purple-600 dark:text-purple-400",
          tagClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25"
        }
      },
      {
        time: 14400,
        node: "rabbitmq",
        stage: 3,
        log: {
          icon: "📮",
          timestamp: "14:20:12",
          tag: "OUTBOX_RELAY",
          message: "CLI Outbox Relay published ShipmentCreatedEvent to shipping-exchange with key 'shipping.created'",
          colorClass: "text-amber-600 dark:text-amber-400",
          tagClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25"
        }
      },
      {
        time: 15600,
        node: "saga",
        stage: 2,
        log: {
          icon: "✅",
          timestamp: "14:20:13",
          tag: "ORDER_SRV",
          message: "Order Service consumed ShipmentCreatedEvent and updated order status to SHIPPED. Saga successfully reconciled.",
          colorClass: "text-emerald-600 dark:text-emerald-400 font-bold",
          tagClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/35 shadow-sm"
        }
      }
    ];

    sequence.forEach((step) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, step.log]);
        setCurrentStage(step.stage);
        if (step.node) {
          setActiveNode(step.node);
          const index = nodes.findIndex((n) => n.id === step.node);
          if (index !== -1) setSelectedLayer(index);
        } else {
          setActiveNode(null);
        }
      }, step.time);
    });

    setTimeout(() => {
      setIsSimulating(false);
      setCurrentStage(-1);
    }, 17000);
  };

  // Helper to calculate exact coordinates for curves between elements
  const getSocketCoords = (nodeId: string, side: "left" | "right" | "top" | "bottom") => {
    const el = document.getElementById(`node-${nodeId}`);
    if (!el || !containerRef.current) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    
    const xLeft = rect.left - containerRect.left;
    const xRight = rect.right - containerRect.left;
    const xCenter = rect.left - containerRect.left + rect.width / 2;
    
    const yTop = rect.top - containerRect.top;
    const yBottom = rect.bottom - containerRect.top;
    const yCenter = rect.top - containerRect.top + rect.height / 2;
    
    if (side === "left") return { x: xLeft, y: yCenter };
    if (side === "right") return { x: xRight, y: yCenter };
    if (side === "top") return { x: xCenter, y: yTop };
    return { x: xCenter, y: yBottom };
  };

  const getPathData = (fromId: string, toId: string) => {
    const elFrom = document.getElementById(`node-${fromId}`);
    const elTo = document.getElementById(`node-${toId}`);
    if (!elFrom || !elTo || !containerRef.current) return "";
    
    const fromRect = elFrom.getBoundingClientRect();
    const toRect = elTo.getBoundingClientRect();
    
    // Check if horizontal flow or vertical flow
    const isHorizontal = toRect.left > fromRect.right + 20;
    
    const start = getSocketCoords(fromId, isHorizontal ? "right" : "bottom");
    const end = getSocketCoords(toId, isHorizontal ? "left" : "top");
    
    if (isHorizontal) {
      const dx = Math.abs(end.x - start.x) * 0.45;
      return `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`;
    } else {
      const dy = Math.abs(end.y - start.y) * 0.45;
      return `M ${start.x} ${start.y} C ${start.x} ${start.y + dy}, ${end.x} ${end.y - dy}, ${end.x} ${end.y}`;
    }
  };

  // Define diagram connection lines with slow matching speeds
  const connections = [
    { id: "c1", from: "client", to: "gateway", color: "#06b6d4", delay: "0s", dur: "1.5s" },
    { id: "c2", from: "gateway", to: "saga", color: "#3b82f6", delay: "1.5s", dur: "1.5s" },
    { id: "c3", from: "saga", to: "rabbitmq", color: "#6366f1", delay: "4.2s", dur: "1.3s" },
    { id: "c4", from: "rabbitmq", to: "inventory", color: "#f59e0b", delay: "6.8s", dur: "1.4s" },
    { id: "c5", from: "rabbitmq", to: "payment", color: "#10b981", delay: "6.8s", dur: "2.8s" },
    { id: "c6", from: "rabbitmq", to: "shipping", color: "#8b5cf6", delay: "6.8s", dur: "4.2s" },
  ];

  return (
    <motion.section
      id="architecture"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="py-24 border-t border-border/40 relative bg-background/30 overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4 text-xs tracking-wider uppercase font-semibold border-primary/20 bg-primary/5 text-primary">
            Architecture Map
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Interactive System Architecture
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Click on any microservice block to inspect its technology stack, or trigger the event loop simulator to watch transaction telemetry propagate in real-time.
          </p>
        </div>

        {/* Dashboard Actions */}
        <div className="flex justify-center mb-10">
          <Button
            onClick={startSimulation}
            disabled={isSimulating}
            className="rounded-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-6 py-5 gap-2 border border-primary/30 shadow-lg shadow-primary/10 transition-transform active:scale-95"
          >
            <Play className={`h-4.5 w-4.5 ${isSimulating ? "animate-pulse" : ""}`} />
            {isSimulating ? "Simulating Event Loop..." : "Simulate Order Event Loop"}
          </Button>
        </div>

        {/* Saga Phase Tracker */}
        <div className="max-w-4xl mx-auto mb-12 border border-border/30 rounded-2xl bg-card/25 p-4 md:px-8 backdrop-blur-sm shadow-md">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
            {stages.map((stage, idx) => {
              const isActive = currentStage === idx;
              const isCompleted = currentStage > idx || (currentStage === -1 && logs.length > 0);
              
              return (
                <React.Fragment key={stage.label}>
                  <div className="flex items-center gap-2">
                    <div className={`relative flex items-center justify-center h-7 w-7 rounded-full text-[10.5px] font-bold border transition-all duration-500 ${
                      isActive 
                        ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                        : isCompleted 
                        ? "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30"
                        : "bg-background text-muted-foreground border-border"
                    }`}>
                      {isCompleted ? "✓" : idx + 1}
                      {isActive && (
                        <span className="absolute -inset-1 rounded-full border border-primary animate-ping opacity-60 pointer-events-none" />
                      )}
                    </div>
                    <span className={`text-[11.5px] font-bold transition-colors duration-300 ${
                      isActive 
                        ? "text-primary dark:text-indigo-400 font-extrabold" 
                        : isCompleted 
                        ? "text-foreground dark:text-zinc-200 font-semibold" 
                        : "text-muted-foreground"
                    }`}>
                      {stage.label}
                    </span>
                  </div>
                  {idx < stages.length - 1 && (
                    <div className="hidden md:block flex-1 h-[2px] mx-4 rounded-full relative bg-border overflow-hidden">
                      <div className={`absolute inset-y-0 left-0 transition-all duration-700 ${
                        isCompleted ? "w-full bg-primary/70" : isActive ? "w-1/2 bg-primary animate-pulse" : "w-0"
                      }`} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Interactive Diagram Sandbox */}
          <div className="lg:col-span-8 flex flex-col justify-between border border-border/40 rounded-3xl p-6 bg-card/10 dark:bg-black/10 backdrop-blur-sm relative overflow-hidden">
            
            {/* Grid overlay for tech blueprint aesthetic */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none z-0">
              <div className="w-full h-full bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:20px_20px]" />
            </div>

            {/* SVG overlay containing the bezier path connection wires and animated signal dots */}
            <div className="absolute inset-0 z-0 pointer-events-none" ref={containerRef}>
              <svg className="w-full h-full" key={resizeKey}>
                <defs>
                  {/* Glowing glow filters for signal pings */}
                  <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Draw connection curves */}
                {connections.map((c) => {
                  const d = getPathData(c.from, c.to);
                  if (!d) return null;
                  
                  return (
                    <g key={c.id}>
                      {/* Background dark pathway wire */}
                      <path
                        d={d}
                        fill="none"
                        className="stroke-border/45 dark:stroke-border/25"
                        strokeWidth={2.5}
                      />
                      
                      {/* Active highlighted connection line (only when nodes are active in loop) */}
                      {isSimulating && (activeNode === c.from || activeNode === c.to) && (
                        <motion.path
                          d={d}
                          fill="none"
                          stroke={c.color}
                          strokeWidth={2.5}
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 0.5 }}
                          className="opacity-75"
                        />
                      )}

                      {/* Animated signal dots traveling down the path */}
                      {isSimulating && (
                        <circle r="4.5" fill={c.color} filter="url(#glow-cyan)">
                          <animateMotion dur={c.dur} repeatCount="1" fill="freeze" begin={c.delay}>
                            <mpath href={`#path-${c.id}`} />
                          </animateMotion>
                        </circle>
                      )}

                      {/* Hidden path with ID specifically for animateMotion linking */}
                      <path
                        id={`path-${c.id}`}
                        d={d}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={1}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Diagram Nodes Columns */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 items-center justify-between z-10 w-full py-8">
              
              {/* Col 1: Ingress (Client & Gateway) */}
              <div className="flex flex-col gap-8 md:gap-14">
                {nodes.slice(0, 2).map((n, idx) => {
                  const isNodeActive = activeNode === n.id;
                  const isSelected = nodes[selectedLayer]?.id === n.id;
                  
                  return (
                    <div
                      key={n.id}
                      id={`node-${n.id}`}
                      onClick={() => {
                        const nodeIdx = nodes.findIndex((item) => item.id === n.id);
                        setSelectedLayer(nodeIdx);
                      }}
                      className={`flex flex-col p-4 rounded-2xl border cursor-pointer backdrop-blur-md transition-all duration-300 relative ${
                        isNodeActive
                          ? "border-primary shadow-[0_0_20px_rgba(99,102,241,0.2)] bg-card/80"
                          : isSelected
                          ? "border-primary/70 bg-card/65"
                          : "border-border/60 bg-card/45 hover:border-border/90 hover:bg-card/60"
                      }`}
                    >
                      {/* Dynamic blinking active indicator dot */}
                      {isNodeActive && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                        </span>
                      )}
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-background border border-border/80">
                          {n.icon}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-[13px] text-foreground tracking-tight leading-tight">
                            {n.title}
                          </h4>
                          <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wide leading-none">
                            {n.subtitle}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Col 2: Order Service (Saga Choreography) */}
              <div className="flex flex-col justify-center">
                {nodes.slice(2, 3).map((n) => {
                  const isNodeActive = activeNode === n.id;
                  const isSelected = nodes[selectedLayer]?.id === n.id;

                  return (
                    <div
                      key={n.id}
                      id={`node-${n.id}`}
                      onClick={() => {
                        const nodeIdx = nodes.findIndex((item) => item.id === n.id);
                        setSelectedLayer(nodeIdx);
                      }}
                      className={`flex flex-col p-4 rounded-2xl border cursor-pointer backdrop-blur-md transition-all duration-300 md:my-10 relative ${
                        isNodeActive
                          ? "border-primary shadow-[0_0_25px_rgba(99,102,241,0.25)] bg-card/85"
                          : isSelected
                          ? "border-primary/70 bg-card/65"
                          : "border-border/60 bg-card/45 hover:border-border/90 hover:bg-card/60"
                      }`}
                    >
                      {/* Dynamic blinking active indicator dot */}
                      {isNodeActive && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                        </span>
                      )}

                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-background border border-border/80">
                          {n.icon}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-[13px] text-foreground tracking-tight leading-tight">
                            {n.title}
                          </h4>
                          <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wide leading-none">
                            {n.subtitle}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Col 3: Event Transport (Message Broker) */}
              <div className="flex flex-col justify-center">
                {nodes.slice(3, 4).map((n) => {
                  const isNodeActive = activeNode === n.id;
                  const isSelected = nodes[selectedLayer]?.id === n.id;

                  return (
                    <div
                      key={n.id}
                      id={`node-${n.id}`}
                      onClick={() => {
                        const nodeIdx = nodes.findIndex((item) => item.id === n.id);
                        setSelectedLayer(nodeIdx);
                      }}
                      className={`flex flex-col p-4 rounded-2xl border cursor-pointer backdrop-blur-md transition-all duration-300 md:my-10 relative ${
                        isNodeActive
                          ? "border-primary shadow-[0_0_25px_rgba(99,102,241,0.25)] bg-card/85"
                          : isSelected
                          ? "border-primary/70 bg-card/65"
                          : "border-border/60 bg-card/45 hover:border-border/90 hover:bg-card/60"
                      }`}
                    >
                      {/* Dynamic blinking active indicator dot */}
                      {isNodeActive && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                        </span>
                      )}

                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-background border border-border/80">
                          {n.icon}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-[13px] text-foreground tracking-tight leading-tight">
                            {n.title}
                          </h4>
                          <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wide leading-none">
                            {n.subtitle}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Col 4: Worker Domain Services */}
              <div className="flex flex-col gap-5">
                {nodes.slice(4, 7).map((n) => {
                  const isNodeActive = activeNode === n.id;
                  const isSelected = nodes[selectedLayer]?.id === n.id;

                  return (
                    <div
                      key={n.id}
                      id={`node-${n.id}`}
                      onClick={() => {
                        const nodeIdx = nodes.findIndex((item) => item.id === n.id);
                        setSelectedLayer(nodeIdx);
                      }}
                      className={`flex flex-col p-3.5 rounded-2xl border cursor-pointer backdrop-blur-md transition-all duration-300 relative ${
                        isNodeActive
                          ? "border-primary shadow-[0_0_20px_rgba(99,102,241,0.2)] bg-card/80"
                          : isSelected
                          ? "border-primary/70 bg-card/65"
                          : "border-border/60 bg-card/45 hover:border-border/90 hover:bg-card/60"
                      }`}
                    >
                      {/* Dynamic blinking active indicator dot */}
                      {isNodeActive && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                        </span>
                      )}

                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-background border border-border/80">
                          {n.icon}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-[12px] text-foreground tracking-tight leading-tight">
                            {n.title}
                          </h4>
                          <span className="text-[9px] text-muted-foreground uppercase font-mono tracking-wide leading-none">
                            {n.subtitle}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Simulated Live Logs Monospaced Terminal */}
            <div className="mt-4 border border-border/60 dark:border-border/40 bg-card/45 dark:bg-black/30 backdrop-blur-md rounded-2xl p-4 font-mono text-xs overflow-hidden h-44 flex flex-col z-10 shadow-inner relative">
              {/* Subtle top glowing bar indicator */}
              <div className={`absolute top-0 inset-x-0 h-[2.5px] transition-colors duration-500 z-20 ${
                isSimulating ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" : "bg-indigo-500/25"
              }`} />

              {/* CRT Matrix micro-grid background pattern */}
              <div 
                className="absolute inset-0 pointer-events-none z-0 opacity-[0.015] dark:opacity-[0.03]" 
                style={{ 
                  backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", 
                  backgroundSize: "8px 8px" 
                }} 
              />

              <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/20 text-muted-foreground select-none z-10">
                <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase font-sans text-indigo-600 dark:text-indigo-400">
                  <TerminalIcon className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" /> Live Event Telemetry Stream
                </span>
                <span className={`text-[9px] font-extrabold uppercase font-mono tracking-widest px-2 py-0.5 rounded-full border transition-all duration-300 ${
                  isSimulating 
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 animate-pulse" 
                    : "bg-muted text-muted-foreground border-border"
                }`}>
                  {isSimulating ? "Running" : "Idle"}
                </span>
              </div>
              <div 
                ref={terminalRef}
                className="flex-1 overflow-y-auto space-y-1.5 pr-1 z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {logs.length === 0 ? (
                  <div className="text-muted-foreground/60 italic text-[11px] h-full flex items-center justify-center select-none">
                    Waiting to capture telemetry loop events... Click 'Simulate Order Event Loop' above to run.
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {logs.map((log: any, i) => {
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8, filter: "blur(1px)" }}
                          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2.5 text-[11px] leading-relaxed font-mono py-0.5"
                        >
                          {/* Timestamp & Icon */}
                          <div className="flex items-center gap-1.5 shrink-0 select-none">
                            <span className="text-[10px] text-muted-foreground/60 font-mono">
                              [{log.timestamp}]
                            </span>
                            <span className="text-[12px]">{log.icon}</span>
                          </div>

                          {/* Tag Badge */}
                          <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-extrabold uppercase font-mono border shrink-0 ${log.tagClass}`}>
                            {log.tag}
                          </span>

                          {/* Message Body */}
                          <span className={`${log.colorClass} flex-1`}>
                            {log.message}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Dynamic Info Panel */}
          <div className="lg:col-span-4">
            <AnimatePresence mode="wait">
              {nodes.map((layer, index) => {
                if (index !== selectedLayer) return null;

                return (
                  <motion.div
                    key={layer.id}
                    initial={{ opacity: 0, x: 25 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -25 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col h-full bg-card/35 border border-border/50 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-lg relative overflow-hidden"
                  >
                    {/* Glowing corner backdrop */}
                    <div
                      className="absolute -right-20 -top-20 w-44 h-44 rounded-full filter blur-[60px] opacity-10 pointer-events-none"
                      style={{ backgroundColor: layer.glowColor }}
                    />

                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 rounded-2xl border bg-background border-border/80">
                        {layer.icon}
                      </div>
                      <div>
                        <span className="text-[10px] font-bold font-mono tracking-widest text-muted-foreground uppercase">
                          Context Inspection
                        </span>
                        <h3 className="font-extrabold text-lg text-foreground mt-0.5">
                          {layer.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-foreground font-semibold text-xs leading-relaxed mb-4">
                      {layer.shortDesc}
                    </p>

                    <p className="text-muted-foreground text-[12px] leading-relaxed mb-6">
                      {layer.longDesc}
                    </p>

                    {/* Tech Badges */}
                    <div className="mb-6 pt-4 border-t border-border/40">
                      <h4 className="text-[10px] font-bold font-mono tracking-wider text-muted-foreground uppercase mb-3 flex items-center gap-1.5">
                        <HelpCircle size={12} className="text-primary" />
                        Tech Stack Isolation
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {layer.techs.map((tech) => (
                          <Badge
                            key={tech}
                            variant="secondary"
                            className="bg-background/80 hover:bg-background border border-border/60 text-xs font-mono text-muted-foreground px-2.5 py-0.5 rounded-lg"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Subsystem components */}
                    <div className="pt-4 border-t border-border/40 mt-auto">
                      <h4 className="text-[10px] font-bold font-mono tracking-wider text-muted-foreground uppercase mb-3">
                        Subsystems Active
                      </h4>
                      <div className="grid grid-cols-1 gap-2.5">
                        {layer.components.map((comp) => (
                          <div
                            key={comp.name}
                            className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/40 bg-background/50 hover:bg-background/80 transition-colors"
                          >
                            <div className="p-1 rounded-lg bg-background border border-border/65">
                              {comp.icon}
                            </div>
                            <span className="text-xs font-bold text-foreground">
                              {comp.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </motion.section>
  );
}
