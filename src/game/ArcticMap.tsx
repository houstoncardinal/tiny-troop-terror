import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AtmosphericParticles } from './Effects';

function Wall({ position, size, color = '#d0d8e0' }: {
  position: [number, number, number];
  size: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
}

function IceBlock({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[1.5 * scale, 1.5 * scale, 1.5 * scale]} />
        <meshStandardMaterial color="#88c8e8" roughness={0.05} metalness={0.15} transparent opacity={0.75} />
      </mesh>
      {/* Ice refraction highlight */}
      <mesh position={[0, scale * 0.3, scale * 0.4]}>
        <planeGeometry args={[scale * 0.5, scale * 0.8]} />
        <meshBasicMaterial color="#aaeeff" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function PineTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.18, 3, 8]} />
        <meshStandardMaterial color="#3a2518" roughness={0.9} />
      </mesh>
      {[3, 3.8, 4.5, 5].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow>
          <coneGeometry args={[1.6 - i * 0.35, 1.4 - i * 0.15, 8]} />
          <meshStandardMaterial color={`hsl(${140 + i * 5}, 35%, ${18 + i * 4}%)`} roughness={0.85} />
        </mesh>
      ))}
      {/* Snow caps on each layer */}
      {[3.7, 4.4, 5.1].map((y, i) => (
        <mesh key={`sc-${i}`} position={[0, y, 0]}>
          <coneGeometry args={[1.2 - i * 0.3, 0.2, 8]} />
          <meshStandardMaterial color="#f0f5ff" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 5.5, 0]}>
        <coneGeometry args={[0.4, 0.5, 8]} />
        <meshStandardMaterial color="#f0f5ff" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Bunker({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Wall position={[0, 1.5, 0]} size={[6, 3, 6]} color="#6a7a82" />
      <Wall position={[0, 3.2, 0]} size={[6.5, 0.4, 6.5]} color="#5a6a72" />
      {/* Reinforced edges */}
      {[[-3, 0], [3, 0], [0, -3], [0, 3]].map(([x, z], i) => (
        <mesh key={i} position={[x, 1.5, z]}>
          <boxGeometry args={[x ? 0.15 : 6.2, 3.1, z ? 0.15 : 6.2]} />
          <meshStandardMaterial color="#4a5a62" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[3.01, 2, 0]}><boxGeometry args={[0.1, 1, 2]} /><meshBasicMaterial color="#0a0a15" /></mesh>
      <mesh position={[-3.01, 2, 0]}><boxGeometry args={[0.1, 1, 2]} /><meshBasicMaterial color="#0a0a15" /></mesh>
      {/* Interior light */}
      <pointLight position={[0, 2.5, 0]} color="#aaccff" intensity={1} distance={6} />
    </group>
  );
}

function AuroraSky() {
  const mat = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 0, 512);
    grad.addColorStop(0, '#0a1a2a');
    grad.addColorStop(0.2, '#1a2a4a');
    grad.addColorStop(0.35, '#2a4060');
    grad.addColorStop(0.45, '#4a6888');
    grad.addColorStop(0.6, '#8aaabb');
    grad.addColorStop(0.75, '#b0c0d0');
    grad.addColorStop(0.9, '#c8d4e0');
    grad.addColorStop(1, '#e0e8f0');
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

// Animated snow particles
function SnowFall() {
  return <AtmosphericParticles count={300} color="#ffffff" speed={1.5} spread={80} height={25} />;
}

export default function ArcticMap() {
  const snowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#e0e8f0';
    ctx.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 15000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1024;
      const l = Math.random();
      ctx.fillStyle = `rgba(${215 + l * 40}, ${220 + l * 35}, ${230 + l * 25}, ${0.2 + l * 0.25})`;
      ctx.fillRect(x, y, 1 + Math.random() * 2, 1 + Math.random() * 2);
    }
    // Snow sparkle
    for (let i = 0; i < 200; i++) {
      ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.4})`;
      ctx.beginPath();
      ctx.arc(Math.random() * 1024, Math.random() * 1024, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(16, 16);
    return tex;
  }, []);

  const wallColor = '#c0c8d0';
  const wallDark = '#8a9098';

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial map={snowTexture} roughness={0.75} />
      </mesh>

      {/* Snow mounds */}
      {[[-25, 1.8, -30], [30, 1.4, -35], [35, 1.1, 25], [-38, 1.5, 20], [10, 1, 40], [-15, 1.3, -38]].map(([x, h, z], i) => (
        <mesh key={`mound-${i}`} position={[x, (h as number) * 0.4, z]} receiveShadow>
          <sphereGeometry args={[(h as number) * 5, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#dde5ed" roughness={0.85} />
        </mesh>
      ))}

      {/* Perimeter */}
      <Wall position={[0, 3, -50]} size={[100, 6, 1.5]} color={wallColor} />
      <Wall position={[0, 3, 50]} size={[100, 6, 1.5]} color={wallColor} />
      <Wall position={[-50, 3, 0]} size={[1.5, 6, 100]} color={wallColor} />
      <Wall position={[50, 3, 0]} size={[1.5, 6, 100]} color={wallColor} />

      {/* Frozen lake with detail */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 5]} receiveShadow>
        <circleGeometry args={[12, 40]} />
        <meshStandardMaterial color="#6ab0d4" roughness={0.05} metalness={0.35} />
      </mesh>
      {/* Ice cracks */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = i * Math.PI / 3;
        return (
          <mesh key={`crack-${i}`} rotation={[-Math.PI / 2, 0, angle]} position={[Math.cos(angle) * 4, 0.025, 5 + Math.sin(angle) * 4]}>
            <planeGeometry args={[0.02, 8]} />
            <meshBasicMaterial color="#8ad0e8" transparent opacity={0.4} />
          </mesh>
        );
      })}

      {/* Bunkers */}
      <Bunker position={[-20, 0, -20]} />
      <Bunker position={[20, 0, -20]} />

      {/* Corridors */}
      <Wall position={[-15, 2, 15]} size={[1, 4, 20]} color={wallDark} />
      <Wall position={[15, 2, 15]} size={[1, 4, 20]} color={wallDark} />
      <Wall position={[0, 2, -15]} size={[12, 4, 1]} color={wallDark} />
      <Wall position={[-6, 2, -8]} size={[1, 4, 14]} color={wallDark} />
      <Wall position={[6, 2, -8]} size={[1, 4, 14]} color={wallDark} />

      {/* Elevated walkway */}
      <Wall position={[0, 3, 30]} size={[30, 0.3, 3]} color={wallDark} />
      {[-12, -6, 0, 6, 12].map((x, i) => (
        <group key={`railing-${i}`}>
          <mesh position={[x, 3.6, 31.3]}><cylinderGeometry args={[0.05, 0.05, 1, 6]} /><meshStandardMaterial color="#555" metalness={0.8} /></mesh>
          <mesh position={[x, 4.1, 31.3]}><sphereGeometry args={[0.06, 6, 6]} /><meshStandardMaterial color="#555" metalness={0.8} /></mesh>
        </group>
      ))}
      {/* Railing bar */}
      <mesh position={[0, 4.1, 31.3]}><boxGeometry args={[24, 0.04, 0.04]} /><meshStandardMaterial color="#555" metalness={0.8} /></mesh>

      {/* Ice blocks */}
      <IceBlock position={[-8, 0.75, 10]} scale={1.3} />
      <IceBlock position={[10, 0.75, -5]} />
      <IceBlock position={[-5, 0.75, -30]} scale={1.5} />
      <IceBlock position={[30, 0.75, 15]} />
      <IceBlock position={[-30, 0.75, -15]} scale={0.8} />
      <IceBlock position={[18, 0.5, 25]} scale={0.7} />

      {/* Pine trees */}
      {[[-40, 35], [38, 40], [-44, -30], [44, -15], [-35, 0], [40, 0], [0, 45], [-20, 42], [30, -35], [-45, -10]].map(([x, z], i) => (
        <PineTree key={i} position={[x, 0, z]} />
      ))}

      {/* Snow fall */}
      <SnowFall />

      {/* Sky */}
      <AuroraSky />

      {/* Lighting */}
      <directionalLight
        position={[20, 30, 15]}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.001}
        color="#d0e0ff"
      />
      <ambientLight intensity={0.45} color="#b0c8e0" />
      <hemisphereLight args={['#8090a8', '#e0e8f0', 0.45]} />
      <directionalLight position={[-15, 8, -25]} intensity={0.3} color="#80a0ff" />
    </group>
  );
}
