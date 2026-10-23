import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeReceiptScanCanvasProps {
  className?: string;
}

export const ThreeReceiptScanCanvas: React.FC<ThreeReceiptScanCanvasProps> = ({ className = '' }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 400;
    let height = container.clientHeight || 450;

    // --- 1. Scene, Camera, Renderer ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // --- 2. Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xd0f81b, 2.5); // Lime
    dirLight1.position.set(5, 6, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xff4783, 2.0); // Neon Pink
    dirLight2.position.set(-5, -4, 4);
    scene.add(dirLight2);

    const laserLight = new THREE.PointLight(0xd0f81b, 3.5, 6);
    laserLight.position.set(0, 0, 0.5);
    scene.add(laserLight);

    // --- 3. Generate Receipt Canvas Texture (High Resolution & Big Bold Text) ---
    const drawReceiptTexture = () => {
      const c = document.createElement('canvas');
      c.width = 1024;
      c.height = 1536;
      const ctx = c.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(c);

      // Background Paper / Glass Obsidian
      ctx.fillStyle = '#0a0f1d';
      ctx.fillRect(0, 0, c.width, c.height);

      // Top Neon Gradient Ribbon
      const gradHeader = ctx.createLinearGradient(0, 0, c.width, 0);
      gradHeader.addColorStop(0, '#ff4783');
      gradHeader.addColorStop(0.5, '#d0f81b');
      gradHeader.addColorStop(1, '#06b6d4');
      ctx.fillStyle = gradHeader;
      ctx.fillRect(0, 0, c.width, 24);

      const px = 64;

      // Store Title
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 62px system-ui, -apple-system, sans-serif';
      ctx.fillText('VIKESO SMART STORE', px, 120);

      // Header Tagline & Details
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 36px system-ui, sans-serif';
      ctx.fillText('HÓA ĐƠN BÁN LẺ & NHẬP HÀNG', px, 175);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 30px system-ui, sans-serif';
      ctx.fillText('Ngày: 23/10/2026 - 14:35 | Thu ngân: Mai Anh', px, 225);
      ctx.fillText('Số phiếu: #VK-88219 • Két chính quầy 01', px, 270);

      // Separator Line (Dashed)
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.setLineDash([16, 12]);
      ctx.beginPath();
      ctx.moveTo(px, 310);
      ctx.lineTo(c.width - px, 310);
      ctx.stroke();
      ctx.setLineDash([]);

      // Receipt Items (Big bold labels & numbers)
      const items = [
        { name: '1. Cà phê Arabica Cầu Đất', qty: '2 ly x 45.000', price: '90.000 ₫' },
        { name: '2. Bánh Croissant bơ Pháp', qty: '1 cái', price: '45.000 ₫' },
        { name: '3. Nước ép cam sành tươi', qty: '2 chai x 35.000', price: '70.000 ₫' },
        { name: '4. Trà sữa Oolong Nướng', qty: '1 ly (size L)', price: '45.000 ₫' },
      ];

      let y = 390;
      items.forEach((item) => {
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 38px system-ui, sans-serif';
        ctx.fillText(item.name, px, y);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 30px system-ui, sans-serif';
        ctx.fillText(item.qty, px, y + 42);

        ctx.fillStyle = '#d0f81b';
        ctx.font = 'bold 44px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(item.price, c.width - px, y + 26);
        ctx.textAlign = 'left';

        // subtle separator
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(px, y + 70);
        ctx.lineTo(c.width - px, y + 70);
        ctx.stroke();

        y += 120;
      });

      // Total Box Container
      y += 20;
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(px, y, c.width - px * 2, 230, 24);
      ctx.fill();
      ctx.strokeStyle = '#d0f81b';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 34px system-ui, sans-serif';
      ctx.fillText('TỔNG TIỀN THANH TOÁN:', px + 36, y + 70);

      ctx.fillStyle = '#d0f81b';
      ctx.font = '900 84px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('250.000 ₫', c.width - px - 36, y + 165);
      ctx.textAlign = 'left';

      // OCR Stamp Badge
      y += 275;
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(px, y, c.width - px * 2, 100, 20);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = '900 36px system-ui, sans-serif';
      ctx.fillText('✓ GEMINI FLASH OCR: 99.8% CHÍNH XÁC', px + 36, y + 62);

      // Barcode at bottom
      y += 140;
      ctx.fillStyle = '#64748b';
      for (let bx = px + 40; bx < c.width - px - 40; bx += 14) {
        const w = (bx % 3 === 0) ? 8 : 4;
        ctx.fillRect(bx, y, w, 70);
      }

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('* VK - 8 8 2 1 9 - F I N A U T O *', c.width / 2, y + 110);
      ctx.textAlign = 'left';

      const texture = new THREE.CanvasTexture(c);
      texture.anisotropy = 8;
      return texture;
    };

    const receiptTexture = drawReceiptTexture();

    // --- 4. Receipt 3D Mesh ---
    const receiptWidth = 2.5;
    const receiptHeight = 3.75;
    const receiptDepth = 0.05;

    // Rounded rectangle shape for Receipt
    const shape = new THREE.Shape();
    const r = 0.14;
    const rw = receiptWidth / 2;
    const rh = receiptHeight / 2;

    shape.moveTo(-rw + r, -rh);
    shape.lineTo(rw - r, -rh);
    shape.quadraticCurveTo(rw, -rh, rw, -rh + r);
    shape.lineTo(rw, rh - r);
    shape.quadraticCurveTo(rw, rh, rw - r, rh);
    shape.lineTo(-rw + r, rh);
    shape.quadraticCurveTo(-rw, rh, -rw, rh - r);
    shape.lineTo(-rw, -rh + r);
    shape.quadraticCurveTo(-rw, -rh, -rw + r, -rh);

    const extrudeSettings = {
      depth: receiptDepth,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    };

    const receiptGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    receiptGeo.center();

    // Map UVs correctly across the entire geometry face
    receiptGeo.computeBoundingBox();
    const rBbox = receiptGeo.boundingBox!;
    const rUvAttr = receiptGeo.attributes.uv;
    const rPosAttr = receiptGeo.attributes.position;
    for (let i = 0; i < rUvAttr.count; i++) {
      const x = rPosAttr.getX(i);
      const y = rPosAttr.getY(i);
      const u = (x - rBbox.min.x) / (rBbox.max.x - rBbox.min.x);
      const v = (y - rBbox.min.y) / (rBbox.max.y - rBbox.min.y);
      rUvAttr.setXY(i, u, v);
    }
    rUvAttr.needsUpdate = true;

    const receiptMat = new THREE.MeshPhysicalMaterial({
      map: receiptTexture,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
      transmission: 0.15,
      transparent: true,
      opacity: 0.98,
    });

    const receiptMesh = new THREE.Mesh(receiptGeo, receiptMat);
    scene.add(receiptMesh);

    // --- 5. Laser Scan Beam & Plane ---
    const laserGeo = new THREE.PlaneGeometry(receiptWidth + 0.6, 0.08);
    const laserMat = new THREE.MeshBasicMaterial({
      color: 0xd0f81b,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide,
    });
    const laserBeam = new THREE.Mesh(laserGeo, laserMat);
    laserBeam.position.z = receiptDepth + 0.06;
    scene.add(laserBeam);

    // Glowing Laser Line Halo
    const haloGeo = new THREE.PlaneGeometry(receiptWidth + 0.8, 0.4);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xd0f81b,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const laserHalo = new THREE.Mesh(haloGeo, haloMat);
    laserHalo.position.z = receiptDepth + 0.05;
    scene.add(laserHalo);

    // --- 6. Floating Extracted Data Badges (3D Chips) ---
    const createDataBadge = (text: string, sub: string, bgColor: string, textColor: string) => {
      const c = document.createElement('canvas');
      c.width = 360;
      c.height = 140;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        ctx.roundRect(6, 6, c.width - 12, c.height - 12, 22);
        ctx.fill();
        ctx.strokeStyle = textColor;
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.fillStyle = textColor;
        ctx.font = '900 42px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(text, c.width / 2, 60);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.fillText(sub, c.width / 2, 105);
      }

      const tex = new THREE.CanvasTexture(c);
      const geo = new THREE.PlaneGeometry(1.6, 0.64);
      const mat = new THREE.MeshBasicMaterial({
        map: tex,
        transparent: true,
        side: THREE.DoubleSide,
      });
      return new THREE.Mesh(geo, mat);
    };

    const badgeTotal = createDataBadge('250.000 ₫', '✓ Bóc tách tự động', '#0f172a', '#d0f81b');
    badgeTotal.position.set(1.6, 0.9, 0.6);
    scene.add(badgeTotal);

    const badgeCategory = createDataBadge('F&B / Ăn Uống', 'Danh mục chi phí', '#0f172a', '#ff4783');
    badgeCategory.position.set(-1.6, -0.7, 0.7);
    scene.add(badgeCategory);

    const badgeMatch = createDataBadge('KHỚP 100% POS', 'Đối soát 2 chiều', '#022c22', '#34d399');
    badgeMatch.position.set(1.5, -1.2, 0.5);
    scene.add(badgeMatch);

    // --- 7. Data Particles (Sparkles around Laser) ---
    const particleCount = 100;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    const particleVel = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePos[i * 3] = (Math.random() - 0.5) * (receiptWidth + 0.8);
      particlePos[i * 3 + 1] = (Math.random() - 0.5) * (receiptHeight + 0.8);
      particlePos[i * 3 + 2] = (Math.random() - 0.5) * 1.5 + 0.2;

      particleVel[i * 3] = (Math.random() - 0.5) * 0.006;
      particleVel[i * 3 + 1] = Math.random() * 0.008 + 0.002;
      particleVel[i * 3 + 2] = (Math.random() - 0.5) * 0.006;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xd0f81b,
      size: 0.05,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- 8. Mouse Interaction (Parallax Tilt) ---
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      targetX = ((clientX - rect.left) / rect.width) * 2 - 1;
      targetY = -(((clientY - rect.top) / rect.height) * 2 - 1);
    };

    window.addEventListener('mousemove', onPointerMove, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });

    // --- 9. Animation Loop ---
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      // Rotate Receipt
      receiptMesh.rotation.y = currentX * 0.35 + Math.sin(elapsedTime * 0.5) * 0.05;
      receiptMesh.rotation.x = -currentY * 0.25 + 0.1;
      receiptMesh.position.y = Math.sin(elapsedTime * 1.2) * 0.08;

      // Laser Scan Sweep Animation (-rh to rh)
      const scanLimit = rh - 0.2;
      const laserY = Math.sin(elapsedTime * 2.2) * scanLimit;
      laserBeam.position.y = receiptMesh.position.y + laserY;
      laserHalo.position.y = receiptMesh.position.y + laserY;
      laserLight.position.y = receiptMesh.position.y + laserY;

      laserBeam.rotation.y = receiptMesh.rotation.y;
      laserBeam.rotation.x = receiptMesh.rotation.x;
      laserHalo.rotation.y = receiptMesh.rotation.y;
      laserHalo.rotation.x = receiptMesh.rotation.x;

      // Animate Floating Badges
      badgeTotal.position.y = 0.9 + Math.sin(elapsedTime * 1.5) * 0.07;
      badgeTotal.rotation.y = currentX * 0.2;

      badgeCategory.position.y = -0.7 + Math.cos(elapsedTime * 1.3) * 0.06;
      badgeCategory.rotation.y = currentX * 0.2;

      badgeMatch.position.y = -1.2 + Math.sin(elapsedTime * 1.7) * 0.05;
      badgeMatch.rotation.y = currentX * 0.2;

      // Animate Particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += particleVel[i * 3 + 1];
        if (positions[i * 3 + 1] > rh + 0.6) {
          positions[i * 3 + 1] = -rh - 0.6;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // --- 10. Resize Observer ---
    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      if (newWidth > 0 && newHeight > 0) {
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      }
    });

    resizeObserver.observe(container);

    // --- 11. Cleanup ---
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      resizeObserver.disconnect();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      receiptGeo.dispose();
      receiptMat.dispose();
      receiptTexture.dispose();
      laserGeo.dispose();
      laserMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className={`relative w-full h-full min-h-[420px] cursor-grab active:cursor-grabbing select-none ${className}`}
      style={{ touchAction: 'none' }}
    />
  );
};
