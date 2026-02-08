
import React, { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import Loader from './components/Loader';
import Navbar from './components/Navbar';
import Hero from './sections/Hero';
import Projects from './sections/Projects';
import Contact from './sections/Contact';

gsap.registerPlugin(ScrollTrigger);

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // 1. Clear scroll memory on mount
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // 2. Initialize Lenis
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;
    (window as any).lenis = lenis;

    // 3. Sync ScrollTrigger with Lenis
    lenis.on('scroll', ScrollTrigger.update);

    // 4. Drive Lenis with GSAP Ticker
    const tickerUpdate = (time: number) => {
      // GSAP Ticker 'time' is in seconds, Lenis 'raf' expects milliseconds
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerUpdate);
    gsap.ticker.lagSmoothing(0);

    // 5. Global ScrollTrigger defaults
    ScrollTrigger.defaults({
      scroller: window,
    });

    return () => {
      gsap.ticker.remove(tickerUpdate);
      lenis.destroy();
      lenisRef.current = null;
      (window as any).lenis = null;
    };
  }, []);

  // Handle ScrollTrigger refreshing after loading and on resize
  useEffect(() => {
    if (!loading) {
      // Refresh ScrollTrigger after a short delay to ensure DOM is ready
      const timer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 200);

      const resizeObserver = new ResizeObserver(() => {
        ScrollTrigger.refresh();
      });

      resizeObserver.observe(document.body);

      return () => {
        clearTimeout(timer);
        resizeObserver.disconnect();
      };
    }
  }, [loading]);

  return (
    <main className="bg-black text-[#F5F5F5] selection:bg-[#2D1B4E] selection:text-white min-h-screen antialiased">
      {loading && <Loader onComplete={() => setLoading(false)} />}

      {!loading && (
        <div className="relative z-10 w-full">
          <Navbar />
          <div id="smooth-wrapper">
            <Hero />
            <Projects />
          </div>
          <Contact />
        </div>
      )}
    </main>
  );
};

export default App;
