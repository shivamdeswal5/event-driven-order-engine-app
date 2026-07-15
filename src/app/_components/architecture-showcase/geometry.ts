import type { SocketSide } from "./types";

export function getSocketCoords(
  nodeId: string,
  side: SocketSide,
  container: HTMLElement | null,
) {
  const el = document.getElementById(`node-${nodeId}`);
  if (!el || !container) return { x: 0, y: 0 };
  const rect = el.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  const xLeft = rect.left - containerRect.left;
  const xRight = rect.right - containerRect.left;
  const xCenter = rect.left - containerRect.left + rect.width / 2;

  const yTop = rect.top - containerRect.top;
  const yBottom = rect.bottom - containerRect.top;
  const yCenter = rect.top - containerRect.top + rect.height / 2;

  if (side === "left") return { x: xLeft, y: yCenter };
  if (side === "right") return { x: xRight, y: yCenter };
  if (side === "top") return { x: xCenter, y: yTop };
  return { x: xCenter, y: yBottom };
}

export function getPathData(
  fromId: string,
  toId: string,
  container: HTMLElement | null,
) {
  const elFrom = document.getElementById(`node-${fromId}`);
  const elTo = document.getElementById(`node-${toId}`);
  if (!elFrom || !elTo || !container) return "";

  const fromRect = elFrom.getBoundingClientRect();
  const toRect = elTo.getBoundingClientRect();

  // Check if horizontal flow or vertical flow
  const isHorizontal = toRect.left > fromRect.right + 20;

  const start = getSocketCoords(fromId, isHorizontal ? "right" : "bottom", container);
  const end = getSocketCoords(toId, isHorizontal ? "left" : "top", container);

  if (isHorizontal) {
    const dx = Math.abs(end.x - start.x) * 0.45;
    return `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`;
  }

  const dy = Math.abs(end.y - start.y) * 0.45;
  return `M ${start.x} ${start.y} C ${start.x} ${start.y + dy}, ${end.x} ${end.y - dy}, ${end.x} ${end.y}`;
}
