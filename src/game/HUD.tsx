import { useState, useEffect, useRef } from 'react';
import { useGameStore } from './useGameStore';
import { WEAPONS, WEAPON_ORDER } from './weapons';

function KillFeed() {
  const [feeds, setFeeds] = useState<Array<{ id: number; text: string; time: number }>>([]);
  const lastKills = useRef(0);
  const feedId = useRef(0);

  useEffect(() => {
    const unsub = useGameStore.subscribe((state) => {
      if (state.kills > lastKills.current) {
        const diff = state.kills - lastKills.current;
        for (let i = 0; i < diff; i++) {
          const id = feedId.current++;
          setFeeds(prev => [...prev.slice(-4), { id, text: `Enemy eliminated +$${50}`, time: Date.now() }]);
        }
        lastKills.current = state.kills;
      }
    });
    return unsub;
  }, []);

  // Clean old feeds
  useEffect(() => {
    const interval = setInterval(() => {
      setFeeds(prev => prev.filter(f => Date.now() - f.time < 3000));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-20 right-6 space-y-1">
      {feeds.map(f => (
        <div key={f.id} className="text-xs font-bold tracking-wider px-3 py-1 bg-background/60 border border-primary/30 text-primary animate-in slide-in-from-right duration-300">
          ☠ {f.text}
        </div>
      ))}
    </div>
  );
}

function HitMarker() {
  const [show, setShow] = useState(false);
  const lastKills = useRef(0);

  useEffect(() => {
    const unsub = useGameStore.subscribe((state) => {
      if (state.kills > lastKills.current) {
        lastKills.current = state.kills;
        setShow(true);
        setTimeout(() => setShow(false), 150);
      }
    });
    return unsub;
  }, []);

  if (!show) return null;
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <div className="w-8 h-8 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-2.5 bg-primary rotate-0 origin-bottom" style={{ transform: 'translateX(-50%) rotate(-45deg)', transformOrigin: 'center bottom' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-2.5 bg-primary" style={{ transform: 'translateX(-50%) rotate(45deg)', transformOrigin: 'center bottom' }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-2.5 bg-primary" style={{ transform: 'translateX(-50%) rotate(-45deg)', transformOrigin: 'center top' }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-2.5 bg-primary" style={{ transform: 'translateX(-50%) rotate(45deg)', transformOrigin: 'center top' }} />
      </div>
    </div>
  );
}

function DamageVignette() {
  const [opacity, setOpacity] = useState(0);
  const lastHealth = useRef(100);

  useEffect(() => {
    const unsub = useGameStore.subscribe((state) => {
      if (state.health < lastHealth.current) {
        setOpacity(0.5);
        setTimeout(() => setOpacity(0), 300);
      }
      lastHealth.current = state.health;
    });
    return unsub;
  }, []);

  if (opacity <= 0) return null;
  return (
    <div className="absolute inset-0 pointer-events-none transition-opacity duration-300"
      style={{
        opacity,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(200,0,0,0.6) 100%)',
      }}
    />
  );
}

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
        <div className="w-7 h-7 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-[9px] bg-foreground/70 rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[2px] h-[9px] bg-foreground/70 rounded-full" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[9px] h-[2px] bg-foreground/70 rounded-full" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[9px] h-[2px] bg-foreground/70 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border border-foreground/40" />
        </div>
      </div>

      {/* Hit marker */}
      <HitMarker />

      {/* Kill feed */}
      <KillFeed />

      {/* Damage vignette */}
      <DamageVignette />

      {/* Health & Armor - sleeker design */}
      <div className="absolute bottom-6 left-6 space-y-1.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <span className="text-lg">❤️</span>
          </div>
          <div className="w-52 h-5 bg-secondary/80 rounded-sm overflow-hidden border border-border/50 backdrop-blur-sm">
            <div className="h-full transition-all duration-300 rounded-sm"
              style={{
                width: `${health}%`,
                background: health > 50
                  ? 'linear-gradient(90deg, hsl(120, 70%, 35%), hsl(120, 70%, 45%))'
                  : health > 25
                  ? 'linear-gradient(90deg, hsl(35, 90%, 45%), hsl(35, 90%, 55%))'
                  : 'linear-gradient(90deg, hsl(0, 80%, 40%), hsl(0, 80%, 50%))',
              }}
            />
          </div>
          <span className="text-foreground text-sm font-bold min-w-[28px]">{health}</span>
        </div>
        {armor > 0 && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-lg">🛡️</span>
            </div>
            <div className="w-52 h-4 bg-secondary/80 rounded-sm overflow-hidden border border-border/50 backdrop-blur-sm">
              <div className="h-full bg-blue-500/80 transition-all duration-300 rounded-sm" style={{ width: `${armor}%` }} />
            </div>
            <span className="text-foreground text-xs font-bold min-w-[28px]">{armor}</span>
          </div>
        )}
        {isCrouching && <div className="text-muted-foreground text-[10px] tracking-[0.2em] ml-11">⬇ CROUCHING</div>}
      </div>

      {/* Weapon & Ammo */}
      <div className="absolute bottom-6 right-6 text-right">
        <div className="text-muted-foreground text-[10px] tracking-[0.15em] mb-1">{weapon.name.toUpperCase()}</div>
        {owned && (
          <div className="flex items-center gap-2 justify-end">
            <span className="text-hud-ammo text-3xl font-bold tabular-nums">{owned.currentAmmo}</span>
            <span className="text-muted-foreground/60 text-xl">/</span>
            <span className="text-muted-foreground text-lg tabular-nums">{owned.reserveAmmo}</span>
          </div>
        )}
        {isReloading && (
          <div className="text-primary text-xs animate-pulse tracking-[0.2em] mt-1">
            ▶ RELOADING...
          </div>
        )}
        {owned && owned.currentAmmo === 0 && !isReloading && (
          <span className="text-hud-danger text-[10px] tracking-[0.15em] animate-pulse">PRESS R TO RELOAD</span>
        )}
      </div>

      {/* Weapon slots */}
      <div className="absolute bottom-[72px] right-6 flex gap-1">
        {WEAPON_ORDER.filter(id => ownedWeapons.find(w => w.id === id)).map((id, i) => (
          <div key={id} className={`px-2 py-1 text-[9px] tracking-wider backdrop-blur-sm border transition-all ${
            id === currentWeaponId
              ? 'border-primary text-primary bg-primary/15 shadow-[0_0_8px_rgba(var(--primary),0.3)]'
              : 'border-border/40 text-muted-foreground/70 bg-secondary/30'
          }`}>
            <span className="opacity-40 mr-0.5">{i + 1}</span>{WEAPONS[id].name.split(' ')[0].slice(0, 5)}
          </div>
        ))}
      </div>

      {/* Score, Wave, Money */}
      <div className="absolute top-6 right-6 text-right">
        <div className="text-primary text-2xl font-bold tabular-nums">{score.toLocaleString()}</div>
        <div className="text-muted-foreground/60 text-[9px] tracking-[0.2em]">SCORE</div>
        <div className="text-hud-ammo text-lg font-bold mt-1 tabular-nums">${money.toLocaleString()}</div>
      </div>
      <div className="absolute top-6 left-6">
        <div className="text-muted-foreground/50 text-[9px] tracking-[0.2em]">{mapNames[currentMap]}</div>
        <div className="text-foreground text-xl font-bold">WAVE {wave}</div>
        <div className="text-muted-foreground text-xs tabular-nums">{kills} kills</div>
      </div>

      {/* Combo */}
      {combo > 1 && comboTimer > 0 && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-center">
          <div className="text-primary text-3xl font-black animate-pulse drop-shadow-[0_0_12px_rgba(var(--primary),0.5)]">
            {combo}x COMBO!
          </div>
          <div className="w-28 h-1.5 bg-secondary/60 mx-auto mt-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(comboTimer / 3) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground/40 text-[9px] tracking-[0.2em]">
        B — BUY MENU • Q — SWITCH • C — CROUCH • SPACE — JUMP
      </div>

      {/* Low health overlay */}
      {health < 30 && (
        <div className="absolute inset-0 animate-pulse pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, transparent 50%, rgba(200,0,0,${(30 - health) / 30 * 0.4}) 100%)`,
          }}
        />
      )}
    </div>
  );
}
