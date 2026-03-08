import { useGameStore } from './useGameStore';
import { WEAPONS, WEAPON_ORDER } from './weapons';
import { playSound } from './AudioManager';

export default function BuyMenu() {
  const { shopOpen, money, ownedWeapons, buyWeapon, buyAmmo, buyArmor, armor, toggleShop, gameState } = useGameStore();

  if (!shopOpen && gameState !== 'shopping') return null;

  const categories = {
    'PISTOLS': WEAPON_ORDER.filter(id => WEAPONS[id].type === 'pistol'),
    'RIFLES': WEAPON_ORDER.filter(id => WEAPONS[id].type === 'rifle'),
    'HEAVY': WEAPON_ORDER.filter(id => WEAPONS[id].type === 'shotgun' || WEAPONS[id].type === 'sniper'),
    'GRENADES': WEAPON_ORDER.filter(id => WEAPONS[id].type === 'grenade'),
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-background/80 backdrop-blur-sm pointer-events-auto">
      <div className="bg-card border border-border p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-tactical text-xl text-primary tracking-widest">BUY MENU</h2>
          <div className="flex items-center gap-4">
            <span className="text-hud-ammo font-bold text-xl font-tactical">${money}</span>
            <button onClick={toggleShop} className="text-muted-foreground hover:text-foreground cursor-pointer font-tactical text-sm">
              [ESC / B]
            </button>
          </div>
        </div>

        {/* Armor */}
        <div className="mb-4 p-3 border border-border">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-foreground font-tactical text-sm">KEVLAR + HELMET</span>
              <span className="text-muted-foreground text-xs ml-2">({armor}/100)</span>
            </div>
            <button
              onClick={() => { if (buyArmor()) playSound('buy'); }}
              disabled={money < 650 || armor >= 100}
              className="px-3 py-1 bg-primary text-primary-foreground text-xs font-tactical cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
            >
              $650
            </button>
          </div>
        </div>

        {Object.entries(categories).map(([cat, ids]) => (
          <div key={cat} className="mb-4">
            <h3 className="text-muted-foreground text-xs tracking-widest mb-2 font-tactical">{cat}</h3>
            <div className="space-y-1">
              {ids.map(id => {
                const w = WEAPONS[id];
                const owned = ownedWeapons.find(o => o.id === id);
                return (
                  <div key={id} className="flex items-center justify-between p-2 border border-border hover:border-primary/50 transition-colors">
                    <div className="flex-1">
                      <span className={`font-tactical text-sm ${owned ? 'text-primary' : 'text-foreground'}`}>
                        {w.name}
                      </span>
                      <span className="text-muted-foreground text-xs ml-2">
                        DMG:{w.damage} • {w.auto ? 'AUTO' : 'SEMI'} • {w.magSize}rd
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {owned ? (
                        <button
                          onClick={() => { if (buyAmmo(id)) playSound('buy'); }}
                          disabled={money < w.ammoPrice || owned.reserveAmmo >= w.maxAmmo}
                          className="px-2 py-1 bg-secondary text-foreground text-xs font-tactical cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          AMMO ${w.ammoPrice}
                        </button>
                      ) : (
                        <button
                          onClick={() => buyWeapon(id)}
                          disabled={money < w.price || w.price === 0}
                          className="px-2 py-1 bg-primary text-primary-foreground text-xs font-tactical cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          {w.price === 0 ? 'FREE' : `$${w.price}`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {gameState === 'shopping' && (
          <button
            onClick={toggleShop}
            className="w-full py-3 bg-primary text-primary-foreground font-tactical text-lg tracking-widest cursor-pointer hover:opacity-90 mt-4"
          >
            START NEXT WAVE
          </button>
        )}
      </div>
    </div>
  );
}
