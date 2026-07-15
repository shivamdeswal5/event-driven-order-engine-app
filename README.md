# Frontend — Apex Console

Next.js app for the Order Engine: marketing home, interactive **Learn** curriculum, and the **Engineering Console** (live topology, event ledger, place/ship/deliver).

Talks to the NestJS backend over REST + Socket.io. Realtime saga animations depend on Redis-backed broadcasts from backend workers.

---

## What’s included

| Route | Purpose |
|-------|---------|
| `/` | Product / architecture landing |
| `/learn` | Guided curriculum (architecture, RabbitMQ, outbox, saga, Redis, WebSockets, …) |
| `/console` | Live playground + observability deck |

### Console highlights

- **Order playground** — place orders, ship, deliver  
- **Live topology** — React Flow graph driven by `saga-event` firehose  
- **Event ledger** — notification history  
- **Health** — API / RabbitMQ / WebSocket status  

### Learn highlights

- Medium-style chapters with visual maps, FAQs, quizzes  
- Official docs links (AWS, RabbitMQ, Redis, Microsoft Learn, …)  

---

## Tech stack

- **Next.js** (App Router) · **React** · **TypeScript**  
- **Redux Toolkit** (+ persist where used)  
- **Socket.io client** — rooms / firehose  
- **Axios** — REST (`NEXT_PUBLIC_BACKEND_URL`)  
- **@xyflow/react** — topology + Learn diagrams  
- **Framer Motion** · **Tailwind** · **shadcn-style UI**  

---

## Quick start

### Prerequisites

- Node.js 20+  
- Backend running on `:8080` with Docker services (Postgres, RabbitMQ, **Redis**) and workers (`../start-workers.sh`)  

### Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:3000

### Environment

From [`.env.example`](./.env.example):

```bash
PORT=3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=http://localhost:8080
```

---

## Demo checklist

1. Backend healthy · `./start-workers.sh` from repo root  
2. Open `/console` — WebSocket connected  
3. Place an order (skip `.99` totals unless testing failure)  
4. Confirm topology + ledger advance to **PAID** / shipment created  
5. **Ship** → **Deliver**  
6. Optional: browse `/learn` for pattern explanations  

---

## Scripts

```bash
npm run dev      # local development
npm run build    # production build
npm run start    # serve build
npm run lint     # ESLint
```
