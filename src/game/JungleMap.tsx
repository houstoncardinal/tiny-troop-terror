import { useMemo } from 'react';
import * as THREE from 'three';

function Wall({ position, size, color = '#5a6a4a' }: {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
}

function JungleTree({ position, height = 8 }: { position: [number, number, number]; height?: number }) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.3, height, 6]} />
        <meshStandardMaterial color="#3a2a15" roughness={0.9} />
      </mesh>
      {/* Canopy layers */}
      {[0, 0.8, 1.6].map((off, i) => (
        <mesh key={i} position={[0, height + off, 0]} castShadow>
          <sphereGeometry args={[2.5 - i * 0.4, 8, 6]} />
          <meshStandardMaterial color={`hsl(${110 + i * 10}, 50%, ${25 + i * 5}%)`} roughness={0.8} />
        </mesh>
      ))}
      {/* Hanging vines */}
      {[0, 1.5, 3].map((r, i) => (
        <mesh key={`vine-${i}`} position={[Math.cos(r) * 1.5, height - 1.5, Math.sin(r) * 1.5]}>
          <cylinderGeometry args={[0.02, 0.02, 3, 4]} />
          <meshStandardMaterial color="#2a5a1a" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function TempleRuin({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base platform */}
      <Wall position={[0, 0.5, 0]} size={[10, 1, 10]} color="#6a6a5a" />
      <Wall position={[0, 1.5, 0]} size={[8, 1, 8]} color="#6a6a5a" />
      <Wall position={[0, 2.5, 0]} size={[6, 1, 6]} color="#6a6a5a" />
      {/* Pillars */}
      {[[-2, -2], [2, -2], [-2, 2], [2, 2]].map(([x, z], i) => (
        <mesh key={i} position={[x, 4.5, z]} castShadow>
          <cylinderGeometry args={[0.3, 0.35, 5, 8]} />
          <meshStandardMaterial color="#7a7a6a" roughness={0.8} />
        </mesh>
      ))}
      {/* Roof fragment */}
      <Wall position={[-1, 7, 0]} size={[3, 0.3, 5]} color="#6a6a5a" />
      {/* Moss */}
      <mesh position={[0, 3.05, 0]}>
        <boxGeometry args={[5.8, 0.05, 5.8]} />
        <meshStandardMaterial color="#3a5a2a" roughness={1} />
      </mesh>
    </group>
  );
}

function Rock({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <mesh position={position} castShadow>
      <dodecahedronGeometry args={[scale, 0]} />
      <meshStandardMaterial color="#5a5a50" roughness={0.9} />
    </mesh>
  );
}

function WaterPool({ position, radius = 5 }: { position: [number, number, number]; radius?: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[position[0], 0.05, position[2]]}>
      <circleGeometry args={[radius, 24]} />
      <meshStandardMaterial color="#2a6a4a" roughness={0.1} metalness={0.2} transparent opacity={0.7} />
    </mesh>
  );
}

export default function JungleMap() {
  const groundTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#3a5a2a';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 8000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = `rgba(${30 + Math.random() * 40}, ${60 + Math.random() * 50}, ${20 + Math.random() * 30}, 0.4)`;
      ctx.fillRect(x, y, 3, 3);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(20, 20);
    return tex;
  }, []);

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial map={groundTexture} roughness={1} />
      </mesh>

      {/* Perimeter - thick vegetation walls */}
      <Wall position={[0, 3, -50]} size={[100, 6, 2]} color="#2a4a1a" />
      <Wall position={[0, 3, 50]} size={[100, 6, 2]} color="#2a4a1a" />
      <Wall position={[-50, 3, 0]} size={[2, 6, 100]} color="#2a4a1a" />
      <Wall position={[50, 3, 0]} size={[2, 6, 100]} color="#2a4a1a" />

      {/* Temple ruin - central landmark */}
      <TempleRuin position={[0, 0, -15]} />

      {/* Pathway walls */}
      <Wall position={[-12, 1.5, 10]} size={[1, 3, 20]} color="#5a5a4a" />
      <Wall position={[12, 1.5, 10]} size={[1, 3, 20]} color="#5a5a4a" />
      <Wall position={[-20, 1.5, -5]} size={[16, 3, 1]} color="#5a5a4a" />
      <Wall position={[20, 1.5, -5]} size={[16, 3, 1]} color="#5a5a4a" />

      {/* Elevated wooden platforms */}
      <Wall position={[-30, 2, 20]} size={[8, 0.2, 6]} color="#6a4a2a" />
      <Wall position={[30, 2, 20]} size={[8, 0.2, 6]} color="#6a4a2a" />
      {/* Platform supports */}
      {[[-33, 20], [-27, 20], [-33, 23], [-27, 23]].map(([x, z], i) => (
        <mesh key={`support-${i}`} position={[x, 1, z]} castShadow>
          <cylinderGeometry args={[0.1, 0.12, 2, 6]} />
          <meshStandardMaterial color="#5a3a1a" roughness={0.9} />
        </mesh>
      ))}

      {/* Rope bridges (simplified) */}
      <Wall position={[0, 2.5, 20]} size={[24, 0.1, 1.5]} color="#8a6a3a" />

      {/* Water features */}
      <WaterPool position={[-25, 0, -30]} radius={6} />
      <WaterPool position={[20, 0, 35]} radius={4} />

      {/* Rocks */}
      <Rock position={[-8, 0.8, 25]} scale={1.2} />
      <Rock position={[15, 0.6, 30]} scale={0.8} />
      <Rock position={[-20, 1, -35]} scale={1.5} />
      <Rock position={[30, 0.7, -20]} />
      <Rock position={[-35, 0.5, 10]} scale={0.6} />

      {/* Trees everywhere */}
      <JungleTree position={[-35, 0, 35]} height={10} />
      <JungleTree position={[38, 0, 38]} height={9} />
      <JungleTree position={[-42, 0, -25]} height={8} />
      <JungleTree position={[42, 0, -10]} height={11} />
      <JungleTree position={[-38, 0, 0]} height={9} />
      <JungleTree position={[40, 0, 5]} height={10} />
      <JungleTree position={[0, 0, 42]} height={8} />
      <JungleTree position={[-15, 0, 40]} height={7} />
      <JungleTree position={[25, 0, 42]} height={9} />
      <JungleTree position={[-42, 0, 15]} height={10} />
      <JungleTree position={[42, 0, 30]} height={8} />
      <JungleTree position={[-30, 0, -40]} height={9} />

      {/* Low bushes/ferns */}
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={`fern-${i}`} position={[
          Math.random() * 80 - 40,
          0.3,
          Math.random() * 80 - 40,
        ]} castShadow>
          <sphereGeometry args={[0.5 + Math.random() * 0.3, 6, 4]} />
          <meshStandardMaterial color={`hsl(${100 + Math.random() * 30}, 45%, ${20 + Math.random() * 15}%)`} roughness={0.9} />
        </mesh>
      ))}

      {/* Sky dome - tropical */}
      <mesh>
        <sphereGeometry args={[80, 32, 32]} />
        <meshBasicMaterial color="#5a8aaa" side={THREE.BackSide} />
      </mesh>

      {/* Lighting - warm humid */}
      <directionalLight
        position={[25, 35, 20]}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        color="#ffe8c0"
      />
      <ambientLight intensity={0.4} color="#a0c0a0" />
      <hemisphereLight args={['#5a8aaa', '#3a5a2a', 0.5]} />
      <fog attach="fog" args={['#4a7a5a', 25, 70]} />
    </group>
  );
}
