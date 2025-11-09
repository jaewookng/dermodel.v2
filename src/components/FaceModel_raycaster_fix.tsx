  // Wait for renderer and scene, then set up raycaster using Spline's Three.js
  const attemptSetup = (retries = 20, delay = 50) => {
    const app = splineApp as any;
    
    if (retries <= 0) {
      console.error('Failed to set up raycaster: renderer/scene not available');
      return;
    }

    // Check if renderer and scene are available
    if (!app.renderer?.domElement || !app.scene) {
      setTimeout(() => attemptSetup(retries - 1, delay), delay);
      return;
    }

    const canvas = app.renderer.domElement;
    const scene = app.scene;
    
    // Get Three.js classes from existing objects
    // Three.js objects have their constructors which expose the classes
    const SceneClass = scene.constructor;
    const RendererClass = app.renderer.constructor;
    
    // Try to get Three.js - it's often accessible through the constructor or as a static property
    let THREE: any = null;
    
    // Method 1: Check if THREE is on the constructor
    if ((SceneClass as any).THREE) {
      THREE = (SceneClass as any).THREE;
    }
    // Method 2: Check renderer constructor
    else if ((RendererClass as any).THREE) {
      THREE = (RendererClass as any).THREE;
    }
    // Method 3: Access through a Three.js object's constructor (Scene, Object3D, etc.)
    // In Three.js, classes are accessible through the constructor
    else if (scene.constructor.name === 'Scene' || scene.isScene) {
      // Create a temporary object to access the constructor chain
      const tempVec = new (scene.constructor as any).constructor?.Vector2?.() || 
                     new (RendererClass as any).Vector2?.();
      if (tempVec) {
        // Extract THREE from the constructor
        THREE = {
          Raycaster: (scene.constructor as any).Raycaster || 
                    (RendererClass as any).Raycaster,
          Vector2: (scene.constructor as any).Vector2 || 
                  (RendererClass as any).Vector2,
          Camera: (scene.constructor as any).Camera,
          Object3D: (scene.constructor as any).Object3D
        };
      }
    }
    
    // Method 4: Access through window (if Spline exposes it)
    if (!THREE && (window as any).THREE) {
      THREE = (window as any).THREE;
    }
    
    // Method 5: Use the objects directly - create raycaster using the scene's methods
    // If we can't get THREE, we'll create a minimal raycaster interface
    if (!THREE) {
      console.warn('Could not find Three.js namespace, creating raycaster from objects');
      // We can still work with the objects directly
    }

    // Create raycaster - try multiple approaches
    let raycaster: any;
    let mouse: any = { x: 0, y: 0 };
    
    try {
      if (THREE?.Raycaster) {
        raycaster = new THREE.Raycaster();
        mouse = new THREE.Vector2();
      } else {
        // Fallback: Try to create using constructor from scene
        // In Three.js r1xx+, you can create instances like this
        const RaycasterConstructor = (SceneClass as any).Raycaster || 
                                    (RendererClass as any).Raycaster ||
                                    (scene as any).constructor.Raycaster;
        
        if (RaycasterConstructor) {
          raycaster = new RaycasterConstructor();
          const Vector2Constructor = (SceneClass as any).Vector2 || 
                                    (RendererClass as any).Vector2;
          if (Vector2Constructor) {
            mouse = new Vector2Constructor();
          }
        } else {
          // Last resort: create a minimal implementation
          console.warn('Creating minimal raycaster implementation');
          raycaster = {
            setFromCamera: function(mouseVec: any, camera: any) {
              this.ray = this.ray || {};
              this.ray.origin = camera.position.clone();
              this.ray.direction = new (camera.constructor as any).Vector3(
                mouseVec.x, mouseVec.y, 0.5
              ).unproject(camera).sub(camera.position).normalize();
            },
            intersectObjects: function(objects: any[], recursive: boolean) {
              // Simplified intersection - would need full Three.js math
              return [];
            }
          };
        }
      }
    } catch (error) {
      console.error('Error creating raycaster:', error);
      return;
    }

    if (!raycaster) {
      console.error('Failed to create raycaster');
      return;
    }

    console.log('✓ Raycaster created successfully');
    
    // Now continue with the rest of the setup...
    // (object mapping, event handlers, etc.)
  };
  
  // Start the setup attempt
  attemptSetup();

