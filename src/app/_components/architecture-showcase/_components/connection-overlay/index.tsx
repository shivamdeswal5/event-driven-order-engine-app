import type { RefObject } from "react";
import { motion } from "framer-motion";
import { CONNECTIONS } from "../../constants";
import { getPathData } from "../../geometry";

type ConnectionOverlayProps = {
  containerRef: RefObject<HTMLDivElement | null>;
  resizeKey: number;
  isSimulating: boolean;
  activeNode: string | null;
};

export function ConnectionOverlay({
  containerRef,
  resizeKey,
  isSimulating,
  activeNode,
}: ConnectionOverlayProps) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none" ref={containerRef}>
      <svg className="w-full h-full" key={resizeKey}>
        <defs>
          {/* Glowing glow filters for signal pings */}
          <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {CONNECTIONS.map((c) => {
          const d = getPathData(c.from, c.to, containerRef.current);
          if (!d) return null;

          return (
            <g key={c.id}>
              {/* Background dark pathway wire */}
              <path
                d={d}
                fill="none"
                className="stroke-border/45 dark:stroke-border/25"
                strokeWidth={2.5}
              />

              {/* Active highlighted connection line (only when nodes are active in loop) */}
              {isSimulating && (activeNode === c.from || activeNode === c.to) && (
                <motion.path
                  d={d}
                  fill="none"
                  stroke={c.color}
                  strokeWidth={2.5}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                  className="opacity-75"
                />
              )}

              {/* Animated signal dots traveling down the path */}
              {isSimulating && (
                <circle r="4.5" fill={c.color} filter="url(#glow-cyan)">
                  <animateMotion dur={c.dur} repeatCount="1" fill="freeze" begin={c.delay}>
                    <mpath href={`#path-${c.id}`} />
                  </animateMotion>
                </circle>
              )}

              {/* Hidden path with ID specifically for animateMotion linking */}
              <path id={`path-${c.id}`} d={d} fill="none" stroke="transparent" strokeWidth={1} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
