"use client";

import { useEffect, useRef } from "react";

type ScoreCelebrationCanvasProps = {
  isActive: boolean;
  className?: string;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  ttl: number;
  color: string;
};

const DEFAULT_COLORS = ["#d3a64f", "#e0594a", "#fff2d9"];
const PARTICLE_COUNT = 60;

const readCssColor = (name: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

const resolvePalette = () => [
  readCssColor("--gold", DEFAULT_COLORS[0]),
  readCssColor("--crayfish-red", DEFAULT_COLORS[1]),
  readCssColor("--warm-cream", DEFAULT_COLORS[2]),
];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export default function ScoreCelebrationCanvas({
  isActive,
  className,
}: ScoreCelebrationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const paletteRef = useRef<string[]>(DEFAULT_COLORS);
  const sizeRef = useRef({ width: 0, height: 0 });
  const reducedMotionRef = useRef(false);
  const isActiveRef = useRef(isActive);
  const isMountedRef = useRef(false);

  const stopAnimation = () => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  };

  const clearCanvas = () => {
    const ctx = ctxRef.current;
    const { width, height } = sizeRef.current;
    if (!ctx || width <= 0 || height <= 0) return;
    ctx.clearRect(0, 0, width, height);
  };

  const createParticles = (count: number) => {
    const { width, height } = sizeRef.current;
    if (width <= 0 || height <= 0) return [];
    const originX = width * 0.5;
    const originY = height * 0.55;
    const colors = paletteRef.current;
    const particles: Particle[] = [];

    for (let i = 0; i < count; i += 1) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
      const speed = 1.2 + Math.random() * 2.6;
      const ttl = 48 + Math.floor(Math.random() * 40);
      const size = 4 + Math.random() * 6;

      particles.push({
        x: originX + (Math.random() - 0.5) * 24,
        y: originY + (Math.random() - 0.5) * 24,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.6,
        vy: Math.sin(angle) * speed - (1.2 + Math.random() * 1.4),
        size,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() - 0.5) * 0.24,
        life: ttl,
        ttl,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    return particles;
  };

  const animate = () => {
    const ctx = ctxRef.current;
    const { width, height } = sizeRef.current;
    if (!ctx || width <= 0 || height <= 0) {
      stopAnimation();
      return;
    }

    if (!isActiveRef.current || reducedMotionRef.current || !isMountedRef.current) {
      stopAnimation();
      clearCanvas();
      return;
    }

    ctx.clearRect(0, 0, width, height);

    const gravity = clamp(height * 0.0006, 0.08, 0.22);
    const nextParticles: Particle[] = [];

    if (particlesRef.current.length === 0) {
      particlesRef.current = createParticles(PARTICLE_COUNT);
    }

    for (const particle of particlesRef.current) {
      particle.vy += gravity;
      particle.vx *= 0.992;
      particle.vy *= 0.992;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rotation += particle.rotationSpeed;
      particle.life -= 1;

      if (particle.life <= 0) continue;

      const alpha = clamp(particle.life / particle.ttl, 0, 1);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate(particle.rotation);
      ctx.fillRect(-particle.size * 0.5, -particle.size * 0.3, particle.size, particle.size * 0.6);
      ctx.restore();
      nextParticles.push(particle);
    }

    ctx.globalAlpha = 1;

    if (nextParticles.length < PARTICLE_COUNT * 0.6) {
      nextParticles.push(...createParticles(PARTICLE_COUNT - nextParticles.length));
    }

    particlesRef.current = nextParticles;
    if (isMountedRef.current) {
      rafIdRef.current = requestAnimationFrame(animate);
    } else {
      stopAnimation();
    }
  };

  const startAnimation = () => {
    if (!isMountedRef.current) return;
    if (rafIdRef.current !== null) return;
    const { width, height } = sizeRef.current;
    if (width <= 0 || height <= 0) return;
    if (!isActiveRef.current || reducedMotionRef.current) return;
    paletteRef.current = resolvePalette();
    particlesRef.current = createParticles(PARTICLE_COUNT);
    rafIdRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    isMountedRef.current = true;
    ctxRef.current = ctx;
    paletteRef.current = resolvePalette();

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(0, rect.width);
      const height = Math.max(0, rect.height);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(0, Math.floor(width * dpr));
      canvas.height = Math.max(0, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { width, height };
      if (!isActiveRef.current || reducedMotionRef.current) {
        clearCanvas();
        return;
      }
      if (width > 0 && height > 0 && rafIdRef.current === null) {
        startAnimation();
      }
    };

    resizeCanvas();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => resizeCanvas());
      resizeObserver.observe(canvas);
    } else {
      window.addEventListener("resize", resizeCanvas);
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotion = () => {
      reducedMotionRef.current = mediaQuery.matches;
      if (mediaQuery.matches) {
        stopAnimation();
        clearCanvas();
      } else if (isActiveRef.current) {
        startAnimation();
      }
    };

    handleMotion();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleMotion);
    } else {
      mediaQuery.addListener(handleMotion);
    }

    return () => {
      isMountedRef.current = false;
      stopAnimation();
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", resizeCanvas);
      }
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleMotion);
      } else {
        mediaQuery.removeListener(handleMotion);
      }
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
      stopAnimation();
      clearCanvas();
      return;
    }
    if (reducedMotionRef.current) {
      clearCanvas();
      return;
    }
    startAnimation();
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: "100%", height: "100%", display: "block", pointerEvents: "none" }}
      aria-hidden="true"
    />
  );
}
