import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCanvasLoop, prefersReducedMotion } from './useCanvasLoop';

gsap.registerPlugin(ScrollTrigger);

const COLS = 72;
const ROWS = 42;
const BONE = [245, 245, 245];
const LAVENDER = [177, 158, 239];

const hash = (x: number, y: number) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};
const smooth = (t: number) => t * t * (3 - 2 * t);
const valueNoise = (x: number, y: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const u = smooth(x - xi);
  const v = smooth(y - yi);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};
// Fractal noise, sharpened so it reads as ridges and valleys rather than hills.
const terrain = (x: number, y: number) => {
  let f = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < 5; i++) {
    f += amp * valueNoise(x * freq, y * freq);
    amp *= 0.5;
    freq *= 2.03;
  }
  return Math.pow(f, 1.7);
};
const toMetres = (hv: number) => Math.round(120 + hv * 2900);

export const TERRAIN_STAGES = [
  'Read a single RGB satellite image',
  'Estimate relative depth with Depth Anything V2',
  'Calibrate to metres against SRTM 30 m elevation',
  'Render it in the browser as a 3D terrain',
];

interface TerrainDemoProps {
  onStage?: (stage: number) => void;
}

const TerrainDemo: React.FC<TerrainDemoProps> = ({ onStage }) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef(prefersReducedMotion() ? 1 : 0);
  const shownRef = useRef(progressRef.current);
  const stageRef = useRef(-1);
  const timeRef = useRef(0);
  const hoverRef = useRef<number | null>(null);
  const exRef = useRef(1.6);
  const [ex, setEx] = useState(1.6);

  useEffect(() => {
    exRef.current = ex;
  }, [ex]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const st = ScrollTrigger.create({
      trigger: frameRef.current,
      start: 'top 85%',
      end: 'center 35%',
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });
    return () => st.kill();
  }, []);

  useCanvasLoop(canvasRef, (ctx, w, h, dt) => {
    const reduced = prefersReducedMotion();
    if (!reduced) timeRef.current += dt * 0.16;
    shownRef.current += (progressRef.current - shownRef.current) * Math.min(1, dt * 6 || 1);
    const p = shownRef.current;

    const stage = p < 0.2 ? 0 : p < 0.5 ? 1 : p < 0.82 ? 2 : 3;
    if (stage !== stageRef.current) {
      stageRef.current = stage;
      onStage?.(stage);
    }

    const rise = smooth(Math.min(1, Math.max(0, (p - 0.18) / 0.62)));
    const tint = BONE.map((c, i) => Math.round(c + (LAVENDER[i] - c) * rise));
    const t = timeRef.current;
    const top = h * 0.3;
    const span = h * 0.64;
    const amp = h * 0.2 * exRef.current;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    let frontX: number[] = [];
    let frontY: number[] = [];
    let frontH: number[] = [];

    for (let r = 0; r < ROWS; r++) {
      const z = r / (ROWS - 1);
      const persp = 0.5 + 0.5 * z;
      const baseY = top + Math.pow(z, 1.25) * span;
      const xs: number[] = [];
      const ys: number[] = [];
      const hs: number[] = [];
      for (let c = 0; c < COLS; c++) {
        const u = c / (COLS - 1);
        const hv = terrain(u * 3.4 + 7, (1 - z) * 2.4 + t);
        xs.push(w / 2 + (u - 0.5) * w * 1.08 * persp);
        ys.push(baseY - hv * amp * rise * persp);
        hs.push(hv);
      }

      // Opaque fill under each ridge hides the rows behind it.
      if (rise > 0.01) {
        ctx.beginPath();
        ctx.moveTo(xs[0], ys[0]);
        for (let c = 1; c < COLS; c++) ctx.lineTo(xs[c], ys[c]);
        ctx.lineTo(xs[COLS - 1], h);
        ctx.lineTo(xs[0], h);
        ctx.closePath();
        ctx.fill();
      }

      const zAlpha = 0.12 + 0.78 * z;
      ctx.lineWidth = 0.6 + z * 0.9;
      for (let c = 1; c < COLS; c++) {
        // While flat, brightness carries the height (like the source photo);
        // once risen, the geometry carries it instead.
        const shade = 0.2 + hs[c] * 1.1;
        const a = zAlpha * (shade + (1 - shade) * rise * 0.85);
        ctx.strokeStyle = `rgba(${tint[0]},${tint[1]},${tint[2]},${Math.min(1, a)})`;
        ctx.beginPath();
        ctx.moveTo(xs[c - 1], ys[c - 1]);
        ctx.lineTo(xs[c], ys[c]);
        ctx.stroke();
      }
      ctx.fillStyle = '#000';
      if (r === ROWS - 1) {
        frontX = xs;
        frontY = ys;
        frontH = hs;
      }
    }

    const hover = hoverRef.current;
    if (hover !== null && frontX.length) {
      const c = Math.round(Math.min(1, Math.max(0, (hover / w - 0.5) / 1.08 + 0.5)) * (COLS - 1));
      const x = frontX[c];
      const y = frontY[c];
      ctx.strokeStyle = 'rgba(177,158,239,0.55)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(x, y - 8);
      ctx.lineTo(x, h * 0.12);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#B19EEF';
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      if (readoutRef.current) {
        readoutRef.current.textContent = `Elevation ${toMetres(frontH[c]).toLocaleString()} m`;
      }
    } else if (readoutRef.current) {
      readoutRef.current.textContent = rise > 0.95 ? 'Hover the terrain to read elevation' : 'Reconstructing…';
    }
  });

  return (
    <div ref={frameRef} className="overflow-hidden rounded-2xl border border-white/10 bg-black">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 text-xs text-white/60">
        <span>Terrain from one image</span>
        <span ref={readoutRef} className="text-[#B19EEF] tabular-nums" aria-live="off" />
      </div>
      <canvas
        ref={canvasRef}
        className="block aspect-[4/3] w-full cursor-crosshair touch-pan-y"
        role="img"
        aria-label="Animated wireframe terrain that rises from a flat image into 3D relief"
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          hoverRef.current = e.clientX - rect.left;
        }}
        onPointerLeave={() => {
          hoverRef.current = null;
        }}
      />
      <label className="flex items-center gap-4 border-t border-white/10 px-4 py-3 text-xs text-white/60">
        <span className="shrink-0">Vertical exaggeration</span>
        <input
          type="range"
          min={0.6}
          max={3}
          step={0.1}
          value={ex}
          onChange={(e) => setEx(parseFloat(e.target.value))}
          className="w-full accent-[#B19EEF]"
        />
        <span className="w-10 shrink-0 text-right tabular-nums text-white/80">{ex.toFixed(1)}×</span>
      </label>
    </div>
  );
};

export default TerrainDemo;
