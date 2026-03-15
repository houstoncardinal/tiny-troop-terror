import { create } from 'zustand';
import { WEAPONS, type WeaponDef } from './weapons';
import { playSound } from './AudioManager';

export type MapType = 'desert' | 'arctic' | 'jungle';

export interface Enemy {
  id: string;
  position: [number, number, number];
  health: number;
  maxHealth: number;
  speed: number;
  alive: boolean;
  type: 'grunt' | 'runner' | 'tank' | 'bomber' | 'sniper';
}

export interface Bullet {
  id: string;
  position: [number, number, number];
  direction: [number, number, number];
  createdAt: number;
  damage: number;
  speed: number;
  isGrenade?: boolean;
  grenadeType?: string;
}

export interface OwnedWeapon {
  id: string;
  currentAmmo: number;
  reserveAmmo: number;
}

interface GameState {
  health: number;
  maxHealth: number;
  armor: number;
  score: number;
  money: number;
  wave: number;
  enemies: Enemy[];
  bullets: Bullet[];
  gameState: 'menu' | 'playing' | 'paused' | 'dead' | 'shopping';
  kills: number;
  totalKills: number;
  isLocked: boolean;
  currentMap: MapType;
  isCrouching: boolean;
  isJumping: boolean;
  playerY: number;
  velocityY: number;
  currentWeaponId: string;
  ownedWeapons: OwnedWeapon[];
  isReloading: boolean;
  reloadStartTime: number;
  shopOpen: boolean;
  waveKills: number;
  combo: number;
  comboTimer: number;
  lastDamageTime: number;
  headshotCount: number;
  isADS: boolean;
  killStreak: number;

  startGame: (map?: MapType) => void;
  takeDamage: (amount: number) => void;
  shoot: (position: [number, number, number], direction: [number, number, number]) => void;
  reload: () => void;
  killEnemy: (id: string, headshot?: boolean) => void;
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
  switchWeapon: (weaponId: string) => void;
  buyWeapon: (weaponId: string) => boolean;
  buyAmmo: (weaponId: string) => boolean;
  buyArmor: () => boolean;
  toggleShop: () => void;
  getCurrentWeapon: () => WeaponDef;
  getOwnedWeapon: () => OwnedWeapon | undefined;
  startReload: () => void;
  finishReload: () => void;
  updateCombo: (delta: number) => void;
  setADS: (ads: boolean) => void;
}

let bulletId = 0;

export const useGameStore = create<GameState>((set, get) => ({
  health: 100,
  maxHealth: 100,
  armor: 0,
  score: 0,
  money: 800,
  wave: 1,
  enemies: [],
  bullets: [],
  gameState: 'menu',
  kills: 0,
  totalKills: 0,
  isLocked: false,
  currentMap: 'desert',
  isCrouching: false,
  isJumping: false,
  playerY: 1.7,
  velocityY: 0,
  currentWeaponId: 'pistol',
  ownedWeapons: [
    { id: 'pistol', currentAmmo: 12, reserveAmmo: 120 },
  ],
  isReloading: false,
  reloadStartTime: 0,
  shopOpen: false,
  waveKills: 0,
  combo: 0,
  comboTimer: 0,
  lastDamageTime: 0,
  headshotCount: 0,

  startGame: (map) => set({
    health: 100, armor: 0, score: 0, money: 800, wave: 1, enemies: [], bullets: [],
    gameState: 'playing', kills: 0, totalKills: 0,
    currentMap: map || get().currentMap,
    isCrouching: false, isJumping: false, playerY: 1.7, velocityY: 0,
    currentWeaponId: 'pistol',
    ownedWeapons: [{ id: 'pistol', currentAmmo: 12, reserveAmmo: 120 }],
    isReloading: false, shopOpen: false, waveKills: 0, combo: 0, comboTimer: 0,
    headshotCount: 0,
  }),

  takeDamage: (amount) => {
    const { armor } = get();
    let dmg = amount;
    let newArmor = armor;
    if (armor > 0) {
      const absorbed = Math.min(armor, Math.floor(amount * 0.6));
      newArmor = armor - absorbed;
      dmg = amount - absorbed;
    }
    const newHealth = Math.max(0, get().health - dmg);
    set({ health: newHealth, armor: newArmor, lastDamageTime: Date.now() });
    playSound('damage');
    if (newHealth <= 0) get().die();
  },

  shoot: (position, direction) => {
    const { ownedWeapons, currentWeaponId, isReloading } = get();
    if (isReloading) return;
    const owned = ownedWeapons.find(w => w.id === currentWeaponId);
    if (!owned || owned.currentAmmo <= 0) return;
    const weapon = WEAPONS[currentWeaponId];

    const newOwned = ownedWeapons.map(w =>
      w.id === currentWeaponId ? { ...w, currentAmmo: w.currentAmmo - 1 } : w
    );

    const newBullets: Bullet[] = [];
    for (let i = 0; i < weapon.pellets; i++) {
      const id = `bullet-${bulletId++}`;
      const spread = weapon.spread * (get().isCrouching ? 0.5 : 1);
      const dir: [number, number, number] = [
        direction[0] + (Math.random() - 0.5) * spread * 2,
        direction[1] + (Math.random() - 0.5) * spread * 2,
        direction[2] + (Math.random() - 0.5) * spread * 2,
      ];
      newBullets.push({
        id, position, direction: dir, createdAt: Date.now(),
        damage: weapon.damage, speed: weapon.bulletSpeed,
        isGrenade: weapon.type === 'grenade',
        grenadeType: weapon.type === 'grenade' ? weapon.id : undefined,
      });
    }

    set(s => ({
      ownedWeapons: newOwned,
      bullets: [...s.bullets, ...newBullets],
    }));
  },

  reload: () => {
    get().startReload();
  },

  startReload: () => {
    const { ownedWeapons, currentWeaponId, isReloading } = get();
    if (isReloading) return;
    const owned = ownedWeapons.find(w => w.id === currentWeaponId);
    const weapon = WEAPONS[currentWeaponId];
    if (!owned || owned.reserveAmmo <= 0 || owned.currentAmmo >= weapon.magSize) return;
    if (weapon.type === 'grenade') return;
    set({ isReloading: true, reloadStartTime: Date.now() });
    setTimeout(() => get().finishReload(), weapon.reloadTime);
  },

  finishReload: () => {
    const { ownedWeapons, currentWeaponId } = get();
    const owned = ownedWeapons.find(w => w.id === currentWeaponId);
    const weapon = WEAPONS[currentWeaponId];
    if (!owned) { set({ isReloading: false }); return; }

    const needed = weapon.magSize - owned.currentAmmo;
    const toLoad = Math.min(needed, owned.reserveAmmo);

    set({
      isReloading: false,
      ownedWeapons: ownedWeapons.map(w =>
        w.id === currentWeaponId
          ? { ...w, currentAmmo: w.currentAmmo + toLoad, reserveAmmo: w.reserveAmmo - toLoad }
          : w
      ),
    });
  },

  killEnemy: (id, headshot = false) => {
    const enemy = get().enemies.find(e => e.id === id);
    if (!enemy) return;
    const baseReward = enemy.type === 'tank' ? 600 : enemy.type === 'runner' ? 200 :
      enemy.type === 'bomber' ? 400 : enemy.type === 'sniper' ? 500 : 300;
    const comboMultiplier = 1 + get().combo * 0.1;
    const hsBonus = headshot ? 1.5 : 1;
    const reward = Math.floor(baseReward * comboMultiplier * hsBonus);
    const moneyReward = Math.floor((enemy.type === 'tank' ? 150 : enemy.type === 'sniper' ? 100 : 50) * comboMultiplier);

    set(s => ({
      enemies: s.enemies.map(e => e.id === id ? { ...e, alive: false } : e),
      score: s.score + reward,
      kills: s.kills + 1,
      totalKills: s.totalKills + 1,
      money: s.money + moneyReward,
      waveKills: s.waveKills + 1,
      combo: s.combo + 1,
      comboTimer: 3,
      headshotCount: headshot ? s.headshotCount + 1 : s.headshotCount,
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
      get().killEnemy(id, amount > 30);
    } else {
      set(s => ({
        enemies: s.enemies.map(e => e.id === id ? { ...e, health: newHealth } : e)
      }));
    }
  },

  setLocked: (locked) => set({ isLocked: locked }),
  die: () => set({ gameState: 'dead' }),

  nextWave: () => {
    const waveBonus = get().wave * 200 + get().waveKills * 25;
    set(s => ({
      wave: s.wave + 1,
      enemies: [],
      money: s.money + waveBonus,
      waveKills: 0,
      shopOpen: true,
      gameState: 'shopping',
    }));
  },

  setCrouching: (c) => set({ isCrouching: c }),
  setJumping: (j) => set({ isJumping: j }),
  setPlayerY: (y) => set({ playerY: y }),
  setVelocityY: (v) => set({ velocityY: v }),
  setMap: (map) => set({ currentMap: map }),

  switchWeapon: (weaponId) => {
    const { ownedWeapons } = get();
    if (ownedWeapons.find(w => w.id === weaponId)) {
      set({ currentWeaponId: weaponId, isReloading: false });
    }
  },

  buyWeapon: (weaponId) => {
    const { money, ownedWeapons } = get();
    const weapon = WEAPONS[weaponId];
    if (!weapon || money < weapon.price) return false;
    if (ownedWeapons.find(w => w.id === weaponId)) return false;
    set(s => ({
      money: s.money - weapon.price,
      ownedWeapons: [...s.ownedWeapons, {
        id: weaponId,
        currentAmmo: weapon.magSize,
        reserveAmmo: weapon.maxAmmo,
      }],
      currentWeaponId: weaponId,
    }));
    return true;
  },

  buyAmmo: (weaponId) => {
    const { money, ownedWeapons } = get();
    const weapon = WEAPONS[weaponId];
    const owned = ownedWeapons.find(w => w.id === weaponId);
    if (!weapon || !owned || money < weapon.ammoPrice) return false;
    if (owned.reserveAmmo >= weapon.maxAmmo) return false;
    set(s => ({
      money: s.money - weapon.ammoPrice,
      ownedWeapons: s.ownedWeapons.map(w =>
        w.id === weaponId ? { ...w, reserveAmmo: Math.min(w.reserveAmmo + weapon.magSize * 2, weapon.maxAmmo) } : w
      ),
    }));
    return true;
  },

  buyArmor: () => {
    const { money, armor } = get();
    if (money < 650 || armor >= 100) return false;
    set({ money: money - 650, armor: 100 });
    return true;
  },

  toggleShop: () => {
    const { shopOpen, gameState } = get();
    if (gameState === 'shopping') {
      set({ shopOpen: false, gameState: 'playing' });
    } else if (gameState === 'playing') {
      set({ shopOpen: !shopOpen });
    }
  },

  getCurrentWeapon: () => WEAPONS[get().currentWeaponId],
  getOwnedWeapon: () => get().ownedWeapons.find(w => w.id === get().currentWeaponId),

  updateCombo: (delta) => {
    const { comboTimer, combo } = get();
    if (combo > 0 && comboTimer > 0) {
      const newTimer = comboTimer - delta;
      if (newTimer <= 0) {
        set({ combo: 0, comboTimer: 0 });
      } else {
        set({ comboTimer: newTimer });
      }
    }
  },
}));
