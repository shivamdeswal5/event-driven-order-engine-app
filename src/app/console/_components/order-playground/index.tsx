"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { placeOrderAction } from "@/features/orders/place-order/place-order.action";
import { listOrdersAction } from "@/features/orders/list-orders/list-orders.action";
import { cancelOrderAction } from "@/features/orders/cancel-order/cancel-order.action";
import { shipOrderAction } from "@/features/shipments/ship-order/ship-order.action";
import { deliverOrderAction } from "@/features/shipments/deliver-order/deliver-order.action";
import { listProductsAction } from "@/features/catalog/list-products/list-products.action";
import {
  setActiveOrderId,
  selectAllOrders,
  selectActiveOrderId,
  selectOrdersLoading,
} from "@/features/orders/orders.slice";
import { selectProducts } from "@/features/catalog/catalog.slice";
import { OrderStatus } from "@/common/order-status.enum";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ShoppingCart,
  Trash2,
  Truck,
  CheckCircle,
  AlertTriangle,
  Loader2,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";

export function OrderPlayground() {
  const dispatch = useAppDispatch();

  // Redux Selectors
  const orders = useAppSelector(selectAllOrders);
  const activeOrderId = useAppSelector(selectActiveOrderId);
  const products = useAppSelector(selectProducts);
  const isOrdersLoading = useAppSelector(selectOrdersLoading);

  // Form State
  const [customerId, setCustomerId] = useState(() => {
    if (typeof window !== "undefined" && window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }
    return "c3b7f14b-5134-4b53-8321-df5f483c66f7";
  });
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Action Loading States (Per-order ID tracking)
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  // Initial Data Fetch
  useEffect(() => {
    dispatch(listOrdersAction({ limit: 50 }));
    dispatch(listProductsAction());
  }, [dispatch]);

  // Sync default selected product
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const totalPrice = selectedProduct ? selectedProduct.unitPrice * quantity : 0;
  const isEndsIn99 = totalPrice.toFixed(2).endsWith(".99");

  const regenCustomerId = () => {
    if (typeof window !== "undefined" && window.crypto?.randomUUID) {
      setCustomerId(window.crypto.randomUUID());
    } else {
      setCustomerId(
        "f" + Math.random().toString(16).substring(2, 10) + "-5134-4b53-8321-df5f483c66f7"
      );
    }
  };

  // Place Order Handler
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantity <= 0) return;

    setIsPlacingOrder(true);
    try {
      const resultAction = await dispatch(
        placeOrderAction({
          customerId: customerId,
          items: [
            {
              productId: selectedProductId,
              quantity,
              price: selectedProduct?.unitPrice ?? 0,
            },
          ],
        })
      ).unwrap();

      // Clear/Reset form fields (or keep customerId)
      setQuantity(1);
      // Re-fetch list
      dispatch(listOrdersAction({ limit: 50 }));

      // Automatically select the placed order
      if (resultAction?.id) {
        dispatch(setActiveOrderId(resultAction.id));
      }
    } catch (err) {
      console.error("Failed to place order:", err);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Cancel Order Handler
  const handleCancelOrder = async (orderId: string) => {
    setActionLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      await dispatch(
        cancelOrderAction({
          orderId,
          reason: "Manual cancel from console",
        })
      ).unwrap();
      dispatch(listOrdersAction({ limit: 50 }));
    } catch (err) {
      console.error("Cancel failed:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Ship Order Handler
  const handleShipOrder = async (orderId: string) => {
    setActionLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      await dispatch(
        shipOrderAction({
          orderId,
          carrier: "DHL Express",
          trackingNumber: `DHL-${Math.floor(100000 + Math.random() * 900000)}`,
        })
      ).unwrap();
      dispatch(listOrdersAction({ limit: 50 }));
    } catch (err) {
      console.error("Ship failed:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Deliver Order Handler
  const handleDeliverOrder = async (orderId: string) => {
    setActionLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      await dispatch(deliverOrderAction(orderId)).unwrap();
      dispatch(listOrdersAction({ limit: 50 }));
    } catch (err) {
      console.error("Deliver failed:", err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  // Copy ID Utility
  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse";
      case OrderStatus.PLACED:
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case OrderStatus.PAID:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case OrderStatus.SHIPPED:
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case OrderStatus.DELIVERED:
        return "bg-teal-500/10 text-teal-400 border-teal-500/20";
      case OrderStatus.CANCELLED:
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full max-w-7xl mx-auto">
      {/* LEFT COLUMN: Place Order Form */}
      <div className="xl:col-span-5 flex flex-col gap-6">
        <div className="border border-border bg-card/45 backdrop-blur-md rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground font-mono">
              Place Order Simulator
            </h2>
          </div>

          <form onSubmit={handlePlaceOrder} className="space-y-4">
            {/* Customer ID */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-muted-foreground uppercase font-mono">
                  Customer ID (UUID)
                </label>
                <button
                  type="button"
                  onClick={regenCustomerId}
                  className="text-[10px] text-primary hover:underline font-mono font-bold"
                >
                  Regen UUID
                </button>
              </div>
              <Input
                type="text"
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="bg-background/50 border-border/80 focus:border-primary font-mono text-xs"
                placeholder="550e8400-e29b-41d4-a716-446655440000"
              />
            </div>

            {/* Product Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase font-mono">
                Product Catalog Selector
              </label>
              <div className="relative">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background/50 text-sm font-mono text-foreground focus:outline-none focus:border-primary appearance-none cursor-pointer"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id} className="bg-card text-foreground">
                      {p.name} ({p.sku}) — ${p.unitPrice.toFixed(2)} [Qty: {p.stockQuantity}]
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground text-xs font-mono">
                  ▼
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase font-mono">
                Order Quantity
              </label>
              <Input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="bg-background/50 border-border/80 focus:border-primary font-mono text-sm"
              />
            </div>

            {/* Price Calculations */}
            <div className="p-4 rounded-xl border border-border/40 bg-background/30 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-mono font-bold">
                  Total Checkout Price
                </p>
                <p className="text-xl font-bold font-mono text-foreground">
                  ${totalPrice.toFixed(2)}
                </p>
              </div>
              {isEndsIn99 && (
                <div className="flex items-center gap-1.5 text-xs text-rose-400 font-mono bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Ends in .99 (Triggers Failure)
                </div>
              )}
            </div>

            {/* Payment Simulation Alert Callout */}
            <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-400 leading-relaxed font-mono flex gap-2.5">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
              <div>
                <strong className="text-amber-300">Payment Failure Simulation Rule:</strong> If
                the total checkout price ends in <span className="underline font-bold text-amber-300">.99</span>, the Payment Service mock handler will deliberately simulate a stripe gateway failure. The Saga Orchestrator will run compensation (releasing reserved inventory items & cancelling the order).
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isPlacingOrder || products.length === 0}
              className="w-full h-10 font-bold font-mono uppercase tracking-wider transition-all"
            >
              {isPlacingOrder ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                "Submit Saga Transaction"
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: Active Orders List */}
      <div className="xl:col-span-7 flex flex-col gap-6">
        <div className="border border-border bg-card/45 backdrop-blur-md rounded-2xl p-6 shadow-xl flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold text-foreground font-mono">
                Active Saga Dashboard
              </h2>
            </div>
            <button
              onClick={() => dispatch(listOrdersAction({ limit: 50 }))}
              className="p-1.5 rounded-lg border border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
              title="Refresh Orders"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-x-auto">
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
              <table className="w-full text-left border-collapse min-w-[600px]">
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
                        onClick={() => dispatch(setActiveOrderId(order.id))}
                        className={`border-b border-border/40 hover:bg-muted/40 cursor-pointer transition-all ${
                          isSelected ? "bg-primary/5 border-l-2 border-l-primary" : ""
                        }`}
                      >
                        {/* ID Column */}
                        <td className="py-3 pl-2 font-mono text-xs text-foreground font-semibold">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate max-w-[80px]" title={order.id}>
                              {order.id.slice(0, 8)}...
                            </span>
                            <button
                              onClick={(e) => handleCopyId(order.id, e)}
                              className="text-muted-foreground hover:text-foreground transition-all"
                            >
                              {copiedId === order.id ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Saga Status */}
                        <td className="py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold tracking-wide uppercase ${getStatusColor(
                              order.status
                            )}`}
                          >
                            {order.status}
                          </span>
                        </td>

                        {/* Total Price */}
                        <td className="py-3 text-right font-mono text-xs text-foreground font-semibold pr-2">
                          ${order.totalPrice.toFixed(2)}
                        </td>

                        {/* Actions */}
                        <td className="py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            {/* Cancel Option (PENDING / PLACED) */}
                            {(order.status === OrderStatus.PENDING ||
                              order.status === OrderStatus.PLACED) && (
                              <Button
                                size="xs"
                                variant="destructive"
                                disabled={isLoading}
                                onClick={() => handleCancelOrder(order.id)}
                                className="font-mono text-[10px] uppercase font-bold"
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

                            {/* Mark as Shipped (PAID) */}
                            {order.status === OrderStatus.PAID && (
                              <Button
                                size="xs"
                                variant="outline"
                                disabled={isLoading}
                                onClick={() => handleShipOrder(order.id)}
                                className="border-primary/30 hover:border-primary text-primary font-mono text-[10px] uppercase font-bold"
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

                            {/* Mark as Delivered (SHIPPED) */}
                            {order.status === OrderStatus.SHIPPED && (
                              <Button
                                size="xs"
                                variant="default"
                                disabled={isLoading}
                                onClick={() => handleDeliverOrder(order.id)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] uppercase font-bold"
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

                            {/* Complete State Placeholder */}
                            {(order.status === OrderStatus.DELIVERED ||
                              order.status === OrderStatus.CANCELLED) && (
                              <span className="text-[10px] font-mono text-muted-foreground font-semibold italic">
                                Archival State
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
      </div>
    </div>
  );
}
