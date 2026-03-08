import { Canvas } from '@react-three/fiber';
import DesertMap from './DesertMap';
import Player from './Player';
import EnemyMinion from './EnemyMinion';
import Bullets from './Bullets';
import GunModel from './GunModel';
import WaveManager from './WaveManager';
import HUD from './HUD';
import MenuScreen from './MenuScreen';
import { useGameStore } from './useGameStore';

function GameObjects() {
  const { enemies, gameState } = useGameStore();

  return (
    <>
      <DesertMap />
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

export default function GameScene() {
  return (
    <div className="w-screen h-screen bg-background">
      <MenuScreen />
      <HUD />
      <Canvas
        shadows
        camera={{ fov: 75, near: 0.1, far: 200 }}
        gl={{ antialias: true }}
      >
        <fog attach="fog" args={['#d4a853', 40, 90]} />
        <GameObjects />
      </Canvas>
    </div>
  );
}
