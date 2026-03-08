import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import DesertMap from './DesertMap';
import ArcticMap from './ArcticMap';
import JungleMap from './JungleMap';
import Player from './Player';
import EnemyMinion from './EnemyMinion';
import Bullets from './Bullets';
import GunModel from './GunModel';
import WaveManager from './WaveManager';
import HUD from './HUD';
import MenuScreen from './MenuScreen';
import BuyMenu from './BuyMenu';
import { MuzzleFlash, HitParticles, ShellCasings } from './Effects';
import { useGameStore } from './useGameStore';

function MapRenderer() {
  const { currentMap } = useGameStore();
  switch (currentMap) {
    case 'arctic': return <ArcticMap />;
    case 'jungle': return <JungleMap />;
    default: return <DesertMap />;
  }
}

function GameObjects() {
  const { enemies, gameState } = useGameStore();
  const isActive = gameState === 'playing' || gameState === 'shopping';

  return (
    <>
      <MapRenderer />
      {isActive && (
        <>
          <Player />
          <GunModel />
          <Bullets />
          <MuzzleFlash />
          <HitParticles />
          <ShellCasings />
          {enemies.map(e => (
            <EnemyMinion key={e.id} enemy={e} />
          ))}
        </>
      )}
      <WaveManager />
    </>
  );
}

export default function GameScene() {
  const { currentMap } = useGameStore();
  return (
    <div className="w-screen h-screen bg-background">
      <MenuScreen />
      <BuyMenu />
      <HUD />
      <Canvas
        shadows
        camera={{ fov: 75, near: 0.1, far: 200 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        dpr={[1, 2]}
      >
        {currentMap === 'arctic' && <fog attach="fog" args={['#c8d0d8', 30, 80]} />}
        {currentMap === 'jungle' && <fog attach="fog" args={['#4a7a5a', 20, 65]} />}
        {currentMap === 'desert' && <fog attach="fog" args={['#d4a853', 35, 85]} />}
        <GameObjects />
      </Canvas>
    </div>
  );
}
