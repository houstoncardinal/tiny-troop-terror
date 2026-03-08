import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function Wall({ position, size, color = '#c4a36e' }: {
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

function Crate({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[1.2 * scale, 1.2 * scale, 1.2 * scale]} />
      <meshStandardMaterial color="#8B6914" roughness={0.8} />
    </mesh>
  );
}

function Barrel({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={[position[0], position[1] + 0.6, position[2]]} castShadow>
      <cylinderGeometry args={[0.4, 0.45, 1.2, 8]} />
      <meshStandardMaterial color="#4a5a3a" roughness={0.7} metalness={0.3} />
    </mesh>
  );
}

function Palm({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 5, 6]} />
        <meshStandardMaterial color="#6B4226" roughness={0.9} />
      </mesh>
      {[0, 1.2, 2.4, 3.6, 4.8].map((r, i) => (
        <mesh key={i} position={[Math.cos(r) * 1.2, 5, Math.sin(r) * 1.2]} rotation={[0.5 * Math.cos(r), r, 0.5 * Math.sin(r)]}>
          <boxGeometry args={[0.6, 0.05, 2]} />
          <meshStandardMaterial color="#2d5a1e" roughness={0.8} />
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
      {/* Window slits */}
      <mesh position={[2.01, 6, 0]}>
        <boxGeometry args={[0.1, 0.8, 0.3]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-2.01, 6, 0]}>
        <boxGeometry args={[0.1, 0.8, 0.3]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 6, 2.01]}>
        <boxGeometry args={[0.3, 0.8, 0.1]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}

function Ruins({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Wall position={[0, 1.5, 0]} size={[6, 3, 0.5]} color="#a89070" />
      <Wall position={[-2.5, 2.5, 0]} size={[1, 5, 0.5]} color="#a89070" />
      <Wall position={[2.5, 1, 0]} size={[1, 2, 0.5]} color="#a89070" />
      {/* Rubble */}
      <mesh position={[1, 0.3, 0.8]} rotation={[0.3, 0.5, 0.2]}>
        <boxGeometry args={[1, 0.6, 0.8]} />
        <meshStandardMaterial color="#a89070" roughness={0.9} />
      </mesh>
    </group>
  );
}

export default function DesertMap() {
  const sandTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#d4a853';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 8000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = `rgba(${150 + Math.random() * 50}, ${130 + Math.random() * 40}, ${50 + Math.random() * 40}, 0.3)`;
      ctx.fillRect(x, y, 2, 2);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(20, 20);
    return tex;
  }, []);

  const wallColor = '#c4a36e';
  const wallDark = '#a08050';

  return (
    <group>
      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial map={sandTexture} roughness={1} />
      </mesh>

      {/* Sand dunes (undulating terrain) */}
      {[[-30, 0.8, -35], [25, 0.6, -40], [40, 0.5, 30], [-40, 0.7, 25]].map(([x, h, z], i) => (
        <mesh key={`dune-${i}`} position={[x, h as number / 2, z]} receiveShadow>
          <sphereGeometry args={[h as number * 4, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#d4a853" roughness={1} />
        </mesh>
      ))}

      {/* Outer perimeter */}
      <Wall position={[0, 3, -50]} size={[100, 6, 1]} color={wallColor} />
      <Wall position={[0, 3, 50]} size={[100, 6, 1]} color={wallColor} />
      <Wall position={[-50, 3, 0]} size={[1, 6, 100]} color={wallColor} />
      <Wall position={[50, 3, 0]} size={[1, 6, 100]} color={wallColor} />

      {/* Central compound - bombsite A */}
      <Wall position={[0, 2, -10]} size={[16, 4, 1]} color={wallDark} />
      <Wall position={[-8, 2, -5]} size={[1, 4, 10]} color={wallDark} />
      <Wall position={[8, 2, -5]} size={[1, 4, 10]} color={wallDark} />
      <Wall position={[-3, 2, 0]} size={[9, 4, 1]} color={wallDark} />
      {/* Roof over bombsite */}
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
      {/* Stairs to platform */}
      {[0, 1, 2, 3, 4].map(i => (
        <Wall key={`stair-l-${i}`} position={[-31 + i * 0.6, 0.3 + i * 0.3, -10]} size={[0.6, 0.3, 3]} color={wallColor} />
      ))}

      <Wall position={[35, 1.5, -10]} size={[8, 0.3, 8]} color={wallDark} />
      {[0, 1, 2, 3, 4].map(i => (
        <Wall key={`stair-r-${i}`} position={[31 + i * 0.6, 0.3 + i * 0.3, -10]} size={[0.6, 0.3, 3]} color={wallColor} />
      ))}

      {/* Cover structures */}
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
      <Crate position={[-5, 0.6, 5]} />
      <Crate position={[-4, 0.6, 5.5]} />
      <Crate position={[-4.5, 1.8, 5.2]} />
      <Crate position={[10, 0.6, -15]} />
      <Crate position={[11, 0.6, -15]} />
      <Crate position={[-10, 0.6, 25]} />
      <Crate position={[35, 0.6, 20]} />
      <Crate position={[36, 0.6, 20]} />
      <Crate position={[-35, 0.6, -20]} />
      <Crate position={[0, 0.6, -35]} />
      <Crate position={[1.2, 0.6, -35]} />
      <Crate position={[0.6, 1.8, -35]} />

      {/* Barrels */}
      <Barrel position={[5, 0, 8]} />
      <Barrel position={[6, 0, 8.5]} />
      <Barrel position={[-12, 0, -5]} />
      <Barrel position={[25, 0, -25]} />
      <Barrel position={[-25, 0, 25]} />
      <Barrel position={[15, 0, -35]} />
      <Barrel position={[-15, 0, 35]} />

      {/* Palm trees */}
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

      {/* Archway */}
      <Wall position={[-3, 3, 25]} size={[1, 6, 1]} color={wallColor} />
      <Wall position={[3, 3, 25]} size={[1, 6, 1]} color={wallColor} />
      <Wall position={[0, 5.5, 25]} size={[7, 1, 1]} color={wallColor} />

      {/* Second archway */}
      <Wall position={[-3, 3, -25]} size={[1, 6, 1]} color={wallColor} />
      <Wall position={[3, 3, -25]} size={[1, 6, 1]} color={wallColor} />
      <Wall position={[0, 5.5, -25]} size={[7, 1, 1]} color={wallColor} />

      {/* Market stalls */}
      {[-8, 0, 8].map((x, i) => (
        <group key={`stall-${i}`} position={[x, 0, -38]}>
          <Wall position={[0, 1.2, 0]} size={[3, 0.1, 2]} color="#8B4513" />
          <mesh position={[-1.3, 0.6, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 1.2, 6]} />
            <meshStandardMaterial color="#8B4513" roughness={0.8} />
          </mesh>
          <mesh position={[1.3, 0.6, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 1.2, 6]} />
            <meshStandardMaterial color="#8B4513" roughness={0.8} />
          </mesh>
          {/* Cloth canopy */}
          <mesh position={[0, 2.2, 0]}>
            <boxGeometry args={[3.2, 0.05, 2.2]} />
            <meshStandardMaterial color={['#c44', '#cc8844', '#4488cc'][i]} roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Sky dome */}
      <mesh>
        <sphereGeometry args={[80, 32, 32]} />
        <meshBasicMaterial color="#87CEEB" side={THREE.BackSide} />
      </mesh>

      {/* Lighting */}
      <directionalLight
        position={[30, 40, 20]}
        intensity={2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <ambientLight intensity={0.6} color="#ffe4b5" />
      <hemisphereLight args={['#87CEEB', '#d4a853', 0.4]} />
    </group>
  );
}
