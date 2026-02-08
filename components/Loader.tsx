
import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface LoaderProps {
  onComplete: () => void;
}

const Loader: React.FC<LoaderProps> = ({ onComplete }) => {
  const counterRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Counter animation
      const obj = { value: 0 };
      gsap.to(obj, {
        value: 100,
        duration: 2.5,
        ease: "power2.inOut",
        onUpdate: () => {
          setCount(Math.floor(obj.value));
        },
        onComplete: () => {
          // Exit transition
          gsap.to(containerRef.current, {
            scale: 2.5,
            opacity: 0,
            duration: 1.2,
            ease: "expo.inOut",
            onComplete: onComplete
          });
        }
      });
    });
    return () => ctx.revert();
  }, [onComplete]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden"
    >
      <div className="relative text-center">
        <div 
          ref={counterRef}
          className="text-8xl md:text-[12rem] font-bold tracking-tighter text-[#F5F5F5]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {count}%
        </div>
        <div className="text-xs uppercase tracking-[0.4em] opacity-40 mt-4">
          Architecting Reality
        </div>
      </div>
    </div>
  );
};

export default Loader;
