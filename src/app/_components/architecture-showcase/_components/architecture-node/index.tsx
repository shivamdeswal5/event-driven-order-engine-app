import type { ArchitectureNodeVariant, NodeData } from "../../types";

type ArchitectureNodeProps = {
  node: NodeData;
  isActive: boolean;
  isSelected: boolean;
  variant?: ArchitectureNodeVariant;
  onSelect: () => void;
};

const VARIANT_STYLES: Record<
  ArchitectureNodeVariant,
  {
    shell: string;
    activeShell: string;
    contentGap: string;
    iconWrap: string;
    title: string;
    subtitle: string;
  }
> = {
  ingress: {
    shell: "flex flex-col p-4 rounded-2xl border cursor-pointer backdrop-blur-md transition-all duration-300 relative",
    activeShell: "border-primary shadow-[0_0_20px_rgba(99,102,241,0.2)] bg-card/80",
    contentGap: "flex items-center gap-3",
    iconWrap: "p-2 rounded-xl bg-background border border-border/80",
    title: "font-extrabold text-[13px] text-foreground tracking-tight leading-tight",
    subtitle: "text-[10px] text-muted-foreground uppercase font-mono tracking-wide leading-none",
  },
  core: {
    shell:
      "flex flex-col p-4 rounded-2xl border cursor-pointer backdrop-blur-md transition-all duration-300 md:my-10 relative",
    activeShell: "border-primary shadow-[0_0_25px_rgba(99,102,241,0.25)] bg-card/85",
    contentGap: "flex items-center gap-3",
    iconWrap: "p-2 rounded-xl bg-background border border-border/80",
    title: "font-extrabold text-[13px] text-foreground tracking-tight leading-tight",
    subtitle: "text-[10px] text-muted-foreground uppercase font-mono tracking-wide leading-none",
  },
  worker: {
    shell:
      "flex flex-col p-3.5 rounded-2xl border cursor-pointer backdrop-blur-md transition-all duration-300 relative",
    activeShell: "border-primary shadow-[0_0_20px_rgba(99,102,241,0.2)] bg-card/80",
    contentGap: "flex items-center gap-2.5",
    iconWrap: "p-1.5 rounded-lg bg-background border border-border/80",
    title: "font-extrabold text-[12px] text-foreground tracking-tight leading-tight",
    subtitle: "text-[9px] text-muted-foreground uppercase font-mono tracking-wide leading-none",
  },
};

export function ArchitectureNode({
  node,
  isActive,
  isSelected,
  variant = "ingress",
  onSelect,
}: ArchitectureNodeProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div
      id={`node-${node.id}`}
      onClick={onSelect}
      className={`${styles.shell} ${
        isActive
          ? styles.activeShell
          : isSelected
            ? "border-primary/70 bg-card/65"
            : "border-border/60 bg-card/45 hover:border-border/90 hover:bg-card/60"
      }`}
    >
      {isActive && (
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
        </span>
      )}

      <div className={styles.contentGap}>
        <div className={styles.iconWrap}>{node.icon}</div>
        <div>
          <h4 className={styles.title}>{node.title}</h4>
          <span className={styles.subtitle}>{node.subtitle}</span>
        </div>
      </div>
    </div>
  );
}
