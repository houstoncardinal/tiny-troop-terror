import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from './useGameStore';

const BULLET_SPEED = 80;
const MAX_DIST = 100;
const HIT_RADIUS = 0.8;

export default function Bullets() {
  const { bullets, removeBullet, enemies, damageEnemy } = useGameStore();
  const meshRefs = useRef<Record<string, THREE.Mesh>>({});

  useFrame((_, delta) => {
    bullets.forEach(bullet => {
      const mesh = meshRefs.current[bullet.id];
      if (!mesh) return;

      const dir = new THREE.Vector3(...bullet.direction);
      mesh.position.add(dir.multiplyScalar(BULLET_SPEED * delta));

      // Check if out of range
      const origin = new THREE.Vector3(...bullet.position);
      if (mesh.position.distanceTo(origin) > MAX_DIST) {
        removeBullet(bullet.id);
        return;
      }

      // Check enemy hits
      for (const enemy of enemies) {
        if (!enemy.alive) continue;
        const ePos = new THREE.Vector3(...enemy.position);
        ePos.y = 0.4;
        if (mesh.position.distanceTo(ePos) < HIT_RADIUS) {
          damageEnemy(enemy.id, 10 + Math.floor(Math.random() * 5));
          removeBullet(bullet.id);
          break;
        }
      }
    });
  });

  return (
    <>
      {bullets.map(b => (
        <mesh
          key={b.id}
          ref={(el) => { if (el) meshRefs.current[b.id] = el; }}
          position={b.position}
        >
          <sphereGeometry args={[0.05, 4, 4]} />
          <meshBasicMaterial color="#ffff00" />
        </mesh>
      ))}
    </>
  );
}
