import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// How far the whole field is pushed per pixel of cursor movement, and the cap on that push.
const PUSH_PER_PX = 0.0001;
const MAX_PUSH = 0.6;

const Snow: React.FC = () => {
  const ref = useRef<THREE.Points>(null!);
  const group = useRef<THREE.Group>(null!);
  const push = useRef({ x: 0, y: 0 });

  // The field drifts opposite to the cursor's movement, then settles back.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let last: { x: number; y: number } | null = null;
    const onMove = (e: PointerEvent) => {
      if (last) {
        const p = push.current;
        p.x = THREE.MathUtils.clamp(p.x - (e.clientX - last.x) * PUSH_PER_PX, -MAX_PUSH, MAX_PUSH);
        p.y = THREE.MathUtils.clamp(p.y + (e.clientY - last.y) * PUSH_PER_PX, -MAX_PUSH, MAX_PUSH);
      }
      last = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => (last = null);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, []);
  const [positions] = useState(() => {
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
    if (group.current) {
      const p = push.current;
      const settle = Math.exp(-1.8 * delta);
      p.x *= settle;
      p.y *= settle;
      const follow = 1 - Math.exp(-5 * delta);
      group.current.position.x += (p.x - group.current.position.x) * follow;
      group.current.position.y += (p.y - group.current.position.y) * follow;
    }
  });

  return (
    <group ref={group}>
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
    </group>
  );
};

// Loaded on its own so three.js never blocks the first paint; fades in once WebGL is up.
const PixelSnow: React.FC<{ active: boolean }> = ({ active }) => {
  const [ready, setReady] = useState(false);
  return (
    <div className={`h-full w-full transition-opacity duration-1000 ${ready ? 'opacity-100' : 'opacity-0'}`}>
      <Canvas camera={{ position: [0, 0, 5] }} frameloop={active ? 'always' : 'never'} onCreated={() => setReady(true)}>
        <Snow />
      </Canvas>
    </div>
  );
};

export default PixelSnow;
