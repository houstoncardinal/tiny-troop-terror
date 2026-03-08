import { useGameStore } from './useGameStore';

export default function MenuScreen() {
  const { gameState, startGame, score, kills, wave } = useGameStore();

  if (gameState === 'playing') return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="text-center space-y-8">
        <h1 className="font-military text-3xl md:text-5xl text-primary tracking-wider">
          DUST STORM
        </h1>
        <p className="text-muted-foreground text-lg font-tactical tracking-widest uppercase">
          Survive the minion onslaught
        </p>

        {gameState === 'dead' && (
          <div className="space-y-3 py-4 border-y border-border">
            <p className="text-accent text-xl font-bold font-tactical">YOU DIED</p>
            <div className="flex gap-8 justify-center text-foreground font-tactical">
              <div><span className="text-primary text-2xl font-bold">{score}</span><br /><span className="text-xs text-muted-foreground">SCORE</span></div>
              <div><span className="text-primary text-2xl font-bold">{kills}</span><br /><span className="text-xs text-muted-foreground">KILLS</span></div>
              <div><span className="text-primary text-2xl font-bold">{wave}</span><br /><span className="text-xs text-muted-foreground">WAVE</span></div>
            </div>
          </div>
        )}

        <button
          onClick={startGame}
          className="px-12 py-4 bg-primary text-primary-foreground font-tactical text-xl font-bold tracking-widest uppercase hover:opacity-90 transition-opacity cursor-pointer"
        >
          {gameState === 'dead' ? 'PLAY AGAIN' : 'START GAME'}
        </button>

        <div className="text-muted-foreground text-sm font-tactical space-y-1">
          <p>WASD to move • MOUSE to aim • CLICK to shoot</p>
          <p>SHIFT to sprint • R to reload</p>
          <p className="text-xs mt-4 opacity-60">Click to lock mouse • ESC to unlock</p>
        </div>
      </div>
    </div>
  );
}
