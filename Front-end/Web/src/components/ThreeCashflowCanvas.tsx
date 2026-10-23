import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeCashflowCanvasProps {
  className?: string;
}

export const ThreeCashflowCanvas: React.FC<ThreeCashflowCanvasProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 400;
    let height = container.clientHeight || 450;

    // --- 1. Scene & Camera ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    // Elevated angle to see both top disc and 3D extruded side
    camera.position.set(0, 2.6, 5.2);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // --- 2. Studio Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const dirLightLime = new THREE.DirectionalLight(0xd0f81b, 2.8);
    dirLightLime.position.set(5, 7, 6);
    scene.add(dirLightLime);

    const dirLightPink = new THREE.DirectionalLight(0xff4783, 2.2);
    dirLightPink.position.set(-5, -3, 4);
    scene.add(dirLightPink);

    const centerGlow = new THREE.PointLight(0xd0f81b, 2.2, 7);
    centerGlow.position.set(0, 0, 1.5);
    scene.add(centerGlow);

    // --- 3. Interactive Chart Group (Pivot) ---
    const chartPivot = new THREE.Group();
    // Tilt the donut forward so the user sees the 3D depth and central core clearly
    chartPivot.rotation.x = -Math.PI / 3.8;
    scene.add(chartPivot);

    // Helper: Create 2D Donut Slice Shape around origin (0, 0)
    const createDonutSliceShape = (innerR: number, outerR: number, startA: number, endA: number) => {
      const shape = new THREE.Shape();
      shape.absarc(0, 0, outerR, startA, endA, false);
      shape.absarc(0, 0, innerR, endA, startA, true);
      return shape;
    };

    const depth = 0.44;
    const extrudeSettings = {
      depth,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.04,
      bevelThickness: 0.04,
      curveSegments: 64,
    };

    const innerRadius = 1.08;
    const outerRadius = 1.95;

    // --- 4. Donut Slice: Tiền Vào (Doanh thu ~76%) ---
    const thuPercent = 0.76;
    const thuStartAngle = 0;
    const thuEndAngle = Math.PI * 2 * thuPercent;

    const thuShape = createDonutSliceShape(innerRadius, outerRadius, thuStartAngle, thuEndAngle);
    const thuGeo = new THREE.ExtrudeGeometry(thuShape, extrudeSettings);
    // DO NOT call thuGeo.center() so it maintains natural center at (0, 0, 0)

    const thuMat = new THREE.MeshPhysicalMaterial({
      color: 0xd0f81b,
      emissive: 0x84cc16,
      emissiveIntensity: 0.35,
      roughness: 0.15,
      metalness: 0.25,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
    });
    const thuMesh = new THREE.Mesh(thuGeo, thuMat);
    thuMesh.position.z = -depth / 2;
    chartPivot.add(thuMesh);

    // --- 5. Donut Slice: Tiền Ra (Chi phí ~24%) ---
    const chiStartAngle = thuEndAngle + 0.06; // Elegant slice gap
    const chiEndAngle = Math.PI * 2 - 0.06;

    const chiShape = createDonutSliceShape(innerRadius, outerRadius, chiStartAngle, chiEndAngle);
    const chiGeo = new THREE.ExtrudeGeometry(chiShape, extrudeSettings);
    // DO NOT call chiGeo.center()

    const chiMat = new THREE.MeshPhysicalMaterial({
      color: 0xff4783,
      emissive: 0xbe185d,
      emissiveIntensity: 0.3,
      roughness: 0.2,
      metalness: 0.2,
      clearcoat: 0.9,
      clearcoatRoughness: 0.15,
    });
    const chiMesh = new THREE.Mesh(chiGeo, chiMat);

    // Explode the Chi slice radially outward along its bisector angle without touching the center hole
    const chiMidAngle = (chiStartAngle + chiEndAngle) / 2;
    const explodeDist = 0.15;
    chiMesh.position.set(
      Math.cos(chiMidAngle) * explodeDist,
      Math.sin(chiMidAngle) * explodeDist,
      -depth / 2
    );
    chartPivot.add(chiMesh);

    // --- 6. Center Core Cylinder (Lõi Lãi Ròng Phát Sáng) ---
    const coreRadius = innerRadius * 0.92;
    const coreGeo = new THREE.CylinderGeometry(coreRadius, coreRadius, depth * 1.05, 48);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x090d16,
      emissive: 0x0f172a,
      emissiveIntensity: 0.5,
      roughness: 0.25,
      metalness: 0.85,
      clearcoat: 0.8,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.rotation.x = Math.PI / 2;
    chartPivot.add(coreMesh);

    // Core Rim Ring Accent
    const rimGeo = new THREE.RingGeometry(coreRadius - 0.04, coreRadius, 48);
    const rimMat = new THREE.MeshBasicMaterial({
      color: 0xd0f81b,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.z = depth / 2 + 0.01;
    chartPivot.add(rimMesh);

    // --- 7. Center Core Badge (LÃI RÒNG +76%) ---
    const coreCanvas = document.createElement('canvas');
    coreCanvas.width = 256;
    coreCanvas.height = 256;
    const coreCtx = coreCanvas.getContext('2d');
    if (coreCtx) {
      coreCtx.fillStyle = '#090d16';
      coreCtx.beginPath();
      coreCtx.arc(128, 128, 120, 0, Math.PI * 2);
      coreCtx.fill();

      coreCtx.fillStyle = '#94a3b8';
      coreCtx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      coreCtx.textAlign = 'center';
      coreCtx.fillText('LÃI RÒNG', 128, 85);

      coreCtx.fillStyle = '#d0f81b';
      coreCtx.font = '900 60px system-ui, -apple-system, sans-serif';
      coreCtx.fillText('+76%', 128, 150);

      coreCtx.fillStyle = '#34d399';
      coreCtx.font = 'bold 20px system-ui, -apple-system, sans-serif';
      coreCtx.fillText('● An Toàn', 128, 195);
    }
    const coreTex = new THREE.CanvasTexture(coreCanvas);
    const coreBadgeGeo = new THREE.PlaneGeometry(coreRadius * 1.6, coreRadius * 1.6);
    const coreBadgeMat = new THREE.MeshBasicMaterial({ map: coreTex, transparent: true });
    const coreBadge = new THREE.Mesh(coreBadgeGeo, coreBadgeMat);
    coreBadge.position.z = depth / 2 + 0.02;
    chartPivot.add(coreBadge);

    // --- 8. Floating Sparkle Particles ---
    const pCount = 50;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 5.0;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 3.5;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 2.0;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xd0f81b,
      size: 0.035,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const ambientParticles = new THREE.Points(pGeo, pMat);
    scene.add(ambientParticles);

    // --- 9. Mouse Interaction & Drag Parallax ---
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;
    let previousPointerX = 0;
    let manualRotZ = 0;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDragging = true;
      previousPointerX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      targetX = ((clientX - rect.left) / rect.width) * 2 - 1;
      targetY = -(((clientY - rect.top) / rect.height) * 2 - 1);

      if (isDragging) {
        const deltaX = clientX - previousPointerX;
        manualRotZ -= deltaX * 0.008;
        previousPointerX = clientX;
      }
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onPointerDown);
    container.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);

    // --- 10. Animation Loop ---
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Mouse lerp
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      // Gentle continuous auto-spin when not dragging
      if (!isDragging) {
        manualRotZ -= 0.0035;
      }

      chartPivot.rotation.z = manualRotZ;

      // Subtle tilt responsive to cursor
      chartPivot.rotation.x = -Math.PI / 3.8 + currentY * 0.12;
      chartPivot.rotation.y = currentX * 0.15;

      // Subtle floating breathing effect
      chartPivot.position.y = Math.sin(elapsedTime * 1.5) * 0.05;

      // Particle drift
      ambientParticles.rotation.y = elapsedTime * 0.025;

      renderer.render(scene, camera);
    };

    animate();

    // --- 11. Responsive Resize ---
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 400;
      height = container.clientHeight || 450;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onPointerDown);
      container.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full min-h-[460px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none overflow-hidden ${className}`}
    >
      {/* Top Left Badge: Tiền Vào (Doanh thu) */}
      <div className="absolute top-4 left-4 z-20 px-3.5 py-2.5 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-[#d0f81b]/50 shadow-xl text-left pointer-events-none">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
          TIỀN VÀO (DOANH THU)
        </span>
        <div className="text-base sm:text-lg font-black text-[#d0f81b] tracking-tight">
          +18.500.000 đ
        </div>
        <span className="text-[10px] text-slate-300 font-semibold">
          Chiếm 76% dòng tiền
        </span>
      </div>

      {/* Top Right Badge: Tiền Ra (Chi phí) */}
      <div className="absolute top-4 right-4 z-20 px-3.5 py-2.5 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-[#ff4783]/50 shadow-xl text-right pointer-events-none">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
          TIỀN RA (CHI PHÍ)
        </span>
        <div className="text-base sm:text-lg font-black text-[#ff4783] tracking-tight">
          -4.200.000 đ
        </div>
        <span className="text-[10px] text-slate-300 font-semibold">
          Chiếm 24% dòng tiền
        </span>
      </div>

      {/* Bottom Center Badge: Tiền Lời Ròng */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-2xl bg-slate-950/95 backdrop-blur-md border border-emerald-500/40 shadow-2xl flex items-center gap-2.5 whitespace-nowrap pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <div className="text-xs text-white">
          <span className="text-slate-300">Tiền lời ròng: </span>
          <strong className="text-emerald-400 font-black">+14.300.000 đ</strong>
          <span className="text-slate-400 text-[11px] ml-1.5">(Tỷ suất 76% an toàn)</span>
        </div>
      </div>
    </div>
  );
};
