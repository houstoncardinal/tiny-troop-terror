// Procedural sound effects using Web Audio API — no external files needed

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function noise(ctx: AudioContext, duration: number, volume = 0.3): AudioBufferSourceNode {
  const buf = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * volume;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  return src;
}

type SoundType = 
  'pistol' | 'rifle' | 'shotgun' | 'sniper' | 'grenade_throw' | 'explosion' |
  'reload' | 'empty' | 'weapon_switch' | 'ui_click' | 'footstep' | 'jump' | 'land' |
  'hit' | 'kill' | 'headshot' | 'buy' | 'damage' | 'combo' | 'killstreak';

export function playSound(type: SoundType) {
  try {
    const ctx = getCtx();
    const now = ctx.currentTime;

    switch (type) {
      case 'pistol': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.12);
        const n = noise(ctx, 0.06, 0.08);
        const ng = ctx.createGain();
        ng.gain.setValueAtTime(0.08, now);
        ng.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        n.connect(ng).connect(ctx.destination);
        n.start(now); n.stop(now + 0.06);
        break;
      }
      case 'rifle': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.08);
        const n = noise(ctx, 0.04, 0.1);
        const ng = ctx.createGain();
        ng.gain.setValueAtTime(0.1, now);
        ng.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        n.connect(ng).connect(ctx.destination);
        n.start(now); n.stop(now + 0.04);
        break;
      }
      case 'shotgun': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.25);
        const n = noise(ctx, 0.15, 0.12);
        const ng = ctx.createGain();
        ng.gain.setValueAtTime(0.12, now);
        ng.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        n.connect(ng).connect(ctx.destination);
        n.start(now); n.stop(now + 0.15);
        break;
      }
      case 'sniper': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.4);
        const osc2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        osc2.frequency.setValueAtTime(200, now + 0.15);
        osc2.frequency.exponentialRampToValueAtTime(40, now + 0.5);
        g2.gain.setValueAtTime(0.05, now + 0.15);
        g2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc2.connect(g2).connect(ctx.destination);
        osc2.start(now + 0.15); osc2.stop(now + 0.5);
        break;
      }
      case 'grenade_throw': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.15);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.15);
        break;
      }
      case 'explosion': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(20, now + 0.5);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.6);
        const n = noise(ctx, 0.4, 0.15);
        const ng = ctx.createGain();
        ng.gain.setValueAtTime(0.15, now);
        ng.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        n.connect(ng).connect(ctx.destination);
        n.start(now); n.stop(now + 0.4);
        break;
      }
      case 'reload': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(2000, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.08);
        const osc2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        osc2.frequency.setValueAtTime(1500, now + 0.12);
        osc2.frequency.exponentialRampToValueAtTime(600, now + 0.18);
        g2.gain.setValueAtTime(0.06, now + 0.12);
        g2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc2.connect(g2).connect(ctx.destination);
        osc2.start(now + 0.12); osc2.stop(now + 0.2);
        break;
      }
      case 'empty': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.03);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.05);
        break;
      }
      case 'weapon_switch': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.06);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.1);
        break;
      }
      case 'ui_click': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.05);
        break;
      }
      case 'footstep': {
        const n = noise(ctx, 0.06, 0.03);
        const ng = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400 + Math.random() * 200;
        ng.gain.setValueAtTime(0.025, now);
        ng.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        n.connect(filter).connect(ng).connect(ctx.destination);
        n.start(now); n.stop(now + 0.06);
        break;
      }
      case 'jump': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.12);
        break;
      }
      case 'land': {
        const n = noise(ctx, 0.08, 0.05);
        const ng = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 300;
        ng.gain.setValueAtTime(0.04, now);
        ng.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        n.connect(filter).connect(ng).connect(ctx.destination);
        n.start(now); n.stop(now + 0.08);
        break;
      }
      case 'hit': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.06);
        break;
      }
      case 'kill': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.3);
        const osc2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1320, now + 0.05);
        g2.gain.setValueAtTime(0.05, now + 0.05);
        g2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc2.connect(g2).connect(ctx.destination);
        osc2.start(now + 0.05); osc2.stop(now + 0.25);
        break;
      }
      case 'headshot': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1760, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.2);
        break;
      }
      case 'damage': {
        const n = noise(ctx, 0.1, 0.08);
        const ng = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 500;
        ng.gain.setValueAtTime(0.07, now);
        ng.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        n.connect(filter).connect(ng).connect(ctx.destination);
        n.start(now); n.stop(now + 0.1);
        break;
      }
      case 'buy': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(900, now + 0.06);
        osc.frequency.setValueAtTime(1200, now + 0.12);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.2);
        break;
      }
      case 'combo': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain).connect(ctx.destination);
        osc.start(now); osc.stop(now + 0.15);
        break;
      }
      case 'killstreak': {
        // Dramatic ascending fanfare
        const notes = [440, 554, 659, 880];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          gain.gain.setValueAtTime(0.06, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);
          osc.connect(gain).connect(ctx.destination);
          osc.start(now + i * 0.08); osc.stop(now + i * 0.08 + 0.3);
        });
        break;
      }
    }
  } catch (e) {
    // Audio not available
  }
}
