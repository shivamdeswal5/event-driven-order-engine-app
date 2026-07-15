"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import type { FaqItem } from "../../_content/chapters";

type Props = {
  items: FaqItem[];
};

export function FaqAccordion({ items }: Props) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-[10px] font-mono font-extrabold uppercase tracking-widest text-muted-foreground mb-2">
        <HelpCircle className="h-3.5 w-3.5" />
        Common doubts
      </p>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.question}
            className={`border rounded-xl overflow-hidden transition-colors ${
              isOpen
                ? "border-primary/30 bg-primary/5"
                : "border-border/60 bg-card/40"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left cursor-pointer hover:bg-muted/30 transition-colors"
              aria-expanded={isOpen}
            >
              <span className="text-sm font-semibold text-foreground pr-2">
                {item.question}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                  isOpen ? "rotate-180 text-primary" : ""
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    <p className="whitespace-pre-line">{item.answer}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
