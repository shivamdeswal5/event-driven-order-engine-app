import { AnimatePresence, motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { NODES } from "../../constants";

type NodeDetailPanelProps = {
  selectedLayer: number;
};

export function NodeDetailPanel({ selectedLayer }: NodeDetailPanelProps) {
  return (
    <div className="lg:col-span-4">
      <AnimatePresence mode="wait">
        {NODES.map((layer, index) => {
          if (index !== selectedLayer) return null;

          return (
            <motion.div
              key={layer.id}
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col h-full bg-card/35 border border-border/50 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-lg relative overflow-hidden"
            >
              {/* Glowing corner backdrop */}
              <div
                className="absolute -right-20 -top-20 w-44 h-44 rounded-full filter blur-[60px] opacity-10 pointer-events-none"
                style={{ backgroundColor: layer.glowColor }}
              />

              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 rounded-2xl border bg-background border-border/80">
                  {layer.icon}
                </div>
                <div>
                  <span className="text-[10px] font-bold font-mono tracking-widest text-muted-foreground uppercase">
                    Context Inspection
                  </span>
                  <h3 className="font-extrabold text-lg text-foreground mt-0.5">{layer.title}</h3>
                </div>
              </div>

              <p className="text-foreground font-semibold text-xs leading-relaxed mb-4">
                {layer.shortDesc}
              </p>

              <p className="text-muted-foreground text-[12px] leading-relaxed mb-6">
                {layer.longDesc}
              </p>

              {/* Tech Badges */}
              <div className="mb-6 pt-4 border-t border-border/40">
                <h4 className="text-[10px] font-bold font-mono tracking-wider text-muted-foreground uppercase mb-3 flex items-center gap-1.5">
                  <HelpCircle size={12} className="text-primary" />
                  Tech Stack Isolation
                </h4>
                <div className="flex flex-wrap gap-2">
                  {layer.techs.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="bg-background/80 hover:bg-background border border-border/60 text-xs font-mono text-muted-foreground px-2.5 py-0.5 rounded-lg"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Subsystem components */}
              <div className="pt-4 border-t border-border/40 mt-auto">
                <h4 className="text-[10px] font-bold font-mono tracking-wider text-muted-foreground uppercase mb-3">
                  Subsystems Active
                </h4>
                <div className="grid grid-cols-1 gap-2.5">
                  {layer.components.map((comp) => (
                    <div
                      key={comp.name}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border/40 bg-background/50 hover:bg-background/80 transition-colors"
                    >
                      <div className="p-1 rounded-lg bg-background border border-border/65">
                        {comp.icon}
                      </div>
                      <span className="text-xs font-bold text-foreground">{comp.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
