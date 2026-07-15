"use client";

import React from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle,
  Copy,
  Loader2,
  RefreshCw,
  ShoppingCart,
  Trash2,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderStatus } from "@/common/order-status.enum";
import { getOrderStatusColor } from "@/common/order-status.styles";
import type { OrderResponse } from "@/features/orders/list-orders/list-orders.interface";

type Props = {
  orders: OrderResponse[];
  activeOrderId: string | null;
  isOrdersLoading: boolean;
  actionLoading: Record<string, boolean>;
  copiedId: string | null;
  onRefresh: () => void;
  onSelectOrder: (orderId: string) => void;
  onCopyId: (id: string, e: React.MouseEvent) => void;
  onCancel: (orderId: string) => void;
  onShip: (orderId: string) => void;
  onDeliver: (orderId: string) => void;
};

export function OrdersDashboard({
  orders,
  activeOrderId,
  isOrdersLoading,
  actionLoading,
  copiedId,
  onRefresh,
  onSelectOrder,
  onCopyId,
  onCancel,
  onShip,
  onDeliver,
}: Props) {
  return (
    <div className="border border-border bg-card/45 backdrop-blur-md rounded-2xl p-6 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground font-mono">
            Active Saga Dashboard
          </h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="p-1.5 rounded-lg border border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
          title="Refresh Orders"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border">
        {isOrdersLoading && orders.length === 0 ? (
          <div className="h-full flex items-center justify-center flex-col gap-2.5 py-20 text-muted-foreground font-mono text-xs">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            Hydrating order ledger...
          </div>
        ) : orders.length === 0 ? (
          <div className="h-full flex items-center justify-center flex-col gap-2 py-20 text-muted-foreground font-mono text-xs border border-dashed border-border/60 rounded-xl">
            <ShoppingCart className="h-8 w-8 opacity-40 mb-1" />
            No active orders found in the database.
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="border-b border-border/60 text-[10px] uppercase font-bold tracking-wider text-muted-foreground font-mono">
                <th className="pb-3 pl-2">Order ID</th>
                <th className="pb-3">Saga status</th>
                <th className="pb-3 text-right">Total</th>
                <th className="pb-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const isSelected = order.id === activeOrderId;
                const isLoading = actionLoading[order.id];

                return (
                  <tr
                    key={order.id}
                    onClick={() => onSelectOrder(order.id)}
                    className={`border-b border-border/40 hover:bg-muted/40 cursor-pointer transition-all ${
                      isSelected ? "bg-primary/5 border-l-2 border-l-primary" : ""
                    }`}
                  >
                    <td className="py-3 pl-2 font-mono text-xs text-foreground font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate max-w-[80px]" title={order.id}>
                          {order.id.slice(0, 8)}...
                        </span>
                        <button
                          type="button"
                          onClick={(e) => onCopyId(order.id, e)}
                          className="text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                        >
                          {copiedId === order.id ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    <td className="py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold tracking-wide uppercase ${getOrderStatusColor(
                          order.status,
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="py-3 text-right font-mono text-xs text-foreground font-semibold pr-2 tabular-nums">
                      ${order.totalPrice.toFixed(2)}
                    </td>

                    <td className="py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-2">
                        {(order.status === OrderStatus.PENDING ||
                          order.status === OrderStatus.PLACED) && (
                          <Button
                            size="xs"
                            variant="destructive"
                            disabled={isLoading}
                            onClick={() => onCancel(order.id)}
                            className="font-mono text-[10px] uppercase font-bold cursor-pointer"
                            title="Cancel this order and trigger compensating transactions"
                          >
                            {isLoading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="h-3 w-3" />
                                Cancel
                              </>
                            )}
                          </Button>
                        )}

                        {order.status === OrderStatus.PAID && (
                          <Button
                            size="xs"
                            variant="outline"
                            disabled={isLoading}
                            onClick={() => onShip(order.id)}
                            className="border-primary/30 hover:border-primary text-primary font-mono text-[10px] uppercase font-bold cursor-pointer"
                            title="Dispatch shipment via DHL Express carrier"
                          >
                            {isLoading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <Truck className="h-3 w-3" />
                                Ship
                              </>
                            )}
                          </Button>
                        )}

                        {order.status === OrderStatus.SHIPPED && (
                          <Button
                            size="xs"
                            variant="default"
                            disabled={isLoading}
                            onClick={() => onDeliver(order.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] uppercase font-bold cursor-pointer"
                            title="Confirm handover — completes the saga"
                          >
                            {isLoading ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                Deliver
                              </>
                            )}
                          </Button>
                        )}

                        {order.status === OrderStatus.DELIVERED && (
                          <span className="text-[10px] font-mono text-teal-500 font-bold flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Done
                          </span>
                        )}
                        {order.status === OrderStatus.CANCELLED && (
                          <span className="text-[10px] font-mono text-rose-500 font-bold flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Aborted
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
