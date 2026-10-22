import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../lib/theme-context';

interface TopicVisualProps {
  slug: string;
  heading: string;
}

export function TopicVisual({ slug, heading }: TopicVisualProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 220;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const canvas = renderer.domElement;
    canvas.style.touchAction = 'none';

    // Light
    const ambientLight = new THREE.AmbientLight(0xffffff, theme === 'dark' ? 0.9 : 1.1);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x6366f1, 2.5);
    keyLight.position.set(4, 4, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xec4899, 1.8);
    fillLight.position.set(-4, -2, 2);
    scene.add(fillLight);

    const group = new THREE.Group();
    scene.add(group);

    const isDark = theme === 'dark';
    const primaryColor = isDark ? 0x818cf8 : 0x4f46e5;
    const secondaryColor = isDark ? 0xf472b6 : 0xdb2777;
    const accentColor = 0x38bdf8;

    const pMat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      roughness: 0.2,
      metalness: 0.3,
      emissive: primaryColor,
      emissiveIntensity: 0.08,
    });

    const sMat = new THREE.MeshStandardMaterial({
      color: secondaryColor,
      roughness: 0.25,
      metalness: 0.2,
      emissive: secondaryColor,
      emissiveIntensity: 0.08,
    });

    const wireMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0xa5b4fc : 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });

    const disposableGeos: THREE.BufferGeometry[] = [];
    const disposableMats: THREE.Material[] = [pMat, sMat, wireMat];

    // Interactive tracking for raycasting & hover/click
    interface InteractiveMesh extends THREE.Mesh {
      userData: {
        baseScale: number;
        targetScale: number;
        spinSpeed: number;
        isHovered: boolean;
      };
    }

    const interactiveItems: InteractiveMesh[] = [];

    const addInteractive = (mesh: THREE.Mesh, baseScale = 1.0) => {
      const im = mesh as InteractiveMesh;
      im.userData = {
        baseScale,
        targetScale: baseScale,
        spinSpeed: 0,
        isHovered: false,
      };
      interactiveItems.push(im);
      return im;
    };

    const lowerSlug = (slug + ' ' + heading).toLowerCase();

    if (lowerSlug.includes('idiom')) {
      // Idioms: Playful linked rings & curved toruses
      const torus1Geo = new THREE.TorusGeometry(1.1, 0.25, 24, 60);
      const torus2Geo = new THREE.TorusGeometry(0.7, 0.18, 24, 48);
      disposableGeos.push(torus1Geo, torus2Geo);

      const m1 = addInteractive(new THREE.Mesh(torus1Geo, pMat), 1.0);
      const m2 = addInteractive(new THREE.Mesh(torus2Geo, sMat), 1.0);
      m2.rotation.x = Math.PI / 2;
      group.add(m1, m2);
    } else if (
      lowerSlug.includes('solar') ||
      lowerSlug.includes('science') ||
      lowerSlug.includes('space')
    ) {
      // Science / Solar: Planetary orb with orbital ring and moons
      const planetGeo = new THREE.SphereGeometry(0.85, 32, 32);
      const ringGeo = new THREE.RingGeometry(1.3, 1.7, 48);
      const moonGeo = new THREE.SphereGeometry(0.2, 16, 16);
      disposableGeos.push(planetGeo, ringGeo, moonGeo);

      const planet = addInteractive(new THREE.Mesh(planetGeo, pMat), 1.0);
      const ringMat = new THREE.MeshStandardMaterial({
        color: secondaryColor,
        side: THREE.DoubleSide,
        roughness: 0.3,
        emissive: secondaryColor,
        emissiveIntensity: 0.08,
      });
      disposableMats.push(ringMat);
      const ring = addInteractive(new THREE.Mesh(ringGeo, ringMat), 1.0);
      ring.rotation.x = Math.PI / 2.5;

      const moon = addInteractive(new THREE.Mesh(moonGeo, sMat), 1.0);
      moon.position.set(1.9, 0.4, 0);

      group.add(planet, ring, moon);
    } else if (
      lowerSlug.includes('computer') ||
      lowerSlug.includes('network') ||
      lowerSlug.includes('code')
    ) {
      // Computing: Network node matrix of cubes and wireframe lattice
      const boxGeo = new THREE.BoxGeometry(0.65, 0.65, 0.65);
      const wireCageGeo = new THREE.IcosahedronGeometry(1.6, 1);
      disposableGeos.push(boxGeo, wireCageGeo);

      const centerBox = addInteractive(new THREE.Mesh(boxGeo, pMat), 1.0);
      const cage = addInteractive(new THREE.Mesh(wireCageGeo, wireMat), 1.0);

      const satelliteBox1 = addInteractive(
        new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), sMat),
        1.0
      );
      satelliteBox1.position.set(1.4, 0.8, -0.4);

      const satelliteBox2 = addInteractive(
        new THREE.Mesh(
          new THREE.BoxGeometry(0.35, 0.35, 0.35),
          new THREE.MeshStandardMaterial({
            color: accentColor,
            roughness: 0.2,
            emissive: accentColor,
            emissiveIntensity: 0.08,
          })
        ),
        1.0
      );
      satelliteBox2.position.set(-1.3, -0.7, 0.5);

      group.add(centerBox, cage, satelliteBox1, satelliteBox2);
    } else {
      // Grammar / Vocabulary / General: Elegant interlocking geometric crystals
      const prismGeo = new THREE.OctahedronGeometry(1.2, 0);
      const cageGeo = new THREE.DodecahedronGeometry(1.7, 0);
      disposableGeos.push(prismGeo, cageGeo);

      const prism = addInteractive(new THREE.Mesh(prismGeo, pMat), 1.0);
      const outerCage = addInteractive(new THREE.Mesh(cageGeo, wireMat), 1.0);

      const smallSphere = addInteractive(
        new THREE.Mesh(new THREE.SphereGeometry(0.35, 24, 24), sMat),
        1.0
      );
      smallSphere.position.set(1.6, 0.5, 0.4);

      group.add(prism, outerCage, smallSphere);
    }

    // -------------------------------------------------------------
    // CURSOR POINTER INTERACTION (DRAG ROTATE, RAYCAST HOVER & CLICK)
    // -------------------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    let isDragging = false;
    let prevX = 0;
    let prevY = 0;
    let velX = 0;
    let velY = 0;
    let rotX = 0;
    let rotY = 0;
    let hovered: InteractiveMesh | null = null;

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
    };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
      velX = 0;
      velY = 0;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
    };

    const onPointerMove = (e: PointerEvent) => {
      updatePointer(e.clientX, e.clientY);

      if (isDragging) {
        const deltaX = e.clientX - prevX;
        const deltaY = e.clientY - prevY;
        prevX = e.clientX;
        prevY = e.clientY;

        velX = deltaX * 0.007;
        velY = deltaY * 0.007;

        rotY += velX;
        rotX += velY;
      } else {
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(interactiveItems, false);

        if (intersects.length > 0) {
          const hit = intersects[0].object as InteractiveMesh;
          if (hovered !== hit) {
            if (hovered) {
              hovered.userData.targetScale = hovered.userData.baseScale;
              hovered.userData.isHovered = false;
            }
            hovered = hit;
            hovered.userData.targetScale = hovered.userData.baseScale * 1.25;
            hovered.userData.isHovered = true;
            canvas.style.cursor = 'pointer';
          }
        } else {
          if (hovered) {
            hovered.userData.targetScale = hovered.userData.baseScale;
            hovered.userData.isHovered = false;
            hovered = null;
          }
          canvas.style.cursor = isDragging ? 'grabbing' : 'grab';
        }
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (isDragging) {
        isDragging = false;
        try {
          canvas.releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
        canvas.style.cursor = hovered ? 'pointer' : 'grab';
      }
    };

    const onClick = (e: MouseEvent) => {
      updatePointer(e.clientX, e.clientY);
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(interactiveItems, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object as InteractiveMesh;
        hit.userData.spinSpeed += 8.0;
        hit.scale.multiplyScalar(1.3);
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('click', onClick);

    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (!isDragging) {
        velX *= 0.94;
        velY *= 0.94;
        rotY += velX + delta * 0.3; // gentle ambient turn
        rotX += velY;
      }

      rotX = THREE.MathUtils.clamp(rotX, -Math.PI / 2.2, Math.PI / 2.2);

      group.rotation.x = THREE.MathUtils.damp(group.rotation.x, rotX, 10, delta);
      group.rotation.y = THREE.MathUtils.damp(group.rotation.y, rotY, 10, delta);

      interactiveItems.forEach((item) => {
        // Damp scale
        const currentScale = item.scale.x;
        const nextScale = THREE.MathUtils.damp(currentScale, item.userData.targetScale, 12, delta);
        item.scale.set(nextScale, nextScale, nextScale);

        // Spin burst on click
        if (item.userData.spinSpeed > 0.01) {
          item.rotation.y += item.userData.spinSpeed * delta;
          item.rotation.x += item.userData.spinSpeed * delta * 0.5;
          item.userData.spinSpeed *= 0.92;
        }

        // Emissive hover glow
        if (item.material && 'emissiveIntensity' in item.material) {
          const mat = item.material as THREE.MeshStandardMaterial;
          const targetGlow = item.userData.isHovered ? 0.5 : 0.08;
          mat.emissiveIntensity = THREE.MathUtils.damp(mat.emissiveIntensity, targetGlow, 10, delta);
        }
      });

      renderer.render(scene, camera);
    };

    animate();

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

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);

      disposableGeos.forEach((g) => g.dispose());
      disposableMats.forEach((m) => m.dispose());
      renderer.dispose();
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
    };
  }, [slug, heading, theme]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[190px] max-h-[260px] pointer-events-auto cursor-grab active:cursor-grabbing select-none"
      title="Click and drag to rotate 3D topic model, click shapes to spin"
    />
  );
}
