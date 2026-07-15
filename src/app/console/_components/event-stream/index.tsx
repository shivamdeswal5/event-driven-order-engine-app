"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { listNotificationsAction } from "@/features/notifications/list-notifications/list-notifications.action";
import { selectAllNotifications } from "@/features/notifications/notifications.slice";
import { Terminal, Loader2 } from "lucide-react";
import { AwaitingEventsDeck } from "../awaiting-events-deck";

type Filter = "all" | "success" | "errors";

export function EventStream() {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectAllNotifications);

  const [filter, setFilter] = useState<Filter>("all");
  const [hasMoreLogs, setHasMoreLogs] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement | null>(null);

  const handleLoadMore = async () => {
    if (isFetchingMore || !hasMoreLogs) return;
    setIsFetchingMore(true);
    try {
      const res = await dispatch(listNotificationsAction({ limit: 30, offset: notifications.length })).unwrap();
      if (res.items.length < 30) setHasMoreLogs(false);
    } catch (err) {
      console.error("Failed to load more notifications:", err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreLogs && !isFetchingMore && notifications.length > 0) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [notifications.length, hasMoreLogs, isFetchingMore]);

  const sortedNotifications = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filteredNotifications = sortedNotifications.filter((notif) => {
    const evLower = notif.eventType.toLowerCase();
    const isError = evLower.includes("fail") || evLower.includes("cancel");
    if (filter === "success") return !isError;
    if (filter === "errors") return isError;
    return true;
  });

  const filterPills: { id: Filter; label: string; active: string }[] = [
    { id: "all", label: "ALL", active: "bg-primary text-primary-foreground" },
    { id: "success", label: "SUCCESS", active: "bg-emerald-600 text-white" },
    { id: "errors", label: "ERRORS", active: "bg-rose-600 text-white" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-border/40 pb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground font-mono text-balance">System Event Stream</h2>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed font-mono mt-1 text-pretty">
            Historical ledger of every event consumed by the Notification service, persisted to Postgres.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-muted/65 p-1 rounded-lg border border-border/80 self-start sm:self-auto font-mono text-[10px] shrink-0">
          {filterPills.map((pill) => (
            <button
              key={pill.id}
              onClick={() => setFilter(pill.id)}
              className={`px-2.5 py-1 rounded-md font-bold cursor-pointer transition-[background-color,color] duration-150 ${
                filter === pill.id ? `${pill.active} shadow-sm` : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border">
        {filteredNotifications.length === 0 ? (
          <AwaitingEventsDeck />
        ) : (
          <div className="space-y-2 font-mono text-[11px] leading-relaxed">
            {filteredNotifications.map((notif) => {
              const isFailure =
                notif.eventType.toLowerCase().includes("fail") || notif.eventType.toLowerCase().includes("cancel");

              return (
                <div
                  key={notif.id}
                  className={`p-2.5 rounded-lg border transition-colors duration-150 hover:bg-muted/30 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isFailure
                      ? "border-rose-500/20 bg-rose-500/5 text-rose-300"
                      : "border-border/40 bg-background/20 text-foreground"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 flex-1 min-w-0">
                    <span className="text-muted-foreground shrink-0 select-none tabular-nums">
                      [
                      {new Date(notif.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                      ]
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded font-extrabold uppercase text-[9px] tracking-wide shrink-0 ${
                        isFailure
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                      }`}
                    >
                      {notif.eventType.replace("Event", "")}
                    </span>

                    <span className="text-foreground/90 truncate md:overflow-visible md:whitespace-normal font-semibold text-pretty">
                      {notif.message}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[9px] text-muted-foreground shrink-0 bg-muted/30 px-2 py-0.5 rounded border border-border/20 self-start md:self-auto font-semibold">
                    <span className="tabular-nums">order_id={notif.orderId.slice(0, 8)}...</span>
                    <span className="text-muted-foreground/30">|</span>
                    <span>bus=RabbitMQ</span>
                  </div>
                </div>
              );
            })}

            <div ref={observerRef} className="h-6 flex items-center justify-center py-4">
              {isFetchingMore && (
                <div className="flex items-center gap-1.5 text-muted-foreground text-[10px]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>Retrieving historical logs...</span>
                </div>
              )}
              {!hasMoreLogs && notifications.length > 0 && (
                <span className="text-[10px] text-muted-foreground/50">— End of historical event ledger —</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
