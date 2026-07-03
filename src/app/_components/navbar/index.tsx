"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Cpu, Menu, Layers, Workflow, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAppSelector } from "@/store/hooks";
import { selectConnectionStatus } from "@/features/telemetry/telemetry.slice";
import { motion } from "framer-motion";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const connectionStatus = useAppSelector(selectConnectionStatus);

  useEffect(() => {
    // Handle scrolling highlights
    const handleScroll = () => {
      // Set scrolled state
      setScrolled(window.scrollY > 40);

      // Section list to observe
      const sections = ["architecture", "patterns", "tech-stack"];
      let currentActive = "";
      const scrollPosition = window.scrollY + 200; // Trigger slightly earlier than the top offset

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            currentActive = sectionId;
            break;
          }
        }
      }

      setActiveSection(currentActive);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Run initially
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Scroll to hash on mount if present, then clear hash from address bar for premium clean URL look
    if (window.location.hash) {
      const targetId = window.location.hash.slice(1);
      const element = document.getElementById(targetId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
          window.history.replaceState(null, "", window.location.pathname);
        }, 150);
      }
    }
  }, []);
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.slice(1);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (window.location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const navLinks = [
    { name: "Architecture", href: "#architecture" },
    { name: "Patterns", href: "#patterns" },
    { name: "Tech Stack", href: "#tech-stack" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border/60 py-4 shadow-sm"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link 
          href="/" 
          onClick={handleLogoClick}
          className="flex items-center gap-2 font-bold text-xl tracking-tight text-foreground"
        >
          <Cpu className="h-6 w-6 text-primary animate-pulse" />
          <span>APEX CONSOLE</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 relative">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.slice(1);
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`text-sm font-medium transition-colors relative py-1 ${
                  isActive
                    ? "text-primary font-semibold animate-pulse-subtle"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background/50 backdrop-blur-sm text-[11px] font-medium">
            <span
              className={`h-2 w-2 rounded-full ${
                connectionStatus === "connected" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
              }`}
            />
            <span>{connectionStatus === "connected" ? "Engine Online" : "Engine Offline"}</span>
          </div>

          <Link href="/console" className="hidden md:block">
            <Button size="sm" className="font-semibold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground transition-all">
              Launch Console
            </Button>
          </Link>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="text-foreground md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              }
            />
            <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-background/95 backdrop-blur-xl border-l border-border/40 p-6 flex flex-col justify-between h-full">
              {/* Header Title / Logo */}
              <div className="flex flex-col gap-8 pt-10">
                <Link 
                  href="/" 
                  className="flex items-center gap-2.5 group" 
                  onClick={(e) => {
                    handleLogoClick(e);
                    setMobileOpen(false);
                  }}
                >
                  <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(99,102,241,0.15)] group-hover:scale-105 transition-transform duration-300">
                    <Cpu className="h-5 w-5 text-primary animate-pulse" />
                  </div>
                  <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
                    APEX CONSOLE
                  </span>
                </Link>

                {/* Custom Nav Link Cards */}
                <nav className="flex flex-col gap-2.5">
                  {navLinks.map((link) => {
                    const isActive = activeSection === link.href.slice(1);
                    
                    let LinkIcon = Layers;
                    if (link.name === "Patterns") LinkIcon = Workflow;
                    if (link.name === "Tech Stack") LinkIcon = Cpu;

                    return (
                      <a
                        key={link.name}
                        href={link.href}
                        onClick={(e) => {
                          handleNavClick(e, link.href);
                          setMobileOpen(false);
                        }}
                        className={`flex items-center gap-3.5 px-4 py-3 rounded-xl border text-[13px] font-bold tracking-tight transition-all duration-300 ${
                          isActive
                            ? "bg-primary/10 text-primary border-primary/20 dark:bg-primary/15 dark:border-primary/25 shadow-sm"
                            : "bg-card/45 text-muted-foreground border-border/50 hover:text-foreground hover:bg-card/70 hover:border-border"
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg border transition-colors ${
                          isActive ? "bg-background border-primary/25 text-primary" : "bg-background border-border/80 text-muted-foreground"
                        }`}>
                          <LinkIcon className="h-4 w-4" />
                        </div>
                        <span className="flex-1 text-[13px]">{link.name}</span>
                        <ArrowRight className={`h-3.5 w-3.5 transition-transform duration-300 ${isActive ? "opacity-100 translate-x-0 text-primary" : "opacity-0 -translate-x-2"}`} />
                      </a>
                    );
                  })}
                </nav>
              </div>

              {/* Bottom Actions Area */}
              <div className="flex flex-col gap-4 pb-4">
                <div className={`flex items-center justify-between px-4 py-3 rounded-xl border backdrop-blur-sm text-[12px] font-bold ${
                  connectionStatus === "connected" 
                    ? "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                    : "bg-rose-500/5 text-rose-600 dark:text-rose-400 border-rose-500/20"
                }`}>
                  <span className="text-muted-foreground font-semibold">Engine Link</span>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        connectionStatus === "connected" ? "bg-emerald-500" : "bg-rose-500"
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${
                        connectionStatus === "connected" ? "bg-emerald-500" : "bg-rose-500"
                      }`}></span>
                    </span>
                    <span className="font-mono uppercase tracking-wider">
                      {connectionStatus === "connected" ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>

                <Link href="/console" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full font-bold bg-primary hover:bg-primary/95 text-primary-foreground py-5 rounded-xl border border-primary/25 shadow-md shadow-primary/10 flex items-center justify-center gap-2 group transition-all">
                    <span>Launch Console</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
