import { useState, useEffect, useRef, useMemo } from 'react';
import { useGameStore } from './useGameStore';
import { WEAPONS, WEAPON_ORDER } from './weapons';
import { playSound } from './AudioManager';

// ═══════════════════════════════════════════════════════
// MULTI-KILL ANNOUNCEMENTS (CoD-style)
// ═══════════════════════════════════════════════════════
const MULTI_KILL_MESSAGES = [
  '', // 0
  '', // 1
  'DOUBLE KILL',
  'TRIPLE KILL',
  'QUAD KILL',
  'KILLING SPREE',
  'RAMPAGE',
  'DOMINATING',
  'UNSTOPPABLE',
  'GODLIKE',
  'LEGENDARY',
];

const KILLSTREAK_MESSAGES: Record<number, { name: string; icon: string }> = {
  3: { name: 'UAV ONLINE', icon: '📡' },
  5: { name: 'PRECISION AIRSTRIKE', icon: '✈️' },
  7: { name: 'ATTACK HELICOPTER', icon: '🚁' },
  10: { name: 'CHOPPER GUNNER', icon: '🔫' },
  15: { name: 'TACTICAL NUKE', icon: '☢️' },
};

function MultiKillAnnouncement() {
  const [announcement, setAnnouncement] = useState<{ text: string; color: string; id: number } | null>(null);
  const killTimes = useRef<number[]>([]);
  const lastKills = useRef(0);
  const announcementId = useRef(0);

  useEffect(() => {
    const unsub = useGameStore.subscribe((state) => {
      if (state.kills > lastKills.current) {
        const now = Date.now();
        killTimes.current.push(now);
        // Count kills in last 3 seconds
        killTimes.current = killTimes.current.filter(t => now - t < 3000);
        const multiCount = killTimes.current.length;

        if (multiCount >= 2) {
          const msgIdx = Math.min(multiCount, MULTI_KILL_MESSAGES.length - 1);
          const msg = MULTI_KILL_MESSAGES[msgIdx];
          if (msg) {
            const id = announcementId.current++;
            const colors = ['', '', '#ff8800', '#ff4400', '#ff0044', '#cc00ff', '#8800ff', '#ff0000', '#ff0000', '#ff0000', '#ff0000'];
            setAnnouncement({ text: msg, color: colors[msgIdx] || '#ff8800', id });
            playSound('combo');
            setTimeout(() => setAnnouncement(prev => prev?.id === id ? null : prev), 2500);
          }
        }
        lastKills.current = state.kills;
      }
    });
    return unsub;
  }, []);

  if (!announcement) return null;
  return (
    <div className="absolute top-[40%] left-1/2 -translate-x-1/2 text-center pointer-events-none animate-in zoom-in-50 duration-300">
      <div className="font-military text-2xl md:text-4xl tracking-widest drop-shadow-[0_0_20px_rgba(255,100,0,0.8)]"
        style={{ color: announcement.color, textShadow: `0 0 30px ${announcement.color}, 0 0 60px ${announcement.color}40` }}>
        {announcement.text}
      </div>
    </div>
  );
}

function KillstreakAnnouncement() {
  const [streak, setStreak] = useState<{ name: string; icon: string; id: number } | null>(null);
  const lastStreak = useRef(0);
  const streakId = useRef(0);

  useEffect(() => {
    const unsub = useGameStore.subscribe((state) => {
      const currentStreak = state.killStreak || 0;
      if (currentStreak > lastStreak.current) {
        const ksMsg = KILLSTREAK_MESSAGES[currentStreak];
        if (ksMsg) {
          const id = streakId.current++;
          setStreak({ ...ksMsg, id });
          playSound('killstreak');
          setTimeout(() => setStreak(prev => prev?.id === id ? null : prev), 3000);
        }
      }
      lastStreak.current = currentStreak;
    });
    return unsub;
  }, []);

  if (!streak) return null;
  return (
    <div className="absolute top-[22%] left-1/2 -translate-x-1/2 text-center pointer-events-none animate-in slide-in-from-top duration-500">
      <div className="bg-background/90 border-2 border-primary px-8 py-3 backdrop-blur-sm">
        <div className="text-3xl mb-1">{streak.icon}</div>
        <div className="font-military text-primary text-sm tracking-[0.3em]">{streak.name}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SCORE POPUPS (floating +score on kills)
// ═══════════════════════════════════════════════════════
function ScorePopups() {
  const [popups, setPopups] = useState<Array<{ id: number; score: number; x: number; y: number; headshot: boolean; time: number }>>([]);
  const lastScore = useRef(0);
  const lastHeadshots = useRef(0);
  const popupId = useRef(0);

  useEffect(() => {
    const unsub = useGameStore.subscribe((state) => {
      if (state.score > lastScore.current) {
        const diff = state.score - lastScore.current;
        const isHeadshot = state.headshotCount > lastHeadshots.current;
        const id = popupId.current++;
        // Random offset from center
        const x = 50 + (Math.random() - 0.5) * 10;
        const y = 45 + (Math.random() - 0.5) * 5;
        setPopups(prev => [...prev.slice(-8), { id, score: diff, x, y, headshot: isHeadshot, time: Date.now() }]);
        lastHeadshots.current = state.headshotCount;
      }
      lastScore.current = state.score;
    });
    return unsub;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPopups(prev => prev.filter(p => Date.now() - p.time < 1500));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {popups.map(p => {
        const age = (Date.now() - p.time) / 1500;
        return (
          <div key={p.id} className="absolute pointer-events-none font-tactical font-bold"
            style={{
              left: `${p.x}%`, top: `${p.y - age * 8}%`,
              opacity: 1 - age,
              transform: `translate(-50%, -50%) scale(${1 + age * 0.3})`,
              color: p.headshot ? '#ff4444' : '#ffcc00',
              textShadow: p.headshot ? '0 0 10px #ff0000' : '0 0 8px #ff880080',
              fontSize: p.headshot ? '1.5rem' : '1.2rem',
            }}>
            +{p.score}{p.headshot ? ' HEADSHOT' : ''}
          </div>
        );
      })}
    </>
  );
}

// ═══════════════════════════════════════════════════════
// ENHANCED KILL FEED
// ═══════════════════════════════════════════════════════
function KillFeed() {
  const [feeds, setFeeds] = useState<Array<{ id: number; text: string; time: number; money: number; type: string }>>([]);
  const lastKills = useRef(0);
  const feedId = useRef(0);

  useEffect(() => {
    const unsub = useGameStore.subscribe((state) => {
      if (state.kills > lastKills.current) {
        const diff = state.kills - lastKills.current;
        for (let i = 0; i < diff; i++) {
          const id = feedId.current++;
          const types = ['grunt', 'runner', 'tank', 'bomber', 'sniper'];
          const typeNames: Record<string, string> = { grunt: 'Grunt', runner: 'Runner', tank: 'Heavy', bomber: 'Bomber', sniper: 'Sniper' };
          // Try to find which enemy was just killed
          const deadEnemy = state.enemies.find(e => !e.alive);
          const enemyType = deadEnemy?.type || 'grunt';
          const moneyReward = enemyType === 'tank' ? 150 : enemyType === 'sniper' ? 100 : 50;
          setFeeds(prev => [...prev.slice(-5), { 
            id, 
            text: `${typeNames[enemyType] || 'Enemy'} eliminated`, 
            time: Date.now(),
            money: moneyReward,
            type: enemyType,
          }]);
        }
        lastKills.current = state.kills;
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFeeds(prev => prev.filter(f => Date.now() - f.time < 4000));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const typeColors: Record<string, string> = {
    grunt: 'text-foreground',
    runner: 'text-blue-400',
    tank: 'text-orange-400',
    bomber: 'text-red-400',
    sniper: 'text-green-400',
  };

  return (
    <div className="absolute top-20 right-4 space-y-1 max-w-[240px]">
      {feeds.map(f => (
        <div key={f.id} className="text-xs font-bold tracking-wider px-3 py-1.5 bg-background/70 border-l-2 border-primary backdrop-blur-sm animate-in slide-in-from-right duration-300 flex items-center gap-2">
          <span className="text-primary">☠</span>
          <span className={typeColors[f.type] || 'text-foreground'}>{f.text}</span>
          <span className="text-hud-ammo ml-auto">+${f.money}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// DYNAMIC CROSSHAIR (expands on movement/shooting)
// ═══════════════════════════════════════════════════════
function DynamicCrosshair() {
  const [spread, setSpread] = useState(0);
  const lastBullets = useRef(0);

  useEffect(() => {
    let frame: number;
    const update = () => {
      const s = useGameStore.getState();
      const bullets = s.bullets.length;
      let targetSpread = 0;
      
      // Expand on shooting
      if (bullets > lastBullets.current) targetSpread += 8;
      lastBullets.current = bullets;
      
      // Expand when moving (check via crouching = smaller)
      if (s.isCrouching) targetSpread -= 2;
      if (s.isReloading) targetSpread += 3;
      
      // ADS = tighter
      if (s.isADS) targetSpread -= 4;

      setSpread(prev => prev + (targetSpread - prev) * 0.15);
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, []);

  const gap = 4 + Math.max(0, spread);
  const len = 10;
  const thickness = 2;
  const isADS = useGameStore(s => s.isADS);
  const weapon = useGameStore(s => WEAPONS[s.currentWeaponId]);

  // Show dot crosshair when ADS with sniper
  if (isADS && weapon.type === 'sniper') {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {/* Scope overlay */}
        <div className="w-[80vmin] h-[80vmin] rounded-full border-[3px] border-foreground/60 relative">
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-foreground/60" />
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-foreground/60" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-500" />
          {/* Mil dots */}
          {[1, 2, 3].map(i => (
            <div key={`h${i}`}>
              <div className="absolute top-1/2 bg-foreground/40 w-1 h-1 rounded-full" style={{ left: `${50 + i * 8}%`, transform: 'translate(-50%, -50%)' }} />
              <div className="absolute top-1/2 bg-foreground/40 w-1 h-1 rounded-full" style={{ left: `${50 - i * 8}%`, transform: 'translate(-50%, -50%)' }} />
              <div className="absolute left-1/2 bg-foreground/40 w-1 h-1 rounded-full" style={{ top: `${50 + i * 8}%`, transform: 'translate(-50%, -50%)' }} />
              <div className="absolute left-1/2 bg-foreground/40 w-1 h-1 rounded-full" style={{ top: `${50 - i * 8}%`, transform: 'translate(-50%, -50%)' }} />
            </div>
          ))}
        </div>
        {/* Black out edges */}
        <div className="fixed inset-0 -z-10" style={{
          background: 'radial-gradient(circle at center, transparent 28vmin, rgba(0,0,0,0.95) 40vmin)'
        }} />
      </div>
    );
  }

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      {/* Top */}
      <div className="absolute bg-foreground/80 rounded-full" style={{
        width: thickness, height: len,
        left: -thickness / 2, bottom: gap,
        boxShadow: '0 0 3px rgba(0,0,0,0.8)',
      }} />
      {/* Bottom */}
      <div className="absolute bg-foreground/80 rounded-full" style={{
        width: thickness, height: len,
        left: -thickness / 2, top: gap,
        boxShadow: '0 0 3px rgba(0,0,0,0.8)',
      }} />
      {/* Left */}
      <div className="absolute bg-foreground/80 rounded-full" style={{
        width: len, height: thickness,
        top: -thickness / 2, right: gap,
        boxShadow: '0 0 3px rgba(0,0,0,0.8)',
      }} />
      {/* Right */}
      <div className="absolute bg-foreground/80 rounded-full" style={{
        width: len, height: thickness,
        top: -thickness / 2, left: gap,
        boxShadow: '0 0 3px rgba(0,0,0,0.8)',
      }} />
      {/* Center dot */}
      <div className="absolute w-[3px] h-[3px] rounded-full bg-foreground/50" style={{
        left: -1.5, top: -1.5,
      }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// HIT MARKER (with headshot variant)
// ═══════════════════════════════════════════════════════
function HitMarker() {
  const [show, setShow] = useState(false);
  const [isHeadshot, setIsHeadshot] = useState(false);
  const lastKills = useRef(0);
  const lastHeadshots = useRef(0);

  useEffect(() => {
    const unsub = useGameStore.subscribe((state) => {
      if (state.kills > lastKills.current) {
        const hs = state.headshotCount > lastHeadshots.current;
        lastKills.current = state.kills;
        lastHeadshots.current = state.headshotCount;
        setIsHeadshot(hs);
        setShow(true);
        setTimeout(() => setShow(false), 200);
      }
    });
    return unsub;
  }, []);

  if (!show) return null;
  const color = isHeadshot ? '#ff2222' : '#ffffff';
  const size = isHeadshot ? 10 : 8;
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <svg width={size * 4} height={size * 4} viewBox={`0 0 ${size * 4} ${size * 4}`} className="drop-shadow-lg">
        <line x1={size * 0.8} y1={size * 0.8} x2={size * 1.5} y2={size * 1.5} stroke={color} strokeWidth={isHeadshot ? 3 : 2} />
        <line x1={size * 3.2} y1={size * 0.8} x2={size * 2.5} y2={size * 1.5} stroke={color} strokeWidth={isHeadshot ? 3 : 2} />
        <line x1={size * 0.8} y1={size * 3.2} x2={size * 1.5} y2={size * 2.5} stroke={color} strokeWidth={isHeadshot ? 3 : 2} />
        <line x1={size * 3.2} y1={size * 3.2} x2={size * 2.5} y2={size * 2.5} stroke={color} strokeWidth={isHeadshot ? 3 : 2} />
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// DAMAGE VIGNETTE + SCREEN SHAKE
// ═══════════════════════════════════════════════════════
function DamageVignette() {
  const [opacity, setOpacity] = useState(0);
  const [shake, setShake] = useState({ x: 0, y: 0 });
  const lastHealth = useRef(100);

  useEffect(() => {
    const unsub = useGameStore.subscribe((state) => {
      if (state.health < lastHealth.current) {
        const dmg = lastHealth.current - state.health;
        setOpacity(Math.min(0.7, dmg / 40));
        // Screen shake proportional to damage
        const intensity = Math.min(15, dmg * 0.8);
        setShake({ x: (Math.random() - 0.5) * intensity, y: (Math.random() - 0.5) * intensity });
        setTimeout(() => setShake({ x: 0, y: 0 }), 100);
        setTimeout(() => setOpacity(0), 400);
      }
      lastHealth.current = state.health;
    });
    return unsub;
  }, []);

  return (
    <>
      {opacity > 0 && (
        <div className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            opacity,
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(200,0,0,0.7) 100%)',
            transform: `translate(${shake.x}px, ${shake.y}px)`,
          }}
        />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════
// MINIMAP RADAR
// ═══════════════════════════════════════════════════════
function Minimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let frame: number;
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) { frame = requestAnimationFrame(draw); return; }
      const ctx = canvas.getContext('2d')!;
      const s = useGameStore.getState();
      const size = canvas.width;
      const center = size / 2;
      const scale = size / 120; // Map is 100x100

      // Background
      ctx.fillStyle = 'rgba(10, 12, 10, 0.85)';
      ctx.fillRect(0, 0, size, size);
      
      // Grid lines
      ctx.strokeStyle = 'rgba(100, 120, 100, 0.15)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < size; i += size / 6) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
      }

      // Border
      ctx.strokeStyle = 'rgba(200, 180, 80, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, 0, size, size);

      // Sweep line (radar effect)
      const sweepAngle = (Date.now() / 2000) * Math.PI * 2;
      const grad = ctx.createConicGradient(sweepAngle, center, center);
      grad.addColorStop(0, 'rgba(80, 200, 80, 0.15)');
      grad.addColorStop(0.1, 'rgba(80, 200, 80, 0)');
      grad.addColorStop(1, 'rgba(80, 200, 80, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(center, center, center, 0, Math.PI * 2); ctx.fill();

      // Enemies as red dots
      s.enemies.forEach(e => {
        if (!e.alive) return;
        const ex = center + e.position[0] * scale;
        const ez = center + e.position[2] * scale;
        if (ex < 0 || ex > size || ez < 0 || ez > size) return;
        
        const typeColors: Record<string, string> = {
          grunt: '#ff4444', runner: '#4488ff', tank: '#ff8800', bomber: '#ff2222', sniper: '#44ff44',
        };
        ctx.fillStyle = typeColors[e.type] || '#ff4444';
        ctx.beginPath();
        ctx.arc(ex, ez, e.type === 'tank' ? 3.5 : 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow
        ctx.fillStyle = (typeColors[e.type] || '#ff4444') + '40';
        ctx.beginPath();
        ctx.arc(ex, ez, 5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Player as triangle
      const px = center + 0 * scale; // Player is at camera position, but for simplicity
      const pz = center + 30 * scale; // Starting pos
      ctx.fillStyle = '#00ff88';
      ctx.beginPath();
      ctx.arc(center, center, 3, 0, Math.PI * 2);
      ctx.fill();
      // Player direction indicator
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(center, center - 8);
      ctx.stroke();

      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="absolute top-16 left-4">
      <canvas ref={canvasRef} width={140} height={140} className="rounded-sm opacity-80" />
      <div className="text-[8px] text-muted-foreground/50 font-tactical tracking-widest text-center mt-0.5">RADAR</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN HUD
// ═══════════════════════════════════════════════════════
export default function HUD() {
  const { health, armor, score, wave, kills, gameState, isCrouching, currentMap,
    currentWeaponId, ownedWeapons, isReloading, money, combo, comboTimer, killStreak, isADS } = useGameStore();

  if (gameState !== 'playing') return null;

  const weapon = WEAPONS[currentWeaponId];
  const owned = ownedWeapons.find(w => w.id === currentWeaponId);
  const mapNames: Record<string, string> = { desert: 'DUST STORM', arctic: 'FROST BITE', jungle: 'VIPER RIDGE' };

  return (
    <div className="fixed inset-0 pointer-events-none z-50 font-tactical select-none">
      {/* Dynamic Crosshair */}
      <DynamicCrosshair />

      {/* Hit marker */}
      <HitMarker />

      {/* Multi-kill announcement */}
      <MultiKillAnnouncement />

      {/* Killstreak announcement */}
      <KillstreakAnnouncement />

      {/* Score popups */}
      <ScorePopups />

      {/* Kill feed */}
      <KillFeed />

      {/* Damage vignette & shake */}
      <DamageVignette />

      {/* Minimap */}
      <Minimap />

      {/* Health & Armor */}
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
              <div className="h-full transition-all duration-300 rounded-sm" style={{
                width: `${armor}%`,
                background: 'linear-gradient(90deg, hsl(210, 80%, 45%), hsl(210, 80%, 55%))',
              }} />
            </div>
            <span className="text-foreground text-xs font-bold min-w-[28px]">{armor}</span>
          </div>
        )}
        {isCrouching && <div className="text-muted-foreground text-[10px] tracking-[0.2em] ml-11">⬇ CROUCHING</div>}
        {/* Kill streak indicator */}
        {(killStreak || 0) >= 2 && (
          <div className="flex items-center gap-1 ml-11">
            <span className="text-primary text-[10px] tracking-[0.2em]">🔥 {killStreak} STREAK</span>
          </div>
        )}
      </div>

      {/* Weapon & Ammo */}
      <div className="absolute bottom-6 right-6 text-right">
        <div className="text-muted-foreground text-[10px] tracking-[0.15em] mb-1">
          {weapon.name.toUpperCase()}
          {isADS && <span className="text-primary ml-2">• ADS</span>}
        </div>
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
              ? 'border-primary text-primary bg-primary/15'
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
      <div className="absolute top-6 left-[170px]">
        <div className="text-muted-foreground/50 text-[9px] tracking-[0.2em]">{mapNames[currentMap]}</div>
        <div className="text-foreground text-xl font-bold">WAVE {wave}</div>
        <div className="text-muted-foreground text-xs tabular-nums">{kills} kills</div>
      </div>

      {/* Combo */}
      {combo > 1 && comboTimer > 0 && (
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 text-center">
          <div className="text-primary text-3xl font-black animate-pulse" style={{
            textShadow: '0 0 20px hsla(35, 90%, 55%, 0.5)',
          }}>
            {combo}x COMBO!
          </div>
          <div className="w-28 h-1.5 bg-secondary/60 mx-auto mt-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(comboTimer / 3) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground/40 text-[9px] tracking-[0.2em]">
        B — BUY • Q — SWITCH • C — CROUCH • SPACE — JUMP • RMB — ADS
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
