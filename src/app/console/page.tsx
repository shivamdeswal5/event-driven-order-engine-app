import React from "react";
import { ConsoleHeader } from "./_components/console-header";
import { ConsoleSidebar } from "./_components/console-sidebar";
import { TopologyVisualizer } from "./_components/topology-visualizer";
import { OrderPlayground } from "./_components/order-playground";
import { OutboxConveyor } from "./_components/outbox-conveyor";
import { TelemetryLedger } from "./_components/telemetry-ledger";

export default function ConsolePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ConsoleHeader />
      <div className="flex-1 flex flex-col lg:flex-row">
        <ConsoleSidebar />
        <main className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-12 gap-6 overflow-y-auto">
          {/* Visualizer & Playground Deck */}
          <div className="xl:col-span-8 flex flex-col gap-6">
            <TopologyVisualizer />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <OrderPlayground />
              <OutboxConveyor />
            </div>
          </div>

          {/* Real-time Telemetry Ledger Panel */}
          <div className="xl:col-span-4 h-[750px] xl:h-auto">
            <TelemetryLedger />
          </div>
        </main>
      </div>
    </div>
  );
}
