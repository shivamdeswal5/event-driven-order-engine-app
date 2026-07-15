export type FaqItem = {
  question: string;
  answer: string;
};

export type QuizItem = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type OfficialLink = {
  label: string;
  href: string;
};

export type ContentBlock = {
  heading: string;
  body: string[];
};

export type Chapter = {
  id: string;
  number: string;
  title: string;
  chipLabel: string;
  subtitle: string;
  readingTime: string;
  analogy: string;
  sections: ContentBlock[];
  snippet?: { label: string; code: string };
  faqs: FaqItem[];
  quiz: QuizItem[];
  officialLinks: OfficialLink[];
};

export const CHAPTERS: Chapter[] = [
  {
    id: "orientation",
    number: "00",
    title: "Orientation",
    chipLabel: "Orientation",
    subtitle: "What you are about to learn",
    readingTime: "4 min",
    analogy:
      "Imagine a restaurant with five kitchen stations. Nobody raids another station’s fridge — they pass tickets through a central pass. That pass is the message broker; the tickets are domain events.",
    sections: [
      {
        heading: "What is this project?",
        body: [
          "Apex Console is a teaching-grade order fulfillment engine. It places an order, reserves stock, charges a payment (simulated), creates a shipment, and notifies the UI — all without modules calling each other like a tangled ball of HTTP.",
          "Technically it is a modular monolith: one NestJS application you run and deploy together, but five bounded contexts (Order, Inventory, Payment, Shipping, Notification). Each owns its own PostgreSQL schema and its own tables. That is the industry stepping stone between a classic monolith and full microservices.",
        ],
      },
      {
        heading: "What problem are we solving?",
        body: [
          "In real e-commerce, “place order” is never one database write. Stock, money, and shipping live in different teams/systems. If Order talks to Inventory with a synchronous API call, and Inventory then calls Payment, you get cascading failures, timeouts, and nightmares when you need to undo a half-finished flow.",
          "Event-driven design flips that: each service does its job, announces what happened (“InventoryReserved”), and others react. You get decoupling, retries, and a clear story of what occurred — which is exactly what interviewers mean by eventual consistency.",
        ],
      },
      {
        heading: "How we will learn (the path)",
        body: [
          "Next we cover architecture foundations — monolith vs modular monolith vs microservices, DDD (lightly), vertical slices, light CQRS, and ports & adapters — so the folder shape and boundaries make sense before messaging.",
          "Then messaging (RabbitMQ), reliability (outbox & inbox), saga choreography, and the happy path of one order. After that: Redis + WebSockets for live UI, the Console, and a hands-on lab. Official docs are linked wherever a concept has a canonical source.",
        ],
      },
    ],
    snippet: {
      label: "five stations (bounded contexts)",
      code: `Order        → create & cancel orders
            Inventory   → reserve / release stock
            Payment     → charge (simulated .99 rule)
            Shipping    → create → ship → deliver
            Notification → persist log + push to UI`,
    },
    faqs: [
      {
        question: "Is this microservices or a monolith?",
        answer:
          "It is a modular monolith: one process, strong module boundaries, communication only via domain events. You get microservice-style decoupling (no shared tables, clear ownership) without operating five separate deployables. Many companies start here, then peel modules into services later.",
      },
      {
        question: "Why separate PostgreSQL schemas?",
        answer:
          "Schemas enforce ownership. Order cannot SELECT from payment_schema. The only way Order learns “payment succeeded” is by consuming PaymentCompletedEvent. That rule prevents accidental tight coupling and makes a future service split realistic.",
      },
      {
        question: "Do I need to know NestJS to follow this page?",
        answer:
          "No. This curriculum is concept-first. Snippets are illustrative stories of what happens — not homework to compile. When you open the Console later, you will see the same story as live animations.",
      },
    ],
    quiz: [
      {
        prompt: "Can Order read Payment’s database tables directly?",
        options: ["Yes, via a shared ORM repository", "Yes, but only inside a transaction", "No — only through events"],
        correctIndex: 2,
        explanation:
          "Cross-module data access is forbidden. PaymentCompletedEvent is how Order learns about payment success.",
      },
      {
        prompt: "What is the main benefit of a modular monolith for learning?",
        options: [
          "You practice service boundaries without multi-deploy complexity",
          "You never need a message broker",
          "Everything shares one giant table",
        ],
        correctIndex: 0,
        explanation: "You still learn events, ownership, and sagas — but you run one app with Docker Compose.",
      },
      {
        prompt:
          "HARD: A teammate adds a JOIN from order_schema into payment_schema “just for a report.” What architectural rule did they break, and what is the correct fix?",
        options: [
          "None — reports may always join across schemas",
          "Module ownership / bounded context isolation; export a read model or consume Payment events instead",
          "They must use Redis instead of SQL for the report",
        ],
        correctIndex: 1,
        explanation:
          "Schemas exist so modules cannot reach into each other’s tables. Cross-context reads belong in events or an intentional read API — not sneaky JOINs.",
      },
    ],
    officialLinks: [
      {
        label: "AWS — What are microservices?",
        href: "https://aws.amazon.com/microservices/",
      },
      {
        label: "AWS — Event-driven architecture",
        href: "https://aws.amazon.com/event-driven-architecture/",
      },
      {
        label: "Martin Fowler — Microservices",
        href: "https://www.martinfowler.com/articles/microservices.html",
      },
      {
        label: "PostgreSQL — Schemas",
        href: "https://www.postgresql.org/docs/current/ddl-schemas.html",
      },
    ],
  },
  {
    id: "architecture",
    number: "01",
    title: "Architecture foundations",
    chipLabel: "Architecture",
    subtitle: "Why this engine is a modular monolith — and how DDD, slices, CQRS, and adapters show up",
    readingTime: "12 min",
    analogy:
      "Think of a shopping mall: one building (deployable), many shops with locked storerooms (bounded contexts), a shared PA system for announcements (events), and each shop’s checkout counter as its own use-case desk (vertical slice) — not one giant shared cash register for the whole mall.",
    sections: [
      {
        heading: "Three shapes of a backend",
        body: [
          "A classic monolith is one codebase, one deployable, and usually one shared database where any code can touch any table. It ships fast early on, then often becomes a ball of mud: unclear ownership, risky deploys, and hard-to-reason side effects.",
          "Microservices reverse that: each service is its own deployable with its own data store. You gain independent scaling and team autonomy — and pay for network failures, distributed transactions, observability, and ops complexity.",
          "A modular monolith sits in the middle: one process you run and deploy together, but modules with hard boundaries (schemas, no cross-table peeks, talk via events). You practice microservice-style ownership without operating five pipelines on day one. Many companies start here and peel modules into services later.",
        ],
      },
      {
        heading: "What problem we chose to solve",
        body: [
          "This project’s goal is teaching: event-driven order flow, reliable messaging, and clear ownership — without drowning you in Kubernetes. So we chose a modular monolith: NestJS modules for Order, Inventory, Payment, Shipping, and Notification, each with its own PostgreSQL schema.",
          "That choice lets you learn sagas and outbox patterns with Docker Compose, while keeping a realistic path to microservices: if Inventory ever becomes its own service, its schema and events already look like a service boundary.",
        ],
      },
      {
        heading: "DDD, lightly",
        body: [
          "Domain-Driven Design (DDD) is a way to structure software around the business language. You do not need every DDD book pattern to benefit. The pieces that matter here: bounded context (a module with a clear job and vocabulary), aggregate (a cluster of data that must stay consistent together — e.g. an Order and its lines), and domain events (facts that happened: OrderPlaced, InventoryReserved).",
          "Bounded contexts explain why Order cannot JOIN Payment’s tables. Aggregates explain why we change order status inside Order’s own rules. Domain events are the language between contexts — the same events you will see on RabbitMQ and in the Console.",
        ],
      },
      {
        heading: "Vertical slices",
        body: [
          "Classic layering puts all controllers in one folder, all services in another, all repositories elsewhere. That scales poorly for “find everything for PlaceOrder.” A vertical slice groups one use case end-to-end: HTTP entry, validation DTO, command or query, handler, and wiring — under something like features/place-order/.",
          "This engine organizes features that way inside each bounded context. When you open a slice, you see the whole story of one action without hopping across six unrelated directories. Interview tip: slices are about cohesion by use case; layers are about technical role.",
        ],
      },
      {
        heading: "Light CQRS",
        body: [
          "CQRS means separating commands (change state) from queries (read state). Full CQRS often means a separate read model or even a second database. That is powerful — and heavy.",
          "Here we use light CQRS: place-order.command.ts vs get-order.query.ts style files, clear intent in naming and handlers, but the same PostgreSQL database. We deliberately do not run a second read store. If an interviewer asks “do you do CQRS?”, answer: “command/query separation in code; same DB — intentional teaching scope.”",
        ],
      },
      {
        heading: "Ports and adapters (where it matters)",
        body: [
          "Hexagonal architecture (ports & adapters) says: core logic depends on abstract ports (interfaces), and adapters plug in the real world (Postgres, RabbitMQ, Redis, Socket.io). You do not need every class to be hexagonal to win.",
          "This project uses that idea sharply for realtime: domain/notification code depends on a RealtimeBroadcaster port. One adapter talks Redis so CLI workers can publish emits; another path uses Socket.io in the HTTP process to reach browsers. Swap the adapter without rewriting business rules — that is the interview punchline. You will see the concrete Redis story again in the Redis chapter.",
        ],
      },
      {
        heading: "How this project uses it (story)",
        body: [
          "You place an order: a PlaceOrder vertical slice in the Order context validates input, loads/creates the Order aggregate, writes the row and an outbox event in one transaction (reliability comes next chapter).",
          "Inventory, Payment, and Shipping react as their own contexts via events — not via shared tables. Notification persists a ledger entry and asks the RealtimeBroadcaster port to push UI updates; Redis + Socket.io adapters make that work across processes. Same architecture spine from folder shape to live Console.",
        ],
      },
    ],
    snippet: {
      label: "architecture at a glance",
      code: `Deployable     → one NestJS app (modular monolith)
Contexts       → Order | Inventory | Payment | Shipping | Notify
Data           → one Postgres, separate schemas (ownership)
Use case       → vertical slice (feature folder)
Write vs read  → light CQRS (command / query files, same DB)
Realtime port  → RealtimeBroadcaster
  adapters     → Redis emitter (workers) + Socket.io (HTTP)`,
    },
    faqs: [
      {
        question: "Is a modular monolith “just a monolith with folders”?",
        answer:
          "No. Folders alone are soft boundaries. Schemas, no cross-context SQL, and event-only communication are hard boundaries. Soft folders rot; hard boundaries survive a future service split.",
      },
      {
        question: "When would you actually split into microservices?",
        answer:
          "When a context needs independent scale, release cadence, or team ownership that the single deployable cannot give — and you can afford the ops tax. Split along existing bounded contexts and events; do not invent new cuts randomly.",
      },
      {
        question: "Is this “real” CQRS if we share one database?",
        answer:
          "It is command/query separation — the useful half of CQRS — without a separate read model. Calling it “full CQRS” would oversell. Light CQRS is an honest label and a common production starting point.",
      },
      {
        question: "Do we use hexagonal architecture everywhere?",
        answer:
          "No. We apply ports & adapters where swapping infrastructure matters most (realtime broadcasting). Claiming full hexagonal for every repository would be theater. Prefer sharp ports at real boundaries.",
      },
      {
        question: "Vertical slice vs clean architecture layers — conflict?",
        answer:
          "They answer different questions. Slices organize by use case; within a slice you may still have domain vs infrastructure. This project favors slices for navigation and domain modules for ownership.",
      },
    ],
    quiz: [
      {
        prompt: "What best describes this project’s deployable shape?",
        options: [
          "Five independently deployed microservices",
          "One modular monolith with hard module boundaries",
          "A classic monolith with one shared schema for all tables",
        ],
        correctIndex: 1,
        explanation: "One NestJS app, five bounded contexts, separate schemas, event communication.",
      },
      {
        prompt: "In DDD terms, why can’t Order SELECT from payment tables?",
        options: [
          "PostgreSQL forbids JOINs across schemas forever",
          "Bounded context / aggregate ownership — cross-context facts travel as domain events",
          "CQRS requires two databases before any read is allowed",
        ],
        correctIndex: 1,
        explanation: "Ownership is the rule. Events (or an intentional read API) are the legal doors between contexts.",
      },
      {
        prompt: "What does “light CQRS” mean here?",
        options: [
          "Separate command and query code paths, same PostgreSQL database",
          "Every read goes to Elasticsearch and every write to Kafka",
          "Commands run only on the browser; queries only on Redis",
        ],
        correctIndex: 0,
        explanation: "Naming and handler separation without a second read store.",
      },
      {
        prompt:
          "HARD: Notification workers must push toasters to browsers, but workers have no Socket.io connections. Which architecture move solves that without merging workers into the API process?",
        options: [
          "Let workers write directly into order_schema from SQL",
          "Depend on a RealtimeBroadcaster port; use a Redis adapter so the HTTP Socket.io process delivers",
          "Replace RabbitMQ with synchronous HTTP between all modules",
        ],
        correctIndex: 1,
        explanation:
          "Port + Redis adapter is the hexagonal move: business code stays free of Socket.io process details.",
      },
    ],
    officialLinks: [
      {
        label: "AWS — What are microservices?",
        href: "https://aws.amazon.com/microservices/",
      },
      {
        label: "Martin Fowler — Microservices",
        href: "https://www.martinfowler.com/articles/microservices.html",
      },
      {
        label: "Microsoft — CQRS pattern",
        href: "https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs",
      },
      {
        label: "Microsoft — Hexagonal architecture",
        href: "https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures#hexagonal-architecture",
      },
      {
        label: "AWS — Event-driven architecture",
        href: "https://aws.amazon.com/event-driven-architecture/",
      },
    ],
  },
  {
    id: "rabbitmq",
    number: "02",
    title: "RabbitMQ from zero",
    chipLabel: "RabbitMQ",
    subtitle: "What it is, what problem it solves, core building blocks",
    readingTime: "10 min",
    analogy:
      "RabbitMQ is a post office. Publishers drop letters at a sorting room (exchange). ZIP codes (routing keys) decide which mailbox slots (queues) get copies. Workers (consumers) empty their slots when ready — not when the sender is free.",
    sections: [
      {
        heading: "What is RabbitMQ?",
        body: [
          "RabbitMQ is an open-source message broker. Applications do not talk to each other directly; they send messages to RabbitMQ, and RabbitMQ delivers those messages to interested consumers. It speaks AMQP (Advanced Message Queuing Protocol) and is widely used for background jobs, event-driven microservices, and reliable async workflows.",
          "Unlike a plain HTTP request (ask → wait → answer), messaging is “fire and forget, then process later.” That lets a slow Inventory worker lag without blocking the Order API from returning 201 Created to the user.",
        ],
      },
      {
        heading: "What problem does it solve?",
        body: [
          "Temporal decoupling: producers and consumers do not need to be online at the same millisecond. Spatial decoupling: producers do not know consumer IP addresses or how many replicas exist. Buffering: if traffic spikes, messages queue instead of melting your database.",
          "It also gives you delivery features HTTP alone does not: acknowledgements, retries, dead-letter queues, and fan-out to many subscribers from one publish.",
        ],
      },
      {
        heading: "Core vocabulary (learn these first)",
        body: [
          "Publisher — code that sends a message. Exchange — routing brain that receives publishes. Routing key — a string label like order.placed. Binding — rule linking exchange + pattern → queue. Queue — ordered buffer of messages. Consumer — worker that pulls/acks messages.",
          "Exchange types matter: direct (exact key), topic (patterns like order.*), fanout (copy to every bound queue), headers (match on headers). This project uses topic for business events and fanout for OrderCancelled so every module can compensate.",
        ],
      },
      {
        heading: "How this project uses RabbitMQ (story)",
        body: [
          "When you place an order, Order does not call Inventory’s HTTP API. It writes OrderPlacedEvent into its outbox; a relay publishes to order-exchange with routing key order.placed. Inventory’s queue is bound to that key, so the Inventory consumer wakes up, reserves stock, and later publishes InventoryReserved to inventory-exchange.",
          "Notification’s queue is bound to almost every routing key — it is a terminal observer that logs and pushes to the UI. In the Console topology you will see those exchanges and queues light up as messages flow. You can also open RabbitMQ Management UI (typically localhost:15672) for the real broker tables and rates.",
        ],
      },
    ],
    snippet: {
      label: "topic routing (conceptual)",
      code: `publish → order-exchange     key: order.placed
         ↓ binding
         inventory-queue  → Inventory consumer

publish → payment-exchange   key: payment.completed
         ↓ bindings
         order-queue      → mark order PAID
         shipping-queue   → create shipment
         notification-q   → UI log + push`,
    },
    faqs: [
      {
        question: "Why not just use HTTP between modules?",
        answer:
          "HTTP couples availability and latency: if Payment is down, Order’s request fails. Messaging lets Order finish its transaction, park the event, and let Payment catch up. Retries and DLQs become broker features instead of custom timeout spaghetti.",
      },
      {
        question: "Is a queue the same as a database table?",
        answer:
          "No. Queues are transient work buffers optimized for consume/ack. Your source of truth for business state remains PostgreSQL. The outbox table is the durable “to publish” list; RabbitMQ is the highway after publish.",
      },
      {
        question: "What is a dead-letter queue (DLQ)?",
        answer:
          "After too many failed processing attempts, RabbitMQ can route a message to an error queue instead of looping forever. Operators inspect DLQ messages, fix bugs, and sometimes requeue. This project configures retry TTL queues and error queues per module.",
      },
      {
        question: "Topic vs fanout — when to use which?",
        answer:
          "Topic = selective routing (only interested consumers). Fanout = everyone must hear (e.g. OrderCancelled so Inventory, Payment, Shipping all compensate). Mixing both is normal in real systems.",
      },
    ],
    quiz: [
      {
        prompt: "In AMQP, who decides which queue receives a message?",
        options: [
          "The publisher picks a queue name every time",
          "PostgreSQL triggers",
          "The exchange + bindings + routing key",
        ],
        correctIndex: 2,
        explanation: "Publishers publish to exchanges. Bindings map routing keys to queues.",
      },
      {
        prompt: "Why can Notification receive almost every event?",
        options: [
          "Its queue is bound to many routing keys / exchanges",
          "It hacks into other modules’ databases",
          "The frontend polls RabbitMQ directly",
        ],
        correctIndex: 0,
        explanation: "Notification is a terminal consumer with wide bindings — perfect for logging and UI push.",
      },
      {
        prompt: "What does “ack” mean for a consumer?",
        options: [
          "Delete the PostgreSQL row",
          "Restart the Docker container",
          "Tell RabbitMQ “I finished; remove/confirm this delivery”",
        ],
        correctIndex: 2,
        explanation: "Acknowledgements control whether a message is removed or redelivered after failure.",
      },
      {
        prompt:
          "HARD: Publisher A publishes with routing key `order.placed` to a topic exchange. Queue Q is bound with `order.*`. Publisher B publishes `payment.completed` to the same exchange. Does Q receive B’s message?",
        options: [
          "Yes — topic exchanges always fan out to every queue",
          "No — `payment.completed` does not match the `order.*` binding",
          "Only if B also writes an outbox row",
        ],
        correctIndex: 1,
        explanation: "Topic bindings are pattern matches. `order.*` matches `order.placed`, not `payment.completed`.",
      },
    ],
    officialLinks: [
      {
        label: "RabbitMQ — Tutorials (official)",
        href: "https://www.rabbitmq.com/tutorials",
      },
      {
        label: "RabbitMQ — AMQP concepts",
        href: "https://www.rabbitmq.com/tutorials/amqp-concepts.html",
      },
      {
        label: "AWS — Publish-subscribe pattern",
        href: "https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/publish-subscribe.html",
      },
      {
        label: "AWS — Amazon MQ for RabbitMQ",
        href: "https://docs.aws.amazon.com/amazon-mq/latest/developer-guide/rabbitmq-basic-elements.html",
      },
    ],
  },
  {
    id: "outbox-inbox",
    number: "03",
    title: "Outbox & Inbox",
    chipLabel: "Outbox & Inbox",
    subtitle: "Why reliable messaging needs more than “just publish”",
    readingTime: "9 min",
    analogy:
      "Outbox = write the business letter and put it in the mailbox drawer in the same locked room (one DB transaction). A courier later empties the drawer. Inbox = stamp every letter you process so a second delivery of the same letter is ignored.",
    sections: [
      {
        heading: "The dual-write problem (the “why”)",
        body: [
          "Naïve approach: (1) UPDATE orders SET status=PLACED; (2) channel.publish(OrderPlaced). If the process crashes between 1 and 2, your database says the order exists but nobody reserved stock — silent data loss. If you publish first and then crash before commit, consumers act on an order that never committed — ghost work.",
          "You cannot solve this with “try/catch and hope.” You need one atomic source of truth for “this business change implies this message must go out.”",
        ],
      },
      {
        heading: "Transactional Outbox — what it is",
        body: [
          "In the same database transaction as your business write, insert a row into outbox_messages (event type, payload, not yet published). After commit, a separate relay process reads unpublished rows, publishes to RabbitMQ with publisher confirms, then marks them processed.",
          "Now either both the order and the outbox row exist, or neither does. The relay can crash and retry safely. Concurrent relays use SELECT … FOR UPDATE SKIP LOCKED so two workers do not publish the same row.",
        ],
      },
      {
        heading: "Inbox — what it is",
        body: [
          "RabbitMQ gives at-least-once delivery: a message may be redelivered after a timeout or restart. If your consumer “reserve stock” runs twice, you oversell. The inbox pattern stores (messageId, handlerName) uniquely before applying side effects. Second delivery hits a unique constraint / exists check and becomes a no-op.",
          "Together, outbox + inbox turn flaky networks into predictable business effects: publish reliably, process idempotently.",
        ],
      },
      {
        heading: "How this project uses them (story)",
        body: [
          "Each module has its own outbox_messages and inbox_messages inside its schema (order_schema.outbox_messages, etc.). Place-order handler saves Order + OrderPlaced outbox row together. CLI dispatch-messages --module=order polls that outbox every OUTBOX_POLLING_INTERVAL_MS and publishes.",
          "When Inventory’s consumer handles OrderPlaced, it first records an inbox entry for that message id, then reserves stock and writes InventoryReserved to its own outbox. That chain is why hops feel spaced by about a second in the Console — reliability over zero-latency magic.",
        ],
      },
    ],
    snippet: {
      label: "same locked room (conceptual)",
      code: `BEGIN TRANSACTION
  save Order (PLACED)
  insert Outbox(OrderPlacedEvent)
COMMIT

-- later, outbox relay:
publish to RabbitMQ → mark outbox processed

-- consumer:
if inbox already has messageId → skip
else process + insert inbox + maybe write next outbox`,
    },
    faqs: [
      {
        question: "Is the outbox the same as the notifications table?",
        answer:
          "No. Outbox is infrastructure (“messages that must be published”). Notifications are a human/UI event log. Different tables, different lifecycles. Confusing them is a common beginner mistake.",
      },
      {
        question: "Why not use RabbitMQ transactions instead?",
        answer:
          "Broker transactions do not span your PostgreSQL commit. The dual-write problem is about two different systems. Outbox keeps the atomic boundary inside the database you already trust for business data.",
      },
      {
        question: "Does inbox mean exactly-once delivery?",
        answer:
          "Brokers usually offer at-least-once. Inbox gives you effectively exactly-once side effects for that handler: duplicates are detected and ignored. That is what product code cares about.",
      },
      {
        question: "What is SKIP LOCKED?",
        answer:
          "A PostgreSQL locking clause so multiple relay workers can poll the same outbox table without grabbing the same row. Unlocked rows are skipped by peers — classic pattern for competing consumers on a DB queue.",
      },
    ],
    quiz: [
      {
        prompt: "When is OrderPlaced actually published to RabbitMQ?",
        options: [
          "Inside the HTTP request, immediately after save",
          "By the browser WebSocket",
          "After commit, by the outbox relay process",
        ],
        correctIndex: 2,
        explanation: "HTTP only writes the outbox. The relay publishes asynchronously — that is the point.",
      },
      {
        prompt: "What does the inbox prevent?",
        options: ["Duplicate business side effects on redelivery", "Slow networks", "Need for exchanges"],
        correctIndex: 0,
        explanation: "Redelivery is normal; inbox makes processing idempotent per handler.",
      },
      {
        prompt: "Dual-write means…",
        options: [
          "Writing to two databases for backup",
          "Updating DB and broker without one atomic boundary",
          "Using two routing keys",
        ],
        correctIndex: 1,
        explanation: "The classic failure mode is partial success across DB + broker.",
      },
      {
        prompt:
          "HARD: The DB commit succeeds and an outbox row is written, but the relay crashes before publishing. What happens next, and why is that still safe?",
        options: [
          "The event is lost forever — dual-write failed",
          "The row stays unpublished; on restart the relay polls it again (at-least-once to the broker)",
          "RabbitMQ invents the message from TCP logs",
        ],
        correctIndex: 1,
        explanation:
          "Outbox is durable intent. Relays are idempotent publishers; consumers still need inbox because broker delivery can still duplicate.",
      },
    ],
    officialLinks: [
      {
        label: "AWS — Transactional outbox",
        href: "https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html",
      },
      {
        label: "Microservices.io — Transactional Outbox",
        href: "https://microservices.io/patterns/data/transactional-outbox.html",
      },
      {
        label: "Microservices.io — Idempotent consumer",
        href: "https://microservices.io/patterns/communication-style/idempotent-consumer.html",
      },
      {
        label: "PostgreSQL — SELECT FOR UPDATE SKIP LOCKED",
        href: "https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE",
      },
    ],
  },
  {
    id: "events-saga",
    number: "04",
    title: "Events & choreography sagas",
    chipLabel: "Saga",
    subtitle: "Distributed workflows without a central puppet master",
    readingTime: "9 min",
    analogy:
      "Orchestration is a conductor telling every musician when to play. Choreography is dancers who know their next move when they hear the music. This project dances — each module reacts to events.",
    sections: [
      {
        heading: "What is a domain event?",
        body: [
          "A domain event is a past-tense fact: OrderPlaced, PaymentFailed, ShipmentShipped. It is not a command (“please place order”) — that already happened. Other parts of the system decide how to react.",
          "Events carry enough payload for consumers (orderId, amounts, ids) plus metadata like event type and ids for tracing. They travel through RabbitMQ after the outbox publish step you just learned.",
        ],
      },
      {
        heading: "What is a saga?",
        body: [
          "A saga is a long-running business transaction across multiple services that cannot share one ACID database transaction. Instead of 2-phase commit, each step has a forward action and often a compensating action (release stock, cancel order, refund).",
          "Two styles: orchestration (a saga coordinator sends commands) and choreography (events trigger the next step). Choreography is simpler to start and matches this codebase.",
        ],
      },
      {
        heading: "Happy vs unhappy paths",
        body: [
          "Happy: OrderPlaced → InventoryReserved → PaymentCompleted → ShipmentCreated → (operator) ShipmentShipped → ShipmentDelivered. Unhappy: InventoryReservationFailed or PaymentFailed → Order cancels → OrderCancelled fans out so others undo their work.",
          "Important teaching point in this engine: ShipmentCreated does not mean the order is SHIPPED. Creating a PENDING shipment is “warehouse labeled the box.” Operator ship emits ShipmentShippedEvent; only then Order becomes SHIPPED. That keeps two state machines honest.",
        ],
      },
      {
        heading: "How this project choreographs (story)",
        body: [
          "There is no SagaOrchestrator class. Payment’s processor listens for InventoryReserved and emits PaymentCompleted or PaymentFailed. Shipping listens for PaymentCompleted and creates a shipment. Order listens for PaymentCompleted (→ PAID), ShipmentShipped (→ SHIPPED), ShipmentDelivered (→ DELIVERED).",
          "When you open the Console topology, each edge you see is one of these reactions. Compensation paths are first-class — failing a .99 payment is a feature for learning rollbacks, not a bug.",
        ],
      },
    ],
    snippet: {
      label: "choreography hop",
      code: `InventoryReservedEvent
  └─ Payment consumes → charge
       ├─ success → PaymentCompletedEvent
       │     ├─ Order → PAID
       │     └─ Shipping → create PENDING shipment
       └─ fail → PaymentFailedEvent
             └─ Order → CANCELLED (+ compensate)`,
    },
    faqs: [
      {
        question: "Where is saga state stored?",
        answer:
          "Not in one saga table. Progress is the combination of order status, reservation status, payment status, and shipment status — reconstructed by applying events. That is normal for choreography.",
      },
      {
        question: "Why not orchestration?",
        answer:
          "Orchestration centralizes flow (easier to visualize, one place to change). Choreography avoids a single coordinator bottleneck and matches “each bounded context owns its reactions.” Both are valid; this project teaches choreography on purpose.",
      },
      {
        question: "What is compensation?",
        answer:
          "A compensating transaction undoes or mitigates a prior step when a later step fails — e.g. release reserved stock after payment failure. It is not an automatic DB rollback across services; it is explicit business logic.",
      },
    ],
    quiz: [
      {
        prompt: "Who decides the next step after InventoryReserved?",
        options: ["A central orchestrator service", "The React frontend", "The Payment module reacting to the event"],
        correctIndex: 2,
        explanation: "Choreography: Payment’s consumer is subscribed to inventory.reserved.",
      },
      {
        prompt: "After PaymentCompleted, order status becomes…",
        options: ["PAID", "SHIPPED", "DELIVERED"],
        correctIndex: 0,
        explanation: "SHIPPED waits for ShipmentShippedEvent from the operator ship action.",
      },
      {
        prompt: "ShipmentCreated is consumed by…",
        options: ["Order (to mark SHIPPED)", "Notification (order stays PAID)", "Payment only"],
        correctIndex: 1,
        explanation: "Informational for UI/log. Order does not advance on create.",
      },
      {
        prompt:
          "HARD: Inventory reservation fails. Which saga style is this project using, and what should happen to reserved money / shipment?",
        options: [
          "Orchestration — a SagaConductor rolls everything back via RPC",
          "Choreography — publishers emit failure/cancel events; peers compensate independently",
          "2PC — the broker freezes all schemas until commit",
        ],
        correctIndex: 1,
        explanation:
          "There is no central conductor. Failure events (and compensations like release stock / cancel payment) propagate through the same event mesh.",
      },
    ],
    officialLinks: [
      {
        label: "AWS — Saga pattern",
        href: "https://docs.aws.amazon.com/prescriptive-guidance/latest/modernization-integrating-microservices/saga.html",
      },
      {
        label: "Microservices.io — Saga",
        href: "https://microservices.io/patterns/data/saga.html",
      },
      {
        label: "Microsoft — Choreography pattern",
        href: "https://learn.microsoft.com/en-us/azure/architecture/patterns/choreography",
      },
      {
        label: "Microsoft — Orchestration",
        href: "https://learn.microsoft.com/en-us/azure/architecture/patterns/orchestrator",
      },
    ],
  },
  {
    id: "happy-path",
    number: "05",
    title: "Happy path in this engine",
    chipLabel: "Happy path",
    subtitle: "One order, told as a story from click to delivered",
    readingTime: "7 min",
    analogy:
      "You push the first domino (HTTP POST). The rest fall through outbox → RabbitMQ → consumers. You only push two more dominoes by hand: Ship and Deliver.",
    sections: [
      {
        heading: "Act 1 — Place",
        body: [
          "User hits Submit in the Console. API validates items, creates Order as PLACED, writes OrderPlacedEvent to the order outbox, returns 201. The browser may already subscribe to the order room and is on the firehose for topology events.",
          "Within about a second, the order outbox relay publishes. Inventory reserves stock (or fails). Notification logs OrderPlaced and broadcasts so the topology’s first edges animate.",
        ],
      },
      {
        heading: "Act 2 — Pay & provision shipment",
        body: [
          "InventoryReserved triggers Payment. Success emits PaymentCompleted: Order → PAID, Shipping creates PENDING shipment + ShipmentCreated (notification only). Failure emits PaymentFailed and compensation cancels the order / releases stock.",
          "Teaching cheat code: totals ending in .99 fail payment on purpose so you can watch the unhappy path.",
        ],
      },
      {
        heading: "Act 3 — Operator ship & deliver",
        body: [
          "When status is PAID, Dispatch shipment calls POST /ship with carrier + tracking. Shipment becomes SHIPPED; ShipmentShippedEvent moves Order to SHIPPED. Confirm delivery calls POST /deliver; ShipmentDeliveredEvent moves Order to DELIVERED.",
          "If you ever saw 409 on deliver while the UI said SHIPPED, that was the old bug: order advanced too early on ShipmentCreated. The story above is the corrected choreography.",
        ],
      },
    ],
    snippet: {
      label: "status timeline",
      code: `POST /orders          → PLACED
PaymentCompleted     → PAID   (+ PENDING shipment)
POST .../ship        → SHIPPED
POST .../deliver     → DELIVERED`,
    },
    faqs: [
      {
        question: "Why are hops ~1 second apart?",
        answer:
          "Each module commits locally, then an outbox relay polls (configurable interval). That delay is the reliability tax — and it makes the Console animation readable.",
      },
      {
        question: "Do I need RabbitMQ Management to use the Console?",
        answer:
          "No. The Console visualizes logical topology from WebSocket saga events. Management UI (:15672) is optional for real queue depths and consumer counts.",
      },
      {
        question: "What if workers are not running?",
        answer:
          "Orders save, but events never leave the outbox. Topology stays idle after maybe the first HTTP-side effects. Run start-workers.sh so consumers and relays are alive.",
      },
    ],
    quiz: [
      {
        prompt: "Right after a successful payment, order status is…",
        options: ["PAID", "SHIPPED", "DELIVERED"],
        correctIndex: 0,
        explanation: "Ship is a separate operator action.",
      },
      {
        prompt: "To reach DELIVERED you must…",
        options: ["Wait; it auto-delivers", "Restart Redis", "Call ship, then deliver"],
        correctIndex: 2,
        explanation: "Both operator endpoints are part of the teaching flow.",
      },
      {
        prompt: "A price ending in .99 is used to…",
        options: ["Force free shipping", "Simulate payment failure / compensation", "Skip inventory"],
        correctIndex: 1,
        explanation: "Deterministic failure for learning rollbacks.",
      },
      {
        prompt:
          "HARD: You call `/deliver` while the order is still PAID (shipment created but never shipped). What should the API do?",
        options: [
          "Silently mark DELIVERED anyway",
          "Reject (e.g. 409) because the state machine requires SHIPPED first",
          "Delete the order and recreate it",
        ],
        correctIndex: 1,
        explanation:
          "Status transitions are guarded. Ship first, then deliver — that is how the teaching saga stays honest.",
      },
    ],
    officialLinks: [
      {
        label: "AWS — Event-driven architecture",
        href: "https://aws.amazon.com/event-driven-architecture/",
      },
      {
        label: "MDN — HTTP 201 Created",
        href: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/201",
      },
    ],
  },
  {
    id: "redis",
    number: "06",
    title: "Redis from zero",
    chipLabel: "Redis",
    subtitle: "In-memory data store — and why we need it for live UI",
    readingTime: "9 min",
    analogy:
      "If PostgreSQL is a filing cabinet and RabbitMQ is the postal service, Redis is a whiteboard on the wall: insanely fast to read/write, great for ephemeral coordination, not where you permanently file legal contracts.",
    sections: [
      {
        heading: "What is Redis?",
        body: [
          "Redis (Remote Dictionary Server) is an in-memory data structure store. It can act as a cache, session store, rate limiter, leaderboard, and — critically for us — a pub/sub (publish/subscribe) bus. Data lives primarily in RAM, which is why it is fast; persistence to disk is optional and configurable.",
          "Core types include strings, hashes, lists, sets, sorted sets, streams, and more. Pub/Sub lets one process publish a channel message that many subscribers receive in realtime.",
        ],
      },
      {
        heading: "What problems does Redis usually solve?",
        body: [
          "Speed: cache hot reads to spare PostgreSQL. Coordination: distributed locks, short-lived flags. Fan-out: notify many app instances of the same event without writing a DB row for each listener.",
          "It is not a replacement for your system of record. If Redis restarts and you only stored orders there, you are in trouble. Use it for what must be fast or shared across processes — not for the only copy of money movements.",
        ],
      },
      {
        heading: "Why this project needs Redis (the story)",
        body: [
          "Browsers connect with Socket.io to the HTTP Nest app. Domain events, however, are handled by separate CLI worker processes. Workers do not own the WebSocket connections. If a worker calls “emit to room,” nothing happens — there is no socket server in that process.",
          "Redis becomes the hallway between rooms: the worker publishes an emit command; the HTTP app’s Socket.io Redis adapter receives it and delivers to real browser sockets. The same pattern scales Socket.io across many API replicas in production.",
          "Architecturally this is the ports & adapters idea from the Architecture chapter: notification code depends on a RealtimeBroadcaster port; Redis and Socket.io are adapters. Business rules stay free of “which process owns the sockets.”",
        ],
      },
      {
        heading: "What we do not use Redis for here",
        body: [
          "Orders, payments, shipments, and outbox rows stay in PostgreSQL. Durable business events stay on RabbitMQ. Redis is only the realtime WebSocket backplane — a sharp, intentional scope that makes a great interview talking point.",
        ],
      },
    ],
    snippet: {
      label: "cross-process emit",
      code: `Worker process:
  NotificationBroadcaster
    → RedisRealtimeBroadcaster
      → PUBLISH emit command on Redis

HTTP process:
  Socket.io + Redis adapter
    → deliver to room order:<id> / saga:firehose`,
    },
    faqs: [
      {
        question: "Could we skip Redis?",
        answer:
          "Only by running notification consuming inside the same process as the WebSocket server. That couples API scaling to consumer workload. Redis is the clean separation — and the industry default for multi-node Socket.io.",
      },
      {
        question: "Redis Streams vs Pub/Sub?",
        answer:
          "Pub/Sub is firehose-and-forget (no backlog if nobody listens). Streams are log-like with consumer groups. Socket.io’s adapter uses Redis pub/sub channels under the hood for emit fan-out — perfect for “deliver now to whoever is connected.”",
      },
      {
        question: "Is Redis durable here?",
        answer:
          "We do not rely on Redis durability for correctness. If Redis blips, live pushes may drop; the Console can refresh via REST. Business truth remains in Postgres + RabbitMQ outbox.",
      },
      {
        question: "How does this relate to ports & adapters?",
        answer:
          "Notification depends on a RealtimeBroadcaster port (an interface). Redis emitter and Socket.io delivery are adapters behind that port. Revisit the Architecture chapter for the broader hexagonal idea — Redis here is the concrete example.",
      },
    ],
    quiz: [
      {
        prompt: "Why can’t the notification worker emit with this.server.to(room)?",
        options: ["That worker process has no Socket.io connections", "RabbitMQ forbids it", "Redis blocks NestJS"],
        correctIndex: 0,
        explanation: "Sockets live in the HTTP app. Redis bridges the process boundary.",
      },
      {
        prompt: "In this project Redis stores…",
        options: ["Canonical order rows", "Shipment PDFs", "Socket.io emit fan-out / backplane traffic"],
        correctIndex: 2,
        explanation: "Backplane only — not the system of record.",
      },
      {
        prompt: "Pub/Sub is best when…",
        options: [
          "You need a permanent audit log of every message",
          "You replace PostgreSQL",
          "Connected subscribers need realtime fan-out",
        ],
        correctIndex: 2,
        explanation: "Realtime fan-out to whoever is listening now — Socket.io’s use case.",
      },
      {
        prompt:
          "HARD: You scale to 3 API replicas behind a load balancer. A worker publishes a toast via Redis. Why do all browsers still get it?",
        options: [
          "Browsers poll every API replica in round-robin",
          "Each API’s Socket.io Redis adapter receives the pub/sub message and emits to local sockets",
          "RabbitMQ Management pushes to the browser",
        ],
        correctIndex: 1,
        explanation:
          "Without a Redis (or similar) adapter, only the replica that held the socket would know — and workers have none.",
      },
    ],
    officialLinks: [
      {
        label: "Redis — Introduction (official)",
        href: "https://redis.io/docs/latest/get-started/",
      },
      {
        label: "Redis — Pub/Sub",
        href: "https://redis.io/docs/latest/develop/pubsub/",
      },
      {
        label: "AWS — Caching / Redis overview",
        href: "https://aws.amazon.com/redis/",
      },
      {
        label: "Socket.io — Redis adapter",
        href: "https://socket.io/docs/v4/redis-adapter/",
      },
    ],
  },
  {
    id: "websockets",
    number: "07",
    title: "WebSockets & Socket.io",
    chipLabel: "WebSockets",
    subtitle: "From HTTP request/response to push channels",
    readingTime: "8 min",
    analogy:
      "HTTP is sending a letter and waiting for a reply each time. A WebSocket is a phone call that stays open — the server can ring you when something happens without you asking again.",
    sections: [
      {
        heading: "What is a WebSocket?",
        body: [
          "WebSocket is a browser/server protocol for full-duplex communication over a single TCP connection after an HTTP upgrade handshake. Either side can send frames anytime. That enables chats, multiplayer games, trading tickers — and our saga live feed.",
          "Raw WebSockets are low-level. Socket.io adds reconnection, fallbacks (long-polling), rooms, and namespaces — production ergonomics teams rely on.",
        ],
      },
      {
        heading: "Namespaces and rooms",
        body: [
          "Namespace = virtual endpoint (we use /notifications). Room = labeled group of sockets inside a namespace (order:abc-123 or saga:firehose). Servers join sockets to rooms; clients ask via events like subscribeToOrder.",
          "Rooms let you target broadcasts: one order’s toast vs every console’s topology stream.",
        ],
      },
      {
        heading: "Two channels in this project (critical)",
        body: [
          "Targeted: room order:<orderId>, event name notification — for toasts after you subscribe to an order. Firehose: room saga:firehose (auto-joined on connect), event name saga-event — feeds the topology and Event Flow Log.",
          "Why both? If the Console only used per-order rooms, it would race the saga: early events can fire before subscribe completes. The firehose is joined the moment the socket connects, so beginners actually see the full animation.",
        ],
      },
      {
        heading: "How it ties to RabbitMQ (story)",
        body: [
          "RabbitMQ moves durable business facts between modules. After Notification persists a row, it broadcasts over Socket.io (via Redis). The UI treats saga-event as a cache invalidation signal: refresh that order, products, notification list — event-driven UI, not blind polling (though a short poll safety net may still exist).",
        ],
      },
    ],
    snippet: {
      label: "browser contract",
      code: `connect → /notifications
auto-join → saga:firehose
listen    → "saga-event"   // topology + refetch
emit      → subscribeToOrder({ orderId })
listen    → "notification" // toasts`,
    },
    faqs: [
      {
        question: "WebSocket vs Server-Sent Events (SSE)?",
        answer:
          "SSE is server→browser only over HTTP; simpler for one-way streams. WebSockets are bidirectional and better when the client also emits (subscribeToOrder). Socket.io can fall back to HTTP techniques when WS is blocked.",
      },
      {
        question: "Why Socket.io instead of bare WS?",
        answer:
          "Automatic reconnect, rooms/namespaces, and broader environment support. For a teaching console that must “just work,” those features matter more than protocol purity.",
      },
      {
        question: "Does the topology read RabbitMQ directly?",
        answer:
          "No. The browser never speaks AMQP. It sees a curated push stream after Notification consumes RabbitMQ messages. That layering is intentional and secure.",
      },
    ],
    quiz: [
      {
        prompt: "What drives topology edge animations?",
        options: ["HTTP polling only", "Direct AMQP from the browser", "saga-event on the firehose room"],
        correctIndex: 2,
        explanation: "Firehose saga-event is the observability channel.",
      },
      {
        prompt: "subscribeToOrder is mainly for…",
        options: ["Joining a per-order room for targeted toasts", "Creating the shipment", "Starting Redis"],
        correctIndex: 0,
        explanation: "Targeted notification channel — not the firehose.",
      },
      {
        prompt: "Socket.io rooms are…",
        options: ["PostgreSQL schemas", "Docker networks", "Server-side groups of sockets for targeted emit"],
        correctIndex: 2,
        explanation: "Virtual channels inside a namespace.",
      },
      {
        prompt: "HARD: Topology looks idle but the event ledger has rows. What is the most likely explanation?",
        options: [
          "Ledger is lying; ignore it",
          "You are looking at historical REST/ledger data while the firehose animation channel was missed or disconnected",
          "RabbitMQ deleted all exchanges",
        ],
        correctIndex: 1,
        explanation:
          "Ledger can show persisted history; live topology needs an active saga-event / firehose subscription.",
      },
    ],
    officialLinks: [
      {
        label: "MDN — WebSockets",
        href: "https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API",
      },
      {
        label: "Socket.io — Rooms",
        href: "https://socket.io/docs/v4/rooms/",
      },
      {
        label: "Socket.io — Namespaces",
        href: "https://socket.io/docs/v4/namespaces/",
      },
    ],
  },
  {
    id: "frontend-console",
    number: "08",
    title: "The Engineering Console",
    chipLabel: "Console",
    subtitle: "How the UI listens, teaches, and stays honest",
    readingTime: "5 min",
    analogy:
      "Mission control: Redux is the radar picture, WebSockets are the radio, REST is the filing cabinet you reopen when the radio says something changed.",
    sections: [
      {
        heading: "What you see",
        body: [
          "Order Playground — place orders, ship, deliver, watch status. Observability deck — Live Topology (animated exchanges/queues) and Event Ledger (historical notifications). Stats and health pills show DB / RabbitMQ / WebSocket status.",
        ],
      },
      {
        heading: "Event-driven cache invalidation",
        body: [
          "On saga-event, the app appends to the live log (powering topology) and refetches order, catalog, and notifications. Toasts come from the notification channel. That pattern — REST for truth, push for “when to refresh” — is how many fintech dashboards stay snappy.",
        ],
      },
      {
        heading: "What to watch for as a learner",
        body: [
          "WS connected in the header. Full event chain in the Event Flow Log. Edges lighting across inventory → payment → shipping — not only order-exchange. After PAID, operator buttons unlock for ship/deliver.",
        ],
      },
    ],
    faqs: [
      {
        question: "Why might a short poll still run?",
        answer:
          "As a safety net while validating push coverage. The learning goal remains: prefer push invalidation; reconcile on reconnect.",
      },
      {
        question: "Topology looks idle but ledger has rows?",
        answer:
          "Ledger can show historical DB notifications; topology animates live saga-event. Place a new order while the tab is open to see motion.",
      },
    ],
    quiz: [
      {
        prompt: "Primary signal for topology animations is…",
        options: ["saga-event", "localStorage", "CSS only"],
        correctIndex: 0,
        explanation: "Live firehose events drive the scrubber/queue.",
      },
      {
        prompt: "REST is still used to…",
        options: [
          "Replace RabbitMQ",
          "Store outbox rows in the browser",
          "Load and refresh authoritative entity state",
        ],
        correctIndex: 2,
        explanation: "Push says when; GET says what.",
      },
      {
        prompt:
          "HARD: After a saga-event, why refetch orders via REST instead of trusting the WebSocket payload as the sole source of truth?",
        options: [
          "WebSocket payloads are always incomplete teaching toys; REST remains the canonical read model",
          "REST is slower so it looks more realistic",
          "RabbitMQ cannot be visualized otherwise",
        ],
        correctIndex: 0,
        explanation: "Push is a wake-up call. Authoritative entity state still comes from HTTP APIs / DB-backed reads.",
      },
    ],
    officialLinks: [
      {
        label: "Redux — Essential concepts",
        href: "https://redux.js.org/tutorials/essentials/part-1-overview-concepts",
      },
    ],
  },
  {
    id: "hands-on",
    number: "09",
    title: "Hands-on lab",
    chipLabel: "Hands-on",
    subtitle: "Prove every chapter with one live order",
    readingTime: "5 min",
    analogy: "Closing the textbook and taxiing onto the runway. The Console is your cockpit.",
    sections: [
      {
        heading: "Before you click",
        body: [
          "API up (:8080), frontend (:3000), Docker services including Redis and RabbitMQ, and workers via start-workers.sh (consumers + outbox relays). Header should show healthy DB/RabbitMQ and WS connected on the Console.",
        ],
      },
      {
        heading: "Lab steps",
        body: [
          "1) Open Console → place an order (avoid .99 unless you want failure). 2) Watch Live Topology + Event Flow Log for OrderPlaced → InventoryReserved → PaymentCompleted → ShipmentCreated. 3) When PAID, Dispatch shipment. 4) Confirm delivery. 5) Optional: place a .99 order and observe cancellation/compensation.",
        ],
      },
      {
        heading: "If something looks wrong",
        body: [
          "Hard refresh the tab. Confirm workers were restarted after code changes. Check Management UI for consumers on each queue. Remember: old orders stuck mid-bug may need a fresh order after saga fixes.",
        ],
      },
    ],
    faqs: [
      {
        question: "I only see OrderPlaced — now what?",
        answer:
          "Usually workers/outbox relays not running, or stale frontend socket. Restart workers, confirm Redis, hard-refresh, place a new order.",
      },
      {
        question: "Deliver returns 409?",
        answer:
          "Shipment must be SHIPPED first. Click Ship, wait for status, then Deliver. Fresh orders after the ShipmentShipped fix behave correctly.",
      },
    ],
    quiz: [
      {
        prompt: "Minimum path to DELIVERED is…",
        options: ["Place only", "Place → Deliver", "Place → (auto pay) → Ship → Deliver"],
        correctIndex: 2,
        explanation: "Ship then Deliver after payment provisioning.",
      },
      {
        prompt: "To demo compensation quickly…",
        options: ["Use a .99 total", "Turn off PostgreSQL", "Delete Redis forever"],
        correctIndex: 0,
        explanation: "Deterministic payment failure rule.",
      },
      {
        prompt: "Firehose exists so that…",
        options: [
          "Postgres replicates faster",
          "RabbitMQ needs fewer queues",
          "Observability does not race per-order subscribe",
        ],
        correctIndex: 2,
        explanation: "Auto-join on connect → full saga visibility.",
      },
      {
        prompt:
          "HARD: You place an order and only see OrderPlaced. Workers were started yesterday before a code pull. What is the best first remediation?",
        options: [
          "Rewrite the saga in the browser",
          "Restart workers / relays with the new build, hard-refresh, place a fresh order",
          "Increase Redis memory to 64GB",
        ],
        correctIndex: 1,
        explanation: "Stale consumers and missed outbox relays are the #1 “stuck after OrderPlaced” cause in this lab.",
      },
    ],
    officialLinks: [
      {
        label: "RabbitMQ Management plugin",
        href: "https://www.rabbitmq.com/docs/management",
      },
    ],
  },
];

/** Ordered short labels for hero chips and any other compact path UI. */
export const LEARNING_PATH = CHAPTERS.map((ch) => ch.chipLabel);

export type LearningPathStep = (typeof LEARNING_PATH)[number];
