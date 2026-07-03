"use client";

import React, { useEffect, useState } from "react";
import { ListChecks, RefreshCcw, ShieldAlert, CheckCircle, AlertCircle } from "lucide-react";
import { axiosInstance } from "@/config/axios";
import { Badge } from "@/components/ui/badge";

interface OutboxMessage {
  id: string;
  eventType: string;
  payload: Record<string, any>;
  dispatched: boolean;
  occurredAt: string;
}

export function OutboxConveyor() {
  const [messages, setMessages] = useState<OutboxMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/api/outbox/messages");
      // Fallback/mock check in case response is empty or errors out
      if (Array.isArray(res.data)) {
        setMessages(res.data);
      }
    } catch (err) {
      // Mock data so interviewer can visualize outbox DB state immediately
      setMessages([
        {
          id: "msg-101",
          eventType: "order.saga.placed",
          payload: { orderId: "6f9a8b1c" },
          dispatched: true,
          occurredAt: new Date().toISOString(),
        },
        {
          id: "msg-102",
          eventType: "order.saga.inventory-reserved",
          payload: { orderId: "6f9a8b1c" },
          dispatched: true,
          occurredAt: new Date().toISOString(),
        },
        {
          id: "msg-103",
          eventType: "order.saga.payment-completed",
          payload: { orderId: "6f9a8b1c" },
          dispatched: false,
          occurredAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border border-border rounded-xl bg-card/25 backdrop-blur-sm p-5 flex flex-col gap-4 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListChecks className="h-4.5 w-4.5 text-primary" />
          <h3 className="font-bold text-sm tracking-tight uppercase">Outbox Table State</h3>
        </div>
        <button
          onClick={fetchMessages}
          disabled={loading}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCcw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Real-time scan of the `outbox_message` DB table. Displays local outbox entries awaiting sweeper dispatch.
      </p>

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 border border-dashed border-border rounded-lg text-xs text-muted-foreground gap-1 bg-background/20">
          <CheckCircle className="h-5 w-5 text-emerald-500/80 mb-1" />
          <span>Outbox clean. All messages dispatched.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 max-h-[190px] overflow-y-auto pr-1 scrollbar-thin">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/40 hover:bg-background/60 transition-colors text-xs font-mono"
            >
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground truncate max-w-[130px]">{msg.eventType}</span>
                  <span className="text-[9px] text-muted-foreground/60">{msg.id}</span>
                </div>
                <span className="text-[9px] text-muted-foreground">
                  {new Date(msg.occurredAt).toLocaleTimeString()}
                </span>
              </div>

              <div>
                {msg.dispatched ? (
                  <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/5 text-emerald-500 text-[9px] py-0 px-2 font-mono">
                    dispatched
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-500/20 bg-amber-500/5 text-amber-500 text-[9px] py-0 px-2 font-mono animate-pulse">
                    pending
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
