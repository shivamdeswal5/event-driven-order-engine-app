"use client";

import React, { useRef, useState, useEffect } from "react";
import { Mailbox, Shuffle, SearchCode, DatabaseZap, Code, RotateCcw } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform, useAnimationControls, animate } from "framer-motion";
import { Button } from "@/components/ui/button";

interface PatternCard {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
  snippet: string;
}

interface DraggablePatternCardProps {
  p: PatternCard;
  index: number;
  initialX: number;
  initialY: number;
  initialRotate: number;
  zIndex: number;
  onSelect: () => void;
  resetTrigger: number;
  dragConstraintsRef: React.RefObject<HTMLDivElement | null>;
}

function DraggablePatternCard({
  p,
  index,
  initialX,
  initialY,
  initialRotate,
  zIndex,
  onSelect,
  resetTrigger,
  dragConstraintsRef,
}: DraggablePatternCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  
  // Set initial motion values to the initial offsets
  const x = useMotionValue(initialX);
  const y = useMotionValue(initialY);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(
    useTransform(mouseY, [-300, 300], [12, -12]),
    { stiffness: 100, damping: 20 }
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-300, 300], [-12, 12]),
    { stiffness: 100, damping: 20 }
  );

  const glareOpacity = useSpring(
    useTransform(mouseX, [-300, 0, 300], [0.15, 0, 0.15]),
    { stiffness: 100, damping: 20 }
  );

  // Handle reset trigger to animate back to initial pile position
  useEffect(() => {
    if (resetTrigger > 0) {
      animate(x, initialX, {
        type: "spring",
        stiffness: 120,
        damping: 18,
        mass: 0.8
      });
      animate(y, initialY, {
        type: "spring",
        stiffness: 120,
        damping: 18,
        mass: 0.8
      });
    }
  }, [resetTrigger, x, y, initialX, initialY]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const clientX = e.clientX;
    const clientY = e.clientY;
    
    const centerX = rect.left + width / 2;
    const centerY = rect.top + height / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    
    mouseX.set(deltaX);
    mouseY.set(deltaY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      drag
      dragConstraints={dragConstraintsRef}
      dragElastic={0.2}
      style={{
        x,
        y,
        rotateX,
        rotateY,
        rotateZ: initialRotate,
        zIndex: zIndex,
        willChange: "transform",
      }}
      animate={controls}
      whileHover={{ scale: 1.03 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onPointerDown={onSelect}
      onDragStart={() => {
        document.body.style.cursor = "grabbing";
        onSelect();
      }}
      onDragEnd={() => {
        document.body.style.cursor = "default";
        
        // Return 3D tilt to normal
        controls.start({
          rotateX: 0,
          rotateY: 0,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 20
          },
        });
      }}
      className="absolute left-0 right-0 mx-auto w-[92%] sm:w-[380px] flex flex-col rounded-2xl border border-border/60 dark:border-border/100 bg-background p-5 hover:shadow-2xl transition-shadow duration-300 group overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing [transform-style:preserve-3d]"
    >
      {/* Solid Tech Stack-like Color Overlay */}
      <div className="absolute inset-0 bg-card/35 pointer-events-none z-0" />

      {/* glare overlay */}
      <motion.div
        style={{
          opacity: glareOpacity,
        }}
        className="pointer-events-none absolute inset-0 bg-white/5 select-none z-10"
      />
      
      {/* glow effect */}
      <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors" />

      <div className="flex items-center gap-4 mb-4 z-20">
        <div className={`p-3 rounded-lg border border-border bg-background ${p.color}`}>
          {p.icon}
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {p.subtitle}
          </span>
          <h3 className="text-xl font-bold text-foreground">{p.title}</h3>
        </div>
      </div>

      <p className="text-[13px] text-muted-foreground leading-relaxed mb-5 flex-1 z-20">
        {p.description}
      </p>

      {/* Code Snippet Box */}
      <div className="relative mt-auto border border-border/50 bg-black/20 rounded-lg p-3.5 font-mono text-[10px] text-foreground/80 overflow-x-hidden leading-normal z-20">
        <div className="absolute top-2.5 right-3.5 flex items-center gap-1.5 opacity-60">
          <Code className="h-3.5 w-3.5 text-primary" />
          <span className="text-[9px] uppercase font-bold tracking-wide">ts</span>
        </div>
        <pre className="overflow-x-hidden"><code>{p.snippet}</code></pre>
      </div>
    </motion.div>
  );
}

export function PatternCards() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pileRef = useRef<HTMLDivElement>(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [zIndices, setZIndices] = useState([10, 20, 30, 40]);

  const patterns: PatternCard[] = [
    {
      title: "Transactional Outbox",
      subtitle: "Guaranteed Delivery",
      icon: <Mailbox className="h-6 w-6" />,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      description: "Persists domain events in a database Outbox table within the same transaction. A separate publisher reads and dispatches events to RabbitMQ, ensuring At-Least-Once delivery.",
      snippet: `// Atomically write order & outbox event
await em.transactional(async (tx) => {
  tx.persist(order);
  tx.persist(outboxMessage);
});`,
    },
    {
      title: "Choreographed Saga",
      subtitle: "Decentralized Coordination",
      icon: <Shuffle className="h-6 w-6" />,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      description: "Contexts react autonomously to domain events without a central coordinator. Compensation processors execute on failure events (e.g. PaymentFailedEvent) to restore system state.",
      snippet: `// Transactional event processor
@Injectable()
export class InventoryReservedProcessor {
  @Transactional()
  async handle(msg: { messageId; body }) {
    // Process billing & write outbox atomically
  }
}`,
    },
    {
      title: "Inbox Idempotency",
      subtitle: "Message Deduplication",
      icon: <SearchCode className="h-6 w-6" />,
      color: "text-violet-400",
      bgColor: "bg-violet-500/10",
      description: "Applies Transactional Inbox pattern to deduplicate events. Inserting the Message ID and Handler Name into the inbox table fails on unique key constraint if already processed, rolling back the transaction.",
      snippet: `// Transactional Inbox deduplication
await this.inboxRepository.storeInboxMessage({
  messageId: message.messageId,
  handlerName: this.getHandlerName(),
  eventType: 'InventoryReservedEvent'
}, schema);`,
    },
    {
      title: "CQRS Isolation",
      subtitle: "Write/Read Segregation",
      icon: <DatabaseZap className="h-6 w-6" />,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      description: "Separates write transactions from read telemetry operations. Writes are processed via APIs while real-time read metrics are pushed to the telemetry view via WebSockets.",
      snippet: `// Command side write
POST /api/orders/place
// Query side read broadcast
Gateway.broadcast('order.placed', payload);`,
    },
  ];

  const bringToFront = (index: number) => {
    setZIndices((prev) => {
      const newZ = [...prev];
      const maxZ = Math.max(...prev);
      if (newZ[index] < maxZ || maxZ === newZ[index]) {
        newZ[index] = maxZ + 1;
      }
      return newZ;
    });
  };

  const handleReset = () => {
    setResetTrigger((prev) => prev + 1);
    setZIndices([10, 20, 30, 40]);
  };

  // Card initial offsets in a stacked physical pile
  const fanOffsets = [
    { x: -12, y: -10, rotate: -6 },
    { x: 8, y: -4, rotate: 4 },
    { x: -4, y: 8, rotate: -2 },
    { x: 10, y: 12, rotate: 8 },
  ];

  return (
    <motion.section
      ref={sectionRef}
      id="patterns"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="py-24 border-t border-border/40 bg-background/25 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Architected for Ultimate Resilience
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Enterprise design patterns fanned out like a physical deck of cards. Grab and drag cards to spread them around the table, click any card to bring it to the front.
          </p>
        </div>

        {/* Stacked Pile Container acting as drag boundaries */}
        <div ref={pileRef} className="relative w-full h-[520px] mt-4 [perspective:3000px]">
          {patterns.map((p, idx) => (
            <DraggablePatternCard
              key={idx}
              p={p}
              index={idx}
              initialX={fanOffsets[idx].x}
              initialY={fanOffsets[idx].y}
              initialRotate={fanOffsets[idx].rotate}
              zIndex={zIndices[idx]}
              onSelect={() => bringToFront(idx)}
              resetTrigger={resetTrigger}
              dragConstraintsRef={pileRef}
            />
          ))}
        </div>

        {/* Control Button to Reset Deck */}
        <div className="mt-8 z-30">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="font-semibold shadow-md border-border bg-card/60 hover:bg-card backdrop-blur-sm transition-all"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Gather Deck
          </Button>
        </div>
      </div>
    </motion.section>
  );
}
