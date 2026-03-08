import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from './useGameStore';
import { playSound } from './AudioManager';

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

// Enhanced muzzle flash with sparks
export function MuzzleFlash() {
  const lightRef = useRef<THREE.PointLight>(null);
  const sparkRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const lastBulletCount = useRef(0);
  const flashTimer = useRef(0);
  const SPARK_COUNT = 8;
  const sparks = useRef(Array.from({ length: SPARK_COUNT }, () => ({
    x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, active: false,
  })));

  useFrame((state, delta) => {
    const bullets = useGameStore.getState().bullets;
    const newShot = bullets.length > lastBulletCount.current;
    
    if (newShot) {
      flashTimer.current = 0.08;
      // Spawn sparks
      const cam = state.camera;
      const dir = new THREE.Vector3();
      cam.getWorldDirection(dir);
      const muzzlePos = cam.position.clone().add(dir.clone().multiplyScalar(1.2));
      
      sparks.current.forEach(s => {
        s.active = true;
        s.life = 0.1 + Math.random() * 0.1;
        s.x = muzzlePos.x; s.y = muzzlePos.y; s.z = muzzlePos.z;
        s.vx = dir.x * 15 + (Math.random() - 0.5) * 8;
        s.vy = dir.y * 15 + (Math.random() - 0.5) * 8;
        s.vz = dir.z * 15 + (Math.random() - 0.5) * 8;
      });
    }
    lastBulletCount.current = bullets.length;
    
    // Update light
    if (lightRef.current) {
      if (flashTimer.current > 0) {
        flashTimer.current -= delta;
        lightRef.current.intensity = flashTimer.current * 120;
        const cam = state.camera;
        const dir = new THREE.Vector3();
        cam.getWorldDirection(dir);
        lightRef.current.position.copy(cam.position).add(dir.multiplyScalar(1.5));
      } else {
        lightRef.current.intensity = 0;
      }
    }

    // Update sparks
    if (sparkRef.current) {
      sparks.current.forEach((s, i) => {
        if (!s.active) {
          dummy.position.set(0, -100, 0);
          dummy.scale.setScalar(0);
        } else {
          s.life -= delta;
          if (s.life <= 0) { s.active = false; return; }
          s.x += s.vx * delta;
          s.y += s.vy * delta - 5 * delta;
          s.z += s.vz * delta;
          dummy.position.set(s.x, s.y, s.z);
          dummy.scale.setScalar(s.life * 0.05);
        }
        dummy.updateMatrix();
        sparkRef.current!.setMatrixAt(i, dummy.matrix);
      });
      sparkRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <pointLight ref={lightRef} color="#ffaa33" distance={20} decay={2} />
      <instancedMesh ref={sparkRef} args={[undefined, undefined, SPARK_COUNT]}>
        <sphereGeometry args={[1, 4, 4]} />
        <meshBasicMaterial color="#ffcc44" />
      </instancedMesh>
    </>
  );
}

// Bullet trails
export function BulletTrails() {
  const trailRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const MAX = 20;
  const trails = useRef(Array.from({ length: MAX }, () => ({
    sx: 0, sy: 0, sz: 0, ex: 0, ey: 0, ez: 0, life: 0, active: false,
  })));
  const lastBulletCount = useRef(0);

  useFrame((state, delta) => {
    if (!trailRef.current) return;
    const { bullets } = useGameStore.getState();

    if (bullets.length > lastBulletCount.current) {
      const newBullets = bullets.slice(lastBulletCount.current);
      newBullets.forEach(b => {
        if (b.isGrenade) return;
        const t = trails.current.find(t => !t.active);
        if (t) {
          t.active = true;
          t.life = 0.15;
          t.sx = b.position[0]; t.sy = b.position[1]; t.sz = b.position[2];
          t.ex = b.position[0] + b.direction[0] * 3;
          t.ey = b.position[1] + b.direction[1] * 3;
          t.ez = b.position[2] + b.direction[2] * 3;
        }
      });
    }
    lastBulletCount.current = bullets.length;

    trails.current.forEach((t, i) => {
      if (!t.active) {
        dummy.position.set(0, -100, 0);
        dummy.scale.setScalar(0);
      } else {
        t.life -= delta;
        if (t.life <= 0) { t.active = false; return; }
        const mx = (t.sx + t.ex) / 2;
        const my = (t.sy + t.ey) / 2;
        const mz = (t.sz + t.ez) / 2;
        dummy.position.set(mx, my, mz);
        const dx = t.ex - t.sx;
        const dy = t.ey - t.sy;
        const dz = t.ez - t.sz;
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        dummy.lookAt(t.ex, t.ey, t.ez);
        dummy.scale.set(0.005 * t.life * 10, 0.005 * t.life * 10, len * t.life * 5);
      }
      dummy.updateMatrix();
      trailRef.current!.setMatrixAt(i, dummy.matrix);
    });
    trailRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={trailRef} args={[undefined, undefined, MAX]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#ffee88" transparent opacity={0.6} />
    </instancedMesh>
  );
}

// Hit marker particles with sound
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

    enemies.forEach(e => {
      const prev = lastEnemyHealth.current[e.id];
      if (prev !== undefined && e.health < prev && e.alive) {
        playSound('hit');
        for (let i = 0; i < 6; i++) {
          const p = particles.current.find(p => !p.active);
          if (p) {
            p.active = true;
            p.life = 0.5;
            p.x = e.position[0]; p.y = e.position[1] + 0.5; p.z = e.position[2];
            p.vx = (Math.random() - 0.5) * 10;
            p.vy = Math.random() * 8;
            p.vz = (Math.random() - 0.5) * 10;
          }
        }
      }
      if (!e.alive && prev !== undefined && prev > 0) {
        playSound('kill');
        for (let i = 0; i < 15; i++) {
          const p = particles.current.find(p => !p.active);
          if (p) {
            p.active = true;
            p.life = 1.0;
            p.x = e.position[0]; p.y = e.position[1] + 0.4; p.z = e.position[2];
            p.vx = (Math.random() - 0.5) * 15;
            p.vy = Math.random() * 12 + 3;
            p.vz = (Math.random() - 0.5) * 15;
          }
        }
      }
      lastEnemyHealth.current[e.id] = e.health;
    });

    particles.current.forEach((p, i) => {
      if (!p.active) {
        dummy.position.set(0, -100, 0);
        dummy.scale.setScalar(0);
      } else {
        p.life -= delta;
        if (p.life <= 0) { p.active = false; return; }
        p.vy -= 18 * delta;
        p.x += p.vx * delta;
        p.y += p.vy * delta;
        p.z += p.vz * delta;
        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.setScalar(p.life * 0.1);
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

// Impact decals on the ground
export function ImpactDecals() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const MAX = 40;
  const decals = useRef(Array.from({ length: MAX }, () => ({
    x: 0, z: 0, life: 0, active: false, size: 0.1,
  })));
  const lastEnemyStates = useRef<Record<string, boolean>>({});

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const enemies = useGameStore.getState().enemies;

    enemies.forEach(e => {
      const wasAlive = lastEnemyStates.current[e.id];
      if (wasAlive && !e.alive) {
        const d = decals.current.find(d => !d.active);
        if (d) {
          d.active = true;
          d.life = 8;
          d.x = e.position[0];
          d.z = e.position[2];
          d.size = 0.3 + Math.random() * 0.3;
        }
      }
      lastEnemyStates.current[e.id] = e.alive;
    });

    decals.current.forEach((d, i) => {
      if (!d.active) {
        dummy.position.set(0, -100, 0);
        dummy.scale.setScalar(0);
      } else {
        d.life -= delta;
        if (d.life <= 0) { d.active = false; return; }
        dummy.position.set(d.x, 0.02, d.z);
        dummy.rotation.set(-Math.PI / 2, 0, 0);
        const fade = Math.min(1, d.life / 2);
        dummy.scale.set(d.size * fade, d.size * fade, 1);
      }
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX]}>
      <circleGeometry args={[1, 8]} />
      <meshBasicMaterial color="#3a0000" transparent opacity={0.5} side={THREE.DoubleSide} />
    </instancedMesh>
  );
}
