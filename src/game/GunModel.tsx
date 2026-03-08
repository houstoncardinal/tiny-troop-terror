import { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from './useGameStore';

export default function GunModel() {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const { ammo, gameState } = useGameStore();
  const [recoil, setRecoil] = useState(0);

  useEffect(() => {
    const onClick = () => {
      if (gameState !== 'playing' || ammo <= 0) return;
      setRecoil(1);
    };
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [gameState, ammo]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    // Attach gun to camera
    const offset = new THREE.Vector3(0.3, -0.25, -0.5);
    offset.applyQuaternion(camera.quaternion);
    groupRef.current.position.copy(camera.position).add(offset);
    groupRef.current.quaternion.copy(camera.quaternion);

    // Recoil animation
    if (recoil > 0) {
      setRecoil(Math.max(0, recoil - delta * 8));
      const kickOffset = new THREE.Vector3(0, 0.02 * recoil, 0.05 * recoil);
      kickOffset.applyQuaternion(camera.quaternion);
      groupRef.current.position.add(kickOffset);
    }
  });

  if (gameState !== 'playing') return null;

  return (
    <group ref={groupRef}>
      {/* Gun body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.06, 0.08, 0.4]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.9} roughness={0.3} />
      </mesh>
      {/* Barrel */}
      <mesh position={[0, 0.01, -0.25]}>
        <cylinderGeometry args={[0.015, 0.02, 0.2, 8]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.95} roughness={0.2} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, -0.07, 0.08]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.05, 0.1, 0.04]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.8} />
      </mesh>
      {/* Magazine */}
      <mesh position={[0, -0.08, -0.02]}>
        <boxGeometry args={[0.04, 0.08, 0.04]} />
        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.4} />
      </mesh>
      {/* Muzzle flash */}
      {recoil > 0.5 && (
        <pointLight position={[0, 0, -0.4]} color="#ffaa00" intensity={3} distance={5} />
      )}
    </group>
  );
}
