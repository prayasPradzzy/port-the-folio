
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
  const [isHoveringButton, setIsHoveringButton] = useState(false);
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
    if (!shellRef.current || !tiltEngine || isFlipped || isHoveringButton) return;
    const target = event.target as HTMLElement;
    if (target.closest('.pc-contact-btn, .pc-back a')) return;
    const { x, y } = getOffsets(event, shellRef.current);
    tiltEngine.setTarget(x, y);
  }, [tiltEngine, isFlipped, isHoveringButton]);

  const handlePointerEnter = useCallback((event: PointerEvent) => {
    const shell = shellRef.current;
    if (!shell || !tiltEngine || isFlipped || isHoveringButton) return;
    const target = event.target as HTMLElement;
    if (target.closest('.pc-contact-btn, .pc-back a')) return;
    shell.classList.add('active');
    shell.classList.add('entering');
    if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current);
    enterTimerRef.current = window.setTimeout(() => {
      shell.classList.remove('entering');
    }, ANIMATION_CONFIG.ENTER_TRANSITION_MS);
    const { x, y } = getOffsets(event, shell);
    tiltEngine.setTarget(x, y);
  }, [tiltEngine, isFlipped, isHoveringButton]);

  const handlePointerLeave = useCallback(() => {
    const shell = shellRef.current;
    if (!shell || !tiltEngine || isFlipped || isHoveringButton) return;
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
  }, [tiltEngine, isFlipped, isHoveringButton]);

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

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    
    if (isFlipped || isHoveringButton) {
      shell.classList.remove('active');
      shell.classList.remove('entering');
      if (tiltEngine) {
        tiltEngine.toCenter();
      }
    }
  }, [isFlipped, isHoveringButton, tiltEngine]);

  const cardStyle = useMemo(() => ({
    '--inner-gradient': innerGradient ?? DEFAULT_INNER_GRADIENT,
    '--behind-glow-color': behindGlowColor ?? 'rgba(45, 27, 78, 0.15)',
    '--behind-glow-size': behindGlowSize ?? '30%',
    '--card-radius': '30px'
  } as React.CSSProperties), [innerGradient, behindGlowColor, behindGlowSize]);

  const toggleFlip = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shell = shellRef.current;
    if (shell) {
      shell.classList.remove('active');
      shell.classList.remove('entering');
    }
    if (tiltEngine && !isFlipped) {
      tiltEngine.toCenter();
    }
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
                    <button 
                      onClick={toggleFlip} 
                      onMouseEnter={() => setIsHoveringButton(true)}
                      onMouseLeave={() => setIsHoveringButton(false)}
                      className="pc-contact-btn"
                    >
                      {contactText}
                    </button>
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
                <a 
                  href="https://www.linkedin.com/in/prayas-singh-572759362/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] transition-all duration-300 group/link hover:border-blue-500/30 text-blue-400"
                >
                  <div className="w-8 h-8 rounded-lg bg-black/80 flex items-center justify-center border border-white/5 group-hover/link:border-white/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="w-5 h-5 fill-current">
                      <path d="M41,4H9C6.24,4,4,6.24,4,9v32c0,2.76,2.24,5,5,5h32c2.76,0,5-2.24,5-5V9C46,6.24,43.76,4,41,4z M17,20v19h-6V20H17z M11,14.47c0-1.4,1.2-2.47,3-2.47s2.93,1.07,3,2.47c0,1.4-1.12,2.53-3,2.53C12.2,17,11,15.87,11,14.47z M39,39h-6c0,0,0-9.26,0-10 c0-2-1-4-3.5-4.04h-0.08C27,24.96,26,27.02,26,29c0,0.91,0,10,0,10h-6V20h6v2.56c0,0,1.93-2.56,5.81-2.56 c3.97,0,7.19,2.73,7.19,8.26V39z"></path>
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-70 group-hover/link:opacity-100">LinkedIn</span>
                </a>

                <a 
                  href="https://github.com/prayasPradzzy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] transition-all duration-300 group/link hover:border-white/20 text-white"
                >
                  <div className="w-8 h-8 rounded-lg bg-black/80 flex items-center justify-center border border-white/5 group-hover/link:border-white/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="w-5 h-5 fill-current">
                      <path d="M17.791,46.836C18.502,46.53,19,45.823,19,45v-5.4c0-0.197,0.016-0.402,0.041-0.61C19.027,38.994,19.014,38.997,19,39 c0,0-3,0-3.6,0c-1.5,0-2.8-0.6-3.4-1.8c-0.7-1.3-1-3.5-2.8-4.7C8.9,32.3,9.1,32,9.7,32c0.6,0.1,1.9,0.9,2.7,2c0.9,1.1,1.8,2,3.4,2 c2.487,0,3.82-0.125,4.622-0.555C21.356,34.056,22.649,33,24,33v-0.025c-5.668-0.182-9.289-2.066-10.975-4.975 c-3.665,0.042-6.856,0.405-8.677,0.707c-0.058-0.327-0.108-0.656-0.151-0.987c1.797-0.296,4.843-0.647,8.345-0.714 c-0.112-0.276-0.209-0.559-0.291-0.849c-3.511-0.178-6.541-0.039-8.187,0.097c-0.02-0.332-0.047-0.663-0.051-0.999 c1.649-0.135,4.597-0.27,8.018-0.111c-0.079-0.5-0.13-1.011-0.13-1.543c0-1.7,0.6-3.5,1.7-5c-0.5-1.7-1.2-5.3,0.2-6.6 c2.7,0,4.6,1.3,5.5,2.1C21,13.4,22.9,13,25,13s4,0.4,5.6,1.1c0.9-0.8,2.8-2.1,5.5-2.1c1.5,1.4,0.7,5,0.2,6.6c1.1,1.5,1.7,3.2,1.6,5 c0,0.484-0.045,0.951-0.11,1.409c3.499-0.172,6.527-0.034,8.204,0.102c-0.002,0.337-0.033,0.666-0.051,0.999 c-1.671-0.138-4.775-0.28-8.359-0.089c-0.089,0.336-0.197,0.663-0.325,0.98c3.546,0.046,6.665,0.389,8.548,0.689 c-0.043,0.332-0.093,0.661-0.151,0.987c-1.912-0.306-5.171-0.664-8.879-0.682C35.112,30.873,31.557,32.75,26,32.969V33 c2.6,0,5,3.9,5,6.6V45c0,0.823,0.498,1.53,1.209,1.836C41.37,43.804,48,35.164,48,25C48,12.318,37.683,2,25,2S2,12.318,2,25 C2,35.164,8.63,43.804,17.791,46.836z"></path>
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-70 group-hover/link:opacity-100">GitHub</span>
                </a>

                <a 
                  href="https://x.com/PradzzyGotALife" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-4 py-3 rounded-xl border border-white/5 bg-white/[0.02] transition-all duration-300 group/link hover:border-sky-400/30 text-sky-400"
                >
                  <div className="w-8 h-8 rounded-lg bg-black/80 flex items-center justify-center border border-white/5 group-hover/link:border-white/20 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" className="w-5 h-5 fill-current">
                      <path d="M 11 4 C 7.134 4 4 7.134 4 11 L 4 39 C 4 42.866 7.134 46 11 46 L 39 46 C 42.866 46 46 42.866 46 39 L 46 11 C 46 7.134 42.866 4 39 4 L 11 4 z M 13.085938 13 L 21.023438 13 L 26.660156 21.009766 L 33.5 13 L 36 13 L 27.789062 22.613281 L 37.914062 37 L 29.978516 37 L 23.4375 27.707031 L 15.5 37 L 13 37 L 22.308594 26.103516 L 13.085938 13 z M 16.914062 15 L 31.021484 35 L 34.085938 35 L 19.978516 15 L 16.914062 15 z"></path>
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-70 group-hover/link:opacity-100">Twitter</span>
                </a>
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
        .pc-card * { pointer-events: none; }
        .pc-card-shell.active:not(.flipped) .pc-card-inner { transform: rotateX(var(--rotate-y)) rotateY(var(--rotate-x)); }
        
        .pc-back { transform: rotateY(180deg); }
        
        .pc-inside { inset: 0; position: absolute; background: var(--inner-gradient); }
        .pc-shine { position: absolute; inset: 0; background: linear-gradient(135deg, transparent, rgba(255,255,255,0.015), transparent); mix-blend-mode: overlay; }
        .pc-glare { position: absolute; inset: 0; background: radial-gradient(circle at var(--pointer-x) var(--pointer-y), rgba(255,255,255,0.03), transparent 60%); mix-blend-mode: soft-light; }
        
        .pc-avatar-content { height: 100%; position: relative; }
        .avatar { width: 100%; height: 100%; object-fit: cover; opacity: 0.65; filter: grayscale(60%) brightness(0.7) contrast(1.1); transition: all 1s cubic-bezier(0.19, 1, 0.22, 1); }
        .pc-card-wrapper:hover .avatar { opacity: 0.8; filter: grayscale(0%) brightness(0.8) contrast(1); }
        
        .pc-user-info { position: absolute; bottom: 18px; left: 14px; right: 14px; display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.85); backdrop-filter: blur(40px); padding: 10px 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.06); z-index: 10; }
        .pc-user-details { display: flex; align-items: center; }
        .pc-mini-avatar { width: 40px; height: 40px; border-radius: 50%; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); flex-shrink: 0; }
        .pc-mini-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .pc-user-text { flex: 1; margin-left: 12px; }
        .pc-handle { font-size: 12px; font-weight: 800; color: #fff; line-height: 1.2; letter-spacing: 0.5px; opacity: 0.9; }
        .pc-status { font-size: 9px; color: rgba(255,255,255,0.3); display: flex; align-items: center; margin-top: 1px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
        
        .pc-contact-btn { background: #fff; color: #000; font-size: 9px; font-weight: 900; padding: 10px 16px; border-radius: 12px; transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1); text-transform: uppercase; letter-spacing: 1.5px; box-shadow: 0 4px 15px rgba(255,255,255,0.05); cursor: pointer; border: none; pointer-events: auto !important; position: relative; z-index: 30; flex-shrink: 0; }
        .pc-contact-btn:hover { background: #eee; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(255,255,255,0.1); }
        .pc-contact-btn:active { transform: translateY(0px); }
        
        .pc-back a { pointer-events: auto !important; }
        .pc-back button { pointer-events: auto !important; }
        
        .pc-details { position: absolute; top: 40px; left: 0; right: 0; text-align: center; z-index: 5; }
        .pc-details h3 { font-size: 32px; font-weight: 900; color: #fff; text-shadow: 0 10px 30px rgba(0,0,0,1); margin: 0; letter-spacing: -1.5px; text-transform: uppercase; }
        .pc-details p { font-size: 11px; color: rgba(255,255,255,0.35); margin-top: -2px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; }
      `}</style>
    </div>
  );
};

export default React.memo(ProfileCardComponent);
