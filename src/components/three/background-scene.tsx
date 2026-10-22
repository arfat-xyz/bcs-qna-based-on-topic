import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RotateCcw, Play, Pause, Sparkles, Orbit, Compass } from 'lucide-react';
import { useTheme } from '../../lib/theme-context';

export function BackgroundScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isAutoOrbit, setIsAutoOrbit] = useState(true);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

  const resetCameraRef = useRef<(() => void) | null>(null);
  const toggleAutoOrbitRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect software or low-power WebGL
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

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 480;

    // Helper to calculate responsive camera distance based on aspect ratio
    const getResponsiveCamZ = (w: number, h: number) => {
      const aspect = w / h;
      if (aspect < 0.75) return 11.5; // Narrow mobile portrait
      if (aspect < 1.1) return 10.0;  // Tablets / square viewports
      return 8.5;                     // Desktop landscape
    };

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    const initialCamZ = getResponsiveCamZ(width, height);
    camera.position.set(0, 0, initialCamZ);

    let targetCamX = 0;
    let targetCamY = 0;
    let targetCamZ = initialCamZ;

    // 2. High-Performance Antialiased Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.appendChild(renderer.domElement);
    const canvas = renderer.domElement;
    // Allow vertical scrolling on mobile and tablet touchscreens without capturing page scroll
    canvas.style.touchAction = 'pan-y';

    // 3. Dynamic Lighting Setup
    const isDark = theme === 'dark';

    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 0.85 : 1.1);
    scene.add(ambientLight);

    // Primary Indigo key light
    const keyLight = new THREE.DirectionalLight(0x6366f1, isDark ? 3.2 : 2.4);
    keyLight.position.set(6, 6, 5);
    scene.add(keyLight);

    // Secondary Rose/Magenta fill light
    const fillLight = new THREE.DirectionalLight(0xec4899, isDark ? 2.6 : 1.8);
    fillLight.position.set(-6, -4, 4);
    scene.add(fillLight);

    // Cyan glowing point light inside the core
    const corePointLight = new THREE.PointLight(0x38bdf8, isDark ? 3.5 : 2.2, 14);
    corePointLight.position.set(0, 0, 0);
    scene.add(corePointLight);

    // Top rim light
    const rimLight = new THREE.DirectionalLight(0xa855f7, isDark ? 2.0 : 1.2);
    rimLight.position.set(0, 8, -4);
    scene.add(rimLight);

    // Master group for physics-driven rotation
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // 4. Materials Setup
    const disposables: { dispose: () => void }[] = [];

    // Central Translucent Crystal Core
    const coreGeo = new THREE.IcosahedronGeometry(1.25, 2);
    disposables.push(coreGeo);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0x818cf8 : 0x6366f1,
      emissive: isDark ? 0x312e81 : 0x1e1b4b,
      emissiveIntensity: isDark ? 0.25 : 0.1,
      metalness: 0.15,
      roughness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      transmission: 0.55,
      thickness: 1.2,
      transparent: true,
      opacity: 0.88,
    });
    disposables.push(coreMat);
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    masterGroup.add(coreMesh);

    // Inner Glowing Nucleus (rotates counter to core)
    const nucleusGeo = new THREE.DodecahedronGeometry(0.68, 0);
    disposables.push(nucleusGeo);
    const nucleusMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
      metalness: 0.7,
      roughness: 0.2,
    });
    disposables.push(nucleusMat);
    const nucleusMesh = new THREE.Mesh(nucleusGeo, nucleusMat);
    masterGroup.add(nucleusMesh);

    // Geodesic Wireframe Resonator Cage
    const cageGeo = new THREE.IcosahedronGeometry(1.5, 1);
    disposables.push(cageGeo);
    const cageMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0xc7d2fe : 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.35 : 0.25,
    });
    disposables.push(cageMat);
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    masterGroup.add(cageMesh);

    // 5. Gyroscopic Astrolabe Rings
    const ringsGroup = new THREE.Group();
    masterGroup.add(ringsGroup);

    const ring1Geo = new THREE.TorusGeometry(1.95, 0.024, 16, 80);
    const ring2Geo = new THREE.TorusGeometry(2.35, 0.02, 16, 80);
    const ring3Geo = new THREE.TorusGeometry(2.75, 0.018, 16, 80);
    disposables.push(ring1Geo, ring2Geo, ring3Geo);

    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      emissive: 0x4338ca,
      emissiveIntensity: 0.3,
      metalness: 0.8,
      roughness: 0.2,
    });
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
      metalness: 0.85,
      roughness: 0.15,
    });
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      emissive: 0xbe185d,
      emissiveIntensity: 0.3,
      metalness: 0.75,
      roughness: 0.25,
    });
    disposables.push(ring1Mat, ring2Mat, ring3Mat);

    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);

    ring1.rotation.x = Math.PI / 4;
    ring2.rotation.y = -Math.PI / 3;
    ring3.rotation.z = Math.PI / 6;

    ringsGroup.add(ring1);
    ringsGroup.add(ring2);
    ringsGroup.add(ring3);

    // Tiny orbiting photon beads on the rings
    const beadGeo = new THREE.SphereGeometry(0.065, 16, 16);
    disposables.push(beadGeo);
    const beadMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    disposables.push(beadMat);

    const bead1 = new THREE.Mesh(beadGeo, beadMat);
    const bead2 = new THREE.Mesh(beadGeo, beadMat);
    ring1.add(bead1);
    ring2.add(bead2);

    // 6. Interactive Orbiting Topic Satellites
    interface SatelliteItem {
      mesh: THREE.Mesh;
      label: string;
      radius: number;
      speed: number;
      inclination: number;
      angle: number;
      baseScale: number;
      targetScale: number;
      pulse: number;
    }

    const satellites: SatelliteItem[] = [];
    const satellitesGroup = new THREE.Group();
    masterGroup.add(satellitesGroup);

    const satelliteDefs = [
      {
        geo: new THREE.BoxGeometry(0.42, 0.42, 0.42),
        color: 0x38bdf8,
        label: 'Computer Science',
        radius: 2.85,
        speed: 0.65,
        inclination: 0.35,
      },
      {
        geo: new THREE.TorusGeometry(0.28, 0.09, 16, 32),
        color: 0xfbbf24,
        label: 'English Idioms',
        radius: 3.4,
        speed: -0.45,
        inclination: -0.55,
      },
      {
        geo: new THREE.OctahedronGeometry(0.38),
        color: 0xa855f7,
        label: 'Parts of Speech',
        radius: 2.5,
        speed: 0.85,
        inclination: 0.75,
      },
      {
        geo: new THREE.SphereGeometry(0.32, 24, 24),
        color: 0x34d399,
        label: 'The Solar System',
        radius: 3.75,
        speed: -0.55,
        inclination: -0.25,
      },
      {
        geo: new THREE.TetrahedronGeometry(0.38),
        color: 0xf43f5e,
        label: 'Grammar & Syntax',
        radius: 3.1,
        speed: 0.75,
        inclination: 1.1,
      },
    ];

    satelliteDefs.forEach((def) => {
      disposables.push(def.geo);
      const mat = new THREE.MeshStandardMaterial({
        color: def.color,
        emissive: def.color,
        emissiveIntensity: 0.2,
        metalness: 0.5,
        roughness: 0.25,
      });
      disposables.push(mat);

      const mesh = new THREE.Mesh(def.geo, mat);
      satellitesGroup.add(mesh);

      satellites.push({
        mesh,
        label: def.label,
        radius: def.radius,
        speed: def.speed,
        inclination: def.inclination,
        angle: Math.random() * Math.PI * 2,
        baseScale: 1.0,
        targetScale: 1.0,
        pulse: 0,
      });
    });

    // 7. Dynamic Neural Constellation (Particles & Adaptive Connecting Lines)
    const particleCount = isSoftwareGl ? 35 : 85;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities: THREE.Vector3[] = [];

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 2.5 + Math.random() * 3.5;

      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);

      particleVelocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.005,
          (Math.random() - 0.5) * 0.005,
          (Math.random() - 0.5) * 0.005
        )
      );
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    disposables.push(particleGeo);

    const particleMat = new THREE.PointsMaterial({
      color: isDark ? 0xc7d2fe : 0x6366f1,
      size: 0.065,
      transparent: true,
      opacity: isDark ? 0.75 : 0.6,
    });
    disposables.push(particleMat);

    const particlePoints = new THREE.Points(particleGeo, particleMat);
    masterGroup.add(particlePoints);

    // Dynamic neural lines linking neighboring particles
    const maxLines = 75;
    const linePositions = new Float32Array(maxLines * 6);
    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    disposables.push(lineGeo);

    const lineMat = new THREE.LineBasicMaterial({
      color: isDark ? 0x818cf8 : 0x6366f1,
      transparent: true,
      opacity: isDark ? 0.22 : 0.15,
    });
    disposables.push(lineMat);

    const neuralLines = new THREE.LineSegments(lineGeo, lineMat);
    masterGroup.add(neuralLines);

    // 8. Pointer Interaction & Raycaster
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let rotX = 0;
    let rotY = 0;

    const updatePointerCoords = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
    };

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      setHasInteracted(true);
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
      velocityX = 0;
      velocityY = 0;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
    };

    const handlePointerMove = (e: PointerEvent) => {
      updatePointerCoords(e.clientX, e.clientY);

      // Mouse Parallax for hero depth
      targetCamX = pointer.x * 0.75;
      targetCamY = pointer.y * 0.45;

      if (isDragging) {
        const deltaX = e.clientX - prevPointerX;
        const deltaY = e.clientY - prevPointerY;
        prevPointerX = e.clientX;
        prevPointerY = e.clientY;

        velocityX = deltaX * 0.005;
        velocityY = deltaY * 0.005;

        rotY += velocityX;
        rotX += velocityY;
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (isDragging) {
        isDragging = false;
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch (_) {}
        canvas.style.cursor = 'grab';
      }
    };

    const handlePointerClick = (e: MouseEvent) => {
      updatePointerCoords(e.clientX, e.clientY);
      raycaster.setFromCamera(pointer, camera);

      const targetMeshes = satellites.map((s) => s.mesh);
      targetMeshes.push(coreMesh);
      const intersects = raycaster.intersectObjects(targetMeshes);

      if (intersects.length > 0) {
        setHasInteracted(true);
        const hitMesh = intersects[0].object;

        satellites.forEach((sat) => {
          if (sat.mesh === hitMesh) {
            sat.pulse = 1.0;
            sat.targetScale = 1.5;
            setHoveredLabel(`${sat.label} • Discovered Module`);
            setTimeout(() => {
              sat.targetScale = 1.0;
            }, 350);
          }
        });

        if (hitMesh === coreMesh) {
          // Central Core clicked: pulse waves
          coreMat.emissiveIntensity = 0.8;
          setTimeout(() => {
            coreMat.emissiveIntensity = isDark ? 0.25 : 0.1;
          }, 300);
          setHoveredLabel('Cognition Knowledge Core • Interactive Engine');
        }
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setHasInteracted(true);
      targetCamZ += e.deltaY * 0.004;
      targetCamZ = Math.max(5.5, Math.min(11.5, targetCamZ));
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('click', handlePointerClick);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    // Reset Camera Function
    resetCameraRef.current = () => {
      targetCamX = 0;
      targetCamY = 0;
      targetCamZ = initialCamZ;
      rotX = 0;
      rotY = 0;
      velocityX = 0;
      velocityY = 0;
      setHoveredLabel(null);
    };

    // Auto-orbit toggle handler
    let autoOrbitActive = true;
    toggleAutoOrbitRef.current = () => {
      autoOrbitActive = !autoOrbitActive;
      setIsAutoOrbit(autoOrbitActive);
    };

    // 9. Main Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Camera Spring Damping (Parallax & Zoom)
      camera.position.x += (targetCamX - camera.position.x) * 0.04;
      camera.position.y += (targetCamY - camera.position.y) * 0.04;
      camera.position.z += (targetCamZ - camera.position.z) * 0.06;
      camera.lookAt(0, 0, 0);

      // Inertia & Damping
      if (!isDragging) {
        velocityX *= 0.94;
        velocityY *= 0.94;
        rotY += velocityX;
        rotX += velocityY;

        if (autoOrbitActive) {
          rotY += 0.0035;
        }
      }

      // Clamp vertical tilt
      rotX = Math.max(-0.6, Math.min(0.6, rotX));
      masterGroup.rotation.y = rotY;
      masterGroup.rotation.x = rotX;

      // Central core breathing & inner counter-rotation
      const breath = 1.0 + Math.sin(elapsed * 2.0) * 0.035;
      coreMesh.scale.set(breath, breath, breath);
      coreMesh.rotation.y += 0.006;
      coreMesh.rotation.x += 0.003;

      nucleusMesh.rotation.y -= 0.012;
      nucleusMesh.rotation.z += 0.008;

      cageMesh.rotation.y += 0.002;
      cageMesh.rotation.z -= 0.004;

      // Gyroscopic rings rotation
      ring1.rotation.z += 0.008;
      ring2.rotation.x -= 0.006;
      ring3.rotation.y += 0.007;

      // Move photon beads along rings
      bead1.position.x = 1.95 * Math.cos(elapsed * 1.5);
      bead1.position.y = 1.95 * Math.sin(elapsed * 1.5);

      bead2.position.x = 2.35 * Math.cos(-elapsed * 1.2);
      bead2.position.y = 2.35 * Math.sin(-elapsed * 1.2);

      // Raycaster for satellite hovering
      raycaster.setFromCamera(pointer, camera);
      const targetMeshes = satellites.map((s) => s.mesh);
      targetMeshes.push(coreMesh);
      const hoverIntersects = raycaster.intersectObjects(targetMeshes);

      let foundHover = false;
      if (hoverIntersects.length > 0 && !isDragging) {
        const hit = hoverIntersects[0].object;
        satellites.forEach((sat) => {
          if (sat.mesh === hit) {
            foundHover = true;
            sat.targetScale = 1.35;
            setHoveredLabel(sat.label);
            canvas.style.cursor = 'pointer';
          } else {
            sat.targetScale = 1.0;
          }
        });

        if (hit === coreMesh) {
          foundHover = true;
          canvas.style.cursor = 'pointer';
          setHoveredLabel('Knowledge Core • Click to Pulse');
        }
      } else {
        satellites.forEach((sat) => {
          sat.targetScale = 1.0;
        });
        if (!isDragging) {
          canvas.style.cursor = 'grab';
        }
      }

      if (!foundHover && !isDragging) {
        setHoveredLabel(null);
      }

      // Update Satellites Orbital Mechanics
      satellites.forEach((sat) => {
        sat.angle += sat.speed * delta * (autoOrbitActive ? 1 : 0.2);
        const r = sat.radius;
        const inc = sat.inclination;

        sat.mesh.position.x = r * Math.cos(sat.angle);
        sat.mesh.position.y = r * Math.sin(sat.angle) * Math.sin(inc);
        sat.mesh.position.z = r * Math.sin(sat.angle) * Math.cos(inc);

        sat.mesh.rotation.x += delta * 1.5;
        sat.mesh.rotation.y += delta * 2.0;

        // Smooth scale lerp for hover/click
        sat.baseScale += (sat.targetScale - sat.baseScale) * 0.12;
        const curScale = sat.baseScale + Math.sin(elapsed * 3.0 + sat.angle) * 0.05;
        sat.mesh.scale.set(curScale, curScale, curScale);
      });

      // Update Neural Constellation & Connecting Filaments
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      const posArray = posAttr.array as Float32Array;

      for (let i = 0; i < particleCount; i++) {
        const vel = particleVelocities[i];
        posArray[i * 3] += vel.x;
        posArray[i * 3 + 1] += vel.y;
        posArray[i * 3 + 2] += vel.z;

        // Bounce back if drifted too far
        const distSq =
          posArray[i * 3] ** 2 + posArray[i * 3 + 1] ** 2 + posArray[i * 3 + 2] ** 2;
        if (distSq > 36 || distSq < 4) {
          vel.negate();
        }
      }
      posAttr.needsUpdate = true;

      // Calculate connections for lines
      let lineIndex = 0;
      const linePosArray = lineGeo.attributes.position.array as Float32Array;
      const connectDistSq = 2.4 * 2.4;

      for (let i = 0; i < particleCount && lineIndex < maxLines * 6; i++) {
        const p1x = posArray[i * 3];
        const p1y = posArray[i * 3 + 1];
        const p1z = posArray[i * 3 + 2];

        for (let j = i + 1; j < particleCount && lineIndex < maxLines * 6; j++) {
          const dx = posArray[j * 3] - p1x;
          const dy = posArray[j * 3 + 1] - p1y;
          const dz = posArray[j * 3 + 2] - p1z;
          const dSq = dx * dx + dy * dy + dz * dz;

          if (dSq < connectDistSq) {
            linePosArray[lineIndex++] = p1x;
            linePosArray[lineIndex++] = p1y;
            linePosArray[lineIndex++] = p1z;
            linePosArray[lineIndex++] = posArray[j * 3];
            linePosArray[lineIndex++] = posArray[j * 3 + 1];
            linePosArray[lineIndex++] = posArray[j * 3 + 2];
          }
        }
      }

      // Zero out unused line segments
      while (lineIndex < maxLines * 6) {
        linePosArray[lineIndex++] = 0;
      }
      (lineGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    // 10. Resize Observer with Aspect Ratio Adjustment
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      targetCamZ = getResponsiveCamZ(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 11. Complete Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animId);

      canvas.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('click', handlePointerClick);
      canvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);

      disposables.forEach((item) => item.dispose());
      renderer.dispose();

      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
    };
  }, [theme]);

  return (
    <div className="relative w-full h-full min-h-[280px] sm:min-h-[360px] md:min-h-[420px] lg:min-h-[480px] flex items-center justify-center">
      {/* 3D Canvas Mount Point */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab select-none"
        aria-label="Interactive 3D Holographic Knowledge Core. Orbit, drag, and click satellite topic nodes to inspect."
      />

      {/* Floating Interactive HUD Overlay */}
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 pointer-events-none flex flex-col gap-1.5 max-w-[85%]">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-neutral-800 dark:text-neutral-200 tracking-tight">
            Knowledge Core 3D
          </span>
        </div>

        {hoveredLabel && (
          <div className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-xl bg-indigo-600 text-white text-[10px] sm:text-[11px] font-semibold tracking-wide shadow-md shadow-indigo-600/30 truncate">
            {hoveredLabel}
          </div>
        )}
      </div>

      {/* Floating Controls Bar at Bottom */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-neutral-200/80 dark:border-neutral-800 shadow-md text-[10px] sm:text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 pointer-events-auto max-w-[92%] whitespace-nowrap">
        {/* <span className="flex items-center gap-1.5 pr-1.5 border-r border-neutral-200 dark:border-neutral-800">
          <Orbit className="w-3.5 h-3.5 text-indigo-500 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="hidden sm:inline">Drag to orbit</span>
          <span className="sm:hidden">3D Core</span>
        </span> */}

        {/* Toggle Auto-Orbit */}
        {/* <button
          type="button"
          onClick={() => toggleAutoOrbitRef.current?.()}
          className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors cursor-pointer"
          title={isAutoOrbit ? 'Pause auto-orbit' : 'Resume auto-orbit'}
        >
          {isAutoOrbit ? <Pause className="w-3 h-3 text-indigo-500" /> : <Play className="w-3 h-3 text-indigo-500" />}
          <span>{isAutoOrbit ? 'Pause' : 'Play'}</span>
        </button> */}

        {/* Reset Camera View */}
        {/* {hasInteracted && (
          <button
            type="button"
            onClick={() => resetCameraRef.current?.()}
            className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 text-[10px] font-bold transition-colors cursor-pointer border border-neutral-200 dark:border-neutral-700"
            title="Reset scene camera angle"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset</span>
          </button>
        )} */}
      </div>
    </div>
  );
}