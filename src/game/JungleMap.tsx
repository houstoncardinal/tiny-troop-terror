import { useMemo } from 'react';
import * as THREE from 'three';
import { AtmosphericParticles } from './Effects';

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
      {/* Trunk with buttress roots */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.35, height, 8]} />
        <meshStandardMaterial color="#3a2515" roughness={0.9} />
      </mesh>
      {/* Buttress roots */}
      {[0, 1.5, 3, 4.5].map((r, i) => (
        <mesh key={`root-${i}`} position={[Math.cos(r) * 0.3, 0.5, Math.sin(r) * 0.3]} rotation={[Math.sin(r) * 0.3, 0, -Math.cos(r) * 0.3]}>
          <boxGeometry args={[0.08, 1.2, 0.2]} />
          <meshStandardMaterial color="#3a2a18" roughness={0.9} />
        </mesh>
      ))}
      {/* Canopy layers */}
      {[0, 0.8, 1.6, 2.2].map((off, i) => (
        <mesh key={i} position={[0, height + off, 0]} castShadow>
          <sphereGeometry args={[2.8 - i * 0.45, 10, 8]} />
          <meshStandardMaterial color={`hsl(${105 + i * 8}, ${50 - i * 3}%, ${20 + i * 5}%)`} roughness={0.85} />
        </mesh>
      ))}
      {/* Hanging vines */}
      {[0, 1.2, 2.5, 3.8, 5].map((r, i) => (
        <mesh key={`vine-${i}`} position={[Math.cos(r) * 1.8, height - 2 + Math.random(), Math.sin(r) * 1.8]}>
          <cylinderGeometry args={[0.015, 0.02, 2.5 + Math.random() * 2, 4]} />
          <meshStandardMaterial color={`hsl(${110 + i * 5}, 40%, ${20 + i * 3}%)`} roughness={0.9} />
        </mesh>
      ))}
      {/* Epiphytes / moss patches */}
      {[0, 2, 4].map((y, i) => (
        <mesh key={`moss-${i}`} position={[0.2, y + 1, 0.15]} rotation={[0, i * 1.2, 0]}>
          <sphereGeometry args={[0.12, 6, 4]} />
          <meshStandardMaterial color="#2a5a1a" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

function TempleRuin({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Wall position={[0, 0.5, 0]} size={[10, 1, 10]} color="#6a6a5a" />
      <Wall position={[0, 1.5, 0]} size={[8, 1, 8]} color="#6a6a5a" />
      <Wall position={[0, 2.5, 0]} size={[6, 1, 6]} color="#6a6a5a" />
      {/* Weathered pillars */}
      {[[-2, -2], [2, -2], [-2, 2], [2, 2]].map(([x, z], i) => (
        <group key={i}>
          <mesh position={[x, 4.5, z]} castShadow>
            <cylinderGeometry args={[0.28, 0.38, 5, 10]} />
            <meshStandardMaterial color="#7a7a6a" roughness={0.85} />
          </mesh>
          {/* Pillar cracks / moss */}
          <mesh position={[x + 0.2, 3 + i * 0.3, z]}>
            <sphereGeometry args={[0.15, 5, 4]} />
            <meshStandardMaterial color="#3a5a2a" roughness={1} />
          </mesh>
        </group>
      ))}
      <Wall position={[-1, 7, 0]} size={[3, 0.3, 5]} color="#6a6a5a" />
      {/* Moss covering */}
      <mesh position={[0, 3.06, 0]}><boxGeometry args={[5.8, 0.06, 5.8]} /><meshStandardMaterial color="#2a4a1a" roughness={1} /></mesh>
      {/* Carved face */}
      <mesh position={[0, 2, 3.05]}>
        <boxGeometry args={[1.5, 1.5, 0.1]} />
        <meshStandardMaterial color="#5a5a4a" roughness={0.8} />
      </mesh>
      <mesh position={[-0.3, 2.3, 3.12]}><sphereGeometry args={[0.1, 6, 6]} /><meshBasicMaterial color="#1a1a0a" /></mesh>
      <mesh position={[0.3, 2.3, 3.12]}><sphereGeometry args={[0.1, 6, 6]} /><meshBasicMaterial color="#1a1a0a" /></mesh>
      {/* Torch */}
      <pointLight position={[0, 4, 3.5]} color="#ff8833" intensity={2} distance={10} decay={2} />
    </group>
  );
}

function Rock({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <dodecahedronGeometry args={[scale, 1]} />
        <meshStandardMaterial color="#5a5a50" roughness={0.9} />
      </mesh>
      {/* Moss on top */}
      <mesh position={[0, scale * 0.7, 0]}>
        <sphereGeometry args={[scale * 0.6, 6, 4, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#2a5a1a" roughness={1} />
      </mesh>
    </group>
  );
}

function WaterPool({ position, radius = 5 }: { position: [number, number, number]; radius?: number }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[position[0], 0.05, position[2]]}>
        <circleGeometry args={[radius, 32]} />
        <meshStandardMaterial color="#1a5a3a" roughness={0.05} metalness={0.25} transparent opacity={0.65} />
      </mesh>
      {/* Lily pads */}
      {Array.from({ length: 4 }, (_, i) => {
        const angle = i * Math.PI / 2 + Math.random();
        const dist = radius * 0.4 + Math.random() * radius * 0.3;
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, angle]} position={[position[0] + Math.cos(angle) * dist, 0.06, position[2] + Math.sin(angle) * dist]}>
            <circleGeometry args={[0.2 + Math.random() * 0.15, 8]} />
            <meshStandardMaterial color="#2a6a2a" roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
}

function Fireflies() {
  return <AtmosphericParticles count={80} color="#aaff44" speed={0.3} spread={50} height={8} />;
}

function TropicalSky() {
  const mat = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#1a2a1a');
    grad.addColorStop(0.2, '#2a4a3a');
    grad.addColorStop(0.4, '#3a6a4a');
    grad.addColorStop(0.6, '#5a8a5a');
    grad.addColorStop(0.8, '#7aaa6a');
    grad.addColorStop(1, '#3a5a2a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1, 512);
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <mesh>
      <sphereGeometry args={[90, 32, 32]} />
      <meshBasicMaterial map={mat} side={THREE.BackSide} />
    </mesh>
  );
}

export default function JungleMap() {
  const groundTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#3a5a2a';
    ctx.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 15000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const l = Math.random();
      ctx.fillStyle = `rgba(${25 + l * 45}, ${50 + l * 55}, ${15 + l * 35}, ${0.2 + l * 0.25})`;
      ctx.fillRect(x, y, 1 + Math.random() * 3, 1 + Math.random() * 3);
    }
    // Darker mud patches
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(40, 30, 15, 0.12)`;
      ctx.beginPath();
      ctx.arc(Math.random() * 1024, Math.random() * 1024, 15 + Math.random() * 30, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(16, 16);
    return tex;
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial map={groundTexture} roughness={1} />
      </mesh>

      {/* Perimeter */}
      <Wall position={[0, 3, -50]} size={[100, 6, 2]} color="#2a4a1a" />
      <Wall position={[0, 3, 50]} size={[100, 6, 2]} color="#2a4a1a" />
      <Wall position={[-50, 3, 0]} size={[2, 6, 100]} color="#2a4a1a" />
      <Wall position={[50, 3, 0]} size={[2, 6, 100]} color="#2a4a1a" />

      <TempleRuin position={[0, 0, -15]} />

      {/* Pathways */}
      <Wall position={[-12, 1.5, 10]} size={[1, 3, 20]} color="#5a5a4a" />
      <Wall position={[12, 1.5, 10]} size={[1, 3, 20]} color="#5a5a4a" />
      <Wall position={[-20, 1.5, -5]} size={[16, 3, 1]} color="#5a5a4a" />
      <Wall position={[20, 1.5, -5]} size={[16, 3, 1]} color="#5a5a4a" />

      {/* Elevated wooden platforms */}
      {[[-30, 20], [30, 20]].map(([x, z], pi) => (
        <group key={`plat-${pi}`}>
          <Wall position={[x, 2, z]} size={[8, 0.2, 6]} color="#6a4a2a" />
          {[[-3, -2.5], [3, -2.5], [-3, 2.5], [3, 2.5]].map(([dx, dz], i) => (
            <mesh key={i} position={[x + dx, 1, z + dz]} castShadow>
              <cylinderGeometry args={[0.1, 0.14, 2, 6]} />
              <meshStandardMaterial color="#5a3a1a" roughness={0.9} />
            </mesh>
          ))}
          {/* Rope railing */}
          <mesh position={[x, 2.6, z + 3.1]}>
            <boxGeometry args={[8, 0.04, 0.04]} />
            <meshStandardMaterial color="#8a6a3a" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Rope bridge */}
      <Wall position={[0, 2.5, 20]} size={[24, 0.1, 1.5]} color="#8a6a3a" />
      {/* Bridge ropes */}
      <mesh position={[0, 3, 20.6]}><boxGeometry args={[24, 0.03, 0.03]} /><meshStandardMaterial color="#6a5a3a" roughness={0.9} /></mesh>
      <mesh position={[0, 3, 19.4]}><boxGeometry args={[24, 0.03, 0.03]} /><meshStandardMaterial color="#6a5a3a" roughness={0.9} /></mesh>

      {/* Water */}
      <WaterPool position={[-25, 0, -30]} radius={7} />
      <WaterPool position={[20, 0, 35]} radius={5} />

      {/* Rocks */}
      <Rock position={[-8, 0.8, 25]} scale={1.3} />
      <Rock position={[15, 0.6, 30]} scale={0.9} />
      <Rock position={[-20, 1, -35]} scale={1.6} />
      <Rock position={[30, 0.7, -20]} />
      <Rock position={[-35, 0.5, 10]} scale={0.7} />

      {/* Trees */}
      {[
        [-35, 35, 10], [38, 38, 9], [-42, -25, 8], [42, -10, 11],
        [-38, 0, 9], [40, 5, 10], [0, 42, 8], [-15, 40, 7],
        [25, 42, 9], [-42, 15, 10], [42, 30, 8], [-30, -40, 9],
        [-8, -42, 7], [35, -38, 8],
      ].map(([x, z, h], i) => (
        <JungleTree key={i} position={[x, 0, z]} height={h} />
      ))}

      {/* Bushes / ferns */}
      {Array.from({ length: 30 }).map((_, i) => (
        <group key={`fern-${i}`} position={[(Math.random() - 0.5) * 80, 0, (Math.random() - 0.5) * 80]}>
          <mesh position={[0, 0.3, 0]} castShadow>
            <sphereGeometry args={[0.4 + Math.random() * 0.4, 8, 6]} />
            <meshStandardMaterial color={`hsl(${95 + Math.random() * 35}, ${40 + Math.random() * 15}%, ${18 + Math.random() * 12}%)`} roughness={0.9} />
          </mesh>
          {/* Fern fronds */}
          {[0, 1.5, 3, 4.5].map((r, j) => (
            <mesh key={j} position={[Math.cos(r) * 0.4, 0.35, Math.sin(r) * 0.4]} rotation={[0.5, r, 0]}>
              <boxGeometry args={[0.08, 0.02, 0.5]} />
              <meshStandardMaterial color="#2a5a1a" roughness={0.9} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Fireflies */}
      <Fireflies />

      {/* Sky */}
      <TropicalSky />

      {/* Lighting - warm, filtered */}
      <directionalLight
        position={[25, 35, 20]}
        intensity={1.6}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.001}
        color="#ffe0a0"
      />
      <ambientLight intensity={0.35} color="#80a080" />
      <hemisphereLight args={['#4a7a4a', '#2a4a1a', 0.5]} />
      {/* God rays feel */}
      <directionalLight position={[10, 25, -5]} intensity={0.6} color="#ffe8a0" />
      <directionalLight position={[-15, 20, 10]} intensity={0.3} color="#a0ffa0" />
    </group>
  );
}
