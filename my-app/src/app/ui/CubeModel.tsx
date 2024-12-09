import { useGLTF, useAnimations, useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group } from "three";

useGLTF.preload("/cube_cascade.glb");

export default function CubeModel() {
  const group = useRef<Group>(null);
  const { nodes, materials, animations, scene } = useGLTF("/cube_cascade.glb");
  const { actions, clips } = useAnimations(animations, scene);
  const scroll = useScroll();

  useEffect(() => {
    console.log("actions", actions);
    actions["Animation"].play().paused = true;
  }, []);

  // useFrame(
  //   () =>
  //     (actions["Experiment"].time =
  //       (actions["Experiment"].getClip().duration * scroll.offset) / 3),
  // );

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}
