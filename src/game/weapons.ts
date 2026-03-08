export interface WeaponDef {
  id: string;
  name: string;
  price: number;
  ammoPrice: number;
  maxAmmo: number;
  magSize: number;
  damage: number;
  fireRate: number; // ms between shots
  recoil: number;
  spread: number; // radians
  pellets: number; // shotgun fires multiple
  bulletSpeed: number;
  reloadTime: number; // ms
  type: 'pistol' | 'rifle' | 'shotgun' | 'sniper' | 'grenade';
  auto: boolean;
}

export const WEAPONS: Record<string, WeaponDef> = {
  pistol: {
    id: 'pistol', name: 'Glock-18', price: 0, ammoPrice: 100,
    maxAmmo: 120, magSize: 12, damage: 12, fireRate: 200,
    recoil: 0.4, spread: 0.015, pellets: 1, bulletSpeed: 70,
    reloadTime: 1500, type: 'pistol', auto: false,
  },
  deagle: {
    id: 'deagle', name: 'Desert Eagle', price: 700, ammoPrice: 200,
    maxAmmo: 35, magSize: 7, damage: 35, fireRate: 400,
    recoil: 1.2, spread: 0.02, pellets: 1, bulletSpeed: 85,
    reloadTime: 1800, type: 'pistol', auto: false,
  },
  ak47: {
    id: 'ak47', name: 'AK-47', price: 2700, ammoPrice: 300,
    maxAmmo: 90, magSize: 30, damage: 18, fireRate: 100,
    recoil: 0.6, spread: 0.025, pellets: 1, bulletSpeed: 90,
    reloadTime: 2200, type: 'rifle', auto: true,
  },
  m4a1: {
    id: 'm4a1', name: 'M4A1-S', price: 3100, ammoPrice: 300,
    maxAmmo: 90, magSize: 25, damage: 16, fireRate: 88,
    recoil: 0.45, spread: 0.018, pellets: 1, bulletSpeed: 95,
    reloadTime: 2000, type: 'rifle', auto: true,
  },
  shotgun: {
    id: 'shotgun', name: 'Nova', price: 1200, ammoPrice: 200,
    maxAmmo: 32, magSize: 8, damage: 10, fireRate: 800,
    recoil: 1.5, spread: 0.08, pellets: 8, bulletSpeed: 60,
    reloadTime: 3000, type: 'shotgun', auto: false,
  },
  awp: {
    id: 'awp', name: 'AWP', price: 4750, ammoPrice: 400,
    maxAmmo: 20, magSize: 5, damage: 80, fireRate: 1500,
    recoil: 2, spread: 0.003, pellets: 1, bulletSpeed: 120,
    reloadTime: 3500, type: 'sniper', auto: false,
  },
  grenade: {
    id: 'grenade', name: 'HE Grenade', price: 300, ammoPrice: 300,
    maxAmmo: 1, magSize: 1, damage: 60, fireRate: 1000,
    recoil: 0, spread: 0, pellets: 1, bulletSpeed: 25,
    reloadTime: 0, type: 'grenade', auto: false,
  },
  flashbang: {
    id: 'flashbang', name: 'Flashbang', price: 200, ammoPrice: 200,
    maxAmmo: 2, magSize: 1, damage: 0, fireRate: 800,
    recoil: 0, spread: 0, pellets: 1, bulletSpeed: 22,
    reloadTime: 0, type: 'grenade', auto: false,
  },
};

export const WEAPON_ORDER = ['pistol', 'deagle', 'ak47', 'm4a1', 'shotgun', 'awp', 'grenade', 'flashbang'];
