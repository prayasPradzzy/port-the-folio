import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import ProfileCard from '../components/ProfileCard';

// The cursor effect pulls in three.js post-processing, so it loads only when Contact is near.
const GhostCursor = lazy(() => import('../components/GhostCursor'));

const EMAIL = 'singhprayas727@gmail.com';

const FREELANCE_BRIEF = [
  'Hi Prayas,',
  '',
  'What I need built:',
  '',
  'Timeline:',
  '',
  'Budget (a rough range is fine):',
  '',
  'Links or examples:',
  '',
].join('\n');
const FREELANCE_MAILTO = `mailto:${EMAIL}?subject=${encodeURIComponent('Freelance project')}&body=${encodeURIComponent(FREELANCE_BRIEF)}`;

const SOCIALS = [
  { name: 'GitHub', handle: '@prayasPradzzy', href: 'https://github.com/prayasPradzzy', icon: 'M17.791,46.836C18.502,46.53,19,45.823,19,45v-5.4c0-0.197,0.016-0.402,0.041-0.61C19.027,38.994,19.014,38.997,19,39 c0,0-3,0-3.6,0c-1.5,0-2.8-0.6-3.4-1.8c-0.7-1.3-1-3.5-2.8-4.7C8.9,32.3,9.1,32,9.7,32c0.6,0.1,1.9,0.9,2.7,2c0.9,1.1,1.8,2,3.4,2 c2.487,0,3.82-0.125,4.622-0.555C21.356,34.056,22.649,33,24,33v-0.025c-5.668-0.182-9.289-2.066-10.975-4.975 c-3.665,0.042-6.856,0.405-8.677,0.707c-0.058-0.327-0.108-0.656-0.151-0.987c1.797-0.296,4.843-0.647,8.345-0.714 c-0.112-0.276-0.209-0.559-0.291-0.849c-3.511-0.178-6.541-0.039-8.187,0.097c-0.02-0.332-0.047-0.663-0.051-0.999 c1.649-0.135,4.597-0.27,8.018-0.111c-0.079-0.5-0.13-1.011-0.13-1.543c0-1.7,0.6-3.5,1.7-5c-0.5-1.7-1.2-5.3,0.2-6.6 c2.7,0,4.6,1.3,5.5,2.1C21,13.4,22.9,13,25,13s4,0.4,5.6,1.1c0.9-0.8,2.8-2.1,5.5-2.1c1.5,1.4,0.7,5,0.2,6.6c1.1,1.5,1.7,3.2,1.6,5 c0,0.484-0.045,0.951-0.11,1.409c3.499-0.172,6.527-0.034,8.204,0.102c-0.002,0.337-0.033,0.666-0.051,0.999 c-1.671-0.138-4.775-0.28-8.359-0.089c-0.089,0.336-0.197,0.663-0.325,0.98c3.546,0.046,6.665,0.389,8.548,0.689 c-0.043,0.332-0.093,0.661-0.151,0.987c-1.912-0.306-5.171-0.664-8.879-0.682C35.112,30.873,31.557,32.75,26,32.969V33 c2.6,0,5,3.9,5,6.6V45c0,0.823,0.498,1.53,1.209,1.836C41.37,43.804,48,35.164,48,25C48,12.318,37.683,2,25,2S2,12.318,2,25 C2,35.164,8.63,43.804,17.791,46.836z' },
  { name: 'LinkedIn', handle: 'Prayas Singh', href: 'https://www.linkedin.com/in/prayas-singh-572759362/', icon: 'M41,4H9C6.24,4,4,6.24,4,9v32c0,2.76,2.24,5,5,5h32c2.76,0,5-2.24,5-5V9C46,6.24,43.76,4,41,4z M17,20v19h-6V20H17z M11,14.47c0-1.4,1.2-2.47,3-2.47s2.93,1.07,3,2.47c0,1.4-1.12,2.53-3,2.53C12.2,17,11,15.87,11,14.47z M39,39h-6c0,0,0-9.26,0-10 c0-2-1-4-3.5-4.04h-0.08C27,24.96,26,27.02,26,29c0,0.91,0,10,0,10h-6V20h6v2.56c0,0,1.93-2.56,5.81-2.56 c3.97,0,7.19,2.73,7.19,8.26V39z' },
  { name: 'X', handle: '@PradzzyGotALife', href: 'https://x.com/PradzzyGotALife', icon: 'M 11 4 C 7.134 4 4 7.134 4 11 L 4 39 C 4 42.866 7.134 46 11 46 L 39 46 C 42.866 46 46 42.866 46 39 L 46 11 C 46 7.134 42.866 4 39 4 L 11 4 z M 13.085938 13 L 21.023438 13 L 26.660156 21.009766 L 33.5 13 L 36 13 L 27.789062 22.613281 L 37.914062 37 L 29.978516 37 L 23.4375 27.707031 L 15.5 37 L 13 37 L 22.308594 26.103516 L 13.085938 13 z M 16.914062 15 L 31.021484 35 L 34.085938 35 L 19.978516 15 L 16.914062 15 z' },
];

// What a client can hire for, each tied to work already shown above.
const SERVICES = [
  {
    title: 'Websites and portfolios',
    body: 'Fast, animated sites with scroll motion and WebGL, like this one.',
    stack: 'React, GSAP, Three.js',
  },
  {
    title: 'Web apps and platforms',
    body: 'Full products with accounts, dashboards and data, like Margastra.',
    stack: 'Next.js, Node.js, Python',
  },
  {
    title: 'AI features',
    body: 'Assistants, agent pipelines and model-backed tools added to your product, like FlowForge.',
    stack: 'LangGraph, Gemini, FastAPI',
  },
];

const linkClass =
  'text-sm text-white/80 underline decoration-white/30 underline-offset-[6px] transition-colors hover:text-white hover:decoration-[#B19EEF]';

const CopyEmail: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
    } catch {
      // Older browsers: select the address so the visitor can copy it by hand.
      const range = document.createRange();
      const node = document.getElementById('contact-email');
      if (!node) return;
      range.selectNodeContents(node);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      return;
    }
    setCopied(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-full border border-white/20 px-5 py-2.5 text-sm text-white/85 transition-colors hover:border-[#B19EEF] hover:text-white"
    >
      <span aria-live="polite">{copied ? 'Copied' : 'Copy email'}</span>
    </button>
  );
};

const Contact: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [nearby, setNearby] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNearby(true);
          io.disconnect();
        }
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const backToTop = () => {
    const lenis = (window as any).lenis;
    if (lenis) lenis.scrollTo(0, { duration: 1.8 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-labelledby="contact-title"
      className="relative min-h-screen w-full overflow-hidden bg-black"
    >
      {nearby && (
        <Suspense fallback={null}>
          <GhostCursor
            color="#B19EEF"
            brightness={1.2}
            maxGlow={0.7}
            trailLength={50}
            inertia={0.5}
            bloomStrength={0.08}
            bloomRadius={0.8}
            bloomThreshold={0.05}
            fadeDelayMs={1000}
            fadeDurationMs={1500}
            zIndex={1}
            edgeIntensity={0.15}
            grainIntensity={0.015}
          />
        </Suspense>
      )}

      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-7xl px-4 pb-10 pt-28 sm:px-6 md:pt-40">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="pointer-events-auto lg:col-span-7">
            <h2
              id="contact-title"
              className="font-syncopate text-[clamp(2.4rem,7vw,5.5rem)] font-bold uppercase leading-[0.95] tracking-tight text-[#F5F5F5]"
            >
              Say hello
            </h2>
            <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-white/70 md:text-lg">
              Have a role, a project or a question? Email is the quickest way to reach me.
            </p>

            <div className="mt-10">
              <a
                id="contact-email"
                href={`mailto:${EMAIL}`}
                className="break-all text-[clamp(1.25rem,3vw,2.1rem)] font-semibold tracking-tight text-[#F5F5F5] underline decoration-[#B19EEF]/50 decoration-2 underline-offset-[10px] transition-colors hover:decoration-[#B19EEF]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {EMAIL}
              </a>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href={`mailto:${EMAIL}`}
                  className="rounded-full bg-[#B19EEF] px-5 py-2.5 text-sm font-semibold text-black transition-transform duration-200 hover:scale-105 active:scale-95"
                >
                  Write an email
                </a>
                <CopyEmail />
              </div>
            </div>

            <ul className="mt-12 max-w-md divide-y divide-white/10 border-y border-white/10" aria-label="Elsewhere">
              {SOCIALS.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 py-4 text-[#F5F5F5] transition-colors hover:text-white"
                  >
                    <svg viewBox="0 0 50 50" className="size-5 shrink-0 fill-white/75 transition-colors group-hover:fill-[#B19EEF]" aria-hidden>
                      <path d={s.icon} />
                    </svg>
                    <span className="flex-1 text-base font-medium">{s.name}</span>
                    <span className="truncate text-sm text-white/50">{s.handle}</span>
                    <svg
                      viewBox="0 0 24 24"
                      className="size-4 shrink-0 fill-none stroke-white/35 stroke-2 transition-[stroke,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:stroke-[#B19EEF]"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M7 17 17 7M9 7h8v8" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="pointer-events-auto flex justify-center lg:col-span-5 lg:justify-end">
            <ProfileCard
              behindGlowColor="rgba(177, 158, 239, 0.2)"
            />
          </div>
        </div>

        <div
          id="freelance"
          aria-labelledby="freelance-title"
          role="region"
          className="pointer-events-auto mt-24 rounded-3xl border border-[#B19EEF]/20 bg-black/60 p-6 backdrop-blur-2xl sm:p-8 md:mt-32 lg:p-10"
        >
          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <h3
                id="freelance-title"
                className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-[1.05] tracking-tight text-[#F5F5F5]"
              >
                Hire me for a freelance project
              </h3>
              <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-white/70">
                I take on a small number of projects at a time, from a single landing page to a full product. Tell me
                what you need and I'll reply with a plan and a quote.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:col-span-5 lg:justify-end">
              <a
                href={FREELANCE_MAILTO}
                className="rounded-full bg-[#B19EEF] px-6 py-3 text-sm font-semibold text-black transition-transform duration-200 hover:scale-105 active:scale-95"
              >
                Start a freelance project
              </a>
            </div>
          </div>

          <ul className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
            {SERVICES.map((s) => (
              <li key={s.title} className="bg-black p-5 md:p-6">
                <p className="text-base font-semibold text-[#F5F5F5]">{s.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{s.body}</p>
                <p className="mt-4 text-sm text-[#B19EEF]">{s.stack}</p>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm text-white/50">
            The button opens an email with a short brief to fill in: what you need, timeline, budget and examples.
          </p>
        </div>

        <footer className="pointer-events-auto mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/45">
          <p>&copy; 2026 Prayas Singh</p>
          <button type="button" onClick={backToTop} className={linkClass}>
            Back to top
          </button>
        </footer>
      </div>
    </section>
  );
};

export default Contact;
