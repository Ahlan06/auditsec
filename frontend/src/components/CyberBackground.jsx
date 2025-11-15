import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Preload } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as random from 'maath/random/dist/maath-random.esm';

const MatrixRain = () => {
  const ref = useRef();
  
  // Generate random positions for particles
  const [sphere] = useMemo(() => [
    random.inSphere(new Float32Array(5000), { radius: 1.2 })
  ], []);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 10;
      ref.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#00ff00"
          size={0.005}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
};

const CyberBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1]">
      <Canvas
        camera={{
          position: [0, 0, 1],
        }}
        style={{
          background: 'transparent',
        }}
      >
        <ambientLight intensity={0.1} />
        <MatrixRain />
        <Preload all />
      </Canvas>
    </div>
  );
};

export default CyberBackground;