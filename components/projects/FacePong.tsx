import React, { useEffect, useRef, useState } from 'react';
import { useCanvasLoop, prefersReducedMotion } from './useCanvasLoop';

const LAVENDER = '#B19EEF';
const WIN_SCORE = 5;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

type Mode = 'attract' | 'play' | 'over';

const FacePong: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const [mode, setMode] = useState<Mode>('attract');
  const [winner, setWinner] = useState<'you' | 'cpu' | null>(null);
  const [hasFace, setHasFace] = useState(false);

  const modeRef = useRef<Mode>('attract');
  const faceRef = useRef<HTMLImageElement | null>(null);
  const faceUrlRef = useRef<string | null>(null);
  const keysRef = useRef({ up: false, down: false });
  const pointerYRef = useRef<number | null>(null);
  const g = useRef({
    w: 0,
    h: 0,
    ball: { x: 0, y: 0, vx: 0, vy: 0, spin: 0 },
    left: 0,
    right: 0,
    score: [0, 0],
    rally: 0,
    best: 0,
    serveIn: 0.6,
    ouch: 0,
    shake: 0,
    flash: [0, 0],
    trail: [] as { x: number; y: number }[],
    particles: [] as Particle[],
  });

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(
    () => () => {
      if (faceUrlRef.current) URL.revokeObjectURL(faceUrlRef.current);
    },
    [],
  );

  const resetMatch = () => {
    const s = g.current;
    s.score = [0, 0];
    s.rally = 0;
    serve(Math.random() < 0.5 ? 1 : -1);
  };

  const serve = (dir: number) => {
    const s = g.current;
    s.ball.x = s.w / 2;
    s.ball.y = s.h / 2;
    s.ball.vx = 0;
    s.ball.vy = 0;
    s.serveIn = 0.7;
    s.trail = [];
    s.ball.spin = dir;
  };

  const updateReadout = () => {
    const s = g.current;
    if (!scoreRef.current) return;
    scoreRef.current.textContent =
      modeRef.current === 'attract'
        ? 'CPU vs CPU, waiting for you'
        : `Rally ${s.rally}, longest ${s.best}`;
  };

  const startPlay = () => {
    setWinner(null);
    setMode('play');
    modeRef.current = 'play';
    resetMatch();
    updateReadout();
    canvasRef.current?.focus();
  };

  const stopPlay = () => {
    setMode('attract');
    modeRef.current = 'attract';
    resetMatch();
    updateReadout();
  };

  const burst = (x: number, y: number, dir: number) => {
    const s = g.current;
    for (let i = 0; i < 14; i++) {
      const a = (Math.random() - 0.5) * Math.PI * 0.9;
      const sp = 80 + Math.random() * 220;
      s.particles.push({ x, y, vx: Math.cos(a) * sp * dir, vy: Math.sin(a) * sp, life: 1 });
    }
  };

  const update = (dt: number) => {
    const s = g.current;
    const { w, h } = s;
    const r = Math.max(10, Math.min(w, h) * 0.045);
    const ph = h * 0.22;
    const margin = 22;
    const playing = modeRef.current === 'play';

    // Paddles: left is you while playing, otherwise both are CPU.
    const cpuSpeed = h * 1.15;
    const track = (cur: number, target: number, speed: number) =>
      cur + Math.max(-speed * dt, Math.min(speed * dt, target - cur));
    const aimFor = (side: number) =>
      Math.sign(s.ball.vx) === side ? s.ball.y + Math.sin(performance.now() / 300 + side) * ph * 0.25 : h / 2;

    if (playing) {
      if (pointerYRef.current !== null) {
        s.left = track(s.left, pointerYRef.current, h * 3);
      } else {
        const k = keysRef.current;
        s.left += ((k.down ? 1 : 0) - (k.up ? 1 : 0)) * h * 1.4 * dt;
      }
    } else {
      s.left = track(s.left, aimFor(-1), cpuSpeed);
    }
    s.right = track(s.right, aimFor(1), cpuSpeed * (playing ? 0.82 : 1));
    s.left = Math.max(ph / 2, Math.min(h - ph / 2, s.left));
    s.right = Math.max(ph / 2, Math.min(h - ph / 2, s.right));

    if (modeRef.current === 'over') return;

    const b = s.ball;
    if (s.serveIn > 0) {
      s.serveIn -= dt;
      if (s.serveIn <= 0) {
        const speed = w * 0.5;
        const ang = (Math.random() - 0.5) * 0.7;
        b.vx = Math.cos(ang) * speed * (b.spin >= 0 ? 1 : -1);
        b.vy = Math.sin(ang) * speed;
      }
    }

    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.spin += (b.vx / w) * dt * 6;

    if (b.y < r) {
      b.y = r;
      b.vy = Math.abs(b.vy);
    } else if (b.y > h - r) {
      b.y = h - r;
      b.vy = -Math.abs(b.vy);
    }

    const hitPaddle = (side: -1 | 1) => {
      const px = side < 0 ? margin : w - margin;
      const py = side < 0 ? s.left : s.right;
      const facing = side < 0 ? b.vx < 0 : b.vx > 0;
      const reached = side < 0 ? b.x - r <= px + 4 : b.x + r >= px - 4;
      if (!facing || !reached || Math.abs(b.y - py) > ph / 2 + r) return;
      const offset = (b.y - py) / (ph / 2);
      const speed = Math.min(Math.hypot(b.vx, b.vy) * 1.06, w * 1.6);
      const ang = offset * 0.85;
      b.vx = Math.cos(ang) * speed * -side;
      b.vy = Math.sin(ang) * speed;
      b.x = side < 0 ? px + 4 + r : px - 4 - r;
      s.rally += 1;
      s.best = Math.max(s.best, s.rally);
      s.ouch = 0.35;
      s.shake = 0.18;
      s.flash[side < 0 ? 0 : 1] = 1;
      burst(b.x - side * r, b.y, -side);
      updateReadout();
    };
    hitPaddle(-1);
    hitPaddle(1);

    if (b.x < -r * 2 || b.x > w + r * 2) {
      const cpuScored = b.x < 0;
      s.score[cpuScored ? 1 : 0] += 1;
      s.rally = 0;
      updateReadout();
      if (playing && Math.max(...s.score) >= WIN_SCORE) {
        modeRef.current = 'over';
        setMode('over');
        setWinner(cpuScored ? 'cpu' : 'you');
        b.vx = 0;
        b.vy = 0;
        return;
      }
      if (!playing && Math.max(...s.score) >= 9) s.score = [0, 0];
      serve(cpuScored ? -1 : 1);
    }

    s.trail.push({ x: b.x, y: b.y });
    if (s.trail.length > 10) s.trail.shift();

    s.ouch = Math.max(0, s.ouch - dt);
    s.shake = Math.max(0, s.shake - dt);
    s.flash = s.flash.map((f) => Math.max(0, f - dt * 3));
    s.particles = s.particles.filter((pt) => {
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vx *= 0.94;
      pt.vy *= 0.94;
      pt.life -= dt * 1.8;
      return pt.life > 0;
    });
  };

  const drawFace = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number, spin: number, ouch: boolean) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(spin) * 0.5);
    const img = faceRef.current;
    if (img) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.save();
      ctx.clip();
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const scale = ouch ? 1.12 : 1;
      ctx.drawImage(
        img,
        (img.naturalWidth - side) / 2,
        (img.naturalHeight - side) / 2,
        side,
        side,
        -r * scale,
        -r * scale,
        r * 2 * scale,
        r * 2 * scale,
      );
      ctx.restore();
      ctx.lineWidth = 2;
      ctx.strokeStyle = LAVENDER;
      ctx.stroke();
    } else {
      ctx.fillStyle = LAVENDER;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#120a22';
      ctx.strokeStyle = '#120a22';
      ctx.lineWidth = Math.max(1.5, r * 0.12);
      ctx.lineCap = 'round';
      const ex = r * 0.36;
      const ey = -r * 0.18;
      if (ouch) {
        // Squeezed eyes and an "O" mouth on impact.
        for (const sx of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(sx * ex - r * 0.14, ey - r * 0.1);
          ctx.lineTo(sx * ex + r * 0.06 * sx, ey);
          ctx.lineTo(sx * ex - r * 0.14, ey + r * 0.1);
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.ellipse(0, r * 0.38, r * 0.18, r * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        for (const sx of [-1, 1]) {
          ctx.beginPath();
          ctx.arc(sx * ex, ey, r * 0.11, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(0, r * 0.12, r * 0.42, Math.PI * 0.2, Math.PI * 0.8);
        ctx.stroke();
      }
    }
    ctx.restore();
  };

  useCanvasLoop(canvasRef, (ctx, w, h, dt) => {
    const s = g.current;
    if (s.w !== w || s.h !== h) {
      const first = s.w === 0;
      s.w = w;
      s.h = h;
      if (first) {
        s.left = s.right = h / 2;
        serve(1);
        updateReadout();
      }
    }
    const frozen = prefersReducedMotion() && modeRef.current === 'attract';
    if (!frozen) update(dt);

    const r = Math.max(10, Math.min(w, h) * 0.045);
    const ph = h * 0.22;
    const margin = 22;

    ctx.save();
    if (s.shake > 0 && !prefersReducedMotion()) {
      ctx.translate((Math.random() - 0.5) * 6 * s.shake * 5, (Math.random() - 0.5) * 6 * s.shake * 5);
    }
    ctx.fillStyle = '#000';
    ctx.fillRect(-10, -10, w + 20, h + 20);

    // Net
    ctx.fillStyle = 'rgba(245,245,245,0.12)';
    for (let y = 8; y < h; y += 22) ctx.fillRect(w / 2 - 1.5, y, 3, 11);

    // Score
    ctx.fillStyle = 'rgba(245,245,245,0.14)';
    ctx.font = `700 ${Math.round(h * 0.22)}px 'Space Grotesk', sans-serif`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'right';
    ctx.fillText(String(s.score[0]), w / 2 - 28, h * 0.08);
    ctx.textAlign = 'left';
    ctx.fillText(String(s.score[1]), w / 2 + 28, h * 0.08);

    // Paddles
    const paddle = (x: number, y: number, flash: number) => {
      ctx.fillStyle = flash > 0 ? `rgba(177,158,239,${0.6 + flash * 0.4})` : '#F5F5F5';
      ctx.shadowColor = LAVENDER;
      ctx.shadowBlur = flash * 24;
      ctx.beginPath();
      ctx.roundRect(x - 4, y - ph / 2, 8, ph, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
    };
    paddle(margin, s.left, s.flash[0]);
    paddle(w - margin, s.right, s.flash[1]);

    // Trail and particles
    s.trail.forEach((t, i) => {
      const a = (i + 1) / s.trail.length;
      ctx.fillStyle = `rgba(177,158,239,${a * 0.18})`;
      ctx.beginPath();
      ctx.arc(t.x, t.y, r * (0.4 + a * 0.6), 0, Math.PI * 2);
      ctx.fill();
    });
    s.particles.forEach((pt) => {
      ctx.fillStyle = `rgba(177,158,239,${pt.life})`;
      ctx.fillRect(pt.x - 2, pt.y - 2, 4, 4);
    });

    drawFace(ctx, s.ball.x, s.ball.y, r, s.ball.spin, s.ouch > 0);
    ctx.restore();
  });

  const onKey = (e: React.KeyboardEvent, down: boolean) => {
    const k = e.key.toLowerCase();
    if (k === 'arrowup' || k === 'w') keysRef.current.up = down;
    else if (k === 'arrowdown' || k === 's') keysRef.current.down = down;
    else if (down && k === 'escape' && modeRef.current !== 'attract') stopPlay();
    else if (down && (k === 'enter' || k === ' ') && modeRef.current !== 'play') startPlay();
    else return;
    pointerYRef.current = null;
    e.preventDefault();
  };

  const onFace = (file: File | undefined) => {
    if (!file) return;
    if (faceUrlRef.current) URL.revokeObjectURL(faceUrlRef.current);
    const url = URL.createObjectURL(file);
    faceUrlRef.current = url;
    const img = new Image();
    img.onload = () => {
      faceRef.current = img;
      setHasFace(true);
    };
    img.src = url;
  };

  const clearFace = () => {
    faceRef.current = null;
    if (faceUrlRef.current) URL.revokeObjectURL(faceUrlRef.current);
    faceUrlRef.current = null;
    setHasFace(false);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
      <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 text-xs text-white/60">
        <span>{mode === 'attract' ? 'Attract mode' : 'You (left) against the CPU'}</span>
        <span ref={scoreRef} className="text-[#B19EEF] tabular-nums" />
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          aria-label="Pong game. Press Enter to play, then use the arrow keys or W and S to move your paddle. Escape stops."
          className={`block aspect-[4/3] w-full outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#B19EEF] ${
            mode === 'play' ? 'cursor-none touch-none' : 'touch-pan-y'
          }`}
          onKeyDown={(e) => onKey(e, true)}
          onKeyUp={(e) => onKey(e, false)}
          onPointerMove={(e) => {
            if (modeRef.current !== 'play') return;
            const rect = e.currentTarget.getBoundingClientRect();
            pointerYRef.current = e.clientY - rect.top;
          }}
          onPointerDown={(e) => {
            if (modeRef.current !== 'play') return;
            const rect = e.currentTarget.getBoundingClientRect();
            pointerYRef.current = e.clientY - rect.top;
          }}
        />

        {mode !== 'play' && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/35 text-center">
            {winner && (
              <p className="font-syncopate text-xl font-bold uppercase md:text-3xl">
                {winner === 'you' ? 'You win' : 'CPU wins'}
              </p>
            )}
            <button
              type="button"
              onClick={startPlay}
              className="pointer-events-auto rounded-full bg-[#B19EEF] px-6 py-3 text-sm font-semibold text-black transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              {winner ? 'Play again' : 'Play a match'}
            </button>
            <p className="max-w-[30ch] text-xs text-white/60">
              First to {WIN_SCORE}. Move with your mouse, finger, arrow keys or W and S.
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3 text-xs text-white/60">
        <span>{hasFace ? 'Your photo is the ball. It stays in your browser.' : 'The ball can be anyone’s face.'}</span>
        <div className="flex gap-2">
          {hasFace && (
            <button
              type="button"
              onClick={clearFace}
              className="rounded-full px-3 py-1.5 text-white/70 transition-colors hover:text-white"
            >
              Reset face
            </button>
          )}
          {mode === 'play' && (
            <button
              type="button"
              onClick={stopPlay}
              className="rounded-full px-3 py-1.5 text-white/70 transition-colors hover:text-white"
            >
              Stop
            </button>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-full border border-[#B19EEF]/40 px-3 py-1.5 text-[#B19EEF] transition-colors hover:bg-[#B19EEF] hover:text-black"
          >
            Use your own face
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              onFace(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FacePong;
