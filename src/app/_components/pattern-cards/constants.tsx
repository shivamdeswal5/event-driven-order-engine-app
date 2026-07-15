import { Mailbox, Shuffle, SearchCode, DatabaseZap } from "lucide-react";
import type { FanOffset, PatternCard } from "./types";

export const patterns: PatternCard[] = [
  {
    title: "Transactional Outbox",
    subtitle: "Guaranteed Delivery",
    icon: <Mailbox className="h-6 w-6" />,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    description:
      "Persists domain events in a database Outbox table within the same transaction. A separate publisher reads and dispatches events to RabbitMQ, ensuring At-Least-Once delivery.",
    snippet: `// Atomically write order & outbox event
await em.transactional(async (tx) => {
  tx.persist(order);
  tx.persist(outboxMessage);
});`,
  },
  {
    title: "Choreographed Saga",
    subtitle: "Decentralized Coordination",
    icon: <Shuffle className="h-6 w-6" />,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    description:
      "Contexts react autonomously to domain events without a central coordinator. Compensation processors execute on failure events (e.g. PaymentFailedEvent) to restore system state.",
    snippet: `// Transactional event processor
@Injectable()
export class InventoryReservedProcessor {
  @Transactional()
  async handle(msg: { messageId; body }) {
    // Process billing & write outbox atomically
  }
}`,
  },
  {
    title: "Inbox Idempotency",
    subtitle: "Message Deduplication",
    icon: <SearchCode className="h-6 w-6" />,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    description:
      "Applies Transactional Inbox pattern to deduplicate events. Inserting the Message ID and Handler Name into the inbox table fails on unique key constraint if already processed, rolling back the transaction.",
    snippet: `// Transactional Inbox deduplication
await this.inboxRepository.storeInboxMessage({
  messageId: message.messageId,
  handlerName: this.getHandlerName(),
  eventType: 'InventoryReservedEvent'
}, schema);`,
  },
  {
    title: "CQRS Isolation",
    subtitle: "Write/Read Segregation",
    icon: <DatabaseZap className="h-6 w-6" />,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    description:
      "Separates write transactions from read telemetry operations. Writes are processed via APIs while real-time read metrics are pushed to the telemetry view via WebSockets.",
    snippet: `// Command side write
POST /api/orders/place
// Query side read broadcast
Gateway.broadcast('order.placed', payload);`,
  },
];

export const fanOffsets: FanOffset[] = [
  { x: -12, y: -10, rotate: -6 },
  { x: 8, y: -4, rotate: 4 },
  { x: -4, y: 8, rotate: -2 },
  { x: 10, y: 12, rotate: 8 },
];
