import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCcw, Move, Sparkles } from 'lucide-react';
import { useTheme } from '../../lib/theme-context';

export function BackgroundScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [hasInteracted, setHasInteracted] = useState(false);
  const resetCameraRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software WebGL
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    const initialCamZ = 7.5;
    camera.position.set(0, 0, initialCamZ);

    let targetCamZ = initialCamZ;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.appendChild(renderer.domElement);
    const canvas = renderer.domElement;
    canvas.style.touchAction = 'none'; // Allow touch drag without browser scroll conflict

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, theme === 'dark' ? 0.8 : 1.0);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x6366f1, theme === 'dark' ? 3.0 : 2.5); // Indigo
    dirLight1.position.set(5, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xec4899, theme === 'dark' ? 2.5 : 2.0); // Pink/Rose
    dirLight2.position.set(-5, -4, 3);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x38bdf8, 3.0, 15); // Cyan
    pointLight.position.set(0, 2, 2);
    scene.add(pointLight);

    // Master Group for drag rotation
    const group = new THREE.Group();
    scene.add(group);

    // Materials
    const isDark = theme === 'dark';
    const mainMat = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0x818cf8 : 0x6366f1,
      emissive: isDark ? 0x312e81 : 0x1e1b4b,
      emissiveIntensity: 0.1,
      metalness: 0.25,
      roughness: 0.15,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: 0.95,
    });

    const accentMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0xf472b6 : 0xec4899,
      emissive: 0x831843,
      emissiveIntensity: 0.1,
      metalness: 0.35,
      roughness: 0.2,
    });

    const wireMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0xa5b4fc : 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0x78350f,
      emissiveIntensity: 0.1,
      metalness: 0.85,
      roughness: 0.15,
    });

    const cyanMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0c4a6e,
      emissiveIntensity: 0.1,
      metalness: 0.4,
      roughness: 0.2,
    });

    // Interactive object tracking
    interface InteractiveMesh extends THREE.Mesh {
      userData: {
        baseScale: number;
        targetScale: number;
        spinVelocity: { x: number; y: number; z: number };
        isHovered: boolean;
      };
    }

    const interactiveMeshes: InteractiveMesh[] = [];

    const registerInteractive = (mesh: THREE.Mesh, baseScale = 1.0) => {
      const im = mesh as InteractiveMesh;
      im.userData = {
        baseScale,
        targetScale: baseScale,
        spinVelocity: { x: 0, y: 0, z: 0 },
        isHovered: false,
      };
      interactiveMeshes.push(im);
      return im;
    };

    // 1. Central Torus Knot
    const torusKnotGeo = new THREE.TorusKnotGeometry(1.2, 0.35, 120, 16);
    const torusKnot = registerInteractive(new THREE.Mesh(torusKnotGeo, mainMat), 1.0);
    group.add(torusKnot);

    // 2. Wireframe Cage
    const cageGeo = new THREE.IcosahedronGeometry(2.3, 1);
    const cage = registerInteractive(new THREE.Mesh(cageGeo, wireMat), 1.0);
    group.add(cage);

    // 3. Floating satellite shapes
    const satelliteGroup = new THREE.Group();
    group.add(satelliteGroup);

    // Octahedron
    const octGeo = new THREE.OctahedronGeometry(0.55);
    const octahedron = registerInteractive(new THREE.Mesh(octGeo, accentMat), 1.0);
    octahedron.position.set(2.8, 1.2, -0.5);
    satelliteGroup.add(octahedron);

    // Gold Sphere
    const sphereGeo = new THREE.SphereGeometry(0.38, 32, 32);
    const sphere = registerInteractive(new THREE.Mesh(sphereGeo, goldMat), 1.0);
    sphere.position.set(-2.6, 1.4, 0.5);
    satelliteGroup.add(sphere);

    // Torus Ring
    const ringGeo = new THREE.TorusGeometry(0.68, 0.12, 16, 48);
    const ring = registerInteractive(new THREE.Mesh(ringGeo, cyanMat), 1.0);
    ring.position.set(-2.2, -1.6, -0.8);
    ring.rotation.x = Math.PI / 3;
    satelliteGroup.add(ring);

    // Dodecahedron
    const dodecaGeo = new THREE.DodecahedronGeometry(0.48);
    const dodeca = registerInteractive(new THREE.Mesh(dodecaGeo, accentMat), 1.0);
    dodeca.position.set(2.4, -1.5, 0.3);
    satelliteGroup.add(dodeca);

    // Particles
    const particleCount = isSoftwareGl ? 30 : 80;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 11;
      positions[i + 1] = (Math.random() - 0.5) * 9;
      positions[i + 2] = (Math.random() - 0.5) * 7;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: isDark ? 0xc7d2fe : 0x6366f1,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    group.add(particles);

    // -------------------------------------------------------------
    // CURSOR & POINTER INTERACTION ENGINE (DRAG, HOVER, CLICK, ZOOM)
    // -------------------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    // Track dragging and rotation physics
    let isDragging = false;
    let previousPointerX = 0;
    let previousPointerY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let rotationX = 0;
    let rotationY = 0;

    let hoveredMesh: InteractiveMesh | null = null;

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
    };

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      setHasInteracted(true);
      previousPointerX = e.clientX;
      previousPointerY = e.clientY;
      velocityX = 0;
      velocityY = 0;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
    };

    const handlePointerMove = (e: PointerEvent) => {
      updatePointer(e.clientX, e.clientY);

      if (isDragging) {
        const deltaX = e.clientX - previousPointerX;
        const deltaY = e.clientY - previousPointerY;
        previousPointerX = e.clientX;
        previousPointerY = e.clientY;

        velocityX = deltaX * 0.005;
        velocityY = deltaY * 0.005;

        rotationY += velocityX;
        rotationX += velocityY;
      } else {
        // Raycasting for hover reaction
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(interactiveMeshes, false);

        if (intersects.length > 0) {
          const hit = intersects[0].object as InteractiveMesh;
          if (hoveredMesh !== hit) {
            if (hoveredMesh) {
              hoveredMesh.userData.targetScale = hoveredMesh.userData.baseScale;
              hoveredMesh.userData.isHovered = false;
            }
            hoveredMesh = hit;
            hoveredMesh.userData.targetScale = hoveredMesh.userData.baseScale * 1.25;
            hoveredMesh.userData.isHovered = true;
            canvas.style.cursor = 'pointer';
          }
        } else {
          if (hoveredMesh) {
            hoveredMesh.userData.targetScale = hoveredMesh.userData.baseScale;
            hoveredMesh.userData.isHovered = false;
            hoveredMesh = null;
          }
          canvas.style.cursor = isDragging ? 'grabbing' : 'grab';
        }
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isDragging) {
        isDragging = false;
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch {
          // ignore if already released
        }
        canvas.style.cursor = hoveredMesh ? 'pointer' : 'grab';
      }
    };

    const handleClick = (e: MouseEvent) => {
      updatePointer(e.clientX, e.clientY);
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(interactiveMeshes, false);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as InteractiveMesh;
        // Spin impulse burst!
        clickedMesh.userData.spinVelocity.x += (Math.random() - 0.5) * 8;
        clickedMesh.userData.spinVelocity.y += (Math.random() * 6 + 4);
        clickedMesh.userData.spinVelocity.z += (Math.random() - 0.5) * 8;

        // Temporary pop scale
        clickedMesh.scale.multiplyScalar(1.35);
        setHasInteracted(true);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setHasInteracted(true);
      // Zoom clamp
      targetCamZ = THREE.MathUtils.clamp(targetCamZ + e.deltaY * 0.005, 4.5, 11.0);
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    // Reset view method
    resetCameraRef.current = () => {
      targetCamZ = initialCamZ;
      rotationX = 0;
      rotationY = 0;
      velocityX = 0;
      velocityY = 0;
      setHasInteracted(false);
    };

    // Resize Handler
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', onResize);

    // Animation Loop
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Camera zoom smooth damp
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 8, delta);

      // Inertia on drag rotation
      if (!isDragging) {
        velocityX *= 0.94;
        velocityY *= 0.94;
        rotationY += velocityX;
        rotationX += velocityY;

        // Gentle continuous ambient drift
        rotationY += delta * 0.25;
      }

      // Clamp vertical tilt to avoid flipping upside down
      rotationX = THREE.MathUtils.clamp(rotationX, -Math.PI / 2.5, Math.PI / 2.5);

      group.rotation.x = THREE.MathUtils.damp(group.rotation.x, rotationX, 10, delta);
      group.rotation.y = THREE.MathUtils.damp(group.rotation.y, rotationY, 10, delta);

      // Object internal rotations & spin impulse decay
      torusKnot.rotation.x += delta * 0.35 + torusKnot.userData.spinVelocity.x * delta;
      torusKnot.rotation.y += delta * 0.45 + torusKnot.userData.spinVelocity.y * delta;

      cage.rotation.x -= delta * 0.15;
      cage.rotation.y -= delta * 0.2;

      octahedron.rotation.x += delta * 0.8 + octahedron.userData.spinVelocity.x * delta;
      octahedron.rotation.y += delta * 0.5 + octahedron.userData.spinVelocity.y * delta;

      sphere.rotation.y += delta * 1.0 + sphere.userData.spinVelocity.y * delta;
      ring.rotation.z += delta * 0.6 + ring.userData.spinVelocity.z * delta;
      dodeca.rotation.y += delta * 0.7 + dodeca.userData.spinVelocity.y * delta;

      satelliteGroup.rotation.y += delta * 0.2;
      particles.rotation.y += delta * 0.08;

      // Update interactive meshes scale and dampen spin impulses
      interactiveMeshes.forEach((mesh) => {
        // Damp scale
        const currentScale = mesh.scale.x;
        const nextScale = THREE.MathUtils.damp(currentScale, mesh.userData.targetScale, 10, delta);
        mesh.scale.set(nextScale, nextScale, nextScale);

        // Damp clicked spin impulses
        mesh.userData.spinVelocity.x *= 0.93;
        mesh.userData.spinVelocity.y *= 0.93;
        mesh.userData.spinVelocity.z *= 0.93;

        // Emissive hover boost
        if (mesh.material && 'emissiveIntensity' in mesh.material) {
          const targetEmissive = mesh.userData.isHovered ? 0.45 : 0.1;
          const mat = mesh.material as THREE.MeshStandardMaterial;
          mat.emissiveIntensity = THREE.MathUtils.damp(mat.emissiveIntensity, targetEmissive, 10, delta);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);

      torusKnotGeo.dispose();
      cageGeo.dispose();
      octGeo.dispose();
      sphereGeo.dispose();
      ringGeo.dispose();
      dodecaGeo.dispose();
      particleGeo.dispose();

      mainMat.dispose();
      accentMat.dispose();
      wireMat.dispose();
      goldMat.dispose();
      cyanMat.dispose();
      particleMat.dispose();

      renderer.dispose();
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
    };
  }, [theme]);

  return (
    <div className="relative w-full h-full min-h-[360px] md:min-h-[440px]">
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        aria-label="Interactive 3D geometry scene. Click and drag to orbit, hover or click shapes, scroll to zoom."
      />

      {/* Floating Interactive Badge & Controls */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 shadow-sm text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 pointer-events-auto">
        <span className="flex items-center gap-1.5">
          <Move className="w-3.5 h-3.5 text-indigo-500" />
          <span>Drag to orbit • Click shapes • Scroll zoom</span>
        </span>

        {hasInteracted && (
          <button
            type="button"
            onClick={() => resetCameraRef.current?.()}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-[10px] font-bold transition-colors cursor-pointer border border-neutral-200 dark:border-neutral-700"
            title="Reset scene camera"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
