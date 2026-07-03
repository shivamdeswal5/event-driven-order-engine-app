"use client";

import React, { useState, useEffect } from "react";
import { PlayCircle, ShieldCheck, ShoppingCart, Loader2, ArrowRight } from "lucide-react";
import { axiosInstance } from "@/config/axios";
import { getTelemetrySocket } from "@/features/telemetry/socket/telemetry.socket";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store/hooks";
import { addLogMessage } from "@/features/telemetry/telemetry.slice";

export function OrderPlayground() {
  const [customerId, setCustomerId] = useState("cust-999");
  const [sku, setSku] = useState("SKU-SSD-2TB");
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [sagaSteps, setSagaSteps] = useState<{ label: string; event: string; status: "pending" | "current" | "done" | "failed" }[]>([
    { label: "Place Order", event: "order.saga.placed", status: "pending" },
    { label: "Reserve Inventory", event: "order.saga.inventory-reserved", status: "pending" },
    { label: "Capture Payment", event: "order.saga.payment-completed", status: "pending" },
    { label: "Schedule Shipment", event: "order.saga.shipment-created", status: "pending" },
    { label: "Confirm Delivery", event: "order.saga.shipment-delivered", status: "pending" },
  ]);

  const dispatch = useAppDispatch();

  // Listen to WebSocket for updates on active order ID
  useEffect(() => {
    if (!activeOrderId) return;
    const socket = getTelemetrySocket();

    // Subscribe to order rooms
    socket.emit("subscribeToOrder", { orderId: activeOrderId });

    const handleNotification = (data: any) => {
      if (data.orderId !== activeOrderId) return;

      const eventType = data.eventType || "";
      setSagaSteps((prev) =>
        prev.map((step) => {
          if (step.event === eventType) {
            return { ...step, status: eventType.includes("failed") || eventType.includes("cancelled") ? "failed" : "done" };
          }
          return step;
        })
      );
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [activeOrderId]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Reset steps
    setSagaSteps([
      { label: "Place Order", event: "order.saga.placed", status: "current" },
      { label: "Reserve Inventory", event: "order.saga.inventory-reserved", status: "pending" },
      { label: "Capture Payment", event: "order.saga.payment-completed", status: "pending" },
      { label: "Schedule Shipment", event: "order.saga.shipment-created", status: "pending" },
      { label: "Confirm Delivery", event: "order.saga.shipment-delivered", status: "pending" },
    ]);

    try {
      const payload = {
        customerId,
        items: [{ productId: sku === "SKU-SSD-2TB" ? "p1" : "p2", quantity, price: 99.99 }],
      };
      const res = await axiosInstance.post("/api/orders", payload);
      const orderId = res.data?.orderId || res.data?.id;

      if (orderId) {
        setActiveOrderId(orderId);
        // Automatically dispatch local placement event for telemetry log visibility
        dispatch(
          addLogMessage({
            id: orderId,
            timestamp: new Date().toISOString(),
            type: "order.saga.placed",
            message: `Saga initiated for Order #${orderId}`,
            correlationId: "N/A",
            causationId: "N/A",
            payload,
            status: "success",
          })
        );
      }
    } catch (err) {
      // Mock saga orchestration loop simulation on error
      const mockOrderId = "mock-" + Math.random().toString(36).substring(2, 10);
      setActiveOrderId(mockOrderId);

      // Simulate step-by-step progress
      let currentStep = 0;
      const interval = setInterval(() => {
        let stepToDispatch: any = null;

        setSagaSteps((prev) => {
          const next = [...prev];
          if (currentStep < next.length) {
            next[currentStep].status = "done";
            if (currentStep + 1 < next.length) {
              next[currentStep + 1].status = "current";
            }
            stepToDispatch = next[currentStep];
            currentStep++;
          } else {
            clearInterval(interval);
          }
          return next;
        });

        if (stepToDispatch) {
          dispatch(
            addLogMessage({
              id: Math.random().toString(),
              timestamp: new Date().toISOString(),
              type: stepToDispatch.event,
              message: `Simulated Saga Step: ${stepToDispatch.label}`,
              correlationId: mockOrderId,
              causationId: mockOrderId,
              payload: { orderId: mockOrderId },
              status: "success",
            })
          );
        }
      }, 2000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-border rounded-xl bg-card/25 backdrop-blur-sm p-5 flex flex-col gap-4 select-none">
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-4.5 w-4.5 text-primary" />
        <h3 className="font-bold text-sm tracking-tight uppercase">Saga Sandbox</h3>
      </div>

      <form onSubmit={handlePlaceOrder} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex flex-col gap-1.5">
            <label className="text-muted-foreground font-semibold">Customer ID</label>
            <input
              type="text"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-foreground font-mono"
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-muted-foreground font-semibold">Product SKU</label>
            <select
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="bg-background border border-border rounded-lg px-3 py-2 text-foreground font-mono"
            >
              <option value="SKU-SSD-2TB">SSD 2TB ($99.99)</option>
              <option value="SKU-RAM-64GB">RAM 64GB ($199.99)</option>
            </select>
          </div>
        </div>

        <Button type="submit" disabled={submitting} className="w-full font-semibold shadow-xs">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Placing Order...
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4 mr-2 text-primary-foreground" />
              Submit Saga Transaction
            </>
          )}
        </Button>
      </form>

      {/* Live Saga Checklist Tracker */}
      {activeOrderId && (
        <div className="border border-border/80 bg-background/35 rounded-xl p-4 mt-2 flex flex-col gap-3 font-mono text-[11px]">
          <div className="flex justify-between items-center border-b border-border/40 pb-2 mb-1">
            <span className="text-muted-foreground">Tracking ID:</span>
            <span className="font-bold text-foreground truncate max-w-[150px]">{activeOrderId}</span>
          </div>

          <div className="flex flex-col gap-2">
            {sagaSteps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3.5">
                <span
                  className={`h-2.5 w-2.5 rounded-full flex items-center justify-center ${
                    step.status === "done"
                      ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                      : step.status === "current"
                      ? "bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                      : step.status === "failed"
                      ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"
                      : "bg-border/60"
                  }`}
                />
                <span
                  className={`flex-1 ${
                    step.status === "done"
                      ? "text-foreground font-semibold"
                      : step.status === "current"
                      ? "text-cyan-400 font-bold"
                      : step.status === "failed"
                      ? "text-rose-400 font-bold"
                      : "text-muted-foreground/60"
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[9px] text-muted-foreground/45 uppercase">{step.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
