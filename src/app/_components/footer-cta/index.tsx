"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Cpu, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FooterCta() {
  return (
    <footer className="border-t border-border/40 bg-card/20 relative overflow-hidden py-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(100,100,255,0.05),transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center relative z-10">
        <Cpu className="h-10 w-10 text-primary animate-bounce mb-6" style={{ animationDuration: "3s" }} />

        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
          Ready to Observe Distributed Workflows?
        </h2>
        <p className="text-muted-foreground text-base max-w-xl mb-8">
          Launch the console to track order saga lifecycles, simulate service faults, and view real-time transaction telemetry.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link href="/console">
            <Button size="lg" className="font-semibold gap-2 shadow-lg">
              Launch Control Deck
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="w-full border-t border-border/40 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-mono">
          <p>© {new Date().getFullYear()} Apex Console. Built with residency-frontend slices architecture.</p>
          <div className="flex gap-6">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
              <span>Source Code</span>
            </a>
            <a href="#" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Globe className="h-3.5 w-3.5" />
              <span>System Status</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
