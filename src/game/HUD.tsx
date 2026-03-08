import { useGameStore } from './useGameStore';
import { WEAPONS, WEAPON_ORDER } from './weapons';

export default function HUD() {
  const { health, armor, score, wave, kills, gameState, isCrouching, currentMap,
    currentWeaponId, ownedWeapons, isReloading, money, combo, comboTimer } = useGameStore();

  if (gameState !== 'playing') return null;

  const weapon = WEAPONS[currentWeaponId];
  const owned = ownedWeapons.find(w => w.id === currentWeaponId);
  const mapNames: Record<string, string> = { desert: 'DUST STORM', arctic: 'FROST BITE', jungle: 'VIPER RIDGE' };

  return (
    <div className="fixed inset-0 pointer-events-none z-50 font-tactical">
      {/* Crosshair */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-6 h-6 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-foreground/80" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-foreground/80" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-0.5 bg-foreground/80" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-0.5 bg-foreground/80" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full border border-foreground/60" />
        </div>
      </div>

      {/* Health & Armor */}
      <div className="absolute bottom-6 left-6 space-y-1">
        <div className="flex items-center gap-3">
          <span className="text-hud-health text-sm font-bold tracking-wider">HP</span>
          <div className="w-48 h-4 bg-secondary rounded-sm overflow-hidden border border-border">
            <div className="h-full transition-all duration-200"
              style={{ width: `${health}%`, backgroundColor: health > 50 ? 'hsl(var(--hud-health))' : health > 25 ? 'hsl(35, 90%, 55%)' : 'hsl(var(--hud-danger))' }} />
          </div>
          <span className="text-foreground text-sm font-bold">{health}</span>
        </div>
        {armor > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-blue-400 text-sm font-bold tracking-wider">AR</span>
            <div className="w-48 h-3 bg-secondary rounded-sm overflow-hidden border border-border">
              <div className="h-full bg-blue-500 transition-all duration-200" style={{ width: `${armor}%` }} />
            </div>
            <span className="text-foreground text-xs font-bold">{armor}</span>
          </div>
        )}
        {isCrouching && <div className="text-muted-foreground text-xs tracking-widest">⬇ CROUCHING</div>}
      </div>

      {/* Weapon & Ammo */}
      <div className="absolute bottom-6 right-6 text-right">
        <div className="text-muted-foreground text-xs tracking-widest mb-1">{weapon.name}</div>
        {owned && (
          <div className="flex items-center gap-2 justify-end">
            <span className="text-hud-ammo text-3xl font-bold">{owned.currentAmmo}</span>
            <span className="text-muted-foreground text-lg">/ {owned.reserveAmmo}</span>
          </div>
        )}
        {isReloading && <div className="text-primary text-sm animate-pulse tracking-widest">RELOADING...</div>}
        {owned && owned.currentAmmo === 0 && !isReloading && (
          <span className="text-hud-danger text-xs tracking-widest">PRESS R TO RELOAD</span>
        )}
      </div>

      {/* Weapon slots */}
      <div className="absolute bottom-20 right-6 flex gap-1">
        {WEAPON_ORDER.filter(id => ownedWeapons.find(w => w.id === id)).map((id, i) => (
          <div key={id} className={`px-2 py-1 border text-[10px] ${id === currentWeaponId ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground'}`}>
            <span className="opacity-50">{i + 1}</span> {WEAPONS[id].name.split(' ')[0].slice(0, 4)}
          </div>
        ))}
      </div>

      {/* Score, Wave, Money */}
      <div className="absolute top-6 right-6 text-right">
        <div className="text-primary text-2xl font-bold">{score}</div>
        <div className="text-muted-foreground text-xs tracking-widest">SCORE</div>
        <div className="text-hud-ammo text-lg font-bold mt-1">${money}</div>
      </div>
      <div className="absolute top-6 left-6">
        <div className="text-muted-foreground text-[10px] tracking-widest">{mapNames[currentMap]}</div>
        <div className="text-foreground text-lg font-bold">WAVE {wave}</div>
        <div className="text-muted-foreground text-xs">{kills} kills</div>
      </div>

      {/* Combo indicator */}
      {combo > 1 && comboTimer > 0 && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-center">
          <div className="text-primary text-2xl font-bold animate-pulse">
            {combo}x COMBO!
          </div>
          <div className="w-24 h-1 bg-secondary mx-auto mt-1 rounded overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${(comboTimer / 3) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Shop hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground text-xs tracking-widest">
        B — BUY MENU • Q — SWITCH WEAPON
      </div>

      {/* Damage overlay */}
      {health < 30 && (
        <div className="absolute inset-0 border-[6px] rounded-none animate-pulse"
          style={{ borderColor: `hsla(var(--hud-danger), ${(30 - health) / 30 * 0.6})` }} />
      )}
    </div>
  );
}
