import { useGameStore } from './useGameStore';

export default function HUD() {
  const { health, ammo, maxAmmo, score, wave, kills, gameState, isCrouching, currentMap } = useGameStore();

  if (gameState !== 'playing') return null;

  const mapNames = { desert: 'DUST STORM', arctic: 'FROST BITE', jungle: 'VIPER RIDGE' };

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

      {/* Health bar */}
      <div className="absolute bottom-6 left-6">
        <div className="flex items-center gap-3">
          <span className="text-hud-health text-sm font-bold tracking-wider">HP</span>
          <div className="w-48 h-4 bg-secondary rounded-sm overflow-hidden border border-border">
            <div
              className="h-full transition-all duration-200"
              style={{
                width: `${health}%`,
                backgroundColor: health > 50 ? 'hsl(var(--hud-health))' : health > 25 ? 'hsl(35, 90%, 55%)' : 'hsl(var(--hud-danger))',
              }}
            />
          </div>
          <span className="text-foreground text-sm font-bold">{health}</span>
        </div>
        {isCrouching && (
          <div className="text-muted-foreground text-xs mt-1 tracking-widest">⬇ CROUCHING</div>
        )}
      </div>

      {/* Ammo */}
      <div className="absolute bottom-6 right-6 text-right">
        <div className="flex items-center gap-2">
          <span className="text-hud-ammo text-3xl font-bold">{ammo}</span>
          <span className="text-muted-foreground text-lg">/ {maxAmmo}</span>
        </div>
        <span className="text-muted-foreground text-xs tracking-widest uppercase">
          {ammo === 0 ? 'PRESS R TO RELOAD' : 'AMMO'}
        </span>
      </div>

      {/* Score & Wave */}
      <div className="absolute top-6 right-6 text-right">
        <div className="text-primary text-2xl font-bold">{score}</div>
        <div className="text-muted-foreground text-xs tracking-widest uppercase">SCORE</div>
      </div>
      <div className="absolute top-6 left-6">
        <div className="text-muted-foreground text-[10px] tracking-widest">{mapNames[currentMap]}</div>
        <div className="text-foreground text-lg font-bold">WAVE {wave}</div>
        <div className="text-muted-foreground text-xs">{kills} kills</div>
      </div>

      {/* Damage overlay */}
      {health < 30 && (
        <div className="absolute inset-0 border-[6px] rounded-none animate-pulse"
          style={{ borderColor: `hsla(var(--hud-danger), ${(30 - health) / 30 * 0.6})` }} />
      )}
    </div>
  );
}
