import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const Snow: React.FC = () => {
  const ref = useRef<THREE.Points>(null!);
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
