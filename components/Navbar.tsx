
import React from 'react';

const Navbar: React.FC = () => {
  const navItems = ['Home', 'Projects', 'Contact'];

  const scrollToSection = (label: string) => {
    const sectionId = `#${label.toLowerCase()}`;
    const lenis = (window as any).lenis;
    
    if (lenis) {
      lenis.scrollTo(sectionId, {
        offset: 0, 
        duration: 1.8,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        // Ensure ScrollTrigger updates after scroll
        onComplete: () => {
          import('gsap/ScrollTrigger').then(({ ScrollTrigger }) => {
            ScrollTrigger.refresh();
          });
        }
      });
    } else {
      const el = document.querySelector(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-auto">
      <div className="glass px-8 py-3 rounded-full flex items-center gap-10">
        {navItems.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => scrollToSection(item)}
            className="relative group text-[10px] font-bold tracking-[0.3em] uppercase transition-all duration-300 active:scale-95"
          >
            <span className="opacity-40 group-hover:opacity-100 transition-opacity duration-300">
              {item}
            </span>
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#F5F5F5] transition-all duration-300 group-hover:w-full opacity-50" />
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
