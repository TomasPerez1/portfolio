"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { Suspense } from "react";
import { useProgress, Html, ScrollControls } from "@react-three/drei";
import AbstractCube from "./ParticleEffect";
// import CubeModel from "./ParticleEffect";

export default function Scene() {
  return (
    <AbstractCube />

    // <Canvas gl={{ antialias: true }} dpr={[1, 1.15]}>
    //   <directionalLight position={[1, 1, 1]} intensity={10} />
    //   <Suspense fallback={null}>
    //     <CubeModel />
    //   </Suspense>
    // </Canvas>
  );
}
