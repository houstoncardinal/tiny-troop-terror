import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from './useGameStore';

const MAX_DIST = 100;
const HIT_RADIUS = 0.8;
const GRENADE_RADIUS = 6;

export default function Bullets() {
  const { bullets, removeBullet, enemies, damageEnemy } = useGameStore();
  const meshRefs = useRef<Record<string, THREE.Mesh>>({});
  const grenadeVelocities = useRef<Record<string, THREE.Vector3>>({});

  useFrame((_, delta) => {
    bullets.forEach(bullet => {
      const mesh = meshRefs.current[bullet.id];
      if (!mesh) return;

      if (bullet.isGrenade) {
        // Grenade physics - arc trajectory
        if (!grenadeVelocities.current[bullet.id]) {
          grenadeVelocities.current[bullet.id] = new THREE.Vector3(
            bullet.direction[0] * bullet.speed,
            bullet.direction[1] * bullet.speed + 8,
            bullet.direction[2] * bullet.speed
          );
        }
        const vel = grenadeVelocities.current[bullet.id];
        vel.y -= 20 * delta; // gravity
        mesh.position.add(vel.clone().multiplyScalar(delta));
        mesh.rotation.x += delta * 5;
        mesh.rotation.z += delta * 3;

        // Explode on ground or after 2.5s
        if (mesh.position.y <= 0.1 || Date.now() - bullet.createdAt > 2500) {
          // Damage all enemies in radius
          for (const enemy of enemies) {
            if (!enemy.alive) continue;
            const ePos = new THREE.Vector3(...enemy.position);
            const dist = mesh.position.distanceTo(ePos);
            if (dist < GRENADE_RADIUS) {
              const falloff = 1 - dist / GRENADE_RADIUS;
              const dmg = Math.floor(bullet.damage * falloff);
              if (bullet.grenadeType === 'grenade' && dmg > 0) {
                damageEnemy(enemy.id, dmg);
              }
            }
          }
          delete grenadeVelocities.current[bullet.id];
          removeBullet(bullet.id);
          return;
        }
      } else {
        // Regular bullet
        const dir = new THREE.Vector3(...bullet.direction);
        mesh.position.add(dir.multiplyScalar(bullet.speed * delta));

        const origin = new THREE.Vector3(...bullet.position);
        if (mesh.position.distanceTo(origin) > MAX_DIST) {
          removeBullet(bullet.id);
          return;
        }

        for (const enemy of enemies) {
          if (!enemy.alive) continue;
          const ePos = new THREE.Vector3(...enemy.position);
          ePos.y = 0.4;
          if (mesh.position.distanceTo(ePos) < HIT_RADIUS) {
            damageEnemy(enemy.id, bullet.damage);
            removeBullet(bullet.id);
            break;
          }
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
          {b.isGrenade ? (
            <>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial color={b.grenadeType === 'flashbang' ? '#ccc' : '#3a5a2a'} />
            </>
          ) : (
            <>
              <sphereGeometry args={[0.04, 4, 4]} />
              <meshBasicMaterial color="#ffdd00" />
            </>
          )}
        </mesh>
      ))}
    </>
  );
}
