import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, type Enemy } from './useGameStore';

const ATTACK_RANGE = 2.5;
const DAMAGE_INTERVAL = 800;

function HealthBar({ health, maxHealth, color = '#00ff00', width = 0.5 }: { health: number; maxHealth: number; color?: string; width?: number }) {
  const pct = health / maxHealth;
  return (
    <group>
      <mesh><planeGeometry args={[width, 0.06]} /><meshBasicMaterial color="#111" /></mesh>
      <mesh position={[(pct - 1) * (width * 0.46), 0, 0.001]}>
        <planeGeometry args={[(width - 0.04) * pct, 0.04]} />
        <meshBasicMaterial color={pct > 0.5 ? color : pct > 0.25 ? '#ffaa00' : '#ff0000'} />
      </mesh>
    </group>
  );
}

function GruntBody({ health, maxHealth }: { health: number; maxHealth: number }) {
  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow><boxGeometry args={[0.35, 0.45, 0.22]} /><meshStandardMaterial color="#7a1a1a" roughness={0.5} /></mesh>
      <mesh position={[0, 0.38, 0.1]} castShadow><boxGeometry args={[0.3, 0.35, 0.06]} /><meshStandardMaterial color="#444" metalness={0.7} roughness={0.3} /></mesh>
      <mesh position={[0, 0.72, 0]} castShadow><sphereGeometry args={[0.14, 12, 12]} /><meshStandardMaterial color="#DEB887" roughness={0.5} /></mesh>
      <mesh position={[0, 0.78, 0]} castShadow><sphereGeometry args={[0.15, 12, 8]} /><meshStandardMaterial color="#556B2F" roughness={0.6} metalness={0.3} /></mesh>
      <mesh position={[-0.05, 0.72, 0.12]}><sphereGeometry args={[0.025, 8, 8]} /><meshBasicMaterial color="#ff2200" /></mesh>
      <mesh position={[0.05, 0.72, 0.12]}><sphereGeometry args={[0.025, 8, 8]} /><meshBasicMaterial color="#ff2200" /></mesh>
      {/* Arms with forearms */}
      <group position={[-0.25, 0.4, 0]}>
        <mesh castShadow><boxGeometry args={[0.1, 0.2, 0.1]} /><meshStandardMaterial color="#DEB887" roughness={0.5} /></mesh>
        <mesh position={[0, -0.15, 0.05]} rotation={[-0.5,0,0]} castShadow><boxGeometry args={[0.08, 0.18, 0.08]} /><meshStandardMaterial color="#556B2F" roughness={0.6} /></mesh>
      </group>
      <group position={[0.25, 0.4, 0]}>
        <mesh castShadow><boxGeometry args={[0.1, 0.2, 0.1]} /><meshStandardMaterial color="#DEB887" roughness={0.5} /></mesh>
        <mesh position={[0, -0.15, 0.05]} rotation={[-0.5,0,0]} castShadow><boxGeometry args={[0.08, 0.18, 0.08]} /><meshStandardMaterial color="#556B2F" roughness={0.6} /></mesh>
        <mesh position={[0.02, -0.28, 0.12]} rotation={[0.5,0,0]}><boxGeometry args={[0.03, 0.03, 0.2]} /><meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.2} /></mesh>
      </group>
      {/* Legs with knees */}
      <group position={[-0.09, 0.08, 0]}>
        <mesh castShadow><boxGeometry args={[0.12, 0.16, 0.12]} /><meshStandardMaterial color="#4a3728" roughness={0.7} /></mesh>
        <mesh position={[0, -0.12, 0.02]} castShadow><boxGeometry args={[0.11, 0.14, 0.11]} /><meshStandardMaterial color="#3a2718" roughness={0.7} /></mesh>
      </group>
      <group position={[0.09, 0.08, 0]}>
        <mesh castShadow><boxGeometry args={[0.12, 0.16, 0.12]} /><meshStandardMaterial color="#4a3728" roughness={0.7} /></mesh>
        <mesh position={[0, -0.12, 0.02]} castShadow><boxGeometry args={[0.11, 0.14, 0.11]} /><meshStandardMaterial color="#3a2718" roughness={0.7} /></mesh>
      </group>
      {/* Belt */}
      <mesh position={[0, 0.15, 0]}><boxGeometry args={[0.36, 0.04, 0.24]} /><meshStandardMaterial color="#333" roughness={0.6} metalness={0.3} /></mesh>
      <group position={[0, 1.05, 0]}><HealthBar health={health} maxHealth={maxHealth} /></group>
    </group>
  );
}

function RunnerBody({ health, maxHealth }: { health: number; maxHealth: number }) {
  return (
    <group scale={[0.75, 0.75, 0.75]}>
      <mesh position={[0, 0.35, 0]} castShadow><boxGeometry args={[0.25, 0.35, 0.15]} /><meshStandardMaterial color="#1a1a5a" roughness={0.3} /></mesh>
      <mesh position={[0, 0.36, 0.07]} castShadow><boxGeometry args={[0.22, 0.28, 0.04]} /><meshStandardMaterial color="#2a2a8a" roughness={0.2} metalness={0.5} /></mesh>
      <mesh position={[0, 0.65, 0]} castShadow><sphereGeometry args={[0.12, 12, 12]} /><meshStandardMaterial color="#1a1a3a" roughness={0.3} /></mesh>
      {/* Hood peak */}
      <mesh position={[0, 0.72, 0.06]} rotation={[-0.5,0,0]}><boxGeometry args={[0.12, 0.04, 0.1]} /><meshStandardMaterial color="#1a1a4a" roughness={0.3} /></mesh>
      <mesh position={[-0.04, 0.66, 0.1]}><sphereGeometry args={[0.02, 6, 6]} /><meshBasicMaterial color="#00ffff" /></mesh>
      <mesh position={[0.04, 0.66, 0.1]}><sphereGeometry args={[0.02, 6, 6]} /><meshBasicMaterial color="#00ffff" /></mesh>
      {/* Cyan glow */}
      <pointLight position={[0, 0.66, 0.12]} color="#00ffff" intensity={0.5} distance={1.5} />
      <mesh position={[-0.18, 0.38, 0]} castShadow><boxGeometry args={[0.06, 0.28, 0.06]} /><meshStandardMaterial color="#1a1a5a" roughness={0.4} /></mesh>
      <mesh position={[0.18, 0.38, 0]} castShadow><boxGeometry args={[0.06, 0.28, 0.06]} /><meshStandardMaterial color="#1a1a5a" roughness={0.4} /></mesh>
      {/* Dual daggers */}
      <mesh position={[-0.2, 0.2, 0.08]} rotation={[0.6,0,0]}><boxGeometry args={[0.02, 0.02, 0.15]} /><meshStandardMaterial color="#88ccff" metalness={0.9} roughness={0.1} /></mesh>
      <mesh position={[0.2, 0.2, 0.08]} rotation={[0.6,0,0]}><boxGeometry args={[0.02, 0.02, 0.15]} /><meshStandardMaterial color="#88ccff" metalness={0.9} roughness={0.1} /></mesh>
      <mesh position={[-0.06, 0.06, 0]} castShadow><boxGeometry args={[0.07, 0.2, 0.07]} /><meshStandardMaterial color="#111133" roughness={0.5} /></mesh>
      <mesh position={[0.06, 0.06, 0]} castShadow><boxGeometry args={[0.07, 0.2, 0.07]} /><meshStandardMaterial color="#111133" roughness={0.5} /></mesh>
      <group position={[0, 0.92, 0]}><HealthBar health={health} maxHealth={maxHealth} color="#00ffff" width={0.4} /></group>
    </group>
  );
}

function TankBody({ health, maxHealth }: { health: number; maxHealth: number }) {
  return (
    <group scale={[1.5, 1.5, 1.5]}>
      <mesh position={[0, 0.4, 0]} castShadow><boxGeometry args={[0.55, 0.6, 0.38]} /><meshStandardMaterial color="#5a2a0a" roughness={0.6} /></mesh>
      <mesh position={[0, 0.42, 0.17]} castShadow><boxGeometry args={[0.5, 0.5, 0.08]} /><meshStandardMaterial color="#555" metalness={0.85} roughness={0.2} /></mesh>
      {/* Skull emblem */}
      <mesh position={[0, 0.45, 0.22]}><sphereGeometry args={[0.05, 8, 8]} /><meshBasicMaterial color="#ffcc00" /></mesh>
      <mesh position={[-0.35, 0.58, 0]} castShadow><boxGeometry args={[0.18, 0.14, 0.24]} /><meshStandardMaterial color="#555" metalness={0.75} roughness={0.25} /></mesh>
      <mesh position={[0.35, 0.58, 0]} castShadow><boxGeometry args={[0.18, 0.14, 0.24]} /><meshStandardMaterial color="#555" metalness={0.75} roughness={0.25} /></mesh>
      <mesh position={[0, 0.82, 0]} castShadow><sphereGeometry args={[0.18, 12, 12]} /><meshStandardMaterial color="#DEB887" roughness={0.5} /></mesh>
      {/* War paint */}
      <mesh position={[0, 0.8, 0.16]}><boxGeometry args={[0.3, 0.04, 0.01]} /><meshBasicMaterial color="#8B0000" /></mesh>
      <mesh position={[-0.07, 0.82, 0.16]}><sphereGeometry args={[0.03, 6, 6]} /><meshBasicMaterial color="#ff6600" /></mesh>
      <mesh position={[0.07, 0.82, 0.16]}><sphereGeometry args={[0.03, 6, 6]} /><meshBasicMaterial color="#ff6600" /></mesh>
      <mesh position={[-0.38, 0.38, 0]} castShadow><boxGeometry args={[0.16, 0.38, 0.16]} /><meshStandardMaterial color="#5a2a0a" roughness={0.6} /></mesh>
      <mesh position={[0.38, 0.38, 0]} castShadow><boxGeometry args={[0.16, 0.38, 0.16]} /><meshStandardMaterial color="#5a2a0a" roughness={0.6} /></mesh>
      {/* Massive hammer */}
      <group position={[0.45, 0.15, 0.12]} rotation={[0.4, 0, -0.2]}>
        <mesh><cylinderGeometry args={[0.035, 0.035, 0.5, 6]} /><meshStandardMaterial color="#555" metalness={0.8} roughness={0.3} /></mesh>
        <mesh position={[0, -0.28, 0]}><boxGeometry args={[0.12, 0.1, 0.08]} /><meshStandardMaterial color="#333" metalness={0.9} roughness={0.2} /></mesh>
      </group>
      <mesh position={[-0.14, 0.06, 0]} castShadow><boxGeometry args={[0.17, 0.28, 0.17]} /><meshStandardMaterial color="#3a1a0a" roughness={0.7} /></mesh>
      <mesh position={[0.14, 0.06, 0]} castShadow><boxGeometry args={[0.17, 0.28, 0.17]} /><meshStandardMaterial color="#3a1a0a" roughness={0.7} /></mesh>
      <group position={[0, 1.15, 0]}><HealthBar health={health} maxHealth={maxHealth} color="#ff8800" width={0.7} /></group>
    </group>
  );
}

function BomberBody({ health, maxHealth }: { health: number; maxHealth: number }) {
  return (
    <group scale={[0.9, 0.9, 0.9]}>
      <mesh position={[0, 0.35, 0]} castShadow><boxGeometry args={[0.4, 0.45, 0.25]} /><meshStandardMaterial color="#5a0a0a" roughness={0.5} /></mesh>
      {/* Bomb vest */}
      <mesh position={[0, 0.36, 0.11]} castShadow><boxGeometry args={[0.35, 0.38, 0.06]} /><meshStandardMaterial color="#4a4a3a" roughness={0.6} /></mesh>
      {/* Dynamite sticks */}
      {[-0.08, 0, 0.08].map((x, i) => (
        <mesh key={i} position={[x, 0.35, 0.15]}><cylinderGeometry args={[0.015, 0.015, 0.12, 6]} /><meshStandardMaterial color="#cc3333" roughness={0.7} /></mesh>
      ))}
      {/* Blinking light */}
      <mesh position={[0, 0.5, 0.15]}><sphereGeometry args={[0.015, 6, 6]} /><meshBasicMaterial color="#ff0000" /></mesh>
      <pointLight position={[0, 0.5, 0.15]} color="#ff0000" intensity={0.8} distance={1} />
      <mesh position={[0, 0.7, 0]} castShadow><sphereGeometry args={[0.13, 12, 12]} /><meshStandardMaterial color="#DEB887" roughness={0.5} /></mesh>
      {/* Crazy eyes */}
      <mesh position={[-0.04, 0.72, 0.11]}><sphereGeometry args={[0.03, 8, 8]} /><meshBasicMaterial color="#fff" /></mesh>
      <mesh position={[0.04, 0.72, 0.11]}><sphereGeometry args={[0.03, 8, 8]} /><meshBasicMaterial color="#fff" /></mesh>
      <mesh position={[-0.04, 0.72, 0.13]}><sphereGeometry args={[0.015, 6, 6]} /><meshBasicMaterial color="#000" /></mesh>
      <mesh position={[0.04, 0.72, 0.13]}><sphereGeometry args={[0.015, 6, 6]} /><meshBasicMaterial color="#000" /></mesh>
      <mesh position={[-0.22, 0.38, 0]} castShadow><boxGeometry args={[0.09, 0.28, 0.09]} /><meshStandardMaterial color="#5a0a0a" roughness={0.5} /></mesh>
      <mesh position={[0.22, 0.38, 0]} castShadow><boxGeometry args={[0.09, 0.28, 0.09]} /><meshStandardMaterial color="#5a0a0a" roughness={0.5} /></mesh>
      <mesh position={[-0.08, 0.05, 0]} castShadow><boxGeometry args={[0.1, 0.2, 0.1]} /><meshStandardMaterial color="#3a1a0a" roughness={0.7} /></mesh>
      <mesh position={[0.08, 0.05, 0]} castShadow><boxGeometry args={[0.1, 0.2, 0.1]} /><meshStandardMaterial color="#3a1a0a" roughness={0.7} /></mesh>
      <group position={[0, 1.0, 0]}><HealthBar health={health} maxHealth={maxHealth} color="#ff3333" width={0.45} /></group>
    </group>
  );
}

function SniperEnemyBody({ health, maxHealth }: { health: number; maxHealth: number }) {
  return (
    <group>
      <mesh position={[0, 0.35, 0]} castShadow><boxGeometry args={[0.3, 0.4, 0.2]} /><meshStandardMaterial color="#2a4a2a" roughness={0.5} /></mesh>
      {/* Ghillie suit texture */}
      <mesh position={[0, 0.4, 0.09]} castShadow><boxGeometry args={[0.28, 0.32, 0.04]} /><meshStandardMaterial color="#3a5a3a" roughness={0.9} /></mesh>
      <mesh position={[0, 0.68, 0]} castShadow><sphereGeometry args={[0.13, 12, 12]} /><meshStandardMaterial color="#DEB887" roughness={0.5} /></mesh>
      {/* Beret */}
      <mesh position={[0.03, 0.78, 0]} castShadow><sphereGeometry args={[0.1, 8, 6]} /><meshStandardMaterial color="#8B0000" roughness={0.6} /></mesh>
      <mesh position={[-0.04, 0.69, 0.11]}><sphereGeometry args={[0.02, 6, 6]} /><meshBasicMaterial color="#ffff00" /></mesh>
      <mesh position={[0.04, 0.69, 0.11]}><sphereGeometry args={[0.02, 6, 6]} /><meshBasicMaterial color="#ffff00" /></mesh>
      {/* Sniper rifle */}
      <group position={[0.2, 0.32, 0.1]} rotation={[0, 0, -0.1]}>
        <mesh><boxGeometry args={[0.03, 0.03, 0.35]} /><meshStandardMaterial color="#2a2a2a" metalness={0.9} roughness={0.2} /></mesh>
        <mesh position={[0, 0.03, -0.08]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.015, 0.015, 0.06, 6]} /><meshStandardMaterial color="#111" metalness={0.9} /></mesh>
      </group>
      <mesh position={[-0.2, 0.35, 0]} castShadow><boxGeometry args={[0.08, 0.25, 0.08]} /><meshStandardMaterial color="#2a4a2a" roughness={0.5} /></mesh>
      <mesh position={[0.2, 0.35, 0]} castShadow><boxGeometry args={[0.08, 0.25, 0.08]} /><meshStandardMaterial color="#2a4a2a" roughness={0.5} /></mesh>
      <mesh position={[-0.08, 0.05, 0]} castShadow><boxGeometry args={[0.1, 0.2, 0.1]} /><meshStandardMaterial color="#2a3a2a" roughness={0.7} /></mesh>
      <mesh position={[0.08, 0.05, 0]} castShadow><boxGeometry args={[0.1, 0.2, 0.1]} /><meshStandardMaterial color="#2a3a2a" roughness={0.7} /></mesh>
      <group position={[0, 1.0, 0]}><HealthBar health={health} maxHealth={maxHealth} color="#aaff00" /></group>
    </group>
  );
}

export default function EnemyMinion({ enemy }: { enemy: Enemy }) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const { takeDamage, updateEnemyPosition } = useGameStore();
  const lastAttack = useRef(0);
  const bobPhase = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (!enemy.alive || !groupRef.current) return;

    const pos = new THREE.Vector3(...enemy.position);
    const playerPos = camera.position.clone();
    playerPos.y = 0;
    const toPlayer = playerPos.sub(pos);
    const dist = toPlayer.length();

    groupRef.current.lookAt(camera.position.x, 0.4, camera.position.z);

    const attackRange = enemy.type === 'sniper' ? 20 : enemy.type === 'bomber' ? 3 : ATTACK_RANGE;

    if (dist > attackRange) {
      const moveSpeed = enemy.type === 'sniper' ? enemy.speed * 0.5 : enemy.speed;
      toPlayer.normalize().multiplyScalar(moveSpeed * delta);
      const newPos: [number, number, number] = [pos.x + toPlayer.x, 0, pos.z + toPlayer.z];
      updateEnemyPosition(enemy.id, newPos);
      groupRef.current.position.set(newPos[0], 0, newPos[2]);
    } else {
      const now = Date.now();
      const interval = enemy.type === 'sniper' ? 2000 : DAMAGE_INTERVAL;
      if (now - lastAttack.current > interval) {
        lastAttack.current = now;
        const dmg = enemy.type === 'tank' ? 15 : enemy.type === 'runner' ? 4 :
          enemy.type === 'bomber' ? 25 : enemy.type === 'sniper' ? 20 : 8;
        takeDamage(dmg + Math.floor(Math.random() * 3));
      }
    }

    const bobSpeed = enemy.type === 'runner' ? 14 : enemy.type === 'bomber' ? 12 : 8;
    bobPhase.current += delta * bobSpeed;
    groupRef.current.position.y = Math.abs(Math.sin(bobPhase.current)) * (enemy.type === 'runner' ? 0.15 : 0.08);
  });

  if (!enemy.alive) return null;

  return (
    <group ref={groupRef} position={enemy.position}>
      {enemy.type === 'runner' ? <RunnerBody health={enemy.health} maxHealth={enemy.maxHealth} /> :
       enemy.type === 'tank' ? <TankBody health={enemy.health} maxHealth={enemy.maxHealth} /> :
       enemy.type === 'bomber' ? <BomberBody health={enemy.health} maxHealth={enemy.maxHealth} /> :
       enemy.type === 'sniper' ? <SniperEnemyBody health={enemy.health} maxHealth={enemy.maxHealth} /> :
       <GruntBody health={enemy.health} maxHealth={enemy.maxHealth} />}
    </group>
  );
}
