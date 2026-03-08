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

function Crate({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[1.2, 1.2, 1.2]} />
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

export default function DesertMap() {
  const groundRef = useRef<THREE.Mesh>(null);

  const sandTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#d4a853';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = `rgba(${160 + Math.random() * 40}, ${140 + Math.random() * 30}, ${60 + Math.random() * 30}, 0.3)`;
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
      <mesh ref={groundRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial map={sandTexture} roughness={1} />
      </mesh>

      {/* Main compound walls - de_dust inspired layout */}
      {/* Outer perimeter */}
      <Wall position={[0, 3, -50]} size={[100, 6, 1]} color={wallColor} />
      <Wall position={[0, 3, 50]} size={[100, 6, 1]} color={wallColor} />
      <Wall position={[-50, 3, 0]} size={[1, 6, 100]} color={wallColor} />
      <Wall position={[50, 3, 0]} size={[1, 6, 100]} color={wallColor} />

      {/* Central building / bombsite A */}
      <Wall position={[0, 2, -10]} size={[16, 4, 1]} color={wallDark} />
      <Wall position={[-8, 2, -5]} size={[1, 4, 10]} color={wallDark} />
      <Wall position={[8, 2, -5]} size={[1, 4, 10]} color={wallDark} />
      <Wall position={[-3, 2, 0]} size={[9, 4, 1]} color={wallDark} />

      {/* Side corridors */}
      <Wall position={[-20, 2, -20]} size={[1, 4, 20]} color={wallColor} />
      <Wall position={[-20, 2, -30]} size={[15, 4, 1]} color={wallColor} />
      <Wall position={[20, 2, -20]} size={[1, 4, 20]} color={wallColor} />
      <Wall position={[20, 2, -30]} size={[15, 4, 1]} color={wallColor} />

      {/* Sniper alley walls */}
      <Wall position={[-15, 2, 15]} size={[1, 4, 25]} color={wallDark} />
      <Wall position={[15, 2, 15]} size={[1, 4, 25]} color={wallDark} />

      {/* Cover structures */}
      <Wall position={[-30, 1.5, 10]} size={[6, 3, 1]} color={wallColor} />
      <Wall position={[30, 1.5, 10]} size={[6, 3, 1]} color={wallColor} />
      <Wall position={[-30, 1.5, -10]} size={[6, 3, 1]} color={wallColor} />
      <Wall position={[30, 1.5, -10]} size={[6, 3, 1]} color={wallColor} />

      {/* Small structures */}
      <Wall position={[0, 1, 20]} size={[4, 2, 4]} color={wallDark} />
      <Wall position={[-25, 1, 0]} size={[3, 2, 3]} color={wallDark} />
      <Wall position={[25, 1, 0]} size={[3, 2, 3]} color={wallDark} />

      {/* Crates for cover */}
      <Crate position={[-5, 0.6, 5]} />
      <Crate position={[-4, 0.6, 5.5]} />
      <Crate position={[-4.5, 1.8, 5.2]} />
      <Crate position={[10, 0.6, -15]} />
      <Crate position={[11, 0.6, -15]} />
      <Crate position={[-10, 0.6, 25]} />
      <Crate position={[35, 0.6, 20]} />
      <Crate position={[36, 0.6, 20]} />
      <Crate position={[-35, 0.6, -20]} />

      {/* Barrels */}
      <Barrel position={[5, 0, 8]} />
      <Barrel position={[6, 0, 8.5]} />
      <Barrel position={[-12, 0, -5]} />
      <Barrel position={[25, 0, -25]} />
      <Barrel position={[-25, 0, 25]} />

      {/* Ramp / elevated platform */}
      <mesh position={[-35, 1, -35]} rotation={[0, 0, 0.15]} castShadow receiveShadow>
        <boxGeometry args={[8, 0.3, 5]} />
        <meshStandardMaterial color={wallDark} roughness={0.8} />
      </mesh>

      {/* Archway pillars */}
      <Wall position={[-3, 3, 25]} size={[1, 6, 1]} color={wallColor} />
      <Wall position={[3, 3, 25]} size={[1, 6, 1]} color={wallColor} />
      <Wall position={[0, 5.5, 25]} size={[7, 1, 1]} color={wallColor} />

      {/* Sky dome color */}
      <mesh>
        <sphereGeometry args={[80, 32, 32]} />
        <meshBasicMaterial color="#87CEEB" side={THREE.BackSide} />
      </mesh>

      {/* Sun light */}
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
