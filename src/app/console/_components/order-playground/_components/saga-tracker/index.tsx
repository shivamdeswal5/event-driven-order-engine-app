"use client";

import React from "react";
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderStatus } from "@/common/order-status.enum";
import { getOrderStatusColor } from "@/common/order-status.styles";
import type { OrderResponse } from "@/features/orders/list-orders/list-orders.interface";

type Props = {
  activeOrder: OrderResponse;
  actionLoading: Record<string, boolean>;
  onShip: (orderId: string) => void;
  onDeliver: (orderId: string) => void;
};

export function SagaTracker({
  activeOrder,
  actionLoading,
  onShip,
  onDeliver,
}: Props) {
  const status = activeOrder.status;
  const isCancelled = status === OrderStatus.CANCELLED;
  const isEarly =
    status === OrderStatus.PENDING || status === OrderStatus.PLACED;
  const isPaid = status === OrderStatus.PAID;
  const isShipped = status === OrderStatus.SHIPPED;
  const isDelivered = status === OrderStatus.DELIVERED;
  const shipDone = isShipped || isDelivered;

  return (
    <div className="flex-1 flex flex-col justify-between h-full space-y-4 font-mono select-none">
      <div>
        <div className="flex justify-between items-center gap-2 mb-3">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
            Saga Active State
          </span>
          <Badge
            variant="outline"
            className={`font-mono text-[9px] uppercase font-bold tracking-wide ${getOrderStatusColor(status)}`}
          >
            {status}
          </Badge>
        </div>
        <div className="p-2.5 bg-background/40 border border-border/60 rounded-xl text-[10px] flex items-center justify-between mb-4">
          <span className="text-muted-foreground font-semibold">Tx Hash (ID):</span>
          <span
            className="font-bold text-foreground text-[9px] truncate max-w-[200px]"
            title={activeOrder.id}
          >
            {activeOrder.id}
          </span>
        </div>

        <div className="relative pl-6 space-y-4 border-l-2 border-border/40 ml-3 py-1 font-mono">
          <TimelineStep
            done
            title="1. Order Placed"
            detail="Saga initialized. Persisted order metadata to DB."
          />
          <TimelineStep
            done={!isEarly || isCancelled}
            danger={isCancelled}
            title="2. Inventory Reserved"
            detail={
              isCancelled
                ? "Inventory released / transaction compensated."
                : "Items reserved successfully in inventory module."
            }
          />
          <TimelineStep
            done={!isEarly && !isCancelled}
            danger={isCancelled}
            pending={isEarly && !isCancelled}
            title="3. Payment Completed"
            detail={
              isCancelled
                ? "Payment authorization failed."
                : isEarly
                  ? "Awaiting authorization queue processing."
                  : "Stripe payment simulation complete."
            }
          />
          <TimelineStep
            done={shipDone}
            active={isPaid}
            pending={!shipDone && !isPaid}
            title="4. Shipment Dispatched"
            detail={
              shipDone
                ? "Carrier package collected, tracking issued."
                : isPaid
                  ? "Awaiting manual operator dispatch."
                  : "Pending preceding payment completion."
            }
            titleClassName={
              isPaid ? "text-primary font-extrabold animate-pulse" : undefined
            }
          />
          <TimelineStep
            done={isDelivered}
            active={isShipped}
            pending={!isDelivered && !isShipped}
            title="5. Order Delivered"
            detail={
              isDelivered
                ? "Handover confirmation recorded. Saga completed."
                : isShipped
                  ? "Awaiting manual operator delivery verification."
                  : "Pending shipment release from warehouse."
            }
            titleClassName={
              isShipped ? "text-primary font-extrabold animate-pulse" : undefined
            }
          />
        </div>
      </div>

      <div className="pt-3 border-t border-border/40 font-mono">
        {isPaid && (
          <OperatorCard
            tone="primary"
            title="Awaiting Operator: Dispatch Shipment"
            body="The Order has been PAID. Advance the saga by dispatching the package via our mock carrier simulation."
            actionLabel="Dispatch DHL Shipment ⚡"
            loading={actionLoading[activeOrder.id]}
            onAction={() => onShip(activeOrder.id)}
            pulse
          />
        )}

        {isShipped && (
          <OperatorCard
            tone="emerald"
            title="Awaiting Operator: Confirm Delivery"
            body="The shipment is currently in-transit. Confirm handover to achieve eventual consistency across services."
            actionLabel="Confirm Handover & Deliver ⚡"
            loading={actionLoading[activeOrder.id]}
            onAction={() => onDeliver(activeOrder.id)}
          />
        )}

        {isCancelled && (
          <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-1.5">
            <h5 className="text-[10px] font-bold text-rose-400 uppercase flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Saga Transaction Aborted
            </h5>
            <p className="text-[9px] text-muted-foreground leading-relaxed font-semibold">
              Payment was rejected (ends in .99). Compensation logic restored reserve
              balances, reverting all mutations.
            </p>
          </div>
        )}

        {isDelivered && (
          <div className="p-3 rounded-xl border border-teal-500/20 bg-teal-500/5 space-y-1.5">
            <h5 className="text-[10px] font-bold text-teal-400 uppercase flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 shrink-0" />
              Saga Completed Successfully
            </h5>
            <p className="text-[9px] text-muted-foreground leading-relaxed font-semibold">
              Eventual consistency reached! No outstanding compensating transactions or
              manual simulation steps are pending.
            </p>
          </div>
        )}

        {isEarly && (
          <div className="p-3 rounded-xl border border-border/50 bg-background/25 space-y-1.5">
            <h5 className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Choreography Routing
            </h5>
            <p className="text-[9px] text-muted-foreground leading-relaxed font-semibold">
              RabbitMQ message queues are currently routing event messages. Operator
              controls will unlock when saga transitions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineStep({
  title,
  detail,
  done,
  danger,
  active,
  pending,
  titleClassName,
}: {
  title: string;
  detail: string;
  done?: boolean;
  danger?: boolean;
  active?: boolean;
  pending?: boolean;
  titleClassName?: string;
}) {
  const border = danger
    ? "border-rose-500"
    : done
      ? "border-emerald-500"
      : active
        ? "border-primary animate-pulse"
        : "border-border/60";
  const dot = danger
    ? "bg-rose-500 animate-pulse"
    : done
      ? "bg-emerald-500"
      : active
        ? "bg-primary animate-ping"
        : pending
          ? "bg-transparent"
          : "bg-transparent";

  return (
    <div className="relative">
      <span
        className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center bg-background ${border}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      </span>
      <h4
        className={`text-xs font-bold ${
          titleClassName ??
          (danger ? "text-rose-400" : "text-foreground")
        }`}
      >
        {title}
      </h4>
      <p className="text-[10px] text-muted-foreground mt-0.5">{detail}</p>
    </div>
  );
}

function OperatorCard({
  tone,
  title,
  body,
  actionLabel,
  loading,
  onAction,
  pulse,
}: {
  tone: "primary" | "emerald";
  title: string;
  body: string;
  actionLabel: string;
  loading?: boolean;
  onAction: () => void;
  pulse?: boolean;
}) {
  const isPrimary = tone === "primary";
  return (
    <div
      className={`p-3 rounded-xl space-y-2.5 ${
        isPrimary
          ? "border border-primary/20 bg-primary/5 shadow-[0_0_15px_rgba(99,102,241,0.05)]"
          : "border border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isPrimary ? "bg-primary" : "bg-emerald-500"
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isPrimary ? "bg-primary" : "bg-emerald-500"
            }`}
          />
        </span>
        <h5
          className={`text-[10px] font-bold uppercase ${
            isPrimary ? "text-primary" : "text-emerald-400"
          }`}
        >
          {title}
        </h5>
      </div>
      <p className="text-[9px] text-muted-foreground leading-relaxed font-semibold">
        {body}
      </p>
      <Button
        onClick={onAction}
        disabled={loading}
        className={`w-full h-8 font-extrabold text-[9px] uppercase tracking-wide cursor-pointer transition-all ${
          isPrimary
            ? `bg-primary hover:bg-primary/95 text-primary-foreground shadow-[0_0_10px_rgba(99,102,241,0.2)] ${pulse ? "animate-pulse" : ""}`
            : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.2)]"
        }`}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : actionLabel}
      </Button>
    </div>
  );
}
