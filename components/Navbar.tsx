
import React, { useEffect, useState } from 'react';

const Navbar: React.FC = () => {
  const navItems = ['Home', 'Projects', 'Contact']; // add 'About' back with the About section
  const [active, setActive] = useState('Home');

  // Whichever section crosses the middle of the viewport is the current one.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const match = navItems.find((item) => item.toLowerCase() === e.target.id);
          if (match) setActive(match);
        });
      },
      { rootMargin: '-50% 0px -50% 0px' },
    );
    navItems.forEach((item) => {
      const el = document.getElementById(item.toLowerCase());
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

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
      <div className="glass px-6 md:px-8 py-3 rounded-full flex items-center gap-4 sm:gap-6 md:gap-10">
        {navItems.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => scrollToSection(item)}
            aria-current={active === item ? 'true' : undefined}
            className="relative group text-[11px] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase transition-all duration-300 active:scale-95 rounded-sm"
          >
            <span className={`${active === item ? 'opacity-100' : 'opacity-60'} group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-300`}>
              {item}
            </span>
            <span className={`absolute -bottom-1.5 left-0 h-[2px] rounded-full transition-all duration-500 ${active === item ? 'w-full bg-[#B19EEF] opacity-100' : 'w-0 bg-[#F5F5F5] opacity-50 group-hover:w-full'}`} />
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
