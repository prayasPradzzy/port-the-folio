import React from 'react';
import ReflectiveCard from './ReflectiveCard';

interface ProfileCardProps {
  name?: string;
  monogram?: string;
  roles?: string;
  handle?: string;
  status?: string;
  behindGlowColor?: string;
  className?: string;
}

// Your ID card: brushed-metal surface from ReflectiveCard, with the name, roles and monogram on top.
const ProfileCardComponent: React.FC<ProfileCardProps> = ({
  name = 'Prayas Singh',
  monogram = 'PS',
  roles = 'Web developer, designer, AI and security',
  handle = 'prayasPradzzy',
  status = 'Open to freelance work',
  behindGlowColor = 'rgba(177, 158, 239, 0.2)',
  className = '',
}) => {
  const [first, ...rest] = name.split(' ');

  return (
    <div
      className={`pc-card-wrapper pointer-events-auto ${className}`}
      style={{ '--behind-glow-color': behindGlowColor } as React.CSSProperties}
    >
      <div className="pc-behind" />
      <ReflectiveCard
        width={340}
        height={474}
        radius={24}
        tint="#d9cff7"
        metalness={1}
        roughness={0.3}
        blurStrength={6}
        shine={1}
        glare={0.5}
        grayscale={1}
        warp={0.6}
        warpScale={1}
        bevel={3}
        tiltStrength={12}
        enableTilt
        intro
      >
        <section className="pc-front" aria-label={`${name}, ${roles}`}>
          {/* Monogram outline, lit by a lavender glow that follows the pointer. */}
          <div className="pc-monogram" aria-hidden>
            <span className="pc-monogram-base">{monogram}</span>
            <span className="pc-monogram-lit">{monogram}</span>
          </div>

          <p className="pc-status">
            <span className="pc-status-dot" />
            {status}
          </p>

          <div className="pc-id">
            <h3 className="pc-name font-syncopate">
              {first}
              <br />
              {rest.join(' ')}
            </h3>
            <p className="pc-roles">{roles}</p>
            <p className="pc-handle">@{handle}</p>
          </div>
        </section>
      </ReflectiveCard>
      <style>{`
        .pc-card-wrapper { position: relative; width: min(340px, 100%); }
        .pc-behind { position: absolute; inset: -100px; background: radial-gradient(circle at 50% 50%, var(--behind-glow-color), transparent 70%); filter: blur(60px); opacity: 0; transition: opacity 1s ease; pointer-events: none; }
        .pc-card-wrapper:hover .pc-behind { opacity: 1; }

        .pc-front { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; padding: 26px 24px; text-align: left; overflow: hidden; border-radius: inherit; }
        .pc-front * { pointer-events: none; }

        .pc-monogram { position: absolute; top: 6%; right: -14%; font-family: 'Syncopate', sans-serif; font-weight: 700; font-size: 210px; line-height: 0.8; letter-spacing: -0.06em; }
        .pc-monogram span { display: block; color: transparent; }
        .pc-monogram-base { -webkit-text-stroke: 1px rgba(177,158,239,0.3); }
        .pc-monogram-lit { position: absolute; inset: 0; -webkit-text-stroke: 1.5px #B19EEF; -webkit-mask-image: radial-gradient(circle at var(--rc-pointer-x, 70%) var(--rc-pointer-y, 20%), #000, transparent 45%); mask-image: radial-gradient(circle at var(--rc-pointer-x, 70%) var(--rc-pointer-y, 20%), #000, transparent 45%); }

        .pc-status { position: relative; display: inline-flex; align-items: center; gap: 8px; align-self: flex-start; margin: 0; padding: 6px 12px; border-radius: 999px; background: rgba(0,0,0,0.45); border: 1px solid rgba(177,158,239,0.25); font-size: 12px; color: rgba(245,245,245,0.85); }
        .pc-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #B19EEF; box-shadow: 0 0 8px #B19EEF; }
        .pc-id { position: relative; text-shadow: 0 1px 2px rgba(0,0,0,0.55), 0 0 18px rgba(0,0,0,0.35); }
        .pc-name { margin: 0; font-size: 28px; font-weight: 700; line-height: 1.05; letter-spacing: -0.02em; text-transform: uppercase; color: #F5F5F5; }
        .pc-roles { margin: 14px 0 0; font-size: 14px; line-height: 1.45; color: rgba(245,245,245,0.82); max-width: 24ch; }
        .pc-handle { margin: 18px 0 0; padding-top: 14px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 13px; color: #B19EEF; }
      `}</style>
    </div>
  );
};

export default React.memo(ProfileCardComponent);
