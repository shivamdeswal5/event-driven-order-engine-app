"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FloatingActionMenuOption {
  label: string;
  onClick?: () => void;
  href?: string;
  Icon?: React.ReactNode;
}

interface FloatingActionMenuProps {
  options: FloatingActionMenuOption[];
  className?: string;
}

export default function FloatingActionMenu({
  options,
  className,
}: FloatingActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: FloatingActionMenuOption) => {
    if (option.href) {
      router.push(option.href);
    } else if (option.onClick) {
      option.onClick();
    }
    setIsOpen(false);
  };

  return (
    <div className={cn("fixed bottom-8 right-8 z-50", className)}>
      <Button
        onClick={toggleMenu}
        className="w-12 h-12 rounded-full bg-slate-900/90 hover:bg-slate-950 text-white border border-border/40 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:scale-110 active:scale-95 transition-all"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
        >
          <Plus className="w-6 h-6" />
        </motion.div>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10, y: 10, filter: "blur(10px)" }}
            animate={{ opacity: 1, x: 0, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 10, y: 10, filter: "blur(10px)" }}
            transition={{
              duration: 0.5,
              type: "spring",
              stiffness: 300,
              damping: 22,
            }}
            className="absolute bottom-14 right-0 mb-2"
          >
            <div className="flex flex-col items-end gap-2.5">
              {options.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.05,
                  }}
                >
                  <Button
                    onClick={() => handleOptionClick(option)}
                    size="sm"
                    className="flex items-center gap-2 bg-slate-950/95 hover:bg-slate-900 border border-border/40 shadow-[0_0_15px_rgba(0,0,0,0.5)] rounded-xl backdrop-blur-md px-3.5 py-2 text-white h-auto"
                  >
                    {option.Icon}
                    <span className="text-xs font-semibold">{option.label}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
