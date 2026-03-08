import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from './useGameStore';

// Floating dust/snow/pollen particles per map
export function AtmosphericParticles({ count = 200, color = '#d4a853', speed = 0.3, spread = 60, height = 20 }: {
  count?: number; color?: string; speed?: number; spread?: number; height?: number;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() =>
    Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * spread,
      y: Math.random() * height,
      z: (Math.random() - 0.5) * spread,
      vx: (Math.random() - 0.5) * speed,
      vy: -Math.random() * speed * 0.5,
      vz: (Math.random() - 0.5) * speed,
      phase: Math.random() * Math.PI * 2,
      size: 0.5 + Math.random() * 0.5,
    }))
  , [count, spread, height, speed]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      p.phase += delta * 0.5;
      p.x += p.vx * delta + Math.sin(p.phase) * 0.01;
      p.y += p.vy * delta;
      p.z += p.vz * delta + Math.cos(p.phase) * 0.01;
      if (p.y < 0) { p.y = height; p.x = (Math.random() - 0.5) * spread; p.z = (Math.random() - 0.5) * spread; }
      if (Math.abs(p.x) > spread / 2) p.vx *= -1;
      if (Math.abs(p.z) > spread / 2) p.vz *= -1;
      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.setScalar(p.size * 0.03);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </instancedMesh>
  );
}

// Muzzle flash effect
export function MuzzleFlash() {
  const ref = useRef<THREE.PointLight>(null);
  const lastBulletCount = useRef(0);
  const flashTimer = useRef(0);

  useFrame((state, delta) => {
    const bullets = useGameStore.getState().bullets;
    if (bullets.length > lastBulletCount.current) {
      flashTimer.current = 0.06;
    }
    lastBulletCount.current = bullets.length;
    
    if (ref.current) {
      if (flashTimer.current > 0) {
        flashTimer.current -= delta;
        ref.current.intensity = flashTimer.current * 80;
        const cam = state.camera;
        const dir = new THREE.Vector3();
        cam.getWorldDirection(dir);
        ref.current.position.copy(cam.position).add(dir.multiplyScalar(1.5));
      } else {
        ref.current.intensity = 0;
      }
    }
  });

  return <pointLight ref={ref} color="#ffaa33" distance={15} decay={2} />;
}

// Hit marker particles - instanced for performance
export function HitParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const MAX = 100;
  const particles = useRef<Array<{
    x: number; y: number; z: number;
    vx: number; vy: number; vz: number;
    life: number; active: boolean;
  }>>(Array.from({ length: MAX }, () => ({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, active: false })));
  const lastEnemyHealth = useRef<Record<string, number>>({});

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const enemies = useGameStore.getState().enemies;

    // Detect hits
    enemies.forEach(e => {
      const prev = lastEnemyHealth.current[e.id];
      if (prev !== undefined && e.health < prev && e.alive) {
        // Spawn particles at enemy position
        for (let i = 0; i < 5; i++) {
          const p = particles.current.find(p => !p.active);
          if (p) {
            p.active = true;
            p.life = 0.4;
            p.x = e.position[0]; p.y = e.position[1] + 0.5; p.z = e.position[2];
            p.vx = (Math.random() - 0.5) * 8;
            p.vy = Math.random() * 6;
            p.vz = (Math.random() - 0.5) * 8;
          }
        }
      }
      if (!e.alive && prev !== undefined && prev > 0) {
        // Death explosion
        for (let i = 0; i < 12; i++) {
          const p = particles.current.find(p => !p.active);
          if (p) {
            p.active = true;
            p.life = 0.8;
            p.x = e.position[0]; p.y = e.position[1] + 0.4; p.z = e.position[2];
            p.vx = (Math.random() - 0.5) * 12;
            p.vy = Math.random() * 10 + 2;
            p.vz = (Math.random() - 0.5) * 12;
          }
        }
      }
      lastEnemyHealth.current[e.id] = e.health;
    });

    // Update particles
    particles.current.forEach((p, i) => {
      if (!p.active) {
        dummy.position.set(0, -100, 0);
        dummy.scale.setScalar(0);
      } else {
        p.life -= delta;
        if (p.life <= 0) { p.active = false; return; }
        p.vy -= 15 * delta;
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.z += p.vz * delta;
        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.setScalar(p.life * 0.08);
      }
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#ff4400" />
    </instancedMesh>
  );
}

// Shell casings ejection
export function ShellCasings() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const MAX = 30;
  const shells = useRef<Array<{
    x: number; y: number; z: number;
    vx: number; vy: number; vz: number;
    rx: number; ry: number; rz: number;
    life: number; active: boolean;
  }>>(Array.from({ length: MAX }, () => ({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, rx: 0, ry: 0, rz: 0, life: 0, active: false })));
  const lastBullets = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const { bullets, currentWeaponId } = useGameStore.getState();

    if (bullets.length > lastBullets.current && currentWeaponId !== 'grenade' && currentWeaponId !== 'flashbang') {
      const s = shells.current.find(s => !s.active);
      if (s) {
        const cam = state.camera;
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion);
        s.active = true;
        s.life = 2;
        s.x = cam.position.x + right.x * 0.3;
        s.y = cam.position.y - 0.2;
        s.z = cam.position.z + right.z * 0.3;
        s.vx = right.x * 3 + (Math.random() - 0.5);
        s.vy = Math.random() * 3 + 1;
        s.vz = right.z * 3 + (Math.random() - 0.5);
        s.rx = Math.random() * 10; s.ry = Math.random() * 10; s.rz = Math.random() * 10;
      }
    }
    lastBullets.current = bullets.length;

    shells.current.forEach((s, i) => {
      if (!s.active) {
        dummy.position.set(0, -100, 0);
        dummy.scale.setScalar(0);
      } else {
        s.life -= delta;
        if (s.life <= 0) { s.active = false; return; }
        s.vy -= 12 * delta;
        s.x += s.vx * delta;
        s.y = Math.max(0, s.y + s.vy * delta);
        s.z += s.vz * delta;
        if (s.y <= 0) { s.vy *= -0.3; s.vx *= 0.5; s.vz *= 0.5; }
        dummy.position.set(s.x, s.y, s.z);
        dummy.rotation.set(s.rx += delta * 8, s.ry += delta * 5, s.rz += delta * 3);
        dummy.scale.set(0.015, 0.015, 0.04);
      }
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX]}>
      <cylinderGeometry args={[1, 1, 1, 6]} />
      <meshStandardMaterial color="#c8a832" metalness={0.9} roughness={0.2} />
    </instancedMesh>
  );
}
