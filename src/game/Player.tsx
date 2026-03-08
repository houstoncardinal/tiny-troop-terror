import { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from './useGameStore';

const SPEED = 12;
const SPRINT_SPEED = 18;
const CROUCH_SPEED = 6;
const GRAVITY = -25;
const JUMP_FORCE = 10;
const STAND_HEIGHT = 1.7;
const CROUCH_HEIGHT = 1.0;
const GROUND_Y = 0;

export default function Player() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const velocity = useRef(new THREE.Vector3());
  const keys = useRef<Record<string, boolean>>({});
  const { shoot, gameState, reload, setLocked, setCrouching, isCrouching } = useGameStore();
  const lastShot = useRef(0);
  const verticalVelocity = useRef(0);
  const isGrounded = useRef(true);
  const currentHeight = useRef(STAND_HEIGHT);
  const headBob = useRef(0);

  useEffect(() => {
    camera.position.set(0, STAND_HEIGHT, 30);

    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === 'KeyR') reload();
      if (e.code === 'Space' && isGrounded.current) {
        verticalVelocity.current = JUMP_FORCE;
        isGrounded.current = false;
      }
      if (e.code === 'KeyC' || e.code === 'ControlLeft') {
        setCrouching(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
      if (e.code === 'KeyC' || e.code === 'ControlLeft') {
        setCrouching(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [camera, reload, setCrouching]);

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
    const sprint = k['ShiftLeft'] ? SPRINT_SPEED : isCrouching ? CROUCH_SPEED : SPEED;
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

    const isMoving = direction.length() > 0;
    if (isMoving) {
      direction.normalize();
      velocity.current.lerp(direction.multiplyScalar(sprint), 0.15);
    } else {
      velocity.current.lerp(new THREE.Vector3(), 0.2);
    }

    // Gravity & jumping
    verticalVelocity.current += GRAVITY * delta;
    const targetHeight = isCrouching ? CROUCH_HEIGHT : STAND_HEIGHT;
    currentHeight.current += (targetHeight - currentHeight.current) * 0.15;

    const newPos = camera.position.clone().add(velocity.current.clone().multiplyScalar(delta));
    newPos.y += verticalVelocity.current * delta;

    // Ground collision
    if (newPos.y <= GROUND_Y + currentHeight.current) {
      newPos.y = GROUND_Y + currentHeight.current;
      verticalVelocity.current = 0;
      isGrounded.current = true;
    }

    // Head bob when moving on ground
    if (isMoving && isGrounded.current) {
      headBob.current += delta * (k['ShiftLeft'] ? 14 : 10);
      newPos.y += Math.sin(headBob.current) * 0.04;
    }

    // Clamp to map bounds
    newPos.x = Math.max(-48, Math.min(48, newPos.x));
    newPos.z = Math.max(-48, Math.min(48, newPos.z));
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
