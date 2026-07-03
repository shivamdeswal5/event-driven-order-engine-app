"use client";

import React, { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const prefersReducedMotion = useReducedMotion();

  // Particle mesh animation
  useEffect(() => {
    if (prefersReducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles: { x: number; y: number; vx: number; vy: number; radius: number }[] = [];
    const maxParticles = 40;

    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(120, 120, 150, 0.06)";
      ctx.fillStyle = "rgba(100, 100, 255, 0.12)";

      // Update & Draw Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Connection Lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [prefersReducedMotion]);

  // 3D Card Hover Tilt Effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setRotate({
      x: -y / 15,
      y: x / 15,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  // Static ISO stub for SSR; replaced with live timestamp on client mount
  // to prevent React hydration mismatch from differing Date values.
  const [eventTimestamp, setEventTimestamp] = useState(
    "2025-01-01T00:00:00.000Z"
  );

  useEffect(() => {
    setEventTimestamp(new Date().toISOString());
  }, []);

  const sampleEventJson = `{
  "id": "e98e27c7-8f5b-42fa-97b7-5421d00c3ba5",
  "eventType": "order.saga.placed",
  "timestamp": "${eventTimestamp}",
  "correlationId": "c8a9-4e89-8aae-9c7d7847",
  "causationId": "a6b9335a-c8a9-4e89-8aae",
  "payload": {
    "orderId": "6f9a8b1c-7d2e-4b6a-9f8c-3d2e1f5a9b8c",
    "customerId": "81f1e948-289d-4762-b98a-1bc2ea8f12b4",
    "totalAmount": 299.95,
    "items": [
      { "productId": "p1", "qty": 2, "price": 99.99 },
      { "productId": "p3", "qty": 1, "price": 99.97 }
    ]
  }
}`;

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-24 overflow-hidden">
      {/* Particle Canvas Field */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none select-none opacity-45"
      />

      {/* Grid Mesh */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none z-0">
        <div className="w-full h-full bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Column: Headline & Description */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider mb-6"
          >
            <span>DDD · CQRS · Event Choreography</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-6xl sm:text-8xl font-black tracking-tighter uppercase mb-4 select-none"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-400 to-violet-500 drop-shadow-[0_0_25px_rgba(99,102,241,0.15)]">
              APEX
            </span>
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4"
          >
            Distributed Order Fulfillment Engine
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-muted-foreground text-lg sm:text-xl max-w-2xl mb-8 leading-relaxed"
          >
            A high-fidelity observability console demonstrating transactional outbox execution, event deduplication, and choreography saga workflows across 5 isolated contexts.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Link href="/console">
              <Button size="lg" className="w-full sm:w-auto font-semibold gap-2 shadow-lg hover:shadow-primary/25">
                Launch Control Deck
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#architecture">
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold gap-2 border-border/80">
                View Architecture
              </Button>
            </a>
          </motion.div>
        </div>

        {/* Right Column: 3D Code Card */}
        <div className="lg:col-span-5 flex justify-center w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: prefersReducedMotion
                ? "none"
                : `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
              transition: prefersReducedMotion ? "none" : "transform 0.1s ease-out",
            }}
            className="w-full max-w-[460px] rounded-xl border border-border/50 bg-card/15 dark:bg-card/30 backdrop-blur-md shadow-lg p-6 relative overflow-hidden group"
          >
            {/* Glowing Card Border */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                <span className="text-xs font-mono text-muted-foreground font-semibold">event_envelope.json</span>
              </div>
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              </div>
            </div>

            <pre className="text-[11px] font-mono text-foreground/90 overflow-x-auto leading-relaxed max-h-[320px] select-all scrollbar-thin">
              <code>{sampleEventJson}</code>
            </pre>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
