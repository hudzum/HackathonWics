import { useRef, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls, Environment, useAnimations } from "@react-three/drei";
import * as THREE from "three";

// Define interfaces for the component props
interface ModelProps {
  modelPath: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  enableTiltAnimation?: boolean;
  partMaterials?: string[];
}

interface Hero3DModelProps {
  modelPath?: string;
  modelScale?: number;
  modelPosition?: [number, number, number];
  modelRotation?: [number, number, number];
  enableTiltAnimation?: boolean;
  canvasHeight?: string;
  partMaterials?: string[];
}


function Model({
  modelPath,
  scale = 0.75,
  position = [0, -2, 0],
  rotation = [0.1, 0.2, 0],
  enableTiltAnimation = true,
  partMaterials = ["jar, jar_rigid_body_top", "jar_rigid_body_bottom"],
}: ModelProps) {
  const gltf = useLoader(GLTFLoader, modelPath) as any;
  const group = useRef<THREE.Group>(null);
  const { actions, names } = useAnimations(gltf.animations, group);

  // Play the first animation automatically on load
  //
  useEffect(() => {
    if (names.length > 0) {
      const action = actions?.[names[0]];
      action?.reset()?.play();
    }
  }, [actions, names]);

  // Apply custom materials to specific parts
  useEffect(() => {
    if (gltf.scene && partMaterials.length > 0) {
      console.log(partMaterials);
      // Go through all the parts of Model
      gltf.scene.traverse((child: any) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;

          const matchingPart = partMaterials.find((part) =>
            mesh.name.toLowerCase().includes(part.toLowerCase())
          );

          if (matchingPart) {
            console.log(
              mesh.name.toLowerCase(),
              "Matches",
              matchingPart.toLowerCase()
            );
            console.log(`Applying custom material to: ${mesh.name}`);

            // If matches apply glass
            let newMaterial = new THREE.MeshPhysicalMaterial({
              transparent: true,
              opacity: 0.3,
            });

            console.log(
              "Switching to Glass",
              matchingPart.toLowerCase(),
              newMaterial
            );

            // Apply the material
            if ((mesh.material as THREE.MeshStandardMaterial).map && !newMaterial.map) {
              newMaterial.map = (mesh.material as THREE.MeshStandardMaterial).map;
            }

            // For multi-material meshes
            if (Array.isArray(mesh.material)) {
              mesh.material = mesh.material.map(() => newMaterial);
            } else {
              mesh.material = newMaterial;
            }
          } else {
            // All the Coins Make Normal
            let newMaterial = new THREE.MeshNormalMaterial({
              transparent: false,
              opacity: 1,
            });
            mesh.material = newMaterial;
            console.log("Making", mesh.name, " Normals");
          }
        }
      });
    }
  }, [gltf.scene, partMaterials]);

  // Gentle tilt animation
  useFrame(({ clock }) => {
    if (enableTiltAnimation && group.current) {
      const t = clock.getElapsedTime();
      group.current.rotation.y = rotation[1] + Math.sin(t * 0.3) * 1.05;
    }
  });

  return (
    <group ref={group} position={position as any} rotation={rotation as any}>
      <primitive object={gltf.scene} scale={scale} />
    </group>
  );
}

export default function Hero3DModel({
  modelPath = "/path/to/your/model.glb",
  modelScale = 0.75,
  modelPosition = [0, -2, 0],
  modelRotation = [0.1, 0.2, 0],
  enableTiltAnimation = true,
  canvasHeight = "80vh",
  partMaterials = ["jar, jar_rigid_body_top", "jar_rigid_body_bottom"],
}: Hero3DModelProps) {
  return (
    <div
      className="w-full absolute top-0 left-0 z-5"
      style={{ height: canvasHeight }}
    >
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          intensity={1}
          castShadow
        />
        <Model
          modelPath={modelPath}
          scale={modelScale}
          position={modelPosition}
          rotation={modelRotation}
          enableTiltAnimation={enableTiltAnimation}
          partMaterials={partMaterials}
        />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={!enableTiltAnimation}
        />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}