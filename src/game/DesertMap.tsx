import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AtmosphericParticles } from './Effects';

function Wall({ position, size, color = '#c4a36e' }: {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.85} metalness={0.05} />
    </mesh>
  );
}

function DetailedCrate({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const s = 1.2 * scale;
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[s, s, s]} />
        <meshStandardMaterial color="#8B6914" roughness={0.75} />
      </mesh>
      {/* Metal edges */}
      {[[-1, 0], [1, 0], [0, -1], [0, 1]].map(([x, z], i) => (
        <mesh key={i} position={[(x * s) / 2, 0, (z * s) / 2]}>
          <boxGeometry args={[x ? 0.02 : s, s, z ? 0.02 : s]} />
          <meshStandardMaterial color="#555" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
      {/* Stencil marking */}
      <mesh position={[0, 0, s / 2 + 0.005]}>
        <planeGeometry args={[s * 0.5, s * 0.3]} />
        <meshBasicMaterial color="#5a4a10" />
      </mesh>
    </group>
  );
}

function DetailedBarrel({ position }: { position: [number, number, number] }) {
  return (
    <group position={[position[0], position[1] + 0.6, position[2]]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.4, 0.45, 1.2, 12]} />
        <meshStandardMaterial color="#4a5a3a" roughness={0.6} metalness={0.35} />
      </mesh>
      {/* Metal bands */}
      {[-0.4, 0, 0.4].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.42, 0.015, 6, 16]} />
          <meshStandardMaterial color="#333" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

function Palm({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Trunk with segments */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[Math.sin(i * 0.2) * 0.1, i * 0.7, Math.cos(i * 0.15) * 0.05]} castShadow>
          <cylinderGeometry args={[0.18 - i * 0.01, 0.2 - i * 0.01, 0.75, 8]} />
          <meshStandardMaterial color={`hsl(25, 40%, ${18 + i * 2}%)`} roughness={0.9} />
        </mesh>
      ))}
      {/* Fronds */}
      {[0, 1.2, 2.4, 3.6, 4.8, 5.8].map((r, i) => (
        <group key={i} position={[0, 5.8, 0]} rotation={[0.6 + Math.random() * 0.3, r, 0]}>
          <mesh>
            <boxGeometry args={[0.4, 0.03, 2.8]} />
            <meshStandardMaterial color={`hsl(${95 + i * 5}, 55%, ${22 + i * 3}%)`} roughness={0.8} side={THREE.DoubleSide} />
          </mesh>
          {/* Leaf segments */}
          {[0.6, 1.2, 1.8, 2.2].map((d, j) => (
            <mesh key={j} position={[0.15, -0.02, -d]} rotation={[0.1 * j, 0, 0.3]}>
              <boxGeometry args={[0.35, 0.02, 0.4]} />
              <meshStandardMaterial color={`hsl(${100 + j * 5}, 50%, ${25 + j * 2}%)`} roughness={0.85} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Coconuts */}
      {[[-0.15, 5.6, 0.1], [0.1, 5.5, -0.12]].map(([x, y, z], i) => (
        <mesh key={`coco-${i}`} position={[x, y, z]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial color="#5a3a1a" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function Tower({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Wall position={[0, 4, 0]} size={[4, 8, 4]} color="#b09060" />
      <Wall position={[0, 8.2, 0]} size={[4.5, 0.4, 4.5]} color="#a08050" />
      {/* Battlements */}
      {[-1.5, 0, 1.5].map((x, i) => (
        <Wall key={`b-${i}`} position={[x, 8.8, 2.1]} size={[0.8, 0.8, 0.3]} color="#a08050" />
      ))}
      {[-1.5, 0, 1.5].map((z, i) => (
        <Wall key={`bs-${i}`} position={[2.1, 8.8, z]} size={[0.3, 0.8, 0.8]} color="#a08050" />
      ))}
      {/* Window slits with depth */}
      {[[2.01, 6, 0], [-2.01, 6, 0], [0, 6, 2.01]].map(([x, y, z], i) => (
        <group key={i}>
          <mesh position={[x, y, z]}><boxGeometry args={[x ? 0.15 : 0.3, 0.8, x ? 0.3 : 0.15]} /><meshBasicMaterial color="#0a0a0a" /></mesh>
          <mesh position={[x * 0.95, y, z * 0.95]}><boxGeometry args={[x ? 0.05 : 0.35, 0.85, x ? 0.35 : 0.05]} /><meshStandardMaterial color="#7a6040" roughness={0.9} /></mesh>
        </group>
      ))}
      {/* Torch */}
      <pointLight position={[2.3, 5, 0]} color="#ff8833" intensity={2} distance={8} decay={2} />
      <mesh position={[2.3, 5, 0]}><sphereGeometry args={[0.05, 6, 6]} /><meshBasicMaterial color="#ffaa33" /></mesh>
    </group>
  );
}

function Ruins({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Wall position={[0, 1.5, 0]} size={[6, 3, 0.5]} color="#a89070" />
      <Wall position={[-2.5, 2.5, 0]} size={[1, 5, 0.5]} color="#a89070" />
      <Wall position={[2.5, 1, 0]} size={[1, 2, 0.5]} color="#a89070" />
      {/* More rubble pieces */}
      {[[1, 0.3, 0.8, 0.3, 0.5, 0.2], [-0.5, 0.2, 1.2, -0.1, 0.2, 0.4], [2, 0.15, 0.5, 0.5, -0.3, 0.1]].map(([x, y, z, rx, ry, rz], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[rx, ry, rz]} castShadow receiveShadow>
          <boxGeometry args={[0.8 + Math.random() * 0.5, 0.4 + Math.random() * 0.3, 0.6 + Math.random() * 0.4]} />
          <meshStandardMaterial color={`hsl(30, 20%, ${55 + i * 5}%)`} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function SandDune({ position, radius = 5, height = 2 }: { position: [number, number, number]; radius?: number; height?: number }) {
  return (
    <mesh position={[position[0], height * 0.4, position[2]]} receiveShadow castShadow>
      <sphereGeometry args={[radius, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
      <meshStandardMaterial color="#d4a853" roughness={1} />
    </mesh>
  );
}

function GradientSky() {
  const skyRef = useRef<THREE.Mesh>(null);
  const mat = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#1a3a6a');
    grad.addColorStop(0.3, '#4a8ac0');
    grad.addColorStop(0.55, '#8ac4e8');
    grad.addColorStop(0.75, '#c8dce8');
    grad.addColorStop(0.9, '#e8d8b8');
    grad.addColorStop(1, '#d4a853');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1, 512);
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  return (
    <mesh ref={skyRef}>
      <sphereGeometry args={[90, 32, 32]} />
      <meshBasicMaterial map={mat} side={THREE.BackSide} />
    </mesh>
  );
}

// Sun disc
function Sun() {
  return (
    <group position={[50, 55, -30]}>
      <mesh>
        <sphereGeometry args={[5, 16, 16]} />
        <meshBasicMaterial color="#fff8e0" />
      </mesh>
      {/* Sun glow */}
      <pointLight color="#ffe0a0" intensity={3} distance={120} decay={1} />
    </group>
  );
}

export default function DesertMap() {
  const sandTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#d4a853';
    ctx.fillRect(0, 0, 1024, 1024);
    // Multi-layer noise
    for (let i = 0; i < 20000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const l = Math.random();
      ctx.fillStyle = `rgba(${140 + l * 60}, ${120 + l * 50}, ${40 + l * 50}, ${0.15 + l * 0.2})`;
      ctx.fillRect(x, y, 1 + Math.random() * 3, 1 + Math.random() * 3);
    }
    // Darker patches
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(120, 90, 40, 0.08)`;
      ctx.beginPath();
      ctx.arc(Math.random() * 1024, Math.random() * 1024, 20 + Math.random() * 40, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(16, 16);
    return tex;
  }, []);

  const wallColor = '#c4a36e';
  const wallDark = '#a08050';

  return (
    <group>
      {/* Ground with normal-mapped feel */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120, 64, 64]} />
        <meshStandardMaterial map={sandTexture} roughness={1} />
      </mesh>

      {/* Sand dunes - larger and more natural */}
      <SandDune position={[-30, 0, -35]} radius={8} height={2.5} />
      <SandDune position={[25, 0, -40]} radius={6} height={1.8} />
      <SandDune position={[40, 0, 30]} radius={7} height={2} />
      <SandDune position={[-40, 0, 25]} radius={9} height={2.8} />
      <SandDune position={[15, 0, 42]} radius={5} height={1.5} />
      <SandDune position={[-20, 0, -42]} radius={6} height={2} />

      {/* Outer perimeter */}
      <Wall position={[0, 3, -50]} size={[100, 6, 1.5]} color={wallColor} />
      <Wall position={[0, 3, 50]} size={[100, 6, 1.5]} color={wallColor} />
      <Wall position={[-50, 3, 0]} size={[1.5, 6, 100]} color={wallColor} />
      <Wall position={[50, 3, 0]} size={[1.5, 6, 100]} color={wallColor} />

      {/* Central compound - bombsite A */}
      <Wall position={[0, 2, -10]} size={[16, 4, 1]} color={wallDark} />
      <Wall position={[-8, 2, -5]} size={[1, 4, 10]} color={wallDark} />
      <Wall position={[8, 2, -5]} size={[1, 4, 10]} color={wallDark} />
      <Wall position={[-3, 2, 0]} size={[9, 4, 1]} color={wallDark} />
      <Wall position={[0, 4.1, -5]} size={[16.5, 0.3, 10.5]} color="#9a7a50" />

      {/* Side corridors */}
      <Wall position={[-20, 2, -20]} size={[1, 4, 20]} color={wallColor} />
      <Wall position={[-20, 2, -30]} size={[15, 4, 1]} color={wallColor} />
      <Wall position={[20, 2, -20]} size={[1, 4, 20]} color={wallColor} />
      <Wall position={[20, 2, -30]} size={[15, 4, 1]} color={wallColor} />

      {/* Sniper alley */}
      <Wall position={[-15, 2, 15]} size={[1, 4, 25]} color={wallDark} />
      <Wall position={[15, 2, 15]} size={[1, 4, 25]} color={wallDark} />

      {/* Multi-level platforms */}
      <Wall position={[-35, 1.5, -10]} size={[8, 0.3, 8]} color={wallDark} />
      <Wall position={[-35, 3, -10]} size={[6, 0.3, 6]} color={wallDark} />
      {[0, 1, 2, 3, 4].map(i => (
        <Wall key={`stair-l-${i}`} position={[-31 + i * 0.6, 0.3 + i * 0.3, -10]} size={[0.6, 0.3, 3]} color={wallColor} />
      ))}
      <Wall position={[35, 1.5, -10]} size={[8, 0.3, 8]} color={wallDark} />
      {[0, 1, 2, 3, 4].map(i => (
        <Wall key={`stair-r-${i}`} position={[31 + i * 0.6, 0.3 + i * 0.3, -10]} size={[0.6, 0.3, 3]} color={wallColor} />
      ))}

      {/* Cover */}
      <Wall position={[-30, 1.5, 10]} size={[6, 3, 1]} color={wallColor} />
      <Wall position={[30, 1.5, 10]} size={[6, 3, 1]} color={wallColor} />
      <Wall position={[-30, 1.5, -10]} size={[6, 3, 1]} color={wallColor} />
      <Wall position={[30, 1.5, -10]} size={[6, 3, 1]} color={wallColor} />

      {/* Pillboxes */}
      <Wall position={[0, 1, 20]} size={[4, 2, 4]} color={wallDark} />
      <Wall position={[-25, 1, 0]} size={[3, 2, 3]} color={wallDark} />
      <Wall position={[25, 1, 0]} size={[3, 2, 3]} color={wallDark} />

      {/* Towers */}
      <Tower position={[-42, 0, -42]} />
      <Tower position={[42, 0, -42]} />

      {/* Ruins */}
      <Ruins position={[10, 0, 35]} />
      <Ruins position={[-20, 0, 40]} />

      {/* Crates */}
      <DetailedCrate position={[-5, 0.6, 5]} />
      <DetailedCrate position={[-4, 0.6, 5.5]} />
      <DetailedCrate position={[-4.5, 1.8, 5.2]} />
      <DetailedCrate position={[10, 0.6, -15]} />
      <DetailedCrate position={[11, 0.6, -15]} />
      <DetailedCrate position={[-10, 0.6, 25]} />
      <DetailedCrate position={[35, 0.6, 20]} />
      <DetailedCrate position={[36, 0.6, 20]} />
      <DetailedCrate position={[-35, 0.6, -20]} />
      <DetailedCrate position={[0, 0.6, -35]} />
      <DetailedCrate position={[1.2, 0.6, -35]} />
      <DetailedCrate position={[0.6, 1.8, -35]} />

      {/* Barrels */}
      <DetailedBarrel position={[5, 0, 8]} />
      <DetailedBarrel position={[6, 0, 8.5]} />
      <DetailedBarrel position={[-12, 0, -5]} />
      <DetailedBarrel position={[25, 0, -25]} />
      <DetailedBarrel position={[-25, 0, 25]} />
      <DetailedBarrel position={[15, 0, -35]} />
      <DetailedBarrel position={[-15, 0, 35]} />

      {/* Palms */}
      <Palm position={[-40, 0, 35]} />
      <Palm position={[38, 0, 40]} />
      <Palm position={[-42, 0, -25]} />
      <Palm position={[44, 0, 10]} />
      <Palm position={[0, 0, 45]} />

      {/* Ramp */}
      <mesh position={[-35, 1, -35]} rotation={[0, 0, 0.15]} castShadow receiveShadow>
        <boxGeometry args={[8, 0.3, 5]} />
        <meshStandardMaterial color={wallDark} roughness={0.8} />
      </mesh>

      {/* Archways */}
      <Wall position={[-3, 3, 25]} size={[1, 6, 1]} color={wallColor} />
      <Wall position={[3, 3, 25]} size={[1, 6, 1]} color={wallColor} />
      <Wall position={[0, 5.5, 25]} size={[7, 1, 1]} color={wallColor} />
      <Wall position={[-3, 3, -25]} size={[1, 6, 1]} color={wallColor} />
      <Wall position={[3, 3, -25]} size={[1, 6, 1]} color={wallColor} />
      <Wall position={[0, 5.5, -25]} size={[7, 1, 1]} color={wallColor} />

      {/* Market stalls */}
      {[-8, 0, 8].map((x, i) => (
        <group key={`stall-${i}`} position={[x, 0, -38]}>
          <Wall position={[0, 1.2, 0]} size={[3, 0.1, 2]} color="#8B4513" />
          <mesh position={[-1.3, 0.6, 0]}><cylinderGeometry args={[0.06, 0.06, 1.2, 6]} /><meshStandardMaterial color="#8B4513" roughness={0.8} /></mesh>
          <mesh position={[1.3, 0.6, 0]}><cylinderGeometry args={[0.06, 0.06, 1.2, 6]} /><meshStandardMaterial color="#8B4513" roughness={0.8} /></mesh>
          <mesh position={[0, 2.2, 0]}><boxGeometry args={[3.2, 0.05, 2.2]} /><meshStandardMaterial color={['#c44', '#cc8844', '#4488cc'][i]} roughness={0.9} side={THREE.DoubleSide} /></mesh>
          {/* Goods on stall */}
          {Array.from({ length: 4 }, (_, j) => (
            <mesh key={j} position={[-0.8 + j * 0.5, 1.35, 0]}>
              <sphereGeometry args={[0.08 + Math.random() * 0.05, 6, 6]} />
              <meshStandardMaterial color={['#dd6633', '#88aa22', '#cc9933', '#aa4455'][j]} roughness={0.7} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Atmospheric particles - floating dust */}
      <AtmosphericParticles count={150} color="#d4a85380" speed={0.5} />

      {/* Gradient sky */}
      <GradientSky />
      <Sun />

      {/* Lighting */}
      <directionalLight
        position={[30, 40, 20]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.001}
        color="#fff5e0"
      />
      <ambientLight intensity={0.5} color="#ffe4b5" />
      <hemisphereLight args={['#87CEEB', '#d4a853', 0.5]} />
      {/* Rim lights for depth */}
      <directionalLight position={[-20, 10, -30]} intensity={0.4} color="#ffa040" />
    </group>
  );
}
