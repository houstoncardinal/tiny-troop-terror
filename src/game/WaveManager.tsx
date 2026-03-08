import { useEffect, useRef } from 'react';
import { useGameStore, type Enemy } from './useGameStore';

let enemyCounter = 0;

function spawnWave(wave: number): Enemy[] {
  // More enemies, scaling aggressively
  const baseCount = 6 + wave * 4;
  const enemies: Enemy[] = [];

  for (let i = 0; i < baseCount; i++) {
    const angle = (i / baseCount) * Math.PI * 2 + Math.random() * 0.5;
    const dist = 25 + Math.random() * 20;

    let type: Enemy['type'] = 'grunt';
    const roll = Math.random();
    if (wave >= 2 && roll > 0.75) type = 'runner';
    if (wave >= 3 && roll > 0.82) type = 'tank';
    if (wave >= 4 && roll > 0.88) type = 'bomber';
    if (wave >= 5 && roll > 0.92) type = 'sniper';

    const healthMap = { grunt: 20 + wave * 5, runner: 10 + wave * 3, tank: 60 + wave * 12, bomber: 15 + wave * 4, sniper: 25 + wave * 5 };
    const speedMap = { grunt: 2 + Math.random() * 2 + wave * 0.3, runner: 5 + Math.random() * 2 + wave * 0.5, tank: 1.2 + wave * 0.15, bomber: 3 + Math.random() + wave * 0.4, sniper: 1.5 + wave * 0.2 };

    const health = healthMap[type];

    enemies.push({
      id: `enemy-${enemyCounter++}`,
      position: [Math.cos(angle) * dist, 0, Math.sin(angle) * dist],
      health,
      maxHealth: health,
      speed: speedMap[type],
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
