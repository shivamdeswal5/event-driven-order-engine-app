"use client";

import React from "react";
import { Navbar } from "./_components/navbar";
import { Hero } from "./_components/hero";
import { ArchitectureShowcase } from "./_components/architecture-showcase";
import { PatternCards } from "./_components/pattern-cards";
import { TechStack } from "./_components/tech-stack";
import { StatsRow } from "./_components/stats-row";
import { FooterCta } from "./_components/footer-cta";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import FloatingActionMenu from "@/components/ui/floating-action-menu";
import { Terminal, Layers, Info, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

export default function Home() {
  const menuOptions = [
    {
      label: "Launch Console",
      href: "/console",
      Icon: <Terminal className="w-4 h-4 text-cyan-400" />,
    },
    {
      label: "Order Playground",
      href: "/console",
      Icon: <Play className="w-4 h-4 text-emerald-400" />,
    },
    {
      label: "System Architecture",
      href: "#architecture",
      Icon: <Layers className="w-4 h-4 text-indigo-400" />,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Section 1: Hero */}
        <Hero />

        {/* Section 2: Exploded 3D Architecture Stack */}
        <ArchitectureShowcase />

        {/* Section 3: Saga Transaction Lifecycle Timeline */}
        <motion.section
          id="saga-flow"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-120px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="py-24 border-t border-border/40 relative bg-background/20 overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge variant="outline" className="mb-4 text-xs tracking-wider uppercase font-semibold border-primary/20 bg-primary/5 text-primary">
                Transactional Telemetry
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
                Saga Choreography Lifecycle
              </h2>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
                Track how distributed transactions achieve eventual consistency across services. Click any phase node on the interactive orbit to trace its events.
              </p>
            </div>
            
            <RadialOrbitalTimeline />
          </div>
        </motion.section>

        {/* DDD & Transactional Patterns Details */}
        <PatternCards />
        
        {/* Technical Stack Overview */}
        <TechStack />
        
        {/* Observability Telemetry Stats */}
        <StatsRow />
      </main>
      <FooterCta />

      {/* Global Quick Actions Floating Menu */}
      <FloatingActionMenu options={menuOptions} />
    </div>
  );
}
