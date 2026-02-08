
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
        brightness={2}
        trailLength={50}
        inertia={0.5}
        bloomStrength={0.15}
        bloomRadius={1}
        bloomThreshold={0.025}
        fadeDelayMs={1000}
        fadeDurationMs={1500}
        zIndex={0}
      />
      
      <div className="relative z-10 w-full max-w-6xl px-4 flex flex-col md:flex-row items-center justify-around gap-12 py-20 pointer-events-none">
        <div className="max-w-md text-center md:text-left pointer-events-auto">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter leading-none mb-6">
            Let's Make <span className="text-white/40">Magic.</span>
          </h2>
          <p className="text-lg opacity-50 font-light leading-relaxed mb-10">
            Available for freelance, full-time positions, or just to chat about the latest in AI and Design.
          </p>
          <div className="flex flex-col gap-4">
            <a href="mailto:hello@prayas.dev" className="text-xl hover:text-[#B19EEF] transition-colors duration-300 border-b border-white/10 pb-2 w-fit">
              hello@prayas.dev
            </a>
            <div className="flex gap-6 mt-4">
              {['Twitter', 'GitHub', 'LinkedIn'].map(link => (
                <a key={link} href="#" className="text-xs uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
                  {link}
                </a>
              ))}
            </div>
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
        &copy; 2024 Prayas Singh — Handcrafted with Passion
      </footer>
    </section>
  );
};

export default Contact;
