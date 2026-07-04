"use client";

import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, ArrowLeft, Link as LinkIcon, Zap, ShoppingCart, Package, CreditCard, Truck, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
}

interface RadialOrbitalTimelineProps {
  timelineData?: TimelineItem[];
}

const defaultTimelineData: TimelineItem[] = [
  {
    id: 1,
    title: "1. Order Placed",
    date: "Step 1",
    content: "Order Service receives order request, persists Order entity (status: PLACED) to order_schema, and stores OrderPlacedEvent in the outbox_messages table in the same transaction.",
    category: "Order Context",
    icon: ShoppingCart,
    relatedIds: [2],
    status: "completed",
    energy: 100,
  },
  {
    id: 2,
    title: "2. Inventory Reserved",
    date: "Step 2",
    content: "Inventory Service consumes order.placed, checks stock, decrements stock_quantity, increases reserved_quantity, saves Reservation (status: RESERVED) to inventory_schema, and dispatches InventoryReservedEvent.",
    category: "Inventory Context",
    icon: Package,
    relatedIds: [1, 3],
    status: "completed",
    energy: 95,
  },
  {
    id: 3,
    title: "3. Payment Completed",
    date: "Step 3",
    content: "Payment Service consumes inventory.reserved, simulates authorization (fails on amount ending in .99), creates Payment (status: COMPLETED) in payment_schema, and saves PaymentCompletedEvent in the transactional outbox.",
    category: "Payment Context",
    icon: CreditCard,
    relatedIds: [2, 4],
    status: "completed",
    energy: 98,
  },
  {
    id: 4,
    title: "4. Shipment Created",
    date: "Step 4",
    content: "Shipping Service consumes payment.completed, schedules delivery, creates Shipment (status: PENDING) in shipping_schema, and dispatches ShipmentCreatedEvent via the Outbox Relay.",
    category: "Shipping Context",
    icon: Truck,
    relatedIds: [3, 5],
    status: "in-progress",
    energy: 90,
  },
  {
    id: 5,
    title: "5. Eventual Consistency",
    date: "Step 5",
    content: "Order Service consumes ShipmentCreatedEvent and transitions order status to SHIPPED. When the shipment is delivered, ShipmentDeliveredEvent transitions the order status to DELIVERED, completing the decentralized saga.",
    category: "Success Context",
    icon: CheckCircle2,
    relatedIds: [4],
    status: "pending",
    energy: 99,
  },
];

export default function RadialOrbitalTimeline({
  timelineData = defaultTimelineData,
}: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [viewMode] = useState<"orbital">("orbital");
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [centerOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const centerViewOnNode = (nodeId: number) => {
    if (viewMode !== "orbital" || !nodeRefs.current[nodeId]) return;

    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;

    // Direct the rotation to align the clicked node to the top/front focus (270 degrees)
    setRotationAngle(270 - targetAngle);
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        const numKey = parseInt(key);
        if (numKey !== id) {
          newState[numKey] = false;
        }
      });

      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);
        const relatedItems = getRelatedItems(id);
        const newPulseEffect: Record<number, boolean> = {};
        relatedItems.forEach((relId) => {
          newPulseEffect[relId] = true;
        });
        setPulseEffect(newPulseEffect);
        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);    
        setPulseEffect({});
      }

      return newState;
    });
  };

  useEffect(() => {
    let rotationTimer: NodeJS.Timeout;

    if (autoRotate && viewMode === "orbital") {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => {
          const newAngle = (prev + 0.15) % 360;
          return Number(newAngle.toFixed(3));
        });
      }, 30);
    }

    return () => {
      if (rotationTimer) {
        clearInterval(rotationTimer);
      }
    };
  }, [autoRotate, viewMode]);

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 260;
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian) + centerOffset.x;
    const y = radius * Math.sin(radian) + centerOffset.y;

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(
      0.55,
      Math.min(1, 0.55 + 0.45 * ((1 + Math.sin(radian)) / 2))
    );

    return { x, y, angle, zIndex, opacity };
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    const relatedItems = getRelatedItems(activeNodeId);
    return relatedItems.includes(itemId);
  };

  const getStatusStyles = (status: TimelineItem["status"]): string => {
    switch (status) {
      case "completed":
        return "text-cyan-400 border-cyan-500/30 bg-cyan-500/10";
      case "in-progress":
        return "text-violet-400 border-violet-500/30 bg-violet-500/10 animate-pulse";
      case "pending":
        return "text-muted-foreground border-border/50 bg-background/50";
      default:
        return "text-muted-foreground border-border/50 bg-background/50";
    }
  };

  return (
    <div
      className="w-full min-h-[600px] flex flex-col items-center justify-center relative overflow-hidden bg-transparent select-none"
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
        {/* Dynamic expanding gradient ripple and rings animation */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes sagaRipple {
            0% {
              transform: scale(0.16);
              opacity: 0;
            }
            15% {
              opacity: 0.65;
            }
            100% {
              transform: scale(1.0);
              opacity: 0;
            }
          }
        ` }} />

        {/* Wave & Ring Set 1 */}
        <div 
          className="absolute w-[750px] h-[750px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.35)_0%,rgba(79,70,229,0.18)_35%,rgba(139,92,246,0.05)_65%,transparent_80%)] border border-primary/20" 
          style={{ animation: 'sagaRipple 10s cubic-bezier(0.15, 0.85, 0.3, 1) infinite' }} 
        />
        
        {/* Wave & Ring Set 2 (Phase Offset) */}
        <div 
          className="absolute w-[750px] h-[750px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.35)_0%,rgba(79,70,229,0.18)_35%,rgba(139,92,246,0.05)_65%,transparent_80%)] border border-violet-500/15" 
          style={{ 
            animation: 'sagaRipple 10s cubic-bezier(0.15, 0.85, 0.3, 1) infinite',
            animationDelay: '5s'
          }} 
        />
      </div>

      <div className="relative w-full max-w-4xl h-[550px] flex items-center justify-center z-10">
        <div
          className="absolute w-full h-full flex items-center justify-center"
          ref={orbitRef}
          style={{
            perspective: "1200px",
          }}
        >
          {/* Central Event Bus Hub */}
          <div className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-primary via-indigo-600 to-violet-500 flex flex-col items-center justify-center z-10 shadow-[0_0_40px_rgba(99,102,241,0.25)]">
            <div className="text-[10px] font-bold font-mono tracking-wider text-white uppercase text-center px-1">RABBITMQ</div>
            <div className="text-[8px] font-mono text-white/70 uppercase">Event Bus</div>
          </div>

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon;

            const nodeStyle = {
              transform: `translate(${position.x}px, ${position.y}px)`,
              zIndex: isExpanded ? 200 : position.zIndex,
              opacity: isExpanded ? 1 : position.opacity,
            };

            return (
              <div
                key={item.id}
                ref={(el) => {
                  nodeRefs.current[item.id] = el;
                }}
                className="absolute transition-all duration-700 cursor-pointer flex flex-col items-center justify-center group"
                style={nodeStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                {/* Outer halo */}
                <div
                  className={`absolute rounded-full -inset-2 transition-opacity ${
                    isPulsing ? "animate-pulse" : "opacity-0 group-hover:opacity-100"
                  }`}
                  style={{
                    background: `radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(99,102,241,0) 70%)`,
                    width: `${item.energy * 0.4 + 50}px`,
                    height: `${item.energy * 0.4 + 50}px`,
                    transform: "translate(-50%, -50%)",
                    left: "50%",
                    top: "50%",
                  }}
                ></div>

                {/* Node circle */}
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center relative z-10
                    ${
                      isExpanded
                        ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                        : isRelated
                        ? "bg-violet-950 text-violet-300 border-violet-400"
                        : "bg-background border-border/80 text-foreground hover:bg-accent hover:border-primary/50"
                    }
                    border-2 transition-all duration-300 transform hover:scale-110 shadow-sm
                    ${isExpanded ? "scale-125" : ""}
                  `}
                >
                  <Icon size={18} />
                </div>

                {/* Node Title */}
                <div
                  className={`
                    absolute top-14 whitespace-nowrap text-center
                    text-[11px] font-bold tracking-tight
                    transition-all duration-300
                    ${isExpanded ? "text-primary scale-110" : "text-foreground/90 group-hover:text-primary"}
                  `}
                >
                  {item.title}
                </div>

                {/* Modal details block */}
                {isExpanded && (
                  <Card className="absolute top-24 w-72 bg-card/95 border-border/60 shadow-2xl backdrop-blur-md overflow-visible select-none text-left z-50">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-primary/60"></div>
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-semibold font-mono ${getStatusStyles(
                            item.status
                          )}`}
                        >
                          {item.status === "completed"
                            ? "COMPLETE"
                            : item.status === "in-progress"
                            ? "IN PROGRESS"
                            : "PENDING"}
                        </Badge>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase">
                          {item.category}
                        </span>
                      </div>
                      <CardTitle className="text-sm font-extrabold mt-2 text-foreground">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-xs text-muted-foreground leading-relaxed">
                      <p className="mb-4">{item.content}</p>



                      {item.relatedIds.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-border/40 space-y-3">
                          {/* Predecessors (Triggered By) */}
                          {item.relatedIds.some(id => id < item.id) && (
                            <div>
                              <div className="flex items-center gap-1 mb-1.5">
                                <LinkIcon size={10} className="text-muted-foreground" />
                                <h4 className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground font-mono">
                                  Triggered By (Incoming Flow)
                                </h4>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {item.relatedIds.filter(id => id < item.id).map((relatedId) => {
                                  const relatedItem = timelineData.find((i) => i.id === relatedId);
                                  return (
                                    <Button
                                      key={relatedId}
                                      variant="outline"
                                      size="sm"
                                      className="flex items-center h-6 px-2 py-0 text-[10px] rounded-md border-border/80 bg-transparent hover:bg-accent text-foreground transition-all"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleItem(relatedId);
                                      }}
                                    >
                                      <ArrowLeft size={8} className="mr-1 text-muted-foreground" />
                                      {relatedItem?.title.split(" ").slice(1).join(" ")}
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Successors (Triggers Next) */}
                          {item.relatedIds.some(id => id > item.id) && (
                            <div>
                              <div className="flex items-center gap-1 mb-1.5">
                                <LinkIcon size={10} className="text-cyan-400" />
                                <h4 className="text-[9px] uppercase tracking-wider font-bold text-cyan-400 font-mono">
                                  Triggers Next (Outgoing Flow)
                                </h4>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {item.relatedIds.filter(id => id > item.id).map((relatedId) => {
                                  const relatedItem = timelineData.find((i) => i.id === relatedId);
                                  return (
                                    <Button
                                      key={relatedId}
                                      variant="outline"
                                      size="sm"
                                      className="flex items-center h-6 px-2 py-0 text-[10px] rounded-md border-border/80 bg-transparent hover:bg-accent text-foreground transition-all"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleItem(relatedId);
                                      }}
                                    >
                                      {relatedItem?.title.split(" ").slice(1).join(" ")}
                                      <ArrowRight size={8} className="ml-1 text-muted-foreground" />
                                    </Button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
