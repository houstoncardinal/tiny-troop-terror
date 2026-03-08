import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from './useGameStore';
import { WEAPONS } from './weapons';

function PistolMesh() {
  return (
    <group>
      <mesh><boxGeometry args={[0.05, 0.06, 0.22]} /><meshStandardMaterial color="#2a2a2a" metalness={0.9} roughness={0.3} /></mesh>
      <mesh position={[0, 0.01, -0.15]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.012, 0.015, 0.12, 8]} /><meshStandardMaterial color="#1a1a1a" metalness={0.95} roughness={0.2} /></mesh>
      <mesh position={[0, -0.06, 0.04]} rotation={[0.3,0,0]}><boxGeometry args={[0.04, 0.09, 0.035]} /><meshStandardMaterial color="#3a2a1a" roughness={0.8} /></mesh>
      <mesh position={[0, -0.06, -0.01]}><boxGeometry args={[0.03, 0.06, 0.03]} /><meshStandardMaterial color="#222" metalness={0.8} roughness={0.4} /></mesh>
    </group>
  );
}

function DeagleMesh() {
  return (
    <group scale={[1.2,1.2,1.2]}>
      <mesh><boxGeometry args={[0.06, 0.07, 0.28]} /><meshStandardMaterial color="#c0c0c0" metalness={0.95} roughness={0.15} /></mesh>
      <mesh position={[0, 0.01, -0.19]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.016, 0.02, 0.14, 8]} /><meshStandardMaterial color="#aaa" metalness={0.95} roughness={0.1} /></mesh>
      <mesh position={[0, -0.07, 0.06]} rotation={[0.35,0,0]}><boxGeometry args={[0.05, 0.1, 0.04]} /><meshStandardMaterial color="#2a1a0a" roughness={0.8} /></mesh>
      <mesh position={[0, -0.08, -0.02]}><boxGeometry args={[0.035, 0.08, 0.035]} /><meshStandardMaterial color="#999" metalness={0.8} roughness={0.3} /></mesh>
      {/* Barrel weight */}
      <mesh position={[0, -0.02, -0.18]}><boxGeometry args={[0.065, 0.04, 0.08]} /><meshStandardMaterial color="#b0b0b0" metalness={0.9} roughness={0.2} /></mesh>
    </group>
  );
}

function RifleMesh({ isM4 }: { isM4?: boolean }) {
  const color = isM4 ? '#1a1a1a' : '#3a3020';
  return (
    <group>
      <mesh><boxGeometry args={[0.06, 0.08, 0.5]} /><meshStandardMaterial color={color} metalness={0.85} roughness={0.35} /></mesh>
      <mesh position={[0, 0.01, -0.3]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.013, 0.018, 0.25, 8]} /><meshStandardMaterial color="#1a1a1a" metalness={0.95} roughness={0.2} /></mesh>
      <mesh position={[0, -0.07, 0.12]} rotation={[0.3,0,0]}><boxGeometry args={[0.05, 0.1, 0.04]} /><meshStandardMaterial color="#3a2a1a" roughness={0.8} /></mesh>
      <mesh position={[0, -0.1, -0.02]} rotation={[0.1,0,0]}><boxGeometry args={[0.035, 0.1, 0.035]} /><meshStandardMaterial color="#222" metalness={0.8} roughness={0.4} /></mesh>
      {/* Stock */}
      <mesh position={[0, 0.01, 0.32]}><boxGeometry args={[0.05, 0.07, 0.12]} /><meshStandardMaterial color={isM4 ? '#1a1a1a' : '#4a3828'} roughness={0.7} /></mesh>
      {/* Scope rail */}
      <mesh position={[0, 0.05, -0.05]}><boxGeometry args={[0.02, 0.015, 0.2]} /><meshStandardMaterial color="#333" metalness={0.9} roughness={0.3} /></mesh>
      {isM4 && <mesh position={[0, 0.065, -0.05]}><boxGeometry args={[0.025, 0.02, 0.06]} /><meshStandardMaterial color="#222" metalness={0.8} roughness={0.3} /></mesh>}
    </group>
  );
}

function ShotgunMesh() {
  return (
    <group>
      <mesh><boxGeometry args={[0.06, 0.07, 0.55]} /><meshStandardMaterial color="#2a2a2a" metalness={0.8} roughness={0.4} /></mesh>
      <mesh position={[0, 0.01, -0.32]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.02, 0.025, 0.25, 8]} /><meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.25} /></mesh>
      {/* Pump */}
      <mesh position={[0, -0.02, -0.15]}><boxGeometry args={[0.065, 0.045, 0.12]} /><meshStandardMaterial color="#4a3828" roughness={0.7} /></mesh>
      <mesh position={[0, -0.07, 0.14]} rotation={[0.3,0,0]}><boxGeometry args={[0.05, 0.1, 0.04]} /><meshStandardMaterial color="#3a2a1a" roughness={0.8} /></mesh>
      <mesh position={[0, 0.01, 0.35]}><boxGeometry args={[0.05, 0.06, 0.1]} /><meshStandardMaterial color="#3a2a1a" roughness={0.7} /></mesh>
    </group>
  );
}

function AWPMesh() {
  return (
    <group>
      <mesh><boxGeometry args={[0.055, 0.07, 0.6]} /><meshStandardMaterial color="#2a3a2a" metalness={0.85} roughness={0.35} /></mesh>
      <mesh position={[0, 0.01, -0.38]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.015, 0.02, 0.3, 8]} /><meshStandardMaterial color="#1a1a1a" metalness={0.95} roughness={0.2} /></mesh>
      <mesh position={[0, -0.07, 0.15]} rotation={[0.3,0,0]}><boxGeometry args={[0.05, 0.1, 0.04]} /><meshStandardMaterial color="#3a2a1a" roughness={0.8} /></mesh>
      {/* Scope */}
      <mesh position={[0, 0.07, -0.05]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.02, 0.02, 0.14, 8]} /><meshStandardMaterial color="#111" metalness={0.9} roughness={0.2} /></mesh>
      <mesh position={[0, 0.07, -0.12]}><sphereGeometry args={[0.022, 8, 8]} /><meshStandardMaterial color="#335588" metalness={0.5} roughness={0.1} /></mesh>
      {/* Stock */}
      <mesh position={[0, 0.01, 0.38]}><boxGeometry args={[0.05, 0.08, 0.16]} /><meshStandardMaterial color="#2a3a2a" roughness={0.6} /></mesh>
      {/* Bipod */}
      <mesh position={[-0.03, -0.06, -0.2]} rotation={[0,0,0.3]}><cylinderGeometry args={[0.005, 0.005, 0.1, 4]} /><meshStandardMaterial color="#333" metalness={0.9} /></mesh>
      <mesh position={[0.03, -0.06, -0.2]} rotation={[0,0,-0.3]}><cylinderGeometry args={[0.005, 0.005, 0.1, 4]} /><meshStandardMaterial color="#333" metalness={0.9} /></mesh>
    </group>
  );
}

function GrenadeMesh() {
  return (
    <group>
      <mesh><sphereGeometry args={[0.05, 12, 12]} /><meshStandardMaterial color="#3a5a2a" roughness={0.6} metalness={0.3} /></mesh>
      <mesh position={[0, 0.06, 0]}><cylinderGeometry args={[0.015, 0.015, 0.03, 6]} /><meshStandardMaterial color="#888" metalness={0.9} /></mesh>
      {/* Ring */}
      <mesh position={[0.02, 0.08, 0]} rotation={[0, 0, 0.5]}><torusGeometry args={[0.012, 0.003, 6, 12]} /><meshStandardMaterial color="#ccc" metalness={0.9} /></mesh>
    </group>
  );
}

function FlashbangMesh() {
  return (
    <group>
      <mesh><cylinderGeometry args={[0.035, 0.035, 0.08, 8]} /><meshStandardMaterial color="#888" metalness={0.7} roughness={0.3} /></mesh>
      <mesh position={[0, 0.05, 0]}><cylinderGeometry args={[0.012, 0.012, 0.025, 6]} /><meshStandardMaterial color="#666" metalness={0.9} /></mesh>
    </group>
  );
}

function WeaponMesh({ weaponId }: { weaponId: string }) {
  switch (weaponId) {
    case 'deagle': return <DeagleMesh />;
    case 'ak47': return <RifleMesh />;
    case 'm4a1': return <RifleMesh isM4 />;
    case 'shotgun': return <ShotgunMesh />;
    case 'awp': return <AWPMesh />;
    case 'grenade': return <GrenadeMesh />;
    case 'flashbang': return <FlashbangMesh />;
    default: return <PistolMesh />;
  }
}

export default function GunModel() {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const { gameState, currentWeaponId, isReloading } = useGameStore();
  const owned = useGameStore(s => s.ownedWeapons.find(w => w.id === s.currentWeaponId));
  const [recoil, setRecoil] = useState(0);
  const reloadAnim = useRef(0);

  useEffect(() => {
    const onClick = () => {
      if (gameState !== 'playing' || !owned || owned.currentAmmo <= 0 || isReloading) return;
      const weapon = WEAPONS[currentWeaponId];
      setRecoil(weapon.recoil);
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [gameState, owned, currentWeaponId, isReloading]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const offset = new THREE.Vector3(0.3, -0.25, -0.5);
    offset.applyQuaternion(camera.quaternion);
    groupRef.current.position.copy(camera.position).add(offset);
    groupRef.current.quaternion.copy(camera.quaternion);

    if (recoil > 0) {
      setRecoil(Math.max(0, recoil - delta * 8));
      const kickOffset = new THREE.Vector3(0, 0.02 * recoil, 0.05 * recoil);
      kickOffset.applyQuaternion(camera.quaternion);
      groupRef.current.position.add(kickOffset);
    }

    if (isReloading) {
      reloadAnim.current += delta * 6;
      const rotOffset = new THREE.Euler(Math.sin(reloadAnim.current) * 0.3, 0, Math.sin(reloadAnim.current * 0.5) * 0.15);
      groupRef.current.rotation.x += rotOffset.x;
      groupRef.current.rotation.z += rotOffset.z;
      const dropOffset = new THREE.Vector3(0, -0.05 * Math.abs(Math.sin(reloadAnim.current)), 0);
      dropOffset.applyQuaternion(camera.quaternion);
      groupRef.current.position.add(dropOffset);
    } else {
      reloadAnim.current = 0;
    }
  });

  if (gameState !== 'playing') return null;

  return (
    <group ref={groupRef}>
      <WeaponMesh weaponId={currentWeaponId} />
      {recoil > 0.3 && (
        <pointLight position={[0, 0, -0.5]} color="#ffaa00" intensity={4} distance={6} />
      )}
    </group>
  );
}
