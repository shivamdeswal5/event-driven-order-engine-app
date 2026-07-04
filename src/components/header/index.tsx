"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Cpu, Menu, Layers, Workflow, ArrowRight, Sun, Moon, 
  ArrowLeft, Database, Radio, Wifi, Activity 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectConnectionStatus } from "@/features/telemetry/telemetry.slice";
import { selectHealthData } from "@/features/health/health.slice";
import { getHealthAction } from "@/features/health/get-health/get-health.action";
import { useTheme } from "@/theme/theme-provider";
import { motion } from "framer-motion";

export function Header() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { theme, setTheme } = useTheme();
  
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const connectionStatus = useAppSelector(selectConnectionStatus);
  const healthData = useAppSelector(selectHealthData);

  const isConsole = pathname === "/console";

  // DB and RabbitMQ health status derivation
  const dbStatus = healthData?.details?.database?.status === "up" ? "healthy" : "unhealthy";
  const rmqStatus = healthData?.details?.rabbitmq?.status === "up" ? "healthy" : "unhealthy";

  // Poll health endpoint every 10 seconds on the console page
  useEffect(() => {
    if (!isConsole) return;
    dispatch(getHealthAction());
    const interval = setInterval(() => {
      dispatch(getHealthAction());
    }, 10000);
    return () => clearInterval(interval);
  }, [dispatch, isConsole]);

  // Handle scroll listener on landing page
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);

      if (isConsole) return;

      const sections = ["architecture", "patterns", "tech-stack"];
      let currentActive = "";
      const scrollPosition = window.scrollY + 200;

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
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isConsole]);

  // Scroll to hash on landing page mount
  useEffect(() => {
    if (!isConsole && window.location.hash) {
      const targetId = window.location.hash.slice(1);
      const element = document.getElementById(targetId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
          window.history.replaceState(null, "", window.location.pathname);
        }, 150);
      }
    }
  }, [isConsole]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.slice(1);
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
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
        isConsole
          ? "bg-card/50 backdrop-blur-md border-b border-border py-4 shadow-sm"
          : scrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border/60 py-4 shadow-sm"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand & Logo */}
        <Link 
          href="/" 
          onClick={handleLogoClick}
          className="flex items-center gap-2 group font-bold text-xl tracking-tight text-foreground"
        >
          {isConsole ? (
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 animate-pulse">
              <Activity className="h-5 w-5 text-primary" />
            </div>
          ) : (
            <Cpu className="h-6 w-6 text-primary animate-pulse" />
          )}
          <span className="font-mono uppercase">
            APEX{isConsole ? <span className="text-primary">.CONSOLE</span> : " CONSOLE"}
          </span>
        </Link>

        {/* Center / Left Navigation Area */}
        {!isConsole ? (
          /* Desktop Navigation for Landing Page */
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
                      ? "text-primary font-semibold"
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
        ) : null}

        {/* Right Actions Area */}
        <div className="flex items-center gap-4">
          {isConsole ? (
            /* Real-time Infrastructure Health Indicators for Console */
            <div className="hidden lg:flex items-center gap-3">
              {/* DB Health */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background/50 border-border/80">
                <Database className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-mono font-medium text-foreground">DB:</span>
                <span className={`text-[11px] font-mono font-bold ${
                  dbStatus === "healthy" ? "text-emerald-500" : "text-rose-500"
                }`}>
                  {dbStatus.toUpperCase()}
                </span>
              </div>

              {/* RabbitMQ Health */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background/50 border-border/80">
                <Radio className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-mono font-medium text-foreground">RabbitMQ:</span>
                <span className={`text-[11px] font-mono font-bold ${
                  rmqStatus === "healthy" ? "text-emerald-500" : "text-rose-500"
                }`}>
                  {rmqStatus.toUpperCase()}
                </span>
              </div>

              {/* WS Connection Status */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background/50 border-border/80">
                <Wifi className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-mono font-medium text-foreground">WebSocket:</span>
                <span className={`text-[11px] font-mono font-bold ${
                  connectionStatus === "connected"
                    ? "text-cyan-500"
                    : connectionStatus === "connecting"
                    ? "text-amber-500"
                    : "text-rose-500"
                }`}>
                  {connectionStatus.toUpperCase()}
                </span>
              </div>
            </div>
          ) : (
            /* Launch Console CTA for Landing Page */
            <Link href="/console" className="hidden md:block">
              <Button size="sm" className="font-semibold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground transition-all">
                Launch Console
              </Button>
            </Link>
          )}

          {/* Theme Settings Toggle (Always Visible) */}
          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="flex items-center justify-center p-2 rounded-lg border border-border bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4 text-primary" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500 animate-pulse" />
            )}
          </button>

          {/* Mobile Navigation Sheet Trigger */}
          {!isConsole && (
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="text-foreground md:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                }
              />
              <SheetContent side="right" className="w-[300px] sm:w-[350px] bg-background/95 backdrop-blur-xl border-l border-border/40 p-6 flex flex-col justify-between h-full">
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

                  {/* Mobile Navigation Links */}
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

                {/* Bottom Actions Area in Mobile Sheet */}
                <div className="flex flex-col gap-4 pb-4">
                  <Link href="/console" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full font-bold bg-primary hover:bg-primary/95 text-primary-foreground py-5 rounded-xl border border-primary/25 shadow-md shadow-primary/10 flex items-center justify-center gap-2 group transition-all">
                      <span>Launch Console</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
}
