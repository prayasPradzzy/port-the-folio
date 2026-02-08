
import React from 'react';
import ProfileCard from '../components/ProfileCard';
import GhostCursor from '../components/GhostCursor';

const Contact: React.FC = () => {
  return (
    <section 
      id="contact"
      className="relative min-h-screen w-full flex flex-col items-center justify-center bg-black overflow-hidden"
    >
      <GhostCursor 
        color="#B19EEF"
        brightness={1.2}
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
      
      <div className="relative z-10 w-full max-w-6xl px-4 flex flex-col md:flex-row items-center justify-around gap-12 py-20 pointer-events-none">
        <div className="max-w-md text-center md:text-left pointer-events-auto">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-6">
            Let's Make <span className="text-white/40">Magic.</span>
          </h2>
          <p className="text-lg opacity-50 font-light leading-relaxed mb-10">
            Available for freelance, full-time positions, or just to chat about the latest in AI and Design.
          </p>
          <div className="flex gap-6 mt-4">
            <a href="https://x.com/PradzzyGotALife" target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest opacity-50 hover:opacity-100 hover:text-black hover:bg-white hover:px-3 hover:py-1 hover:rounded-md transition-all duration-300">
              Twitter
            </a>
            <a href="https://github.com/prayasPradzzy" target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest opacity-50 hover:opacity-100 hover:text-black hover:bg-white hover:px-3 hover:py-1 hover:rounded-md transition-all duration-300">
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/prayas-singh-572759362/" target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-widest opacity-50 hover:opacity-100 hover:text-black hover:bg-white hover:px-3 hover:py-1 hover:rounded-md transition-all duration-300">
              LinkedIn
            </a>
          </div>
        </div>

        <div className="relative z-20 pointer-events-auto">
          <ProfileCard 
            onContactClick={() => window.open('mailto:hello@prayas.dev')}
            behindGlowColor="rgba(177, 158, 239, 0.2)"
            innerGradient="linear-gradient(145deg, #0a0a0a 0%, #2D1B4E 100%)"
          />
        </div>
      </div>

      <footer className="absolute bottom-8 left-0 right-0 text-center text-[10px] uppercase tracking-[0.4em] opacity-20 pointer-events-none">
        &copy; 2026 Prayas Singh — Handcrafted with Passion
      </footer>
    </section>
  );
};

export default Contact;
