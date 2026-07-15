"use client";

import { useCallback, useEffect, useState } from "react";
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
import { addToast } from "@/features/ui/ui.slice";

export type PlaygroundTab = "simulator" | "tracker";

export function useOrderPlayground() {
  const dispatch = useAppDispatch();

  const orders = useAppSelector(selectAllOrders);
  const activeOrderId = useAppSelector(selectActiveOrderId);
  const products = useAppSelector(selectProducts);
  const isOrdersLoading = useAppSelector(selectOrdersLoading);

  const [activeTab, setActiveTab] = useState<PlaygroundTab>("simulator");
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleOutsideClick = () => setIsDropdownOpen(false);
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isDropdownOpen]);

  useEffect(() => {
    dispatch(listOrdersAction({ limit: 50 }));
    dispatch(listProductsAction());
  }, [dispatch]);

  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  useEffect(() => {
    if (activeOrderId) {
      setActiveTab("tracker");
    }
  }, [activeOrderId]);

  useEffect(() => {
    if (orders.length > 0 && !activeOrderId) {
      dispatch(setActiveOrderId(orders[0].id));
    }
  }, [orders, activeOrderId, dispatch]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const totalPrice = selectedProduct ? selectedProduct.unitPrice * quantity : 0;
  const isEndsIn99 = totalPrice.toFixed(2).endsWith(".99");
  const activeOrder = orders.find((o) => o.id === activeOrderId);

  const regenCustomerId = useCallback(() => {
    if (typeof window !== "undefined" && window.crypto?.randomUUID) {
      setCustomerId(window.crypto.randomUUID());
    } else {
      setCustomerId(
        "f" + Math.random().toString(16).substring(2, 10) + "-5134-4b53-8321-df5f483c66f7",
      );
    }
  }, []);

  const refreshOrders = useCallback(() => {
    dispatch(listOrdersAction({ limit: 50 }));
  }, [dispatch]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || quantity <= 0) return;

    setIsPlacingOrder(true);
    try {
      const resultAction = await dispatch(
        placeOrderAction({
          customerId,
          items: [
            {
              productId: selectedProductId,
              quantity,
              price: selectedProduct?.unitPrice ?? 0,
            },
          ],
        }),
      ).unwrap();

      setQuantity(1);
      refreshOrders();

      if (resultAction?.id) {
        dispatch(setActiveOrderId(resultAction.id));
      }

      dispatch(
        addToast({
          type: "success",
          title: "Saga Initiated",
          message: "Order placed. Choreography saga is now in flight via RabbitMQ.",
        }),
      );
    } catch (err: unknown) {
      const payload = err as { message?: string };
      dispatch(
        addToast({
          type: "error",
          title: "Order Failed",
          message: payload?.message ?? "Failed to place order. Please try again.",
        }),
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    setActionLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      await dispatch(
        cancelOrderAction({
          orderId,
          reason: "Manual cancel from console",
        }),
      ).unwrap();
      refreshOrders();
      dispatch(
        addToast({
          type: "warning",
          title: "Order Cancelled",
          message: "Compensating transactions dispatched. Inventory rollback initiated.",
        }),
      );
    } catch (err: unknown) {
      const payload = err as { message?: string };
      dispatch(
        addToast({
          type: "error",
          title: "Cancel Failed",
          message: payload?.message ?? "Could not cancel the order.",
        }),
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleShipOrder = async (orderId: string) => {
    setActionLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      await dispatch(
        shipOrderAction({
          orderId,
          carrier: "DHL Express",
          trackingNumber: `DHL-${Math.floor(100000 + Math.random() * 900000)}`,
        }),
      ).unwrap();
      refreshOrders();
      dispatch(
        addToast({
          type: "success",
          title: "Shipment Dispatched",
          message: "DHL Express carrier assigned. ShipmentShipped event published to RabbitMQ.",
        }),
      );
    } catch (err: unknown) {
      const payload = err as { message?: string };
      dispatch(
        addToast({
          type: "error",
          title: "Ship Failed",
          message: payload?.message ?? "Could not dispatch shipment.",
        }),
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleDeliverOrder = async (orderId: string) => {
    setActionLoading((prev) => ({ ...prev, [orderId]: true }));
    try {
      await dispatch(deliverOrderAction(orderId)).unwrap();
      refreshOrders();
      dispatch(
        addToast({
          type: "success",
          title: "Saga Complete",
          message:
            "Handover confirmed. ShipmentDelivered event published. Eventual consistency reached.",
        }),
      );
    } catch (err: unknown) {
      const payload = err as { message?: string };
      dispatch(
        addToast({
          type: "error",
          title: "Delivery Failed",
          message: payload?.message ?? "Could not confirm delivery. Check shipment state.",
        }),
      );
    } finally {
      setActionLoading((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const selectOrder = (orderId: string) => {
    dispatch(setActiveOrderId(orderId));
  };

  return {
    orders,
    activeOrderId,
    products,
    isOrdersLoading,
    activeTab,
    setActiveTab,
    customerId,
    setCustomerId,
    selectedProductId,
    setSelectedProductId,
    quantity,
    setQuantity,
    isPlacingOrder,
    copiedId,
    isDropdownOpen,
    setIsDropdownOpen,
    actionLoading,
    selectedProduct,
    totalPrice,
    isEndsIn99,
    activeOrder,
    regenCustomerId,
    refreshOrders,
    handlePlaceOrder,
    handleCancelOrder,
    handleShipOrder,
    handleDeliverOrder,
    handleCopyId,
    selectOrder,
  };
}

export type OrderPlaygroundState = ReturnType<typeof useOrderPlayground>;
