import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const ThreeHeroCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // --- 1. SCENE, CAMERA, RENDERER ---
    const scene = new THREE.Scene();

    const width = container.clientWidth || 560;
    const height = container.clientHeight || 480;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // --- 2. LIGHTING SETUP ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    // Primary Neon Lime Key Light
    const limeLight = new THREE.DirectionalLight(0xd0f81b, 3.5);
    limeLight.position.set(4, 5, 4);
    scene.add(limeLight);

    // Secondary Neon Pink Rim Light
    const pinkLight = new THREE.PointLight(0xff4783, 4.5, 15);
    pinkLight.position.set(-4, -2.5, 3);
    scene.add(pinkLight);

    // Soft Top Fill Light
    const topLight = new THREE.DirectionalLight(0xffffff, 1.5);
    topLight.position.set(0, 6, 2);
    scene.add(topLight);

    // Moving Specular Light (follows mouse)
    const mouseLight = new THREE.PointLight(0xd0f81b, 2.5, 8);
    mouseLight.position.set(0, 0, 4);
    scene.add(mouseLight);

    // --- 3. DYNAMIC CARD TEXTURE CREATION (High Res & Big Crisp Numbers) ---
    const cardCanvas = document.createElement('canvas');
    cardCanvas.width = 1280;
    cardCanvas.height = 800;
    const ctx = cardCanvas.getContext('2d');

    if (ctx) {
      // Background dark obsidian gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 1280, 800);
      bgGrad.addColorStop(0, '#0a0d14');
      bgGrad.addColorStop(0.5, '#111827');
      bgGrad.addColorStop(1, '#07090e');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1280, 800);

      // Subtle holographic diagonal shine pattern
      ctx.save();
      ctx.strokeStyle = 'rgba(208, 248, 27, 0.08)';
      ctx.lineWidth = 2;
      for (let i = -600; i < 2000; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 500, 800);
        ctx.stroke();
      }
      ctx.restore();

      // Curved glow gradient banner at bottom
      const glowGrad = ctx.createRadialGradient(1050, 650, 20, 1050, 650, 500);
      glowGrad.addColorStop(0, 'rgba(255, 71, 131, 0.35)');
      glowGrad.addColorStop(0.5, 'rgba(208, 248, 27, 0.15)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, 1280, 800);

      const px = 90;

      // Top VikeSo Logo & Badge
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 76px system-ui, -apple-system, sans-serif';
      ctx.fillText('VikeSo', px, 130);

      // Lime Dot on Logo
      ctx.fillStyle = '#d0f81b';
      ctx.beginPath();
      ctx.arc(px + 270, 95, 12, 0, Math.PI * 2);
      ctx.fill();

      // Brand Subtitle
      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 24px monospace';
      ctx.fillText('AI FINANCIAL COPILOT & SỔ QUỸ TỰ ĐỘNG', px, 175);

      // Top Right Pro Badge
      ctx.fillStyle = 'rgba(208, 248, 27, 0.18)';
      ctx.strokeStyle = '#d0f81b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(1020, 75, 170, 60, 16);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#d0f81b';
      ctx.font = '900 26px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PRO 2026', 1105, 115);
      ctx.textAlign = 'left';

      // EMV Brass Chip
      const chipX = px;
      const chipY = 270;
      const chipW = 150;
      const chipH = 115;
      const chipGrad = ctx.createLinearGradient(chipX, chipY, chipX + chipW, chipY + chipH);
      chipGrad.addColorStop(0, '#eab308');
      chipGrad.addColorStop(0.5, '#fef08a');
      chipGrad.addColorStop(1, '#ca8a04');
      ctx.fillStyle = chipGrad;
      ctx.beginPath();
      ctx.roundRect(chipX, chipY, chipW, chipH, 18);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Chip internal circuit lines
      ctx.strokeStyle = 'rgba(113, 63, 18, 0.5)';
      ctx.lineWidth = 3;
      ctx.strokeRect(chipX + 30, chipY + 24, 90, 67);
      ctx.beginPath();
      ctx.moveTo(chipX + 75, chipY);
      ctx.lineTo(chipX + 75, chipY + chipH);
      ctx.stroke();

      // Contactless Wave Icon
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4.5;
      for (let r = 24; r <= 54; r += 14) {
        ctx.beginPath();
        ctx.arc(310, 328, r, -Math.PI / 4, Math.PI / 4);
        ctx.stroke();
      }

      // Card Number Simulation (Big & Bold)
      ctx.fillStyle = '#f8fafc';
      ctx.font = '900 58px monospace';
      ctx.fillText('8920   ••••   ••••   2026', px, 510);

      // Card Details Row (Store Name, Expiry, Profit Rate)
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 22px system-ui, sans-serif';
      ctx.fillText('CHỦ HỘ KINH DOANH', px, 600);
      ctx.fillText('HIỆU LỰC', 660, 600);
      ctx.fillText('LÃI RÒNG', 960, 600);

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 38px system-ui, sans-serif';
      ctx.fillText('VIKESO SMART STORE', px, 655);
      ctx.fillText('12 / 29', 660, 655);

      ctx.fillStyle = '#d0f81b';
      ctx.font = '900 44px monospace';
      ctx.fillText('80%', 960, 655);

      // Holographic security stamp (bottom right)
      ctx.fillStyle = 'rgba(255, 71, 131, 0.25)';
      ctx.strokeStyle = '#ff4783';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(1140, 680, 52, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(208, 248, 27, 0.25)';
      ctx.strokeStyle = '#d0f81b';
      ctx.beginPath();
      ctx.arc(1095, 680, 52, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    const cardTexture = new THREE.CanvasTexture(cardCanvas);
    cardTexture.anisotropy = 8;

    // --- 4. 3D CARD GEOMETRY & MESH ---
    // Rounded Card Shape
    const cWidth = 4.3;
    const cHeight = 2.7;
    const radius = 0.22;
    const shape = new THREE.Shape();
    shape.moveTo(-cWidth / 2 + radius, -cHeight / 2);
    shape.lineTo(cWidth / 2 - radius, -cHeight / 2);
    shape.quadraticCurveTo(cWidth / 2, -cHeight / 2, cWidth / 2, -cHeight / 2 + radius);
    shape.lineTo(cWidth / 2, cHeight / 2 - radius);
    shape.quadraticCurveTo(cWidth / 2, cHeight / 2, cWidth / 2 - radius, cHeight / 2);
    shape.lineTo(-cWidth / 2 + radius, cHeight / 2);
    shape.quadraticCurveTo(-cWidth / 2, cHeight / 2, -cWidth / 2, cHeight / 2 - radius);
    shape.lineTo(-cWidth / 2, -cHeight / 2 + radius);
    shape.quadraticCurveTo(-cWidth / 2, -cHeight / 2, -cWidth / 2 + radius, -cHeight / 2);

    const cardGeometry = new THREE.ExtrudeGeometry(shape, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.03,
      bevelThickness: 0.03,
    });
    cardGeometry.center();

    // Map UVs correctly across the entire geometry face
    cardGeometry.computeBoundingBox();
    const cBbox = cardGeometry.boundingBox!;
    const cUvAttr = cardGeometry.attributes.uv;
    const cPosAttr = cardGeometry.attributes.position;
    for (let i = 0; i < cUvAttr.count; i++) {
      const x = cPosAttr.getX(i);
      const y = cPosAttr.getY(i);
      const u = (x - cBbox.min.x) / (cBbox.max.x - cBbox.min.x);
      const v = (y - cBbox.min.y) / (cBbox.max.y - cBbox.min.y);
      cUvAttr.setXY(i, u, v);
    }
    cUvAttr.needsUpdate = true;

    // Front Face Material with Card Texture
    const cardFrontMaterial = new THREE.MeshPhysicalMaterial({
      map: cardTexture,
      roughness: 0.18,
      metalness: 0.35,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
      transmission: 0.15,
      transparent: true,
    });

    const cardSideMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.25,
    });

    const cardMesh = new THREE.Mesh(cardGeometry, [cardFrontMaterial, cardSideMaterial]);
    
    // Group for combined card tilt and float
    const cardGroup = new THREE.Group();
    cardGroup.add(cardMesh);
    scene.add(cardGroup);

    // --- 5. FLOATING 3D ACCENT OBJECTS ---
    // A. Neon Lime Financial Coin
    const coinGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.08, 36);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xd0f81b,
      metalness: 0.85,
      roughness: 0.2,
      emissive: 0x223500,
      emissiveIntensity: 0.4,
    });
    const coinMesh = new THREE.Mesh(coinGeo, coinMat);
    coinMesh.position.set(2.4, 1.4, 0.8);
    coinMesh.rotation.set(0.6, 0.4, 0.2);
    scene.add(coinMesh);

    // B. Neon Pink Floating Hologram Torus Ring
    const torusGeo = new THREE.TorusGeometry(0.72, 0.065, 20, 60);
    const torusMat = new THREE.MeshStandardMaterial({
      color: 0xff4783,
      metalness: 0.5,
      roughness: 0.15,
      emissive: 0x550020,
      emissiveIntensity: 0.6,
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.position.set(-2.5, -1.2, 0.9);
    torusMesh.rotation.set(1.2, 0.5, 0.3);
    scene.add(torusMesh);

    // C. Frosted Glass Financial Cubes
    const cubeGeo = new THREE.BoxGeometry(0.45, 0.45, 0.45);
    const glassCubeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.85,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
      ior: 1.5,
      reflectivity: 0.8,
      metalness: 0.1,
    });
    const cubeMesh1 = new THREE.Mesh(cubeGeo, glassCubeMat);
    cubeMesh1.position.set(-2.2, 1.6, 0.5);
    cubeMesh1.rotation.set(0.4, 0.8, 0.2);
    scene.add(cubeMesh1);

    const cubeMesh2 = new THREE.Mesh(cubeGeo, glassCubeMat);
    cubeMesh2.position.set(2.2, -1.5, 0.6);
    cubeMesh2.rotation.set(0.8, 0.3, 0.5);
    cubeMesh2.scale.set(0.7, 0.7, 0.7);
    scene.add(cubeMesh2);

    // D. Ambient Floating Energy Particles
    const particleCount = 120;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const limeColor = new THREE.Color(0xd0f81b);
    const pinkColor = new THREE.Color(0xff4783);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 11;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 6;

      const c = Math.random() > 0.5 ? limeColor : pinkColor;
      particleColors[i * 3] = c.r;
      particleColors[i * 3 + 1] = c.g;
      particleColors[i * 3 + 2] = c.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.055,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    setIsLoaded(true);

    // --- 6. MOUSE INTERACTION & LERP ---
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0.15;
    let targetRotY = -0.25;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      // Clamp target rotation within comfortable aesthetic limits
      mouseX = Math.max(-1, Math.min(1, x));
      mouseY = Math.max(-1, Math.min(1, y));

      targetRotY = mouseX * 0.45;
      targetRotX = -mouseY * 0.35;

      mouseLight.position.x = mouseX * 4;
      mouseLight.position.y = mouseY * 3;
    };

    // Touch support for mobile devices
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = container.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
        targetRotY = Math.max(-1, Math.min(1, x)) * 0.4;
        targetRotX = -Math.max(-1, Math.min(1, y)) * 0.3;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('touchmove', handleTouchMove, { passive: true });

    // --- 7. RESIZE OBSERVER ---
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // --- 8. SMOOTH ANIMATION LOOP (60 FPS) ---
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth interpolation for card rotation
      cardGroup.rotation.y += (targetRotY - cardGroup.rotation.y) * 0.055;
      cardGroup.rotation.x += (targetRotX - cardGroup.rotation.x) * 0.055;

      // Gentle continuous vertical floating bob
      cardGroup.position.y = Math.sin(elapsedTime * 1.6) * 0.12;

      // Orbit and spin floating coin
      coinMesh.rotation.y += 0.02;
      coinMesh.rotation.x = Math.sin(elapsedTime * 1.5) * 0.3;
      coinMesh.position.y = 1.4 + Math.cos(elapsedTime * 1.8) * 0.15;

      // Orbit and spin torus
      torusMesh.rotation.x += 0.015;
      torusMesh.rotation.z += 0.012;
      torusMesh.position.y = -1.2 + Math.sin(elapsedTime * 1.4) * 0.14;

      // Tumble floating glass cubes
      cubeMesh1.rotation.x += 0.01;
      cubeMesh1.rotation.y += 0.015;
      cubeMesh1.position.y = 1.6 + Math.sin(elapsedTime * 2.0) * 0.1;

      cubeMesh2.rotation.y += 0.012;
      cubeMesh2.rotation.z += 0.018;
      cubeMesh2.position.y = -1.5 + Math.cos(elapsedTime * 1.6) * 0.12;

      // Drift particle cloud slowly
      particleSystem.rotation.y = elapsedTime * 0.03;

      renderer.render(scene, camera);
    };

    animate();

    // --- 9. CLEANUP MEMORY ON UNMOUNT ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('touchmove', handleTouchMove);
      resizeObserver.disconnect();

      // Dispose geometries
      cardGeometry.dispose();
      coinGeo.dispose();
      torusGeo.dispose();
      cubeGeo.dispose();
      particleGeometry.dispose();

      // Dispose materials
      cardFrontMaterial.dispose();
      cardSideMaterial.dispose();
      coinMat.dispose();
      torusMat.dispose();
      glassCubeMat.dispose();
      particleMaterial.dispose();

      // Dispose texture
      cardTexture.dispose();

      // Dispose renderer
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[400px] sm:h-[480px] lg:h-[540px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
    >
      {/* Background Soft Neon Glow Aura */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-[#ff4783]/20 via-[#d0f81b]/20 to-transparent blur-3xl opacity-75 animate-pulse"></div>
      </div>

      {/* Loading Skeleton Indicator */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#d0f81b] rounded-full animate-spin"></div>
        </div>
      )}

      {/* Three.js WebGL Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block focus:outline-none drop-shadow-2xl"
      />
    </div>
  );
};
