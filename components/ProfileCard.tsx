
import React, { useEffect, useRef, useCallback, useMemo, useState } from 'react';

const DEFAULT_INNER_GRADIENT = 'linear-gradient(145deg,#0a0a0a 0%,#1a112e 100%)';
const ANIMATION_CONFIG = {
  INITIAL_DURATION: 1200,
  INITIAL_X_OFFSET: 70,
  INITIAL_Y_OFFSET: 60,
  DEVICE_BETA_OFFSET: 20,
  ENTER_TRANSITION_MS: 180
};

const clamp = (v: number, min = 0, max = 100) => Math.min(Math.max(v, min), max);
const round = (v: number, precision = 3) => parseFloat(v.toFixed(precision));
const adjust = (v: number, fMin: number, fMax: number, tMin: number, tMax: number) => 
  round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

interface ProfileCardProps {
  avatarUrl?: string;
  iconUrl?: string;
  grainUrl?: string;
  innerGradient?: string;
  behindGlowEnabled?: boolean;
  behindGlowColor?: string;
  behindGlowSize?: string;
  className?: string;
  enableTilt?: boolean;
  enableMobileTilt?: boolean;
  mobileTiltSensitivity?: number;
  miniAvatarUrl?: string;
  name?: string;
  title?: string;
  handle?: string;
  status?: string;
  contactText?: string;
  showUserInfo?: boolean;
  onContactClick?: () => void;
}

const ProfileCardComponent: React.FC<ProfileCardProps> = ({
  avatarUrl = 'https://picsum.photos/400/600?grayscale',
  iconUrl = '',
  grainUrl = '',
  innerGradient,
  behindGlowEnabled = true,
  behindGlowColor,
  behindGlowSize,
  className = '',
  enableTilt = true,
  enableMobileTilt = false,
  mobileTiltSensitivity = 5,
  miniAvatarUrl,
  name = 'Prayas Singh',
  title = 'Web Developer',
  handle = 'prayasPradzzy',
  status = 'Online',
  contactText = 'Socials',
  showUserInfo = true,
  onContactClick
}) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const enterTimerRef = useRef<number | null>(null);
  const leaveRafRef = useRef<number | null>(null);

  const tiltEngine = useMemo(() => {
    if (!enableTilt) return null;
    let rafId: number | null = null;
    let running = false;
    let lastTs = 0;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    const DEFAULT_TAU = 0.14;
    const INITIAL_TAU = 0.6;
    let initialUntil = 0;

    const setVarsFromXY = (x: number, y: number) => {
      const shell = shellRef.current;
      const wrap = wrapRef.current;
      if (!shell || !wrap) return;
      const width = shell.clientWidth || 1;
      const height = shell.clientHeight || 1;
      const percentX = clamp((100 / width) * x);
      const percentY = clamp((100 / height) * y);
      const centerX = percentX - 50;
      const centerY = percentY - 50;

      const properties: any = {
        '--pointer-x': `${percentX}%`,
        '--pointer-y': `${percentY}%`,
        '--background-x': `${adjust(percentX, 0, 100, 35, 65)}%`,
        '--background-y': `${adjust(percentY, 0, 100, 35, 65)}%`,
        '--pointer-from-center': `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
        '--pointer-from-top': `${percentY / 100}`,
        '--pointer-from-left': `${percentX / 100}`,
        '--rotate-x': `${round(-(centerX / 5))}deg`,
        '--rotate-y': `${round(centerY / 4)}deg`
      };
      for (const [k, v] of Object.entries(properties)) wrap.style.setProperty(k, v as string);
    };

    const step = (ts: number) => {
      if (!running) return;
      if (lastTs === 0) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;
      const tau = ts < initialUntil ? INITIAL_TAU : DEFAULT_TAU;
      const k = 1 - Math.exp(-dt / tau);
      currentX += (targetX - currentX) * k;
      currentY += (targetY - currentY) * k;
      setVarsFromXY(currentX, currentY);
      const stillFar = Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05;
      if (stillFar || document.hasFocus()) {
        rafId = requestAnimationFrame(step);
      } else {
        running = false;
        lastTs = 0;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      lastTs = 0;
      rafId = requestAnimationFrame(step);
    };

    return {
      setImmediate(x: number, y: number) {
        currentX = x; currentY = y;
        setVarsFromXY(currentX, currentY);
      },
      setTarget(x: number, y: number) {
        targetX = x; targetY = y;
        start();
      },
      toCenter() {
        const shell = shellRef.current;
        if (!shell) return;
        this.setTarget(shell.clientWidth / 2, shell.clientHeight / 2);
      },
      beginInitial(durationMs: number) {
        initialUntil = performance.now() + durationMs;
        start();
      },
      getCurrent() { return { x: currentX, y: currentY, tx: targetX, ty: targetY }; },
      cancel() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        running = false;
        lastTs = 0;
      }
    };
  }, [enableTilt]);

  const getOffsets = (evt: PointerEvent | MouseEvent, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
  };

  const handlePointerMove = useCallback((event: PointerEvent) => {
    if (!shellRef.current || !tiltEngine || isFlipped) return;
    const { x, y } = getOffsets(event, shellRef.current);
    tiltEngine.setTarget(x, y);
  }, [tiltEngine, isFlipped]);

  const handlePointerEnter = useCallback((event: PointerEvent) => {
    const shell = shellRef.current;
    if (!shell || !tiltEngine || isFlipped) return;
    shell.classList.add('active');
    shell.classList.add('entering');
    if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current);
    enterTimerRef.current = window.setTimeout(() => {
      shell.classList.remove('entering');
    }, ANIMATION_CONFIG.ENTER_TRANSITION_MS);
    const { x, y } = getOffsets(event, shell);
    tiltEngine.setTarget(x, y);
  }, [tiltEngine, isFlipped]);

  const handlePointerLeave = useCallback(() => {
    const shell = shellRef.current;
    if (!shell || !tiltEngine || isFlipped) return;
    tiltEngine.toCenter();
    const checkSettle = () => {
      const { x, y, tx, ty } = tiltEngine.getCurrent();
      const settled = Math.hypot(tx - x, ty - y) < 0.6;
      if (settled) {
        shell.classList.remove('active');
        leaveRafRef.current = null;
      } else {
        leaveRafRef.current = requestAnimationFrame(checkSettle);
      }
    };
    if (leaveRafRef.current) cancelAnimationFrame(leaveRafRef.current);
    leaveRafRef.current = requestAnimationFrame(checkSettle);
  }, [tiltEngine, isFlipped]);

  useEffect(() => {
    if (!enableTilt || !tiltEngine) return;
    const shell = shellRef.current;
    if (!shell) return;
    shell.addEventListener('pointerenter', handlePointerEnter as any);
    shell.addEventListener('pointermove', handlePointerMove as any);
    shell.addEventListener('pointerleave', handlePointerLeave as any);
    const initialX = (shell.clientWidth || 0) - ANIMATION_CONFIG.INITIAL_X_OFFSET;
    const initialY = ANIMATION_CONFIG.INITIAL_Y_OFFSET;
    tiltEngine.setImmediate(initialX, initialY);
    tiltEngine.toCenter();
    tiltEngine.beginInitial(ANIMATION_CONFIG.INITIAL_DURATION);
    return () => {
      shell.removeEventListener('pointerenter', handlePointerEnter as any);
      shell.removeEventListener('pointermove', handlePointerMove as any);
      shell.removeEventListener('pointerleave', handlePointerLeave as any);
      tiltEngine.cancel();
    };
  }, [enableTilt, tiltEngine, handlePointerMove, handlePointerEnter, handlePointerLeave]);

  const cardStyle = useMemo(() => ({
    '--inner-gradient': innerGradient ?? DEFAULT_INNER_GRADIENT,
    '--behind-glow-color': behindGlowColor ?? 'rgba(45, 27, 78, 0.15)',
    '--behind-glow-size': behindGlowSize ?? '30%',
    '--card-radius': '30px'
  } as React.CSSProperties), [innerGradient, behindGlowColor, behindGlowSize]);

  const toggleFlip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(!isFlipped);
  };

  return (
    <div ref={wrapRef} className={`pc-card-wrapper pointer-events-auto ${className}`} style={cardStyle}>
      {behindGlowEnabled && <div className="pc-behind" />}
      <div ref={shellRef} className={`pc-card-shell ${isFlipped ? 'flipped' : ''}`}>
        <div className="pc-card-inner">
          <section className="pc-card pc-front">
            <div className="pc-inside">
              <div className="pc-shine" />
              <div className="pc-glare" />
              <div className="pc-content pc-avatar-content">
                <img className="avatar" src={avatarUrl} alt={name} />
                {showUserInfo && (
                  <div className="pc-user-info">
                    <div className="pc-user-details">
                      <div className="pc-mini-avatar">
                        <img src={miniAvatarUrl || avatarUrl} alt={name} />
                      </div>
                      <div className="pc-user-text">
                        <div className="pc-handle">@{handle}</div>
                        <div className="pc-status">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block mr-2 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                          {status}
                        </div>
                      </div>
                    </div>
                    <button onClick={toggleFlip} className="pc-contact-btn">{contactText}</button>
                  </div>
                )}
              </div>
              <div className="pc-content">
                <div className="pc-details">
                  <h3>{name}</h3>
                  <p>{title}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="pc-card pc-back">
            <div className="pc-inside flex flex-col items-center justify-center p-8 text-center bg-[#030303]">
              <div className="mb-10">
                <h3 className="text-xl font-black mb-2 text-[#f5f5f5] tracking-[0.1em] uppercase">Connect</h3>
                <div className="h-[1px] w-8 bg-white/10 mx-auto" />
              </div>
              
              <div className="flex flex-col gap-3 w-full max-w-[240px]">
                {[
                  { label: 'LinkedIn', icon: 'In', url: 'https://www.linkedin.com/in/prayas-singh-572759362/', color: 'hover:border-blue-500/30 text-blue-400' },
                  { label: 'GitHub', icon: 'GH', url: 'https://github.com/prayasPradzzy', color: 'hover:border-white/20 text-white' },
                  { label: 'Twitter', icon: 'X', url: 'https://x.com/PradzzyGotALife', color: 'hover:border-sky-400/30 text-sky-400' }
                ].map((social) => (
                  <a 
                    key={social.label} 
                    href={social.url} 
                    target="_blank" 
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] transition-all duration-300 group/link ${social.color}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-black/80 flex items-center justify-center font-bold text-[10px] border border-white/5 group-hover/link:border-white/20 transition-colors">
                      {social.icon}
                    </div>
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-70 group-hover/link:opacity-100">{social.label}</span>
                  </a>
                ))}
              </div>

              <button 
                onClick={toggleFlip} 
                className="mt-12 text-[8px] uppercase tracking-[0.5em] opacity-30 hover:opacity-100 transition-opacity font-black border-b border-transparent hover:border-white/10 pb-1"
              >
                Back
              </button>
            </div>
          </section>
        </div>
      </div>
      <style>{`
        .pc-card-wrapper { perspective: 2500px; position: relative; width: 340px; }
        .pc-behind { position: absolute; inset: -100px; z-0; background: radial-gradient(circle at var(--pointer-x) var(--pointer-y), var(--behind-glow-color), transparent 70%); filter: blur(60px); opacity: 0; transition: opacity 1s ease; }
        .pc-card-wrapper:hover .pc-behind { opacity: 1; }
        
        .pc-card-shell { width: 100%; aspect-ratio: 0.718; transform-style: preserve-3d; transition: transform 0.8s cubic-bezier(0.19, 1, 0.22, 1); position: relative; z-index: 1; }
        .pc-card-shell.flipped { transform: rotateY(180deg) !important; }
        .pc-card-inner { width: 100%; height: 100%; transform-style: preserve-3d; position: relative; }
        
        .pc-card { position: absolute; width: 100%; height: 100%; backface-visibility: hidden; border-radius: var(--card-radius); overflow: hidden; border: 1px solid rgba(255,255,255,0.04); background: #000; box-shadow: 0 40px 80px rgba(0,0,0,0.9); }
        .pc-card-shell.active:not(.flipped) .pc-card-inner { transform: rotateX(var(--rotate-y)) rotateY(var(--rotate-x)); }
        
        .pc-back { transform: rotateY(180deg); }
        
        .pc-inside { inset: 0; position: absolute; background: var(--inner-gradient); }
        .pc-shine { position: absolute; inset: 0; background: linear-gradient(135deg, transparent, rgba(255,255,255,0.015), transparent); mix-blend-mode: overlay; pointer-events: none; }
        .pc-glare { position: absolute; inset: 0; background: radial-gradient(circle at var(--pointer-x) var(--pointer-y), rgba(255,255,255,0.03), transparent 60%); mix-blend-mode: soft-light; pointer-events: none; }
        
        .pc-avatar-content { height: 100%; position: relative; }
        .avatar { width: 100%; height: 100%; object-fit: cover; opacity: 0.65; filter: grayscale(60%) brightness(0.7) contrast(1.1); transition: all 1s cubic-bezier(0.19, 1, 0.22, 1); }
        .pc-card-wrapper:hover .avatar { opacity: 0.8; filter: grayscale(0%) brightness(0.8) contrast(1); }
        
        .pc-user-info { position: absolute; bottom: 18px; left: 14px; right: 14px; display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.85); backdrop-filter: blur(40px); padding: 10px 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.06); z-index: 10; }
        .pc-mini-avatar { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); flex-shrink: 0; }
        .pc-mini-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .pc-user-text { flex: 1; margin-left: 12px; }
        .pc-handle { font-size: 12px; font-weight: 800; color: #fff; line-height: 1.2; letter-spacing: 0.5px; opacity: 0.9; }
        .pc-status { font-size: 9px; color: rgba(255,255,255,0.3); display: flex; align-items: center; margin-top: 1px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
        
        .pc-contact-btn { background: #fff; color: #000; font-size: 9px; font-weight: 900; padding: 10px 16px; border-radius: 12px; transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1); text-transform: uppercase; letter-spacing: 1.5px; box-shadow: 0 4px 15px rgba(255,255,255,0.05); }
        .pc-contact-btn:hover { background: #eee; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(255,255,255,0.1); }
        
        .pc-details { position: absolute; top: 40px; left: 0; right: 0; text-align: center; pointer-events: none; z-index: 5; }
        .pc-details h3 { font-size: 32px; font-weight: 900; color: #fff; text-shadow: 0 10px 30px rgba(0,0,0,1); margin: 0; letter-spacing: -1.5px; text-transform: uppercase; }
        .pc-details p { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: -2px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; }
      `}</style>
    </div>
  );
};

export default React.memo(ProfileCardComponent);
