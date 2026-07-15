"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";
import { CHAPTERS } from "../../_content/chapters";

type Props = {
  activeId: string;
};

export function ChapterToc({ activeId }: Props) {
  const activeIndex = useMemo(
    () => Math.max(0, CHAPTERS.findIndex((c) => c.id === activeId)),
    [activeId],
  );
  const progress = Math.round(((activeIndex + 1) / CHAPTERS.length) * 100);

  return (
    <aside
      className="hidden lg:block w-60 xl:w-64 shrink-0 self-start sticky top-24 z-20 max-h-[calc(100vh-6.5rem)] overflow-y-auto overscroll-contain"
      aria-label="Curriculum chapters"
    >
      <nav className="rounded-xl border border-border/50 bg-background/95 backdrop-blur-md p-3 shadow-sm">
        <div className="px-2 mb-3 space-y-2">
          <p className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-muted-foreground">
            Curriculum
          </p>
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[9px] font-mono text-muted-foreground">
            Chapter {CHAPTERS[activeIndex]?.number ?? "00"} · {progress}%
          </p>
        </div>

        <ol className="space-y-0.5 border-l border-border/60 ml-1">
          {CHAPTERS.map((ch, i) => {
            const active = activeId === ch.id;
            const passed = i < activeIndex;
            return (
              <li key={ch.id}>
                <a
                  href={`#${ch.id}`}
                  className={`group flex flex-col gap-0.5 pl-3 py-2.5 -ml-px border-l-2 text-left transition-all ${
                    active
                      ? "border-primary text-primary bg-primary/5 rounded-r-md"
                      : passed
                        ? "border-emerald-500/40 text-foreground/80 hover:border-emerald-500/60"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  <span className="flex items-start gap-2">
                    <span className="mt-0.5 w-4 shrink-0 flex justify-center">
                      {passed ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <span className="font-mono text-[10px] tabular-nums opacity-70">
                          {ch.number}
                        </span>
                      )}
                    </span>
                    <span
                      className={`text-xs leading-snug ${
                        active ? "font-bold" : "font-medium"
                      }`}
                    >
                      {ch.title}
                    </span>
                  </span>
                  <span
                    className={`pl-6 text-[9px] font-mono transition-opacity ${
                      active
                        ? "opacity-70 text-primary/80"
                        : "opacity-0 group-hover:opacity-60"
                    }`}
                  >
                    {ch.readingTime}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </aside>
  );
}

export function useActiveChapterId(ids: string[]): string {
  const [activeId, setActiveId] = useState(ids[0] ?? "");

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el);

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-15% 0px -50% 0px", threshold: [0.05, 0.15, 0.35] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids]);

  useEffect(() => {
    if (!activeId || typeof window === "undefined") return;
    const next = `#${activeId}`;
    if (window.location.hash !== next) {
      window.history.replaceState(null, "", next);
    }
  }, [activeId]);

  return activeId;
}
