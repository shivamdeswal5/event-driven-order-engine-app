"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BookOpen, GraduationCap, Sparkles, Terminal } from "lucide-react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CHAPTERS, LEARNING_PATH } from "./_content/chapters";
import { ChapterSection } from "./_components/chapter-section";
import { LearnHeroBeam } from "./_components/learn-hero-beam";
import { ChapterToc, useActiveChapterId } from "./_components/chapter-toc";

export default function LearnPage() {
  const reduceMotion = useReducedMotion();
  const chapterIds = CHAPTERS.map((c) => c.id);
  const activeId = useActiveChapterId(chapterIds);

  return (
    <div className="flex flex-col min-h-screen bg-background relative">
      <Header />

      <main className="flex-1 pt-24 pb-24">
        <section className="relative border-b border-border/40 pb-16 mb-4 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] pointer-events-none">
            <div className="w-full h-full bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
          </div>
          <div className="absolute top-0 right-0 w-[50%] h-full bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.12),transparent_55%)] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[40%] h-[60%] bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.08),transparent_50%)] pointer-events-none" />

          <div className="max-w-[96rem] mx-auto px-6 sm:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-xl"
              >
                <Badge
                  variant="outline"
                  className="mb-4 text-xs tracking-wider uppercase font-semibold border-primary/20 bg-primary/5 text-primary gap-1.5"
                >
                  <GraduationCap className="h-3.5 w-3.5" />
                  Guided curriculum
                </Badge>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">Learn the Order Engine</h1>
                <p className="text-muted-foreground text-base sm:text-lg leading-relaxed mb-4">
                  Each chapter starts from first principles — what the technology is, what problem it solves, why this
                  project needs it — then shows how we use it here, with a visual map you can study as you read.
                </p>

                <div className="flex flex-wrap items-center gap-1.5 mb-5">
                  {LEARNING_PATH.map((step, i) => (
                    <React.Fragment key={step}>
                      <span className="px-2.5 py-1 rounded-full border border-border/60 bg-muted/30 text-[10px] font-mono font-semibold text-foreground/80">
                        {step}
                      </span>
                      {i < LEARNING_PATH.length - 1 && <span className="text-muted-foreground/50 text-xs">→</span>}
                    </React.Fragment>
                  ))}
                </div>

                <p className="text-muted-foreground/80 text-sm leading-relaxed mb-6 flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  Interactive quizzes, chapter visual maps, and links to AWS & official docs — built for interviews, not
                  repo spelunking.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href={`#${CHAPTERS[0].id}`}>
                    <Button className="font-semibold gap-2 shadow-md shadow-primary/20">
                      <BookOpen className="h-4 w-4" />
                      Start chapter 00
                    </Button>
                  </a>
                  <Link href="/console">
                    <Button variant="outline" className="font-semibold gap-2">
                      Skip to Console
                      <Terminal className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="hidden sm:block"
              >
                <LearnHeroBeam />
              </motion.div>
            </div>

            <div className="lg:hidden mt-10 -mx-6 px-6 overflow-x-auto">
              <div className="flex gap-2 pb-2 min-w-max">
                {CHAPTERS.map((ch) => (
                  <a
                    key={ch.id}
                    href={`#${ch.id}`}
                    className={`px-3 py-1.5 rounded-full border text-[11px] font-mono font-bold whitespace-nowrap transition-colors ${
                      activeId === ch.id
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border/60 text-muted-foreground"
                    }`}
                  >
                    {ch.number} {ch.title}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-[96rem] mx-auto px-6 sm:px-8 flex gap-8 xl:gap-10 items-start">
          <ChapterToc activeId={activeId} />

          <div className="flex-1 min-w-0 self-start">
            {CHAPTERS.map((chapter) => (
              <ChapterSection key={chapter.id} chapter={chapter} />
            ))}

            <section className="py-20 text-center space-y-6 relative max-w-4xl">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.06),transparent_60%)] pointer-events-none" />
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight relative">Ready to see it live?</h2>
              <p className="text-muted-foreground max-w-xl text-sm sm:text-base leading-relaxed relative">
                Open the Engineering Console, place an order, and watch the same flows you just studied animate in real
                time.
              </p>
              <div className="flex flex-wrap justify-center gap-3 relative">
                <Link href="/console">
                  <Button size="lg" className="font-semibold gap-2 shadow-md shadow-primary/20">
                    Launch Console
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" size="lg" className="font-semibold">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
