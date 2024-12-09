"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { Suspense } from "react";
import { useProgress, Html, ScrollControls } from "@react-three/drei";
import CubeModel from "./CubeModel";

function Loader() {
  // const { progress, active } = useProgress();

  // return <Html center>{progress.toFixed(1)} % loaded</Html>;
  return (
    <div className="bg-orange-500 text-white">
      <h1>Estoy cargadno</h1>
    </div>
  );
}

export default function Scene() {
  return (
    <Canvas gl={{ antialias: true }} dpr={[1, 1.15]}>
      <directionalLight position={[5, 5, 5]} intensity={4} />
      <Suspense fallback={<Loader />}>
        <ScrollControls>
          <CubeModel />
        </ScrollControls>
      </Suspense>
    </Canvas>
  );
}
