import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, type Enemy } from './useGameStore';

const ATTACK_RANGE = 2.5;
const DAMAGE_INTERVAL = 800;

function MinionBody({ health, maxHealth }: { health: number; maxHealth: number }) {
  const healthPct = health / maxHealth;

  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <boxGeometry args={[0.3, 0.4, 0.2]} />
        <meshStandardMaterial color="#8B0000" roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#DEB887" roughness={0.5} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.05, 0.68, 0.12]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshBasicMaterial color="red" />
      </mesh>
      <mesh position={[0.05, 0.68, 0.12]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshBasicMaterial color="red" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.08, 0.05, 0]} castShadow>
        <boxGeometry args={[0.1, 0.2, 0.1]} />
        <meshStandardMaterial color="#4a3728" roughness={0.7} />
      </mesh>
      <mesh position={[0.08, 0.05, 0]} castShadow>
        <boxGeometry args={[0.1, 0.2, 0.1]} />
        <meshStandardMaterial color="#4a3728" roughness={0.7} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.22, 0.35, 0]} castShadow>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <meshStandardMaterial color="#DEB887" roughness={0.5} />
      </mesh>
      <mesh position={[0.22, 0.35, 0]} castShadow>
        <boxGeometry args={[0.08, 0.3, 0.08]} />
        <meshStandardMaterial color="#DEB887" roughness={0.5} />
      </mesh>
      {/* Tiny weapon */}
      <mesh position={[0.28, 0.3, 0.1]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.04, 0.04, 0.25]} />
        <meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Health bar */}
      <group position={[0, 0.95, 0]}>
        <mesh>
          <planeGeometry args={[0.4, 0.05]} />
          <meshBasicMaterial color="#333" />
        </mesh>
        <mesh position={[(healthPct - 1) * 0.19, 0, 0.001]}>
          <planeGeometry args={[0.38 * healthPct, 0.03]} />
          <meshBasicMaterial color={healthPct > 0.5 ? '#00ff00' : healthPct > 0.25 ? '#ffaa00' : '#ff0000'} />
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

  useFrame((_, delta) => {
    if (!enemy.alive || !groupRef.current) return;

    const pos = new THREE.Vector3(...enemy.position);
    const playerPos = camera.position.clone();
    playerPos.y = 0;
    const toPlayer = playerPos.sub(pos);
    const dist = toPlayer.length();

    // Look at player
    groupRef.current.lookAt(camera.position.x, 0.4, camera.position.z);

    // Move toward player
    if (dist > ATTACK_RANGE) {
      toPlayer.normalize().multiplyScalar(enemy.speed * delta);
      const newPos: [number, number, number] = [
        pos.x + toPlayer.x,
        0,
        pos.z + toPlayer.z,
      ];
      updateEnemyPosition(enemy.id, newPos);
      groupRef.current.position.set(newPos[0], 0, newPos[2]);
    } else {
      // Attack
      const now = Date.now();
      if (now - lastAttack.current > DAMAGE_INTERVAL) {
        lastAttack.current = now;
        takeDamage(5 + Math.floor(Math.random() * 5));
      }
    }

    // Bob animation
    bobPhase.current += delta * 8;
    groupRef.current.position.y = Math.abs(Math.sin(bobPhase.current)) * 0.1;
  });

  if (!enemy.alive) return null;

  return (
    <group ref={groupRef} position={enemy.position}>
      <MinionBody health={enemy.health} maxHealth={30} />
    </group>
  );
}
