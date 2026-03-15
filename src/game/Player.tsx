import { useRef, useEffect, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from './useGameStore';
import { WEAPONS, WEAPON_ORDER } from './weapons';
import { playSound } from './AudioManager';

const SPEED = 12;
const SPRINT_SPEED = 18;
const CROUCH_SPEED = 6;
const GRAVITY = -25;
const JUMP_FORCE = 10;
const STAND_HEIGHT = 1.7;
const CROUCH_HEIGHT = 1.0;
const GROUND_Y = 0;
const DEFAULT_FOV = 75;
const ADS_FOV = 40;
const SPRINT_FOV = 85;

export default function Player() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const velocity = useRef(new THREE.Vector3());
  const keys = useRef<Record<string, boolean>>({});
  const lastShot = useRef(0);
  const verticalVelocity = useRef(0);
  const isGrounded = useRef(true);
  const currentHeight = useRef(STAND_HEIGHT);
  const headBob = useRef(0);
  const mouseDown = useRef(false);
  const rightMouseDown = useRef(false);
  const initialized = useRef(false);
  const footstepTimer = useRef(0);
  const currentFOV = useRef(DEFAULT_FOV);

  // Initialize camera position only once
  useEffect(() => {
    if (!initialized.current) {
      camera.position.set(0, STAND_HEIGHT, 30);
      initialized.current = true;
    }
  }, [camera]);

  // Stable refs for store values used in key handlers
  const storeRef = useRef(useGameStore.getState());
  useEffect(() => {
    const unsub = useGameStore.subscribe(state => { storeRef.current = state; });
    return unsub;
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      const s = storeRef.current;

      if (e.code === 'KeyR') {
        s.reload();
        playSound('reload');
      }
      if (e.code === 'Space' && isGrounded.current) {
        verticalVelocity.current = JUMP_FORCE;
        isGrounded.current = false;
        playSound('jump');
      }
      if (e.code === 'KeyC' || e.code === 'ControlLeft') s.setCrouching(true);
      if (e.code === 'KeyB') {
        s.toggleShop();
        playSound('ui_click');
      }

      // Number keys to switch weapons
      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        const ownedIds = s.ownedWeapons.map(w => w.id);
        const ordered = WEAPON_ORDER.filter(id => ownedIds.includes(id));
        if (ordered[num - 1]) {
          s.switchWeapon(ordered[num - 1]);
          playSound('weapon_switch');
        }
      }
      // Q to cycle weapons
      if (e.code === 'KeyQ') {
        const ownedIds = s.ownedWeapons.map(w => w.id);
        const ordered = WEAPON_ORDER.filter(id => ownedIds.includes(id));
        const idx = ordered.indexOf(s.currentWeaponId);
        const next = ordered[(idx + 1) % ordered.length];
        if (next) {
          s.switchWeapon(next);
          playSound('weapon_switch');
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
      if (e.code === 'KeyC' || e.code === 'ControlLeft') storeRef.current.setCrouching(false);
    };
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) mouseDown.current = true;
      if (e.button === 2) {
        rightMouseDown.current = true;
        useGameStore.getState().setADS(true);
      }
    };
    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 0) mouseDown.current = false;
      if (e.button === 2) {
        rightMouseDown.current = false;
        useGameStore.getState().setADS(false);
      }
    };
    const onContextMenu = (e: Event) => e.preventDefault();

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('contextmenu', onContextMenu);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('contextmenu', onContextMenu);
    };
  }, []);

  const fireWeapon = useCallback(() => {
    const s = useGameStore.getState();
    if (s.gameState !== 'playing' || s.isReloading) return;
    const weapon = WEAPONS[s.currentWeaponId];
    const now = Date.now();
    if (now - lastShot.current < weapon.fireRate) return;
    lastShot.current = now;

    const owned = s.ownedWeapons.find(w => w.id === s.currentWeaponId);
    if (!owned || owned.currentAmmo <= 0) {
      playSound('empty');
      return;
    }

    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const pos = camera.position.clone();
    s.shoot([pos.x, pos.y, pos.z], [dir.x, dir.y, dir.z]);

    // Play weapon-specific sound
    if (weapon.type === 'grenade') playSound('grenade_throw');
    else if (weapon.type === 'shotgun') playSound('shotgun');
    else if (weapon.type === 'sniper') playSound('sniper');
    else if (weapon.type === 'rifle') playSound('rifle');
    else playSound('pistol');
  }, [camera]);

  useEffect(() => {
    const onClick = () => fireWeapon();
    window.addEventListener('click', onClick);
    return () => window.removeEventListener('click', onClick);
  }, [fireWeapon]);

  useFrame((_, delta) => {
    const s = useGameStore.getState();
    if (s.gameState !== 'playing') return;

    s.updateCombo(delta);

    // Auto-fire for automatic weapons
    const weapon = WEAPONS[s.currentWeaponId];
    if (weapon.auto && mouseDown.current) {
      fireWeapon();
    }

    // FOV interpolation (ADS / Sprint / Normal)
    const isSprinting = keys.current['ShiftLeft'] && !s.isADS;
    const targetFOV = s.isADS ? (weapon.type === 'sniper' ? 20 : ADS_FOV) : isSprinting ? SPRINT_FOV : DEFAULT_FOV;
    currentFOV.current += (targetFOV - currentFOV.current) * 0.12;
    (camera as THREE.PerspectiveCamera).fov = currentFOV.current;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();

    const k = keys.current;
    const sprint = isSprinting ? SPRINT_SPEED : s.isCrouching ? CROUCH_SPEED : SPEED;
    // Slower movement when ADS
    const moveSpeed = s.isADS ? sprint * 0.6 : sprint;
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
      velocity.current.lerp(direction.multiplyScalar(moveSpeed), 0.15);
    } else {
      velocity.current.lerp(new THREE.Vector3(), 0.2);
    }

    // Footstep sounds
    if (isMoving && isGrounded.current) {
      footstepTimer.current += delta * (isSprinting ? 1.8 : 1);
      if (footstepTimer.current > 0.4) {
        footstepTimer.current = 0;
        playSound('footstep');
      }
    }

    verticalVelocity.current += GRAVITY * delta;
    const targetHeight = s.isCrouching ? CROUCH_HEIGHT : STAND_HEIGHT;
    currentHeight.current += (targetHeight - currentHeight.current) * 0.15;

    const newPos = camera.position.clone().add(velocity.current.clone().multiplyScalar(delta));
    newPos.y += verticalVelocity.current * delta;

    if (newPos.y <= GROUND_Y + currentHeight.current) {
      if (!isGrounded.current && verticalVelocity.current < -3) {
        playSound('land');
      }
      newPos.y = GROUND_Y + currentHeight.current;
      verticalVelocity.current = 0;
      isGrounded.current = true;
    }

    if (isMoving && isGrounded.current) {
      headBob.current += delta * (isSprinting ? 14 : 10);
      newPos.y += Math.sin(headBob.current) * (s.isADS ? 0.01 : 0.04);
    }

    newPos.x = Math.max(-48, Math.min(48, newPos.x));
    newPos.z = Math.max(-48, Math.min(48, newPos.z));
    camera.position.copy(newPos);
  });

  return (
    <PointerLockControls
      ref={controlsRef}
      onLock={() => useGameStore.getState().setLocked(true)}
      onUnlock={() => useGameStore.getState().setLocked(false)}
    />
  );
}
