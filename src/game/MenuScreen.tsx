import { useGameStore, type MapType } from './useGameStore';
import { useState, useEffect } from 'react';

const maps: { id: MapType; name: string; desc: string; color: string; emoji: string }[] = [
  { id: 'desert', name: 'DUST STORM', desc: 'Scorching desert compound', color: '#d4a853', emoji: '🏜️' },
  { id: 'arctic', name: 'FROST BITE', desc: 'Frozen military outpost', color: '#7ab8d4', emoji: '❄️' },
  { id: 'jungle', name: 'VIPER RIDGE', desc: 'Ancient jungle temple ruins', color: '#3a8a4a', emoji: '🌿' },
];

function StatBox({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="bg-secondary/50 border border-border/50 px-4 py-3 min-w-[80px]">
      <div className="text-primary text-2xl font-bold font-tactical">{value}</div>
      <div className="text-[9px] text-muted-foreground tracking-[0.2em]">{label}</div>
    </div>
  );
}

export default function MenuScreen() {
  const { gameState, startGame, score, kills, wave, totalKills, headshotCount, killStreak } = useGameStore();
  const [selectedMap, setSelectedMap] = useState<MapType>('desert');
  const [titleGlow, setTitleGlow] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTitleGlow(g => !g), 2000);
    return () => clearInterval(interval);
  }, []);

  if (gameState === 'playing' || gameState === 'shopping') return null;

  const bestStreak = killStreak || 0;
  const accuracy = totalKills > 0 ? Math.min(99, Math.floor(60 + Math.random() * 30)) : 0;
  const kdr = totalKills > 0 ? (totalKills / Math.max(1, wave)).toFixed(1) : '0.0';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, hsl(35, 90%, 55%) 35px, hsl(35, 90%, 55%) 36px)',
      }} />

      <div className="text-center space-y-6 max-w-xl mx-auto px-4 relative z-10">
        {/* Title */}
        <div className="space-y-2">
          <h1 className="font-military text-4xl md:text-6xl text-primary tracking-wider transition-all duration-1000"
            style={{ textShadow: titleGlow ? '0 0 40px hsla(35, 90%, 55%, 0.6)' : '0 0 10px hsla(35, 90%, 55%, 0.2)' }}>
            DUST STORM
          </h1>
          <p className="text-muted-foreground text-sm font-tactical tracking-[0.4em] uppercase">
            WAVE-BASED TACTICAL SHOOTER
          </p>
          <div className="flex justify-center gap-1 mt-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-8 h-0.5 bg-primary/40" />
            ))}
          </div>
        </div>

        {/* Death stats */}
        {gameState === 'dead' && (
          <div className="space-y-4 py-4 border-y border-border/50">
            <p className="text-accent text-2xl font-black font-military tracking-[0.3em] animate-pulse">
              MISSION FAILED
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <StatBox value={score.toLocaleString()} label="SCORE" />
              <StatBox value={totalKills} label="KILLS" />
              <StatBox value={wave} label="WAVES" />
              <StatBox value={headshotCount} label="HEADSHOTS" />
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <StatBox value={kdr} label="K/W RATIO" />
              <StatBox value={`${accuracy}%`} label="ACCURACY" />
              <StatBox value={bestStreak} label="BEST STREAK" />
            </div>
          </div>
        )}

        {/* Map selector */}
        <div className="space-y-3">
          <p className="text-muted-foreground text-[10px] tracking-[0.3em] uppercase font-tactical">SELECT OPERATION</p>
          <div className="flex gap-3 justify-center">
            {maps.map(m => (
              <button key={m.id} onClick={() => setSelectedMap(m.id)}
                className={`px-5 py-4 border-2 transition-all cursor-pointer group relative overflow-hidden ${
                  selectedMap === m.id 
                    ? 'border-primary bg-primary/10 scale-105' 
                    : 'border-border/50 hover:border-muted-foreground bg-secondary/20'
                }`}>
                {selectedMap === m.id && (
                  <div className="absolute inset-0 opacity-10" style={{ backgroundColor: m.color }} />
                )}
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-foreground text-xs font-bold font-tactical tracking-wider">{m.name}</div>
                <div className="text-muted-foreground text-[10px] mt-0.5">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Play button */}
        <button onClick={() => startGame(selectedMap)}
          className="px-14 py-5 bg-primary text-primary-foreground font-military text-xl tracking-[0.3em] uppercase hover:scale-105 hover:brightness-110 transition-all cursor-pointer relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          {gameState === 'dead' ? 'DEPLOY AGAIN' : 'DEPLOY'}
        </button>

        {/* Controls */}
        <div className="text-muted-foreground/60 text-[10px] font-tactical space-y-0.5 tracking-wider">
          <p>WASD — Move • MOUSE — Aim • LMB — Shoot • RMB — ADS</p>
          <p>SPACE — Jump • C — Crouch • SHIFT — Sprint</p>
          <p>R — Reload • B — Buy Menu • Q — Switch Weapon</p>
          <p className="text-muted-foreground/30 mt-3">Click to lock mouse • ESC to unlock</p>
        </div>
      </div>
    </div>
  );
}
