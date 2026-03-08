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

  return (
    <>
      <MapRenderer />
      {gameState === 'playing' && (
        <>
          <Player />
          <GunModel />
          <Bullets />
          {enemies.map(e => (
            <EnemyMinion key={e.id} enemy={e} />
          ))}
        </>
      )}
      <WaveManager />
    </>
  );
}

function FogForMap({ map }: { map: string }) {
  if (map === 'arctic') return <fog attach="fog" args={['#c8d0d8', 30, 80]} />;
  if (map === 'jungle') return <fog attach="fog" args={['#4a7a5a', 25, 70]} />;
  return <fog attach="fog" args={['#d4a853', 40, 90]} />;
}

export default function GameScene() {
  const { currentMap } = useGameStore();
  return (
    <div className="w-screen h-screen bg-background">
      <MenuScreen />
      <HUD />
      <Canvas
        shadows
        camera={{ fov: 75, near: 0.1, far: 200 }}
        gl={{ antialias: true }}
      >
        <FogForMap map={currentMap} />
        <GameObjects />
      </Canvas>
    </div>
  );
}
