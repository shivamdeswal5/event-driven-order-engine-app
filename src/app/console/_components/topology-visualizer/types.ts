import type { Node } from "@xyflow/react";

export type ExchangeNodeData = {
  label: string;
  routingKey: string;
  color: string;
};

export type QueueNodeData = {
  label: string;
  consumer: string;
  color: string;
};

export type ServiceNodeData = {
  label: string;
  role: "publisher" | "consumer";
  color: string;
};

export type CustomExchangeNode = Node<ExchangeNodeData, "exchangeNode">;
export type CustomQueueNode = Node<QueueNodeData, "queueNode">;
export type CustomServiceNode = Node<ServiceNodeData, "serviceNode">;

export type ActivityEntry = {
  eventType: string;
  orderId: string;
  ts: number;
};

export type AnimQueueItem = {
  eventType: string;
  orderId: string;
};
