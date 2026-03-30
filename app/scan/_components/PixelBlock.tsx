// app/scan/_components/PixelBlock.tsx
"use client";

import { useEffect, useRef } from "react";

export function PixelBlock({ size = 48 }: { size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const g = 8;
    const px = size / g;
    const cols = [
      "#c4391a", "#d4543a", "#e87460", "#c9a55a",
      "#222", "#ddd", "#F8F7F4", "#b02a0e",
    ];
    const cells: string[] = [];
    for (let i = 0; i < g * g; i++)
      cells.push(cols[Math.floor(Math.random() * cols.length)]);

    // Draw initial frame regardless of motion preference
    for (let j = 0; j < cells.length; j++) {
      ctx.fillStyle = cells[j];
      ctx.fillRect((j % g) * px, Math.floor(j / g) * px, px, px);
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let f: number;
    function draw() {
      for (let j = 0; j < cells.length; j++) {
        if (Math.random() < 0.012) {
          cells[j] = cols[Math.floor(Math.random() * cols.length)];
          ctx.fillStyle = cells[j];
          ctx.fillRect((j % g) * px, Math.floor(j / g) * px, px, px);
        }
      }
      f = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(f);
  }, [size]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      aria-hidden="true"
      style={{ imageRendering: "pixelated", borderRadius: 4, display: "block" }}
    />
  );
}

export function PixelDot({ size = 18 }: { size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const g = 4;
    const px = size / g;
    const cols = ["#c4391a", "#d4543a", "#c9a55a", "#222"];

    // Draw initial frame regardless of motion preference
    for (let i = 0; i < g * g; i++) {
      ctx.fillStyle = cols[Math.floor(Math.random() * cols.length)];
      ctx.fillRect((i % g) * px, Math.floor(i / g) * px, px, px);
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let f: number;
    function tick() {
      for (let j = 0; j < g * g; j++) {
        if (Math.random() < 0.02) {
          ctx.fillStyle = cols[Math.floor(Math.random() * cols.length)];
          ctx.fillRect((j % g) * px, Math.floor(j / g) * px, px, px);
        }
      }
      f = requestAnimationFrame(tick);
    }
    tick();
    return () => cancelAnimationFrame(f);
  }, [size]);

  return (
    <canvas
      ref={ref}
      width={size}
      height={size}
      aria-hidden="true"
      style={{ imageRendering: "pixelated", borderRadius: 2, display: "block" }}
    />
  );
}
