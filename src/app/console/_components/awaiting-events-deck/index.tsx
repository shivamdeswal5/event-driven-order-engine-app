"use client";

import React, { useEffect, useState } from "react";
import { Database, Radio, Wifi, ShieldAlert, Cpu } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectConnectionStatus } from "@/features/telemetry/telemetry.slice";
import { selectHealthData } from "@/features/health/health.slice";
import { motion } from "framer-motion";

export function AwaitingEventsDeck() {
  const connectionStatus = useAppSelector(selectConnectionStatus);
  const healthData = useAppSelector(selectHealthData);

  const [sysTime, setSysTime] = useState("");

  // Sub-second precision clock for live diagnostics feel
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      const secs = String(now.getSeconds()).padStart(2, "0");
      const ms = String(now.getMilliseconds()).padStart(3, "0");
      setSysTime(`${hrs}:${mins}:${secs}.${ms}`);
    };

    updateClock();
    const interval = setInterval(updateClock, 33); // ~30fps refresh rate
    return () => clearInterval(interval);
  }, []);

  const dbStatus = healthData?.details?.database?.status === "up" ? "healthy" : "unhealthy";
  const rmqStatus = healthData?.details?.rabbitmq?.status === "up" ? "healthy" : "unhealthy";

  return (
    <div className="space-y-6 py-2 font-mono">
      {/* 1. Diagnostics Grid (Health State + Interactive Waveform) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side: System Diagnostic Metrics */}
        <div className="lg:col-span-5 border border-border/80 bg-background/40 rounded-xl p-5 flex flex-col justify-between min-h-[240px]">
          <div>
            <div className="flex items-center justify-between border-b border-border/40 pb-2.5 mb-4">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5 text-primary" />
                TELEMETRY DIAGNOSTICS
              </span>
              <span className="text-[10px] text-muted-foreground uppercase">
                Status: Standby
              </span>
            </div>
            
            <div className="space-y-3.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Database className="h-3 w-3" /> Database Status:
                </span>
                <span className={`font-bold ${dbStatus === "healthy" ? "text-emerald-500" : "text-rose-500"}`}>
                  {dbStatus.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Radio className="h-3 w-3" /> Message Broker:
                </span>
                <span className={`font-bold ${rmqStatus === "healthy" ? "text-emerald-500" : "text-rose-500"}`}>
                  {rmqStatus.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Wifi className="h-3 w-3" /> Event WebSocket:
                </span>
                <span className={`font-bold ${connectionStatus === "connected" ? "text-cyan-500" : "text-rose-500"}`}>
                  {connectionStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>CLOCK:</span>
            <span className="font-bold text-foreground tracking-wider">{sysTime}</span>
          </div>
        </div>

        {/* Right Side: Oscilloscope Waveform & Standby State */}
        <div className="lg:col-span-7 border border-border/80 bg-background/40 rounded-xl p-5 flex flex-col justify-between overflow-hidden relative min-h-[240px]">
          <div>
            <div className="flex items-center justify-between border-b border-border/40 pb-2.5 mb-2">
              <span className="text-xs font-bold text-foreground">
                LIVE WAVEFORM MONITOR
              </span>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
                  LISTENING
                </span>
              </div>
            </div>
          </div>

          {/* SVG Waveform Animation */}
          <div className="flex-1 flex items-center justify-center py-4 relative h-20">
            <svg 
              className="w-full h-full text-primary/40 dark:text-primary/30" 
              viewBox="0 0 200 40" 
              preserveAspectRatio="none"
            >
              {/* Stationary Grid Lines */}
              <line x1="0" y1="20" x2="200" y2="20" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
              
              {/* Animating Wave Path */}
              <motion.path
                d="M 0,20 Q 25,5 50,20 T 100,20 T 150,20 T 200,20"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="1.5"
                animate={{
                  d: [
                    "M 0,20 Q 25,5 50,20 T 100,20 T 150,20 T 200,20",
                    "M 0,20 Q 25,35 50,20 T 100,20 T 150,20 T 200,20",
                    "M 0,20 Q 25,5 50,20 T 100,20 T 150,20 T 200,20"
                  ]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  ease: "easeInOut"
                }}
              />
              <motion.path
                d="M 0,20 Q 25,35 50,20 T 100,20 T 150,20 T 200,20"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                animate={{
                  d: [
                    "M 0,20 Q 25,35 50,20 T 100,20 T 150,20 T 200,20",
                    "M 0,20 Q 25,5 50,20 T 100,20 T 150,20 T 200,20",
                    "M 0,20 Q 25,35 50,20 T 100,20 T 150,20 T 200,20"
                  ]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  ease: "easeInOut"
                }}
              />
            </svg>
          </div>

          <div className="text-[10px] text-muted-foreground flex items-center justify-between border-t border-border/30 pt-2.5">
            <span>TELEMETRY CHANNEL:</span>
            <span className="text-primary font-bold">READY</span>
          </div>
        </div>
      </div>
    </div>
  );
}
