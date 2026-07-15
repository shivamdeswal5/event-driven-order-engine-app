"use client";

import React from "react";
import { Activity, ShoppingCart } from "lucide-react";
import { useOrderPlayground } from "./use-order-playground";
import { OrderSimulator } from "./_components/order-simulator";
import { SagaTracker } from "./_components/saga-tracker";
import { OrdersDashboard } from "./_components/orders-dashboard";

export function OrderPlayground() {
  const playground = useOrderPlayground();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 w-full">
      <div className="lg:col-span-5 flex flex-col h-[560px] lg:h-[600px]">
        <div className="border border-border bg-card/45 backdrop-blur-md rounded-2xl p-5 shadow-xl relative overflow-hidden h-full flex flex-col">
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/80 mb-5 shrink-0 font-mono text-xs select-none">
            <button
              type="button"
              onClick={() => playground.setActiveTab("simulator")}
              className={`flex-1 py-2 rounded-lg transition-all font-bold cursor-pointer flex items-center justify-center gap-1.5 ${
                playground.activeTab === "simulator"
                  ? "bg-background text-primary shadow-sm border border-border/40 font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              <span>Simulator</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (playground.activeOrderId) playground.setActiveTab("tracker");
              }}
              disabled={!playground.activeOrderId}
              className={`flex-1 py-2 rounded-lg transition-all font-bold flex items-center justify-center gap-1.5 ${
                !playground.activeOrderId
                  ? "opacity-50 cursor-not-allowed text-muted-foreground"
                  : "cursor-pointer"
              } ${
                playground.activeTab === "tracker"
                  ? "bg-background text-primary shadow-sm border border-border/40 font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Saga Tracker</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 scrollbar-none flex flex-col justify-between">
            {playground.activeTab === "simulator" ? (
              <OrderSimulator
                products={playground.products}
                customerId={playground.customerId}
                setCustomerId={playground.setCustomerId}
                selectedProductId={playground.selectedProductId}
                setSelectedProductId={playground.setSelectedProductId}
                quantity={playground.quantity}
                setQuantity={playground.setQuantity}
                selectedProduct={playground.selectedProduct}
                totalPrice={playground.totalPrice}
                isEndsIn99={playground.isEndsIn99}
                isPlacingOrder={playground.isPlacingOrder}
                isDropdownOpen={playground.isDropdownOpen}
                setIsDropdownOpen={playground.setIsDropdownOpen}
                regenCustomerId={playground.regenCustomerId}
                onSubmit={playground.handlePlaceOrder}
              />
            ) : playground.activeOrder ? (
              <SagaTracker
                activeOrder={playground.activeOrder}
                actionLoading={playground.actionLoading}
                onShip={playground.handleShipOrder}
                onDeliver={playground.handleDeliverOrder}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground font-mono text-xs p-6 text-center">
                Select an order from the Active Saga Dashboard to monitor its
                distributed transaction lifecycle.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="lg:col-span-7 flex flex-col h-[560px] lg:h-[600px]">
        <OrdersDashboard
          orders={playground.orders}
          activeOrderId={playground.activeOrderId}
          isOrdersLoading={playground.isOrdersLoading}
          actionLoading={playground.actionLoading}
          copiedId={playground.copiedId}
          onRefresh={playground.refreshOrders}
          onSelectOrder={playground.selectOrder}
          onCopyId={playground.handleCopyId}
          onCancel={playground.handleCancelOrder}
          onShip={playground.handleShipOrder}
          onDeliver={playground.handleDeliverOrder}
        />
      </div>
    </div>
  );
}
