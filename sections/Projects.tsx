import React, { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FaultyTerminal from '../components/FaultyTerminal';
import TerrainDemo, { TERRAIN_STAGES } from '../components/projects/TerrainDemo';
import FacePong from '../components/projects/FacePong';
import FlowGraph from '../components/projects/FlowGraph';
import { prefersReducedMotion } from '../components/projects/useCanvasLoop';
import '../components/projects/projects.css';

gsap.registerPlugin(ScrollTrigger);

const GITHUB = 'https://github.com/prayasPradzzy';

interface ProjectLink {
  label: string;
  href: string;
  primary?: boolean;
}

interface ProjectProps {
  id: string;
  title: string;
  context: string;
  description: string;
  builtWith: string;
  links: ProjectLink[];
  demo: React.ReactNode;
  reverse?: boolean;
  children?: React.ReactNode;
}

const Project: React.FC<ProjectProps> = ({ id, title, context, description, builtWith, links, demo, reverse, children }) => {
  const plateRef = useRef<HTMLElement>(null);

  // Lavender glow on the plate border follows the pointer.
  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = plateRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  return (
    <article
      ref={plateRef}
      id={id}
      aria-labelledby={`${id}-title`}
      onPointerMove={onPointerMove}
      className="project-plate pointer-events-auto relative grid items-center gap-8 rounded-3xl border border-white/5 bg-black/60 p-4 backdrop-blur-2xl sm:p-6 lg:grid-cols-12 lg:gap-12 lg:p-10"
    >
      <div className={`project-demo lg:col-span-7 ${reverse ? 'lg:order-last' : ''}`}>{demo}</div>

      <div className="lg:col-span-5">
        <p className="reveal-item text-sm text-[#B19EEF]">{context}</p>
        <div className="mt-3 overflow-hidden pb-1">
          <h3
            id={`${id}-title`}
            className="project-title font-syncopate text-[clamp(1.5rem,2.8vw,2.6rem)] break-words font-bold uppercase leading-[1.05] tracking-tight text-[#F5F5F5]"
          >
            {title}
          </h3>
        </div>
        <p className="reveal-item mt-5 max-w-[52ch] text-base leading-relaxed text-white/70 md:text-lg">{description}</p>
        {children && <div className="reveal-item mt-7">{children}</div>}
        <p className="reveal-item mt-7 max-w-[52ch] text-sm leading-relaxed text-white/50">{builtWith}</p>
        <div className="reveal-item mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          {links.map((link) =>
            link.primary ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#B19EEF] px-6 py-3 text-sm font-semibold text-black transition-transform duration-200 hover:scale-105 active:scale-95"
              >
                {link.label}
              </a>
            ) : (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/80 underline decoration-white/30 underline-offset-[6px] transition-colors hover:text-white hover:decoration-[#B19EEF]"
              >
                {link.label}
              </a>
            ),
          )}
        </div>
      </div>
    </article>
  );
};

const DepthWizard: React.FC = () => {
  const [stage, setStage] = useState(0);
  return (
    <Project
      id="depthwizard"
      title="DepthWizard"
      context="Smart India Hackathon 2026, for ISRO"
      description="Turns a single satellite or aerial photo into terrain you can fly through in the browser. No stereo pairs, no LiDAR: depth comes from one image and gets calibrated to real elevations."
      builtWith="Built with Python, FastAPI, Depth Anything V2, RANSAC calibration against SRTM 30 m data, and a Three.js viewer with WASD flythrough."
      links={[{ label: 'Code on GitHub', href: `${GITHUB}/DepthWizard3D` }]}
      demo={<TerrainDemo onStage={setStage} />}
    >
      <ol className="space-y-2.5">
        {TERRAIN_STAGES.map((label, i) => (
          <li
            key={label}
            className={`flex gap-4 text-sm leading-snug transition-colors duration-500 ${
              i <= stage ? 'text-white/90' : 'text-white/35'
            }`}
          >
            <span
              className={`w-5 shrink-0 tabular-nums transition-colors duration-500 ${
                i === stage ? 'text-[#B19EEF]' : ''
              }`}
            >
              {i + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>
    </Project>
  );
};

const Projects: React.FC = () => {
  const containerRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from('.projects-heading-line', {
        yPercent: 110,
        duration: 1.2,
        stagger: 0.12,
        ease: 'power4.out',
        scrollTrigger: { trigger: '.projects-heading', start: 'top 80%', once: true },
      });
      gsap.from('.projects-intro', {
        opacity: 0,
        y: 24,
        duration: 1,
        delay: 0.3,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.projects-heading', start: 'top 80%', once: true },
      });

      gsap.utils.toArray<HTMLElement>('.project-plate').forEach((plate) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: plate, start: 'top 78%', once: true },
        });
        tl.from(plate, { opacity: 0, y: 80, scale: 0.97, duration: 1.1, ease: 'power3.out' })
          .from(plate.querySelector('.project-demo'), { clipPath: 'inset(0 0 100% 0 round 16px)', duration: 1.1, ease: 'expo.out' }, 0.15)
          .from(plate.querySelector('.project-title'), { yPercent: 110, duration: 1, ease: 'power4.out' }, 0.3)
          .from(plate.querySelectorAll('.reveal-item'), { opacity: 0, y: 20, duration: 0.8, stagger: 0.08, ease: 'power3.out' }, 0.4);

        // Demo drifts slightly against the text while scrolling through.
        gsap.fromTo(
          plate.querySelector('.project-demo'),
          { y: 30 },
          { y: -30, ease: 'none', scrollTrigger: { trigger: plate, start: 'top bottom', end: 'bottom top', scrub: true } },
        );
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="projects" ref={containerRef} aria-labelledby="projects-title" className="relative w-full bg-black">
      {/* Pinned so the terminal fills the viewport for the whole section instead of stretching. */}
      <div className="absolute inset-0 z-0" aria-hidden>
        <div className="sticky top-0 h-screen w-full opacity-80">
          <FaultyTerminal
            scale={2.1}
            gridMul={[2, 1]}
            digitSize={1.2}
            timeScale={0.5}
            pause={false}
            scanlineIntensity={0.5}
            glitchAmount={1}
            flickerAmount={1}
            noiseAmp={1}
            chromaticAberration={0}
            dither={0}
            curvature={0.1}
            tint="#ffffff"
            mouseReact
            mouseStrength={2}
            pageLoadAnimation
            brightness={0.6}
          />
        </div>
      </div>

      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-7xl px-4 py-28 sm:px-6 md:py-40">
        <header className="projects-heading mb-16 grid gap-6 md:mb-24 md:grid-cols-12 md:items-end">
          <h2
            id="projects-title"
            className="text-[clamp(3rem,9vw,7.5rem)] font-bold leading-[0.92] tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] md:col-span-7"
          >
            <span className="block overflow-hidden pb-2">
              <span className="projects-heading-line block">Selected</span>
            </span>
            <span className="block overflow-hidden pb-2">
              <span className="projects-heading-line block">work</span>
            </span>
          </h2>
          <div className="projects-intro rounded-2xl bg-black/50 p-5 backdrop-blur-md md:col-span-5 md:p-6">
            <p className="text-base leading-relaxed text-white/75 md:text-lg">
              Terrain from a single satellite photo, a multiplayer Pong where your face is the ball, and AI agents
              that pass work down a line. Each one has a small working demo you can try here.
            </p>
            <a
              href={GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto mt-4 inline-block text-sm text-white/80 underline decoration-white/30 underline-offset-[6px] transition-colors hover:text-white hover:decoration-[#B19EEF]"
            >
              All repositories on GitHub
            </a>
          </div>
        </header>

        <div className="flex flex-col gap-20 md:gap-32">
          <DepthWizard />

          <Project
            id="pongzu"
            reverse
            title="Pongzu.io"
            context="Browser game, real-time multiplayer"
            description="Pong where the ball is a face. Upload a photo, MediaPipe finds and crops the face, and it becomes the ball. Play the CPU or send a friend a room code and play live."
            builtWith="Built with React, TypeScript, Phaser 3, MediaPipe face detection, and a Node.js Socket.io server that keeps the match state authoritative."
            links={[
              { label: 'Play Pongzu', href: 'https://pongzu.netlify.app/', primary: true },
              { label: 'Code on GitHub', href: `${GITHUB}/Pongzu.io` },
            ]}
            demo={<FacePong />}
          />

          <Project
            id="flowforge"
            title="FlowForge AI"
            context="Multi-agent workflows"
            description="Three small teams of AI agents, each a step in a LangGraph pipeline. One researches a question, one writes and edits content, one reviews code. Every step's output is visible as it runs."
            builtWith="Built with Python, LangGraph, LangChain, Google Gemini 2.5 Flash, and a tabbed Streamlit interface."
            links={[{ label: 'Code on GitHub', href: `${GITHUB}/FlowForge-AI` }]}
            demo={<FlowGraph />}
          />
        </div>
      </div>
    </section>
  );
};

export default Projects;
