
import React, { useRef, useLayoutEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const PixelSnow: React.FC = () => {
  const ref = useRef<THREE.Points>(null!);
  const [positions] = React.useState(() => {
    const pos = new Float32Array(5000 * 3);
    for (let i = 0; i < 5000; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  });

  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.05;
      ref.current.position.y -= delta * 0.15;
      if (ref.current.position.y < -5) ref.current.position.y = 5;
    }
  });

  return (
    <Points positions={positions} ref={ref}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.012}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null!);
  const textRef = useRef<HTMLDivElement>(null!);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Initial Reveal
      gsap.from(".reveal-text", {
        y: 100,
        opacity: 0,
        duration: 1.5,
        stagger: 0.1,
        ease: "power4.out",
        delay: 0.5
      });

      // Parallax Effect
      gsap.to(textRef.current, {
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
        y: 200,
        opacity: 0,
        ease: "none"
      });
      
      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="home" ref={containerRef} className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <PixelSnow />
        </Canvas>
      </div>
      
      <div ref={textRef} className="relative z-10 text-center px-6 select-none pointer-events-none">
        <div className="reveal-container mb-2 overflow-hidden">
          <h1 className="reveal-text font-syncopate text-5xl md:text-[10rem] font-bold leading-none tracking-tighter text-[#F5F5F5] uppercase">
            Prayas Singh
          </h1>
        </div>
        <div className="reveal-container overflow-hidden">
          <p className="reveal-text text-[8px] md:text-sm tracking-[0.6em] text-white/40 uppercase font-light">
            Web Developer | Designer | Cybersecurity | AI Enthusiast
          </p>
        </div>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-4 opacity-50">
        <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white/50 to-transparent" />
        <span className="text-[7px] tracking-[0.5em] text-white uppercase">Scroll</span>
      </div>
    </section>
  );
};

export default Hero;
