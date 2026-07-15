"use client";

import React, { useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fanOffsets, patterns } from "./constants";
import { DraggablePatternCard } from "./_components/draggable-pattern-card";

export function PatternCards() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pileRef = useRef<HTMLDivElement>(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [zIndices, setZIndices] = useState([10, 20, 30, 40]);

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
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Architected for Ultimate Resilience
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Enterprise design patterns fanned out like a physical deck of cards.
            Grab and drag cards to spread them around the table, click any card
            to bring it to the front.
          </p>
        </div>

        <div
          ref={pileRef}
          className="relative w-full h-[520px] mt-4 [perspective:3000px]"
        >
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
