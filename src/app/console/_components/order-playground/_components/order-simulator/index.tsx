"use client";

import React from "react";
import { AlertTriangle, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ProductResponse } from "@/features/catalog/list-products/list-products.interface";
import { SagaDispatchOverlay } from "../saga-dispatch-overlay";

type Props = {
  products: ProductResponse[];
  customerId: string;
  setCustomerId: (id: string) => void;
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  quantity: number;
  setQuantity: (q: number) => void;
  selectedProduct: ProductResponse | undefined;
  totalPrice: number;
  isEndsIn99: boolean;
  isPlacingOrder: boolean;
  isDropdownOpen: boolean;
  setIsDropdownOpen: (open: boolean) => void;
  regenCustomerId: () => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function OrderSimulator({
  products,
  customerId,
  setCustomerId,
  selectedProductId,
  setSelectedProductId,
  quantity,
  setQuantity,
  selectedProduct,
  totalPrice,
  isEndsIn99,
  isPlacingOrder,
  isDropdownOpen,
  setIsDropdownOpen,
  regenCustomerId,
  onSubmit,
}: Props) {
  return (
    <div className="relative flex-1 flex flex-col justify-between">
      {isPlacingOrder && <SagaDispatchOverlay />}
      <form onSubmit={onSubmit} className="space-y-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-muted-foreground uppercase font-mono">
              Customer ID (UUID)
            </label>
            <button
              type="button"
              onClick={regenCustomerId}
              className="text-[10px] text-primary hover:underline font-mono font-bold cursor-pointer"
            >
              Regen UUID
            </button>
          </div>
          <input
            type="text"
            required
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background/50 text-xs font-mono text-foreground placeholder:text-muted-foreground/60 transition-all outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background/80"
            placeholder="550e8400-e29b-41d4-a716-446655440000"
          />
        </div>

        <div className="space-y-1.5 relative">
          <label className="text-xs font-semibold text-muted-foreground uppercase font-mono">
            Product Catalog Selector
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className={`w-full h-10 px-3 pr-10 rounded-lg border bg-background/50 text-left text-xs font-mono text-foreground transition-all outline-none cursor-pointer flex items-center justify-between focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background/80 ${
                isDropdownOpen
                  ? "border-primary ring-1 ring-primary bg-background/80"
                  : "border-border/80 hover:border-border"
              }`}
            >
              <span className="truncate">
                {selectedProduct
                  ? `${selectedProduct.name} (${selectedProduct.sku}) — $${selectedProduct.unitPrice.toFixed(2)} [Qty: ${selectedProduct.stockQuantity}]`
                  : "Select a product..."}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-muted-foreground/70 shrink-0 transition-transform duration-200 ${isDropdownOpen ? "transform rotate-180 text-primary" : ""}`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-lg border border-border bg-popover/95 backdrop-blur-md p-1 shadow-lg font-mono text-xs text-popover-foreground scrollbar-thin scrollbar-thumb-border animate-in fade-in-50 zoom-in-95 duration-100">
                {products.length === 0 ? (
                  <div className="p-2 text-center text-muted-foreground">
                    No products available
                  </div>
                ) : (
                  products.map((p) => {
                    const isSelected = p.id === selectedProductId;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedProductId(p.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors cursor-pointer hover:bg-muted/80 flex flex-col gap-0.5 ${
                          isSelected
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-foreground"
                        }`}
                      >
                        <div className="flex justify-between items-center w-full gap-2">
                          <span className="truncate font-bold">{p.name}</span>
                          <span className="text-muted-foreground text-[9px] shrink-0">
                            {p.sku}
                          </span>
                        </div>
                        <div className="flex justify-between items-center w-full text-[9px] text-muted-foreground">
                          <span>${p.unitPrice.toFixed(2)}</span>
                          <span>Stock: {p.stockQuantity}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase font-mono">
            Order Quantity
          </label>
          <input
            type="number"
            min="1"
            required
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full h-10 px-3 rounded-lg border border-border/80 bg-background/50 text-xs font-mono text-foreground placeholder:text-muted-foreground/60 transition-all outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-background/80"
          />
        </div>

        <div className="p-3.5 rounded-xl border border-border/40 bg-background/30 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-mono font-bold">
              Total Checkout Price
            </p>
            <p className="text-lg font-bold font-mono text-foreground tabular-nums">
              ${totalPrice.toFixed(2)}
            </p>
          </div>
          {isEndsIn99 && (
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-mono bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
              <AlertTriangle className="h-3.5 w-3.5" />
              Ends in .99 (Failure)
            </div>
          )}
        </div>

        <div className="p-3 rounded-xl border border-amber-500/20 bg-amber-500/5 text-[10px] text-amber-400 leading-relaxed font-mono flex gap-2">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-amber-400 mt-0.5" />
          <div>
            <strong className="text-amber-300">Payment Simulation:</strong> If the
            checkout price ends in{" "}
            <span className="underline font-bold text-amber-300">.99</span>, payment
            authorization will fail, triggering compensate transactions via RabbitMQ to
            rollback stocks.
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPlacingOrder || products.length === 0}
          className="w-full h-10 font-bold font-mono uppercase tracking-wider transition-all cursor-pointer"
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
  );
}
