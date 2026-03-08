import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, type Enemy } from './useGameStore';

const ATTACK_RANGE = 2.5;
const DAMAGE_INTERVAL = 800;

function GruntBody({ health, maxHealth }: { health: number; maxHealth: number }) {
  const healthPct = health / maxHealth;
  return (
    <group>
      {/* Torso */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.35, 0.45, 0.22]} />
        <meshStandardMaterial color="#7a1a1a" roughness={0.5} />
      </mesh>
      {/* Chest plate */}
      <mesh position={[0, 0.38, 0.1]} castShadow>
        <boxGeometry args={[0.3, 0.35, 0.06]} />
        <meshStandardMaterial color="#444" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshStandardMaterial color="#DEB887" roughness={0.5} />
      </mesh>
      {/* Helmet */}
      <mesh position={[0, 0.78, 0]} castShadow>
        <sphereGeometry args={[0.15, 12, 8]} />
        <meshStandardMaterial color="#556B2F" roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Eyes - glowing */}
      <mesh position={[-0.05, 0.72, 0.12]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#ff2200" />
      </mesh>
      <mesh position={[0.05, 0.72, 0.12]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color="#ff2200" />
      </mesh>
      {/* Left Arm */}
      <group position={[-0.25, 0.4, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.1, 0.2, 0.1]} />
          <meshStandardMaterial color="#DEB887" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.15, 0]} castShadow>
          <boxGeometry args={[0.08, 0.18, 0.08]} />
          <meshStandardMaterial color="#556B2F" roughness={0.6} />
        </mesh>
      </group>
      {/* Right Arm + weapon */}
      <group position={[0.25, 0.4, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.1, 0.2, 0.1]} />
          <meshStandardMaterial color="#DEB887" roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.15, 0]} castShadow>
          <boxGeometry args={[0.08, 0.18, 0.08]} />
          <meshStandardMaterial color="#556B2F" roughness={0.6} />
        </mesh>
        {/* Knife */}
        <mesh position={[0.02, -0.28, 0.08]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.03, 0.03, 0.2]} />
          <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
      {/* Legs */}
      <mesh position={[-0.09, 0.05, 0]} castShadow>
        <boxGeometry args={[0.12, 0.22, 0.12]} />
        <meshStandardMaterial color="#4a3728" roughness={0.7} />
      </mesh>
      <mesh position={[0.09, 0.05, 0]} castShadow>
        <boxGeometry args={[0.12, 0.22, 0.12]} />
        <meshStandardMaterial color="#4a3728" roughness={0.7} />
      </mesh>
      {/* Boots */}
      <mesh position={[-0.09, -0.05, 0.02]} castShadow>
        <boxGeometry args={[0.13, 0.06, 0.16]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.8} />
      </mesh>
      <mesh position={[0.09, -0.05, 0.02]} castShadow>
        <boxGeometry args={[0.13, 0.06, 0.16]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.8} />
      </mesh>
      {/* Health bar */}
      <group position={[0, 1.0, 0]}>
        <mesh>
          <planeGeometry args={[0.5, 0.06]} />
          <meshBasicMaterial color="#111" />
        </mesh>
        <mesh position={[(healthPct - 1) * 0.23, 0, 0.001]}>
          <planeGeometry args={[0.46 * healthPct, 0.04]} />
          <meshBasicMaterial color={healthPct > 0.5 ? '#00ff00' : healthPct > 0.25 ? '#ffaa00' : '#ff0000'} />
        </mesh>
      </group>
    </group>
  );
}

function RunnerBody({ health, maxHealth }: { health: number; maxHealth: number }) {
  const healthPct = health / maxHealth;
  return (
    <group scale={[0.7, 0.7, 0.7]}>
      {/* Slim torso */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.25, 0.35, 0.15]} />
        <meshStandardMaterial color="#1a1a5a" roughness={0.4} />
      </mesh>
      {/* Head with hood */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#1a1a3a" roughness={0.3} />
      </mesh>
      {/* Glowing eyes */}
      <mesh position={[-0.04, 0.66, 0.1]}>
        <sphereGeometry args={[0.02, 6, 6]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>
      <mesh position={[0.04, 0.66, 0.1]}>
        <sphereGeometry args={[0.02, 6, 6]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.2, 0.35, 0]} castShadow>
        <boxGeometry args={[0.07, 0.3, 0.07]} />
        <meshStandardMaterial color="#1a1a5a" roughness={0.4} />
      </mesh>
      <mesh position={[0.2, 0.35, 0]} castShadow>
        <boxGeometry args={[0.07, 0.3, 0.07]} />
        <meshStandardMaterial color="#1a1a5a" roughness={0.4} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.07, 0.05, 0]} castShadow>
        <boxGeometry args={[0.08, 0.22, 0.08]} />
        <meshStandardMaterial color="#111133" roughness={0.5} />
      </mesh>
      <mesh position={[0.07, 0.05, 0]} castShadow>
        <boxGeometry args={[0.08, 0.22, 0.08]} />
        <meshStandardMaterial color="#111133" roughness={0.5} />
      </mesh>
      {/* Health bar */}
      <group position={[0, 0.95, 0]}>
        <mesh>
          <planeGeometry args={[0.4, 0.05]} />
          <meshBasicMaterial color="#111" />
        </mesh>
        <mesh position={[(healthPct - 1) * 0.19, 0, 0.001]}>
          <planeGeometry args={[0.38 * healthPct, 0.03]} />
          <meshBasicMaterial color="#00ffff" />
        </mesh>
      </group>
    </group>
  );
}

function TankBody({ health, maxHealth }: { health: number; maxHealth: number }) {
  const healthPct = health / maxHealth;
  return (
    <group scale={[1.4, 1.4, 1.4]}>
      {/* Massive torso */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.5, 0.55, 0.35]} />
        <meshStandardMaterial color="#5a2a0a" roughness={0.6} />
      </mesh>
      {/* Heavy armor */}
      <mesh position={[0, 0.42, 0.15]} castShadow>
        <boxGeometry args={[0.45, 0.45, 0.1]} />
        <meshStandardMaterial color="#666" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Shoulder pads */}
      <mesh position={[-0.32, 0.55, 0]} castShadow>
        <boxGeometry args={[0.15, 0.12, 0.2]} />
        <meshStandardMaterial color="#666" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.32, 0.55, 0]} castShadow>
        <boxGeometry args={[0.15, 0.12, 0.2]} />
        <meshStandardMaterial color="#666" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.78, 0]} castShadow>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#DEB887" roughness={0.5} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.06, 0.78, 0.14]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshBasicMaterial color="#ff6600" />
      </mesh>
      <mesh position={[0.06, 0.78, 0.14]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshBasicMaterial color="#ff6600" />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.35, 0.35, 0]} castShadow>
        <boxGeometry args={[0.14, 0.35, 0.14]} />
        <meshStandardMaterial color="#5a2a0a" roughness={0.6} />
      </mesh>
      <mesh position={[0.35, 0.35, 0]} castShadow>
        <boxGeometry args={[0.14, 0.35, 0.14]} />
        <meshStandardMaterial color="#5a2a0a" roughness={0.6} />
      </mesh>
      {/* Giant mace */}
      <mesh position={[0.4, 0.1, 0.1]} rotation={[0.3, 0, -0.2]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 6]} />
        <meshStandardMaterial color="#555" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0.42, -0.08, 0.15]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#333" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.12, 0.05, 0]} castShadow>
        <boxGeometry args={[0.15, 0.25, 0.15]} />
        <meshStandardMaterial color="#3a1a0a" roughness={0.7} />
      </mesh>
      <mesh position={[0.12, 0.05, 0]} castShadow>
        <boxGeometry args={[0.15, 0.25, 0.15]} />
        <meshStandardMaterial color="#3a1a0a" roughness={0.7} />
      </mesh>
      {/* Health bar */}
      <group position={[0, 1.1, 0]}>
        <mesh>
          <planeGeometry args={[0.6, 0.07]} />
          <meshBasicMaterial color="#111" />
        </mesh>
        <mesh position={[(healthPct - 1) * 0.28, 0, 0.001]}>
          <planeGeometry args={[0.56 * healthPct, 0.05]} />
          <meshBasicMaterial color={healthPct > 0.5 ? '#ff8800' : '#ff0000'} />
        </mesh>
      </group>
    </group>
  );
}

export default function EnemyMinion({ enemy }: { enemy: Enemy }) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const { takeDamage, updateEnemyPosition } = useGameStore();
  const lastAttack = useRef(0);
  const bobPhase = useRef(Math.random() * Math.PI * 2);
  const armSwing = useRef(0);

  useFrame((_, delta) => {
    if (!enemy.alive || !groupRef.current) return;

    const pos = new THREE.Vector3(...enemy.position);
    const playerPos = camera.position.clone();
    playerPos.y = 0;
    const toPlayer = playerPos.sub(pos);
    const dist = toPlayer.length();

    groupRef.current.lookAt(camera.position.x, 0.4, camera.position.z);

    if (dist > ATTACK_RANGE) {
      toPlayer.normalize().multiplyScalar(enemy.speed * delta);
      const newPos: [number, number, number] = [
        pos.x + toPlayer.x,
        0,
        pos.z + toPlayer.z,
      ];
      updateEnemyPosition(enemy.id, newPos);
      groupRef.current.position.set(newPos[0], 0, newPos[2]);
      armSwing.current += delta * 10;
    } else {
      const now = Date.now();
      if (now - lastAttack.current > DAMAGE_INTERVAL) {
        lastAttack.current = now;
        const dmg = enemy.type === 'tank' ? 15 : enemy.type === 'runner' ? 3 : 8;
        takeDamage(dmg + Math.floor(Math.random() * 3));
      }
      armSwing.current += delta * 15;
    }

    bobPhase.current += delta * (enemy.type === 'runner' ? 14 : 8);
    groupRef.current.position.y = Math.abs(Math.sin(bobPhase.current)) * (enemy.type === 'runner' ? 0.15 : 0.08);
  });

  if (!enemy.alive) return null;

  const maxHealth = enemy.type === 'tank' ? 80 : enemy.type === 'runner' ? 15 : 30;

  return (
    <group ref={groupRef} position={enemy.position}>
      {enemy.type === 'runner' ? (
        <RunnerBody health={enemy.health} maxHealth={maxHealth} />
      ) : enemy.type === 'tank' ? (
        <TankBody health={enemy.health} maxHealth={maxHealth} />
      ) : (
        <GruntBody health={enemy.health} maxHealth={maxHealth} />
      )}
    </group>
  );
}
