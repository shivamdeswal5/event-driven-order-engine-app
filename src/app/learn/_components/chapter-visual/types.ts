import type { Edge, Node } from "@xyflow/react";
import type { LearnToneKey } from "./tones.styles";

export type LearnNodeData = {
  label: string;
  sublabel?: string;
  tone?: LearnToneKey;
  icon?: string;
};

export type Graph = {
  nodes: Node<LearnNodeData>[];
  edges: Edge[];
};

export type ChapterVisualProps = {
  chapterId: string;
  className?: string;
};
