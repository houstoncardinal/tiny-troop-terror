import { useEffect, useRef } from 'react';
import { useGameStore, type Enemy } from './useGameStore';

let enemyCounter = 0;

function spawnWave(wave: number): Enemy[] {
  const count = 5 + wave * 3;
  const enemies: Enemy[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
    const dist = 25 + Math.random() * 20;
    enemies.push({
      id: `enemy-${enemyCounter++}`,
      position: [Math.cos(angle) * dist, 0, Math.sin(angle) * dist],
      health: 20 + wave * 5,
      speed: 2 + Math.random() * 2 + wave * 0.3,
      alive: true,
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

  // Check wave cleared
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
