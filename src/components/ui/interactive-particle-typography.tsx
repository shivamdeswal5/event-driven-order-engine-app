"use client";

import React, { useEffect, useRef, useCallback } from "react";

interface InteractiveParticleTypographyProps {
  text?: string;
  fontSize?: number;
  particleSize?: number;
  className?: string;
}

const DEFAULT_FONT_FAMILY = "var(--font-sans), system-ui, sans-serif";

const initialPhysicsParams = {
  PARTICLE_COUNT_TARGET: 2200,
  PARTICLE_BASE_SIZE: 1.5,
  ATTRACTION_FORCE_BASE: 0.12,
  NOISE_STRENGTH_BASE: 0.35,
  FRICTION: 0.94,
  MOUSE_INTERACTION_RADIUS: 110,
  MOUSE_DISPERSE_STRENGTH: 1.8,
  TRAIL_ALPHA: 0.22,
};

const POINT_SAMPLING_DENSITY = 4;
const TARGET_CANVAS_FILL_PERCENTAGE = 0.85;
const MAX_INITIAL_FONT_SIZE = 280;
const MIN_FONT_SIZE = 14;
const FIT_CHECK_PADDING = 20;
const SETTLE_DISTANCE_THRESHOLD = 5;
const SETTLE_ATTRACTION_MULTIPLIER = 0.2;
const SETTLE_NOISE_MULTIPLIER = 0.6;

const particleColors = [
  "#3b82f6", // Indigo/blue
  "#06b6d4", // Cyan
  "#8b5cf6", // Violet
  "#6366f1", // Deep blue
  "#14b8a6", // Teal
  "#a78bfa", // Soft lavender
];

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  physicsParams: typeof initialPhysicsParams;
  baseSize: number;
  size: number;
  color: string;
  attractionOffset: number;
  noiseOffset: number;

  constructor(
    targetX: number,
    targetY: number,
    canvasWidth: number,
    canvasHeight: number,
    physicsParams: typeof initialPhysicsParams
  ) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.vx = (Math.random() - 0.5) * 5;
    this.vy = (Math.random() - 0.5) * 5;
    this.targetX = targetX;
    this.targetY = targetY;
    this.physicsParams = physicsParams;
    this.baseSize = this.physicsParams.PARTICLE_BASE_SIZE;
    this.size = this.baseSize + Math.random() * (this.baseSize * 0.5);
    this.color = particleColors[Math.floor(Math.random() * particleColors.length)];
    this.attractionOffset = (Math.random() - 0.5) * 0.04;
    this.noiseOffset = (Math.random() - 0.5) * 0.2;
  }

  update(mouse: { x?: number; y?: number }) {
    if (this.baseSize !== this.physicsParams.PARTICLE_BASE_SIZE) {
      this.baseSize = this.physicsParams.PARTICLE_BASE_SIZE;
    }
    this.size = this.baseSize + Math.random() * (this.baseSize * 0.4);

    const dxTarget = this.targetX - this.x;
    const dyTarget = this.targetY - this.y;
    const distTarget = Math.sqrt(dxTarget * dxTarget + dyTarget * dyTarget);

    let currentAttraction = Math.max(
      0.001,
      this.physicsParams.ATTRACTION_FORCE_BASE + this.attractionOffset
    );
    let currentNoise = Math.max(
      0,
      this.physicsParams.NOISE_STRENGTH_BASE + this.noiseOffset
    );

    if (distTarget < SETTLE_DISTANCE_THRESHOLD) {
      currentAttraction *= SETTLE_ATTRACTION_MULTIPLIER;
      currentNoise *= SETTLE_NOISE_MULTIPLIER;
    } else if (distTarget < SETTLE_DISTANCE_THRESHOLD * 4) {
      const factor = Math.max(
        0,
        (distTarget - SETTLE_DISTANCE_THRESHOLD) / (SETTLE_DISTANCE_THRESHOLD * 3)
      );
      currentAttraction =
        currentAttraction *
        (SETTLE_ATTRACTION_MULTIPLIER + (1 - SETTLE_ATTRACTION_MULTIPLIER) * factor);
      currentNoise =
        currentNoise *
        (SETTLE_NOISE_MULTIPLIER + (1 - SETTLE_NOISE_MULTIPLIER) * factor);
    }

    let forceX = 0;
    let forceY = 0;

    if (mouse.x !== undefined && mouse.y !== undefined) {
      const dxMouse = this.x - mouse.x;
      const dyMouse = this.y - mouse.y;
      const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

      if (
        distMouse < this.physicsParams.MOUSE_INTERACTION_RADIUS &&
        distMouse > 0
      ) {
        const angleMouse = Math.atan2(dyMouse, dxMouse);
        const disperseForce =
          ((this.physicsParams.MOUSE_INTERACTION_RADIUS - distMouse) /
            this.physicsParams.MOUSE_INTERACTION_RADIUS) *
          this.physicsParams.MOUSE_DISPERSE_STRENGTH;
        forceX += Math.cos(angleMouse) * disperseForce * 6;
        forceY += Math.sin(angleMouse) * disperseForce * 6;
        currentAttraction *= 0.05;
      }
    }

    if (distTarget > 0.01) {
      forceX +=
        (dxTarget / distTarget) *
        currentAttraction *
        Math.min(distTarget, 100) *
        0.1;
      forceY +=
        (dyTarget / distTarget) *
        currentAttraction *
        Math.min(distTarget, 100) *
        0.1;
    }

    forceX += (Math.random() - 0.5) * currentNoise;
    forceY += (Math.random() - 0.5) * currentNoise;

    this.vx += forceX;
    this.vy += forceY;
    this.vx *= this.physicsParams.FRICTION;
    this.vy *= this.physicsParams.FRICTION;
    this.x += this.vx;
    this.y += this.vy;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, Math.max(0.4, this.size), 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

export default function InteractiveParticleTypography({
  text = "APEX",
  className = "",
  fontSize,
  particleSize,
}: InteractiveParticleTypographyProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const particlesArrayRef = useRef<Particle[]>([]);
  const wordTargetPointsRef = useRef<any[]>([]);
  const mouseRef = useRef<{ x?: number; y?: number }>({ x: undefined, y: undefined });
  const animationFrameIdRef = useRef<number | null>(null);
  const physicsParamsRef = useRef({ ...initialPhysicsParams });

  const getWordPoints = useCallback(
    (word: string, mainCanvasWidth: number, mainCanvasHeight: number) => {
      const points = [];
      if (
        !word ||
        word.trim() === "" ||
        mainCanvasWidth <= 0 ||
        mainCanvasHeight <= 0
      ) {
        return [{ sourceCanvasWidth: mainCanvasWidth, sourceCanvasHeight: mainCanvasHeight, isEmptyPlaceholder: true }];
      }

      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = mainCanvasWidth;
      tempCanvas.height = mainCanvasHeight;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return [];

      const normalizedWord = word.toUpperCase();
      let optimalFontSize = fontSize || MIN_FONT_SIZE;

      if (!fontSize) {
        // Dynamic search for best fit size
        const targetFill = 0.85;
        const maxFs = 450;
        for (let fs = maxFs; fs >= MIN_FONT_SIZE; fs -= 4) {
          tempCtx.font = `black ${fs}px ${DEFAULT_FONT_FAMILY}`;
          const textMetrics = tempCtx.measureText(normalizedWord);
          const textWidthWithPadding = textMetrics.width + FIT_CHECK_PADDING;
          const textHeightWithPadding = fs + FIT_CHECK_PADDING;
          if (
            textWidthWithPadding < mainCanvasWidth * targetFill &&
            textHeightWithPadding < mainCanvasHeight * targetFill
          ) {
            optimalFontSize = fs;
            break;
          }
        }
      }

      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.font = `900 ${optimalFontSize}px ${DEFAULT_FONT_FAMILY}`;
      tempCtx.fillStyle = "white";
      tempCtx.textAlign = "center";
      tempCtx.textBaseline = "middle";
      tempCtx.fillText(normalizedWord, tempCanvas.width / 2, tempCanvas.height / 2);

      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imageData.data;
      for (let y = 0; y < tempCanvas.height; y += POINT_SAMPLING_DENSITY) {
        for (let x = 0; x < tempCanvas.width; x += POINT_SAMPLING_DENSITY) {
          const alphaIndex = (y * tempCanvas.width + x) * 4 + 3;
          if (data[alphaIndex] > 128) {
            points.push({
              x: x,
              y: y,
              sourceCanvasWidth: mainCanvasWidth,
              sourceCanvasHeight: mainCanvasHeight,
            });
          }
        }
      }

      if (points.length === 0) {
        return [{ sourceCanvasWidth: mainCanvasWidth, sourceCanvasHeight: mainCanvasHeight, isEmptyPlaceholder: true }];
      }
      return points;
    },
    [fontSize]
  );

  const initParticles = useCallback(
    (forceRepopulate = true, forceRecalculatePoints = true) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (particleSize) {
        physicsParamsRef.current.PARTICLE_BASE_SIZE = particleSize;
      }

      const currentWord = text.toUpperCase();

      if (
        forceRecalculatePoints ||
        wordTargetPointsRef.current.length === 0 ||
        wordTargetPointsRef.current[0].sourceCanvasWidth !== canvas.width ||
        wordTargetPointsRef.current[0].sourceCanvasHeight !== canvas.height
      ) {
        wordTargetPointsRef.current = getWordPoints(currentWord, canvas.width, canvas.height);

        if (wordTargetPointsRef.current.length > 0 && !wordTargetPointsRef.current[0].isEmptyPlaceholder) {
          const particleCountStep = 100;
          const particleCountMin = 600;
          const particleCountMax = 4000;
          const ratio = 1.0;

          let dynamicParticleCount = wordTargetPointsRef.current.length * ratio;
          dynamicParticleCount =
            Math.round(
              Math.max(particleCountMin, Math.min(particleCountMax, dynamicParticleCount)) /
                particleCountStep
            ) * particleCountStep;

          physicsParamsRef.current.PARTICLE_COUNT_TARGET = dynamicParticleCount;
        }
      }

      const count = physicsParamsRef.current.PARTICLE_COUNT_TARGET;
      if (forceRepopulate || particlesArrayRef.current.length !== count) {
        particlesArrayRef.current = [];
        if (
          wordTargetPointsRef.current.length === 0 ||
          wordTargetPointsRef.current[0].isEmptyPlaceholder
        ) {
          for (let i = 0; i < count; i++) {
            particlesArrayRef.current.push(
              new Particle(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                canvas.width,
                canvas.height,
                physicsParamsRef.current
              )
            );
          }
        } else {
          for (let i = 0; i < count; i++) {
            const targetPoint =
              wordTargetPointsRef.current[i % wordTargetPointsRef.current.length];
            particlesArrayRef.current.push(
              new Particle(
                targetPoint.x,
                targetPoint.y,
                canvas.width,
                canvas.height,
                physicsParamsRef.current
              )
            );
          }
        }
      } else {
        particlesArrayRef.current.forEach((p, i) => {
          if (
            wordTargetPointsRef.current.length > 0 &&
            !wordTargetPointsRef.current[0].isEmptyPlaceholder
          ) {
            const targetPoint =
              wordTargetPointsRef.current[i % wordTargetPointsRef.current.length];
            p.targetX = targetPoint.x;
            p.targetY = targetPoint.y;
          } else {
            p.targetX = Math.random() * canvas.width;
            p.targetY = Math.random() * canvas.height;
          }
          p.baseSize = physicsParamsRef.current.PARTICLE_BASE_SIZE;
        });
      }
    },
    [text, getWordPoints, particleSize]
  );

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Transparent trail effect using destination-out
    ctx.fillStyle = `rgba(0, 0, 0, ${physicsParamsRef.current.TRAIL_ALPHA})`;
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";

    particlesArrayRef.current.forEach((particle) => {
      particle.update(mouseRef.current);
      particle.draw(ctx);
    });

    animationFrameIdRef.current = requestAnimationFrame(animate);
  }, []);

  const adjustLayout = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const newWidth = rect.width;
    const newHeight = rect.height || 450;

    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      canvas.width = newWidth;
      canvas.height = newHeight;
      initParticles(false, true);
    }
  }, [initParticles]);

  useEffect(() => {
    adjustLayout();
    initParticles(true, true);
    if (!animationFrameIdRef.current) {
      animate();
    }

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        mouseRef.current = { x, y };
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: undefined, y: undefined };
    };

    const handleTouchMove = (event: TouchEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect && event.touches.length > 0) {
        const x = event.touches[0].clientX - rect.left;
        const y = event.touches[0].clientY - rect.top;
        mouseRef.current = { x, y };
      }
    };

    const handleTouchEnd = () => {
      mouseRef.current = { x: undefined, y: undefined };
    };

    const canvasEl = canvasRef.current;
    if (canvasEl) {
      canvasEl.addEventListener("mousemove", handleMouseMove);
      canvasEl.addEventListener("mouseleave", handleMouseLeave);
      canvasEl.addEventListener("touchmove", handleTouchMove, { passive: true });
      canvasEl.addEventListener("touchend", handleTouchEnd);
      canvasEl.addEventListener("touchcancel", handleTouchEnd);
    }

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
          animationFrameIdRef.current = null;
        }
        adjustLayout();
        if (!animationFrameIdRef.current) {
          animate();
        }
      }, 150);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (canvasEl) {
        canvasEl.removeEventListener("mousemove", handleMouseMove);
        canvasEl.removeEventListener("mouseleave", handleMouseLeave);
        canvasEl.removeEventListener("touchmove", handleTouchMove);
        canvasEl.removeEventListener("touchend", handleTouchEnd);
        canvasEl.removeEventListener("touchcancel", handleTouchEnd);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [adjustLayout, animate, initParticles]);

  return (
    <div ref={containerRef} className={`w-full h-full relative ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ display: "block", backgroundColor: "transparent" }}
        className="w-full h-full"
      />
    </div>
  );
}
