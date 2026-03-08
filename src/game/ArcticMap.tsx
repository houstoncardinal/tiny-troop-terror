import { useMemo } from 'react';
import * as THREE from 'three';

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
    <mesh position={position} castShadow>
      <boxGeometry args={[1.5 * scale, 1.5 * scale, 1.5 * scale]} />
      <meshStandardMaterial color="#a0d0e8" roughness={0.2} metalness={0.1} transparent opacity={0.8} />
    </mesh>
  );
}

function PineTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, 3, 6]} />
        <meshStandardMaterial color="#4a3020" roughness={0.9} />
      </mesh>
      {[3, 3.8, 4.4].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} castShadow>
          <coneGeometry args={[1.5 - i * 0.35, 1.5 - i * 0.2, 8]} />
          <meshStandardMaterial color="#1a4a2a" roughness={0.8} />
        </mesh>
      ))}
      {/* Snow on trees */}
      <mesh position={[0, 5, 0]}>
        <coneGeometry args={[0.6, 0.5, 8]} />
        <meshStandardMaterial color="#f0f5ff" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Bunker({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <Wall position={[0, 1.5, 0]} size={[6, 3, 6]} color="#7a8a90" />
      <Wall position={[0, 3.2, 0]} size={[6.5, 0.4, 6.5]} color="#6a7a80" />
      <mesh position={[3.01, 2, 0]}>
        <boxGeometry args={[0.1, 1, 2]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-3.01, 2, 0]}>
        <boxGeometry args={[0.1, 1, 2]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}

export default function ArcticMap() {
  const snowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#e8eef5';
    ctx.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 6000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      ctx.fillStyle = `rgba(${220 + Math.random() * 35}, ${225 + Math.random() * 30}, ${235 + Math.random() * 20}, 0.4)`;
      ctx.fillRect(x, y, 2, 2);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(20, 20);
    return tex;
  }, []);

  const wallColor = '#c0c8d0';
  const wallDark = '#8a9098';

  return (
    <group>
      {/* Snowy ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial map={snowTexture} roughness={0.8} />
      </mesh>

      {/* Snow mounds */}
      {[[-25, 1.2, -30], [30, 0.9, -35], [35, 0.7, 25], [-38, 1, 20]].map(([x, h, z], i) => (
        <mesh key={`mound-${i}`} position={[x, (h as number) / 2, z]} receiveShadow>
          <sphereGeometry args={[(h as number) * 5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#e0e8f0" roughness={0.9} />
        </mesh>
      ))}

      {/* Perimeter walls - ice/concrete */}
      <Wall position={[0, 3, -50]} size={[100, 6, 1]} color={wallColor} />
      <Wall position={[0, 3, 50]} size={[100, 6, 1]} color={wallColor} />
      <Wall position={[-50, 3, 0]} size={[1, 6, 100]} color={wallColor} />
      <Wall position={[50, 3, 0]} size={[1, 6, 100]} color={wallColor} />

      {/* Central frozen lake */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 5]} receiveShadow>
        <circleGeometry args={[10, 32]} />
        <meshStandardMaterial color="#7ab8d4" roughness={0.1} metalness={0.3} />
      </mesh>

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
        <mesh key={`railing-${i}`} position={[x, 3.6, 31.3]}>
          <cylinderGeometry args={[0.05, 0.05, 1, 6]} />
          <meshStandardMaterial color="#555" metalness={0.8} />
        </mesh>
      ))}

      {/* Ice blocks for cover */}
      <IceBlock position={[-8, 0.75, 10]} scale={1.2} />
      <IceBlock position={[10, 0.75, -5]} />
      <IceBlock position={[-5, 0.75, -30]} scale={1.5} />
      <IceBlock position={[30, 0.75, 15]} />
      <IceBlock position={[-30, 0.75, -15]} scale={0.8} />

      {/* Pine trees */}
      <PineTree position={[-40, 0, 35]} />
      <PineTree position={[38, 0, 40]} />
      <PineTree position={[-44, 0, -30]} />
      <PineTree position={[44, 0, -15]} />
      <PineTree position={[-35, 0, 0]} />
      <PineTree position={[40, 0, 0]} />
      <PineTree position={[0, 0, 45]} />
      <PineTree position={[-20, 0, 42]} />

      {/* Sky dome - overcast */}
      <mesh>
        <sphereGeometry args={[80, 32, 32]} />
        <meshBasicMaterial color="#b0b8c8" side={THREE.BackSide} />
      </mesh>

      {/* Snow particles - static decorative */}
      {Array.from({ length: 40 }).map((_, i) => (
        <mesh key={`snow-${i}`} position={[
          Math.random() * 80 - 40,
          Math.random() * 15 + 2,
          Math.random() * 80 - 40,
        ]}>
          <sphereGeometry args={[0.06, 4, 4]} />
          <meshBasicMaterial color="#fff" />
        </mesh>
      ))}

      {/* Lighting - cold blue tone */}
      <directionalLight
        position={[20, 30, 15]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        color="#d0e0ff"
      />
      <ambientLight intensity={0.5} color="#c0d0e0" />
      <hemisphereLight args={['#b0b8c8', '#e0e8f0', 0.4]} />
      <fog attach="fog" args={['#c8d0d8', 30, 80]} />
    </group>
  );
}
