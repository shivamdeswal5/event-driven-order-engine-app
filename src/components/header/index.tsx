"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cpu,
  Menu,
  BookOpen,
  Home,
  Terminal,
  ArrowRight,
  Sun,
  Moon,
  Database,
  Radio,
  Wifi,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectConnectionStatus } from "@/features/telemetry/telemetry.slice";
import { selectHealthData } from "@/features/health/health.slice";
import { getHealthAction } from "@/features/health/get-health/get-health.action";
import { useTheme } from "@/theme/theme-provider";
import { motion } from "framer-motion";

const PRIMARY_LINKS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Learn", href: "/learn", icon: BookOpen },
  { name: "Console", href: "/console", icon: Terminal },
] as const;

export function Header() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { theme, setTheme } = useTheme();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const connectionStatus = useAppSelector(selectConnectionStatus);
  const healthData = useAppSelector(selectHealthData);

  const isConsole = pathname === "/console";
  const isLearn = pathname === "/learn" || pathname.startsWith("/learn/");
  const isHome = pathname === "/";

  const dbStatus =
    healthData?.details?.database?.status === "up" ? "healthy" : "unhealthy";
  const rmqStatus =
    healthData?.details?.rabbitmq?.status === "up" ? "healthy" : "unhealthy";

  useEffect(() => {
    if (!isConsole) return;
    dispatch(getHealthAction());
    const interval = setInterval(() => {
      dispatch(getHealthAction());
    }, 10000);
    return () => clearInterval(interval);
  }, [dispatch, isConsole]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const isActiveLink = (href: string) => {
    if (href === "/") return isHome;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 ${
        isConsole || isLearn
          ? "bg-card/50 backdrop-blur-md border-b border-border py-4 shadow-sm"
          : scrolled
            ? "bg-background/90 backdrop-blur-md border-b border-border/60 py-4 shadow-sm"
            : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-4">
        <Link
          href="/"
          onClick={handleLogoClick}
          className="flex items-center gap-2 group font-bold text-xl tracking-tight text-foreground shrink-0"
        >
          {isConsole ? (
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Activity className="h-5 w-5 text-primary" />
            </div>
          ) : isLearn ? (
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
          ) : (
            <Cpu className="h-6 w-6 text-primary" />
          )}
          <span className="font-mono uppercase">
            APEX
            {isConsole ? (
              <span className="text-primary">.CONSOLE</span>
            ) : isLearn ? (
              <span className="text-primary">.LEARN</span>
            ) : (
              " CONSOLE"
            )}
          </span>
        </Link>

        {/* Primary site nav — Home / Learn / Console */}
        <nav
          className="hidden md:flex items-center gap-1 relative"
          aria-label="Primary"
        >
          {PRIMARY_LINKS.map((link) => {
            const active = isActiveLink(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  active
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.name}
                {active && (
                  <motion.div
                    layoutId="activePrimaryNav"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {isConsole ? (
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background/50 border-border/80">
                <Database className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-mono font-medium text-foreground">
                  DB:
                </span>
                <span
                  className={`text-[11px] font-mono font-bold ${
                    dbStatus === "healthy" ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {dbStatus.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background/50 border-border/80">
                <Radio className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-mono font-medium text-foreground">
                  RabbitMQ:
                </span>
                <span
                  className={`text-[11px] font-mono font-bold ${
                    rmqStatus === "healthy"
                      ? "text-emerald-500"
                      : "text-rose-500"
                  }`}
                >
                  {rmqStatus.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-background/50 border-border/80">
                <Wifi className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-mono font-medium text-foreground">
                  WebSocket:
                </span>
                <span
                  className={`text-[11px] font-mono font-bold ${
                    connectionStatus === "connected"
                      ? "text-cyan-500"
                      : connectionStatus === "connecting"
                        ? "text-amber-500"
                        : "text-rose-500"
                  }`}
                >
                  {connectionStatus.toUpperCase()}
                </span>
              </div>
            </div>
          ) : !isLearn ? (
            <Link href="/learn" className="hidden md:block">
              <Button
                variant="outline"
                size="sm"
                className="font-semibold border-border/80 gap-1.5"
              >
                <BookOpen className="h-3.5 w-3.5" />
                Start Learning
              </Button>
            </Link>
          ) : (
            <Link href="/console" className="hidden md:block">
              <Button
                size="sm"
                className="font-semibold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Launch Console
              </Button>
            </Link>
          )}

          <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="flex items-center justify-center p-2 rounded-lg border border-border bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
            type="button"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4 text-primary" />
            ) : (
              <Sun className="h-4 w-4 text-amber-500" />
            )}
          </button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground md:hidden"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              }
            />
            <SheetContent
              side="right"
              className="w-[300px] sm:w-[350px] bg-background/95 backdrop-blur-xl border-l border-border/40 p-6 flex flex-col justify-between h-full"
            >
              <div className="flex flex-col gap-8 pt-10">
                <Link
                  href="/"
                  className="flex items-center gap-2.5 group"
                  onClick={() => setMobileOpen(false)}
                >
                  <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                    <Cpu className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-extrabold text-lg tracking-tight font-mono uppercase">
                    APEX CONSOLE
                  </span>
                </Link>

                <nav className="flex flex-col gap-2.5" aria-label="Mobile primary">
                  {PRIMARY_LINKS.map((link) => {
                    const active = isActiveLink(link.href);
                    const LinkIcon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3.5 px-4 py-3 rounded-xl border text-[13px] font-bold tracking-tight transition-all ${
                          active
                            ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
                            : "bg-card/45 text-muted-foreground border-border/50 hover:text-foreground hover:bg-card/70"
                        }`}
                      >
                        <div
                          className={`p-1.5 rounded-lg border ${
                            active
                              ? "bg-background border-primary/25 text-primary"
                              : "bg-background border-border/80 text-muted-foreground"
                          }`}
                        >
                          <LinkIcon className="h-4 w-4" />
                        </div>
                        <span className="flex-1">{link.name}</span>
                        <ArrowRight
                          className={`h-3.5 w-3.5 ${
                            active
                              ? "opacity-100 text-primary"
                              : "opacity-0"
                          }`}
                        />
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="flex flex-col gap-3 pb-4">
                <Link href="/learn" onClick={() => setMobileOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full font-bold py-5 rounded-xl gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    Start Learning
                  </Button>
                </Link>
                <Link href="/console" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full font-bold bg-primary text-primary-foreground py-5 rounded-xl gap-2">
                    Launch Console
                    <ArrowRight className="h-4 w-4" />
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
