
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import FaultyTerminal from '../components/FaultyTerminal';

const Projects: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(contentRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top center",
          end: "center center",
          scrub: 1
        }
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <section 
      id="projects"
      ref={containerRef}
      className="relative min-h-screen w-full flex items-center justify-center bg-black overflow-hidden"
    >
      <div className="absolute inset-0 z-0 opacity-80">
        <FaultyTerminal
          scale={1.5}
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
          tint="#A7EF9E"
          mouseReact
          mouseStrength={0.5}
          pageLoadAnimation
          brightness={0.4}
        />
      </div>
      
      <div ref={contentRef} className="relative z-10 w-full max-w-7xl px-4">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 text-center drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">Selected Works</h2>
        <div className="w-full border border-white/5 bg-black/60 backdrop-blur-2xl rounded-3xl relative overflow-hidden py-32 px-12">
           <div className="absolute inset-0 bg-[#2D1B4E]/10 blur-3xl rounded-full pointer-events-none" />
           <div className="relative z-10 text-center">
             <p className="text-7xl md:text-9xl font-black tracking-tighter opacity-20 uppercase">
               Coming<br/>Soon
             </p>
             <p className="mt-10 text-xs tracking-[0.5em] opacity-40 uppercase font-bold">
               Forging Digital Excellence
             </p>
           </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
