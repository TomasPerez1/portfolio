"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const ThreeScene = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // Configuración de la escena
    const scene = new THREE.Scene();

    // Configuración del renderizador
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(840, 840);
    renderer.setClearColor(0x000000); // Fondo negro
    mountRef.current.appendChild(renderer.domElement);

    // Configuración de la cámara ortográfica
    const aspect = 840 / 840;
    const camera = new THREE.OrthographicCamera(
      -420 * aspect,
      420 * aspect,
      420,
      -420,
      1,
      1000,
    );
    camera.position.set(0, 0, 500);
    camera.lookAt(0, 0, 0);

    // Luz direccional
    const light = new THREE.DirectionalLight(0xd3d3d3, 0.75);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    // Geometría y textura
    const geometry = new THREE.BoxGeometry(200, 200, 200); // Usa tu geometría aquí
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load("/path_to_texture.jpg"); // Cambia a la ruta real
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const cube = new THREE.Mesh(geometry, material);

    // Aplicar transformaciones
    cube.position.set(0, 0, 0);
    cube.rotation.set(0, 0, 0);
    cube.scale.set(1, 1, 1);

    scene.add(cube);

    // Animación
    const animate = () => {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />;
};

export default ThreeScene;
