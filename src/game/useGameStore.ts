import { create } from 'zustand';

export type MapType = 'desert' | 'arctic' | 'jungle';

export interface Enemy {
  id: string;
  position: [number, number, number];
  health: number;
  speed: number;
  alive: boolean;
  type: 'grunt' | 'runner' | 'tank';
}

export interface Bullet {
  id: string;
  position: [number, number, number];
  direction: [number, number, number];
  createdAt: number;
}

interface GameState {
  health: number;
  score: number;
  ammo: number;
  maxAmmo: number;
  wave: number;
  enemies: Enemy[];
  bullets: Bullet[];
  gameState: 'menu' | 'playing' | 'paused' | 'dead';
  kills: number;
  isLocked: boolean;
  currentMap: MapType;
  isCrouching: boolean;
  isJumping: boolean;
  playerY: number;
  velocityY: number;

  startGame: (map?: MapType) => void;
  takeDamage: (amount: number) => void;
  shoot: (position: [number, number, number], direction: [number, number, number]) => void;
  reload: () => void;
  killEnemy: (id: string) => void;
  spawnEnemies: (enemies: Enemy[]) => void;
  updateEnemyPosition: (id: string, position: [number, number, number]) => void;
  removeBullet: (id: string) => void;
  damageEnemy: (id: string, amount: number) => void;
  setLocked: (locked: boolean) => void;
  die: () => void;
  nextWave: () => void;
  setCrouching: (c: boolean) => void;
  setJumping: (j: boolean) => void;
  setPlayerY: (y: number) => void;
  setVelocityY: (v: number) => void;
  setMap: (map: MapType) => void;
}

let bulletId = 0;

export const useGameStore = create<GameState>((set, get) => ({
  health: 100,
  score: 0,
  ammo: 30,
  maxAmmo: 30,
  wave: 1,
  enemies: [],
  bullets: [],
  gameState: 'menu',
  kills: 0,
  isLocked: false,
  currentMap: 'desert',
  isCrouching: false,
  isJumping: false,
  playerY: 1.7,
  velocityY: 0,

  startGame: (map) => set({
    health: 100, score: 0, ammo: 30, wave: 1, enemies: [], bullets: [],
    gameState: 'playing', kills: 0, currentMap: map || get().currentMap,
    isCrouching: false, isJumping: false, playerY: 1.7, velocityY: 0,
  }),

  takeDamage: (amount) => {
    const newHealth = Math.max(0, get().health - amount);
    set({ health: newHealth });
    if (newHealth <= 0) get().die();
  },

  shoot: (position, direction) => {
    const { ammo } = get();
    if (ammo <= 0) return;
    const id = `bullet-${bulletId++}`;
    set(s => ({
      ammo: s.ammo - 1,
      bullets: [...s.bullets, { id, position, direction, createdAt: Date.now() }]
    }));
  },

  reload: () => set({ ammo: get().maxAmmo }),

  killEnemy: (id) => {
    const enemy = get().enemies.find(e => e.id === id);
    const bonus = enemy?.type === 'tank' ? 300 : enemy?.type === 'runner' ? 150 : 100;
    set(s => ({
      enemies: s.enemies.map(e => e.id === id ? { ...e, alive: false } : e),
      score: s.score + bonus,
      kills: s.kills + 1,
    }));
  },

  spawnEnemies: (enemies) => set(s => ({ enemies: [...s.enemies, ...enemies] })),

  updateEnemyPosition: (id, position) => set(s => ({
    enemies: s.enemies.map(e => e.id === id ? { ...e, position } : e)
  })),

  removeBullet: (id) => set(s => ({
    bullets: s.bullets.filter(b => b.id !== id)
  })),

  damageEnemy: (id, amount) => {
    const enemy = get().enemies.find(e => e.id === id);
    if (!enemy || !enemy.alive) return;
    const newHealth = enemy.health - amount;
    if (newHealth <= 0) {
      get().killEnemy(id);
    } else {
      set(s => ({
        enemies: s.enemies.map(e => e.id === id ? { ...e, health: newHealth } : e)
      }));
    }
  },

  setLocked: (locked) => set({ isLocked: locked }),
  die: () => set({ gameState: 'dead' }),
  nextWave: () => set(s => ({
    wave: s.wave + 1,
    ammo: s.maxAmmo,
    enemies: [],
  })),
  setCrouching: (c) => set({ isCrouching: c }),
  setJumping: (j) => set({ isJumping: j }),
  setPlayerY: (y) => set({ playerY: y }),
  setVelocityY: (v) => set({ velocityY: v }),
  setMap: (map) => set({ currentMap: map }),
}));
