"use client";

import React from "react";
import { Layers, Network, Server, Database, Wind, MonitorPlay, Flame, Puzzle } from "lucide-react";
import { motion } from "framer-motion";

interface TechItem {
  name: string;
  category: "Frontend" | "Backend" | "Infrastructure";
  icon: React.ReactNode;
  description: string;
}

export function TechStack() {
  const stack: TechItem[] = [
    {
      name: "Next.js 15 (App Router)",
      category: "Frontend",
      icon: <MonitorPlay className="h-5 w-5 text-cyan-400" />,
      description: "Optimized server rendering, standalone mode compilations, and React Suspense layouts.",
    },
    {
      name: "Redux Toolkit & Slices",
      category: "Frontend",
      icon: <Layers className="h-5 w-5 text-violet-400" />,
      description: "Strict slice state boundaries matching backend DDD domain contexts.",
    },
    {
      name: "Tailwind CSS v4 & Shadcn",
      category: "Frontend",
      icon: <Wind className="h-5 w-5 text-emerald-400" />,
      description: "High performance component rendering using HSL tokens and system theme matching.",
    },
    {
      name: "NestJS Framework",
      category: "Backend",
      icon: <Server className="h-5 w-5 text-cyan-400" />,
      description: "Modular architecture containing CLI worker bootstrap execution pipes.",
    },
    {
      name: "RabbitMQ Broker",
      category: "Backend",
      icon: <Network className="h-5 w-5 text-amber-400" />,
      description: "High throughput messaging queue orchestrating saga event exchanges.",
    },
    {
      name: "PostgreSQL & MikroORM",
      category: "Infrastructure",
      icon: <Database className="h-5 w-5 text-indigo-400" />,
      description: "Fully isolated schemas with cross-schema references and transactional outbox persistence.",
    },
    {
      name: "Docker & Shared Network",
      category: "Infrastructure",
      icon: <Puzzle className="h-5 w-5 text-rose-400" />,
      description: "Isolated environments bound to a shared external communication network.",
    },
    {
      name: "Socket.io Streams",
      category: "Infrastructure",
      icon: <Flame className="h-5 w-5 text-amber-500" />,
      description: "Ultra low-latency socket notifications broadcasting backend transaction updates.",
    },
  ];

  return (
    <motion.section
      id="tech-stack"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-120px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="py-24 border-t border-border/40 bg-background/50"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Unified Modern Technology Stack
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Engineered with modern architectural practices, type-safe APIs, and containerized deployments.
          </p>
        </div>

        {/* Tech Stack Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stack.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col p-5 rounded-xl border border-border/50 bg-card/35 backdrop-blur-md hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="flex items-center gap-3.5 mb-3">
                <div className="p-2 rounded-lg border border-border bg-background">
                  {item.icon}
                </div>
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-primary opacity-80">
                    {item.category}
                  </span>
                  <h3 className="font-bold text-sm tracking-tight text-foreground">{item.name}</h3>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
