import { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from './useGameStore';

const SPEED = 12;
const SPRINT_SPEED = 18;

export default function Player() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const velocity = useRef(new THREE.Vector3());
  const keys = useRef<Record<string, boolean>>({});
  const { shoot, gameState, reload, setLocked } = useGameStore();
  const lastShot = useRef(0);

  useEffect(() => {
    camera.position.set(0, 1.7, 30);

    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === 'KeyR') reload();
    };
    const onKeyUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [camera, reload]);

  const handleClick = useCallback(() => {
    if (gameState !== 'playing') return;
    const now = Date.now();
    if (now - lastShot.current < 100) return;
    lastShot.current = now;

    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const pos = camera.position.clone();
    shoot(
      [pos.x, pos.y, pos.z],
      [dir.x, dir.y, dir.z]
    );
  }, [camera, shoot, gameState]);

  useEffect(() => {
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [handleClick]);

  useFrame((_, delta) => {
    if (gameState !== 'playing') return;

    const k = keys.current;
    const sprint = k['ShiftLeft'] ? SPRINT_SPEED : SPEED;
    const direction = new THREE.Vector3();

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    if (k['KeyW'] || k['ArrowUp']) direction.add(forward);
    if (k['KeyS'] || k['ArrowDown']) direction.sub(forward);
    if (k['KeyA'] || k['ArrowLeft']) direction.sub(right);
    if (k['KeyD'] || k['ArrowRight']) direction.add(right);

    if (direction.length() > 0) {
      direction.normalize();
      velocity.current.lerp(direction.multiplyScalar(sprint), 0.15);
    } else {
      velocity.current.lerp(new THREE.Vector3(), 0.2);
    }

    const newPos = camera.position.clone().add(velocity.current.clone().multiplyScalar(delta));
    // Clamp to map bounds
    newPos.x = Math.max(-48, Math.min(48, newPos.x));
    newPos.z = Math.max(-48, Math.min(48, newPos.z));
    newPos.y = 1.7;
    camera.position.copy(newPos);
  });

  return (
    <PointerLockControls
      ref={controlsRef}
      onLock={() => setLocked(true)}
      onUnlock={() => setLocked(false)}
    />
  );
}
