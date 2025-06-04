import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import GameScene from './components/GameScene';
import UI from './components/UI';
import Loading from './components/Loading';
import { GameProvider } from './context/GameContext';

function App() {
  return (
    <GameProvider>
      <div className="w-full h-full relative">
        <Canvas shadows camera={{ position: [0, 1.6, 10], fov: 60 }}>
          <color attach="background" args={['#87CEEB']} />
          <fog attach="fog" args={['#87CEEB', 30, 100]} />
          <Suspense fallback={null}>
            <GameScene />
          </Suspense>
          <ambientLight intensity={0.5} />
          <Sky
            distance={450000}
            sunPosition={[0, 1, 0]}
            inclination={0.49}
            azimuth={0.25}
            rayleigh={0.5}
            turbidity={8}
          />
          <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
        </Canvas>
        <UI />
        <Loading />
      </div>
    </GameProvider>
  );
}

export default App;