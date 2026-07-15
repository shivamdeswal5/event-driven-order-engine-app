"use client";

import React, { useRef, useEffect } from "react";
import { Code } from "lucide-react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useAnimationControls,
  animate,
} from "framer-motion";
import type { DraggablePatternCardProps } from "../../types";

export function DraggablePatternCard({
  p,
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

  const x = useMotionValue(initialX);
  const y = useMotionValue(initialY);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [12, -12]), {
    stiffness: 100,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-12, 12]), {
    stiffness: 100,
    damping: 20,
  });

  const glareOpacity = useSpring(
    useTransform(mouseX, [-300, 0, 300], [0.15, 0, 0.15]),
    { stiffness: 100, damping: 20 }
  );

  useEffect(() => {
    if (resetTrigger > 0) {
      animate(x, initialX, {
        type: "spring",
        stiffness: 120,
        damping: 18,
        mass: 0.8,
      });
      animate(y, initialY, {
        type: "spring",
        stiffness: 120,
        damping: 18,
        mass: 0.8,
      });
    }
  }, [resetTrigger, x, y, initialX, initialY]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
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

        controls.start({
          rotateX: 0,
          rotateY: 0,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 20,
          },
        });
      }}
      className="absolute left-0 right-0 mx-auto w-[92%] sm:w-[380px] flex flex-col rounded-2xl border border-border/60 dark:border-border/100 bg-background p-5 hover:shadow-2xl transition-shadow duration-300 group overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing [transform-style:preserve-3d]"
    >
      <div className="absolute inset-0 bg-card/35 pointer-events-none z-0" />

      <motion.div
        style={{
          opacity: glareOpacity,
        }}
        className="pointer-events-none absolute inset-0 bg-white/5 select-none z-10"
      />

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

      <div className="relative mt-auto border border-border/50 bg-black/20 rounded-lg p-3.5 font-mono text-[10px] text-foreground/80 overflow-x-hidden leading-normal z-20">
        <div className="absolute top-2.5 right-3.5 flex items-center gap-1.5 opacity-60">
          <Code className="h-3.5 w-3.5 text-primary" />
          <span className="text-[9px] uppercase font-bold tracking-wide">ts</span>
        </div>
        <pre className="overflow-x-hidden">
          <code>{p.snippet}</code>
        </pre>
      </div>
    </motion.div>
  );
}
