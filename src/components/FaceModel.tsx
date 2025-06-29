import { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import { Card } from '@/components/ui/card';
import * as THREE from 'three';

type FaceArea = 'forehead' | 'eyes' | 'cheeks' | 'nose' | 'mouth' | 'chin' | null;

// Camera positions for each face area - centered in the scene
const cameraPositions: Record<FaceArea, { position: [number, number, number]; target: [number, number, number] }> = {
  forehead: { position: [0, 2.5, 3.5], target: [0, 1.8, 0] },
  eyes: { position: [0, 0.8, 3.5], target: [0, 0.5, 0] },
  cheeks: { position: [1.3, 0, 3.5], target: [-1, 0, 0] },
  nose: { position: [0, 0.2, 3], target: [0, 0, 0] },
  mouth: { position: [0, -0.8, 3.5], target: [0, -0.5, 0] },
  chin: { position: [0, -1.8, 3.5], target: [0, -1.2, 0] }
};

// Face area information
const areaInfo = {
  forehead: {
    title: 'Forehead',
    concerns: ['Fine lines', 'Oil control', 'Texture'],
    ingredients: ['Retinol', 'Niacinamide', 'Salicylic Acid'],
    color: '#fce7f3'
  },
  eyes: {
    title: 'Eye Area',
    concerns: ['Dark circles', 'Puffiness', 'Crow\'s feet'],
    ingredients: ['Caffeine', 'Peptides', 'Hyaluronic Acid'],
    color: '#e0e7ff'
  },
  cheeks: {
    title: 'Cheeks',
    concerns: ['Dryness', 'Redness', 'Loss of firmness'],
    ingredients: ['Ceramides', 'Vitamin C', 'Collagen'],
    color: '#fef3c7'
  },  nose: {
    title: 'Nose',
    concerns: ['Blackheads', 'Large pores', 'Oiliness'],
    ingredients: ['BHA', 'Charcoal', 'Clay'],
    color: '#d1fae5'
  },
  mouth: {
    title: 'Mouth & Lips',
    concerns: ['Dryness', 'Fine lines', 'Pigmentation'],
    ingredients: ['Shea Butter', 'Vitamin E', 'Peptides'],
    color: '#fce7f3'
  },
  chin: {
    title: 'Chin',
    concerns: ['Acne', 'Texture', 'Sensitivity'],
    ingredients: ['Tea Tree', 'Zinc', 'Allantoin'],
    color: '#f3e8ff'
  }
};

// Mesh name mapping - maps face areas to actual mesh names in the GLB
const meshNameMap: Record<FaceArea, string> = {
  forehead: 'face_forehead',
  eyes: 'face_eyes',
  cheeks: 'face_cheeks',
  nose: 'face_nose',
  mouth: 'face_mouth',
  chin: 'face_chin'
};

// Face 3D Model component with mesh interaction and camera animation
function Face3DModel({ 
  activeArea, 
  hoveredArea, 
  onHover, 
  onClick 
}: { 
  activeArea: FaceArea; 
  hoveredArea: FaceArea; 
  onHover: (area: FaceArea) => void; 
  onClick: (area: FaceArea) => void; 
}) {
  const { scene } = useGLTF('/src/meshed_face_model.glb');
  const meshRef = useRef<THREE.Group>(null);
  const [originalMaterials] = useState<Map<string, THREE.Material | THREE.Material[]>>(new Map());
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>(null);
  
  // Store original materials on first render
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        originalMaterials.set(child.name, child.material);
      }
    });
  }, [scene, originalMaterials]);
  
  // Auto-rotate when no zone is active
  useFrame((state, delta) => {
    if (meshRef.current && !activeArea) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });
  
  // Animate camera when active area changes
  useEffect(() => {
    if (controlsRef.current && activeArea && cameraPositions[activeArea]) {
      const targetPosition = cameraPositions[activeArea];
      
      // Smoothly animate camera position
      const startPosition = camera.position.clone();
      const startTarget = controlsRef.current.target.clone();
      
      // Disable controls during animation
      controlsRef.current.enabled = false;
      
      let progress = 0;
      const animationDuration = 1000; // 1 second
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / animationDuration, 1);
        
        // Ease-in-out curve
        const eased = progress < 0.5 
          ? 2 * progress * progress 
          : -1 + (4 - 2 * progress) * progress;
        
        // Interpolate camera position
        camera.position.lerpVectors(
          startPosition,
          new THREE.Vector3(...targetPosition.position),
          eased
        );
        
        // Interpolate look-at target
        controlsRef.current.target.lerpVectors(
          startTarget,
          new THREE.Vector3(...targetPosition.target),
          eased
        );
        
        controlsRef.current.update();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Re-enable controls after animation
          controlsRef.current.enabled = true;
        }
      };
      
      animate();
    } else if (controlsRef.current && !activeArea) {
      // Return to default position
      const defaultPosition = new THREE.Vector3(0, 0, 5);
      const defaultTarget = new THREE.Vector3(0, 0, 0);
      
      const startPosition = camera.position.clone();
      const startTarget = controlsRef.current.target.clone();
      
      // Disable controls during animation
      controlsRef.current.enabled = false;
      
      let progress = 0;
      const animationDuration = 800;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / animationDuration, 1);
        
        const eased = progress < 0.5 
          ? 2 * progress * progress 
          : -1 + (4 - 2 * progress) * progress;
        
        camera.position.lerpVectors(startPosition, defaultPosition, eased);
        controlsRef.current.target.lerpVectors(startTarget, defaultTarget, eased);
        controlsRef.current.update();
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Re-enable controls after animation
          controlsRef.current.enabled = true;
        }
      };
      
      animate();
    }
  }, [activeArea, camera]);
  
  // Handle mesh interactions
  const handleMeshClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    const meshName = event.object.name;
    
    // Find which face area this mesh corresponds to
    const faceArea = Object.entries(meshNameMap).find(
      ([_, meshMapName]) => meshMapName === meshName
    )?.[0] as FaceArea | undefined;
    
    if (faceArea) {
      onClick(faceArea);
      // Clear hover state when clicking
      onHover(null);
      gl.domElement.style.cursor = 'auto';
    }
  };
  
  const handleMeshHover = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    const meshName = event.object.name;
    
    // Find which face area this mesh corresponds to
    const faceArea = Object.entries(meshNameMap).find(
      ([_, meshMapName]) => meshMapName === meshName
    )?.[0] as FaceArea | undefined;
    
    if (faceArea) {
      onHover(faceArea);
      gl.domElement.style.cursor = 'pointer';
    }
  };
  
  const handleMeshUnhover = () => {
    onHover(null);
    gl.domElement.style.cursor = 'auto';
  };
  
  // Update mesh materials based on hover/active state
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const faceArea = Object.entries(meshNameMap).find(
          ([_, meshMapName]) => meshMapName === child.name
        )?.[0] as FaceArea | undefined;
        
        if (faceArea && child.material) {
          const isActive = activeArea === faceArea;
          const isHovered = hoveredArea === faceArea;
          
          // Clone material to avoid affecting original
          const material = (originalMaterials.get(child.name) as THREE.Material).clone() as THREE.MeshStandardMaterial;
          
          if (isActive) {
            material.emissive = new THREE.Color('#ec4899');
            material.emissiveIntensity = 0.3;
          } else if (isHovered) {
            material.emissive = new THREE.Color('#a78bfa');
            material.emissiveIntensity = 0.2;
          }
          
          child.material = material;
        } else if (child.name === 'face_else' && child.material) {
          // Ensure face_else mesh is not highlighted
          child.material = originalMaterials.get(child.name) || child.material;
        }
      }
    });
  }, [scene, activeArea, hoveredArea, originalMaterials]);
  
  return (
    <>
      <group ref={meshRef} position={[0, 0, 0]}>
        <primitive 
          object={scene} 
          scale={[2, 2, 2]}
          onPointerDown={handleMeshClick}
          onPointerOver={handleMeshHover}
          onPointerOut={handleMeshUnhover}
        />
      </group>
      <OrbitControls 
        ref={controlsRef}
        enablePan={false}
        maxDistance={8}
        minDistance={3}
        maxPolarAngle={Math.PI * 0.8}
        minPolarAngle={Math.PI * 0.2}
        target={[0, 0, 0]}
      />
    </>
  );
}

// Loading component
function LoadingFace() {
  return (
    <Html center>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mb-4"></div>
        <p className="text-sm text-gray-600">Loading 3D model...</p>
      </div>
    </Html>
  );
}

// Fallback for browsers that don't support WebGL
function FallbackView({ activeArea, onAreaClick }: {
  activeArea: FaceArea;
  onAreaClick: (area: FaceArea) => void;
}) {
  return (
    <div className="p-6 bg-gray-50 rounded-lg text-center">
      <p className="text-sm text-gray-600 mb-4">
        3D view not supported. Use the buttons below to explore face areas:
      </p>
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(areaInfo) as FaceArea[]).map((area) => (
          <button
            key={area}
            onClick={() => onAreaClick(area)}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeArea === area
                ? 'bg-rose-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {areaInfo[area!].title}
          </button>
        ))}
      </div>
    </div>
  );
}

// Main FaceModel component
export const FaceModel = () => {
  const [activeArea, setActiveArea] = useState<FaceArea>(null);
  const [hoveredArea, setHoveredArea] = useState<FaceArea>(null);
  const [webGLSupported, setWebGLSupported] = useState(true);

  // Check WebGL support on mount
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const supported = !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      setWebGLSupported(supported);
    } catch(e) {
      setWebGLSupported(false);
    }
  }, []);

  const handleAreaClick = (area: FaceArea) => {
    setActiveArea(activeArea === area ? null : area);
  };

  const handleAreaHover = (area: FaceArea) => {
    setHoveredArea(area);
  };

  return (
    <div className="fixed inset-0 w-full h-full">
      {/* Boundless 3D Face Model */}
      {webGLSupported ? (
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          style={{ background: 'black' }}
          gl={{ antialias: true, alpha: false }}
        >
          {/* Lighting setup for better visualization */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-5, 5, -5]} intensity={0.4} />
          <pointLight position={[0, 2, 2]} intensity={0.6} />
          
          {/* 3D Model with Suspense for loading */}
          <Suspense fallback={<LoadingFace />}>
            <Face3DModel 
              activeArea={activeArea}
              hoveredArea={hoveredArea}
              onHover={handleAreaHover}
              onClick={handleAreaClick}
            />
          </Suspense>
        </Canvas>
      ) : (
        <FallbackView activeArea={activeArea} onAreaClick={handleAreaClick} />
      )}
      
      {/* Hover tooltip */}
      {hoveredArea && webGLSupported && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-md">
          <p className="text-sm font-medium text-gray-700">{areaInfo[hoveredArea].title}</p>
        </div>
      )}      
      
      {/* Area Information Card - Floating overlay at bottom left of scene */}
      {activeArea && (
        <div className="absolute bottom-6 left-6 w-80 animate-fade-in">
          <Card className="p-4 bg-white/90 backdrop-blur-sm border-gray-200 shadow-xl">
            <h3 className="font-semibold text-lg text-gray-800 mb-2">
              {areaInfo[activeArea].title}
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-1">Common Concerns:</h4>
                <div className="flex flex-wrap gap-1">
                  {areaInfo[activeArea].concerns.map((concern, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded-full"
                    >
                      {concern}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-1">Recommended Ingredients:</h4>
                <div className="flex flex-wrap gap-1">
                  {areaInfo[activeArea].ingredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-violet-100 text-violet-700 text-xs rounded-full font-medium cursor-pointer hover:bg-violet-200 transition-colors"
                      onClick={() => {
                        // TODO: Link to ingredient search
                        console.log('Search for ingredient:', ingredient);
                      }}
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}      
      
      {/* Instructions overlay */}
      <div className="absolute bottom-6 left-6 text-sm text-white/70">
        <p className="md:hidden">Touch and drag to rotate • Tap zones to explore</p>
        <p className="hidden md:block">Click and drag to rotate • Click zones to explore</p>
      </div>
    </div>
  );
};

// Preload the GLB file
useGLTF.preload('/src/meshed_face_model.glb');