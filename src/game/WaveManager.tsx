import { useEffect, useRef } from 'react';
import { useGameStore, type Enemy } from './useGameStore';

let enemyCounter = 0;

function spawnWave(wave: number): Enemy[] {
  const baseCount = 5 + wave * 3;
  const enemies: Enemy[] = [];

  for (let i = 0; i < baseCount; i++) {
    const angle = (i / baseCount) * Math.PI * 2 + Math.random() * 0.5;
    const dist = 25 + Math.random() * 20;

    // Decide type based on wave and randomness
    let type: Enemy['type'] = 'grunt';
    const roll = Math.random();
    if (wave >= 2 && roll > 0.7) type = 'runner';
    if (wave >= 3 && roll > 0.85) type = 'tank';

    const health = type === 'tank' ? 60 + wave * 10 : type === 'runner' ? 10 + wave * 2 : 20 + wave * 5;
    const speed = type === 'tank' ? 1.5 + wave * 0.15 : type === 'runner' ? 5 + Math.random() * 2 + wave * 0.5 : 2 + Math.random() * 2 + wave * 0.3;

    enemies.push({
      id: `enemy-${enemyCounter++}`,
      position: [Math.cos(angle) * dist, 0, Math.sin(angle) * dist],
      health,
      speed,
      alive: true,
      type,
    });
  }
  return enemies;
}

export default function WaveManager() {
  const { wave, enemies, spawnEnemies, nextWave, gameState } = useGameStore();
  const waveSpawned = useRef(0);

  useEffect(() => {
    if (gameState !== 'playing') return;
    if (waveSpawned.current >= wave) return;

    waveSpawned.current = wave;
    const waveEnemies = spawnWave(wave);
    spawnEnemies(waveEnemies);
  }, [wave, gameState, spawnEnemies]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    if (enemies.length === 0) return;

    const allDead = enemies.every(e => !e.alive);
    if (allDead) {
      setTimeout(() => nextWave(), 2000);
    }
  }, [enemies, gameState, nextWave]);

  return null;
}
