import { useGameStore, type MapType } from './useGameStore';
import { useState } from 'react';

const maps: { id: MapType; name: string; desc: string; color: string }[] = [
  { id: 'desert', name: 'DUST STORM', desc: 'Scorching desert compound', color: '#d4a853' },
  { id: 'arctic', name: 'FROST BITE', desc: 'Frozen military outpost', color: '#7ab8d4' },
  { id: 'jungle', name: 'VIPER RIDGE', desc: 'Ancient jungle temple ruins', color: '#3a8a4a' },
];

export default function MenuScreen() {
  const { gameState, startGame, score, kills, wave, totalKills, headshotCount } = useGameStore();
  const [selectedMap, setSelectedMap] = useState<MapType>('desert');

  if (gameState === 'playing' || gameState === 'shopping') return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="text-center space-y-6 max-w-lg mx-auto px-4">
        <h1 className="font-military text-3xl md:text-5xl text-primary tracking-wider">
          DUST STORM
        </h1>
        <p className="text-muted-foreground text-lg font-tactical tracking-widest uppercase">
          Survive the minion onslaught
        </p>

        {gameState === 'dead' && (
          <div className="space-y-3 py-4 border-y border-border">
            <p className="text-accent text-xl font-bold font-tactical">YOU DIED</p>
            <div className="flex gap-6 justify-center text-foreground font-tactical flex-wrap">
              <div><span className="text-primary text-2xl font-bold">{score}</span><br /><span className="text-xs text-muted-foreground">SCORE</span></div>
              <div><span className="text-primary text-2xl font-bold">{totalKills}</span><br /><span className="text-xs text-muted-foreground">KILLS</span></div>
              <div><span className="text-primary text-2xl font-bold">{wave}</span><br /><span className="text-xs text-muted-foreground">WAVE</span></div>
              <div><span className="text-primary text-2xl font-bold">{headshotCount}</span><br /><span className="text-xs text-muted-foreground">HEADSHOTS</span></div>
            </div>
          </div>
        )}

        {/* Map selector */}
        <div className="space-y-2">
          <p className="text-muted-foreground text-xs tracking-widest uppercase">SELECT MAP</p>
          <div className="flex gap-2 justify-center">
            {maps.map(m => (
              <button key={m.id} onClick={() => setSelectedMap(m.id)}
                className={`px-4 py-3 border-2 transition-all cursor-pointer ${selectedMap === m.id ? 'border-primary bg-primary/10' : 'border-border hover:border-muted-foreground'}`}>
                <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: m.color }} />
                <div className="text-foreground text-xs font-bold font-tactical">{m.name}</div>
                <div className="text-muted-foreground text-[10px]">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={() => startGame(selectedMap)}
          className="px-12 py-4 bg-primary text-primary-foreground font-tactical text-xl font-bold tracking-widest uppercase hover:opacity-90 transition-opacity cursor-pointer">
          {gameState === 'dead' ? 'PLAY AGAIN' : 'START GAME'}
        </button>

        <div className="text-muted-foreground text-sm font-tactical space-y-1">
          <p>WASD — Move • MOUSE — Aim • CLICK — Shoot</p>
          <p>SPACE — Jump • C — Crouch • SHIFT — Sprint</p>
          <p>R — Reload • B — Buy Menu • Q — Switch Weapon</p>
          <p>1-8 — Select Weapon • Hold click for auto weapons</p>
          <p className="text-xs mt-4 opacity-60">Click to lock mouse • ESC to unlock</p>
        </div>
      </div>
    </div>
  );
}
