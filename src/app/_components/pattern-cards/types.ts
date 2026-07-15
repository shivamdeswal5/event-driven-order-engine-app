import type React from "react";

export interface PatternCard {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  description: string;
  snippet: string;
}

export interface DraggablePatternCardProps {
  p: PatternCard;
  index: number;
  initialX: number;
  initialY: number;
  initialRotate: number;
  zIndex: number;
  onSelect: () => void;
  resetTrigger: number;
  dragConstraintsRef: React.RefObject<HTMLDivElement | null>;
}

export interface FanOffset {
  x: number;
  y: number;
  rotate: number;
}
