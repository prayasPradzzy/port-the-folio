import React, { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STATEMENT =
  "I'm Prayas, a developer and designer. I like projects where the interface is the interesting part: terrain you can fly through, a game that plays with your face, AI agents you can watch work. Lately I've also been digging into cybersecurity.";

const TOOLS = [
  { area: 'Interfaces', items: ['React', 'TypeScript', 'Tailwind CSS', 'Streamlit'] },
  { area: '3D and motion', items: ['Three.js', 'React Three Fiber', 'WebGL shaders', 'GSAP', 'Phaser'] },
  { area: 'Back end', items: ['Python', 'FastAPI', 'Node.js', 'Socket.io'] },
  { area: 'AI and vision', items: ['LangGraph', 'LangChain', 'Gemini', 'Depth Anything V2', 'MediaPipe'] },
];

const About: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      // Words light up as the statement scrolls through the viewport.
      gsap.fromTo(
        '.about-word',
        { opacity: 0.15 },
        {
          opacity: 1,
          stagger: 0.05,
          ease: 'none',
          scrollTrigger: { trigger: '.about-statement', start: 'top 80%', end: 'bottom 45%', scrub: true },
        },
      );
      gsap.from('.about-group', {
        opacity: 0,
        y: 30,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.about-tools', start: 'top 80%', once: true },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="about"
      ref={containerRef}
      aria-labelledby="about-title"
      className="relative w-full overflow-hidden bg-black py-28 md:py-40"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-10 h-[36rem] w-[36rem] rounded-full bg-[#2D1B4E] opacity-40 blur-[140px]"
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6">
        <h2 id="about-title" className="mb-10 text-sm font-medium text-[#B19EEF] md:mb-14">
          About
        </h2>

        <p style={{ fontFamily: "'Space Grotesk', sans-serif" }} className="about-statement max-w-[24ch] text-[clamp(1.75rem,4.6vw,4rem)] font-medium leading-[1.12] tracking-tight text-[#F5F5F5] md:max-w-[26ch]">
          {STATEMENT.split(' ').map((word, i) => (
            <span key={i} className="about-word">
              {word}{' '}
            </span>
          ))}
        </p>

        <div className="mt-20 grid gap-12 md:mt-28 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h3 className="text-xl font-semibold text-[#F5F5F5]">Recently</h3>
            <p className="mt-4 max-w-[42ch] leading-relaxed text-white/65">
              At Smart India Hackathon 2026 I built DepthWizard for ISRO's problem statement on single-view height
              estimation. Pongzu.io is live and playable at{' '}
              <a
                href="https://pongzu.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-[#B19EEF]"
              >
                pongzu.netlify.app
              </a>
              .
            </p>
          </div>

          <div className="about-tools lg:col-span-8">
            <h3 className="text-xl font-semibold text-[#F5F5F5]">What I build with</h3>
            <dl className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {TOOLS.map((group) => (
                <div key={group.area} className="about-group border-t border-white/10 pt-4">
                  <dt className="text-sm text-[#B19EEF]">{group.area}</dt>
                  <dd className="mt-2 leading-relaxed text-white/80">{group.items.join(', ')}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
