"use client";

import React from "react";
import { ExternalLink, Lightbulb, Clock } from "lucide-react";
import type { Chapter } from "../../_content/chapters";
import { FaqAccordion } from "../faq-accordion";
import { CodeSnippet } from "../code-snippet";
import { QuizCheck } from "../quiz-check";
import { ChapterVisual } from "../chapter-visual";

type Props = {
  chapter: Chapter;
};

export function ChapterSection({ chapter }: Props) {
  return (
    <section
      id={chapter.id}
      className="scroll-mt-28 py-16 sm:py-20 border-b border-border/40"
    >
      <div className="max-w-4xl space-y-8">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-mono font-extrabold uppercase tracking-[0.2em] text-primary">
              Chapter {chapter.number}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded-full border border-border/60 bg-muted/30">
              <Clock className="h-3 w-3" />
              {chapter.readingTime}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {chapter.title}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            {chapter.subtitle}
          </p>
        </header>

        <ChapterVisual chapterId={chapter.id} />

        <div className="relative flex gap-3 rounded-xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-4 overflow-hidden">
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
          <Lightbulb className="h-5 w-5 text-amber-500 shrink-0 mt-0.5 relative z-10" />
          <div className="relative z-10">
            <p className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
              Analogy
            </p>
            <p className="text-sm sm:text-[15px] text-foreground/90 leading-relaxed">
              {chapter.analogy}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {chapter.sections.map((block) => (
            <article key={block.heading} className="space-y-3">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {block.heading}
              </h3>
              <div className="space-y-3.5 pl-3.5 border-l border-border/50">
                {block.body.map((p) => (
                  <p
                    key={p.slice(0, 48)}
                    className="text-[15px] sm:text-base text-muted-foreground leading-relaxed"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>

        {chapter.snippet && (
          <CodeSnippet
            label={chapter.snippet.label}
            code={chapter.snippet.code}
          />
        )}

        {chapter.officialLinks.length > 0 && (
          <div className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-3">
            <p className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-muted-foreground">
              Official docs &amp; further reading
            </p>
            <ul className="flex flex-wrap gap-2">
              {chapter.officialLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 bg-background/60 text-xs font-medium text-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors"
                  >
                    {link.label}
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <FaqAccordion items={chapter.faqs} />

        {chapter.quiz.length > 0 && <QuizCheck items={chapter.quiz} />}
      </div>
    </section>
  );
}
