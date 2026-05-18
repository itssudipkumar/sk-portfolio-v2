/* ============================================================
   universe.js — Three.js universe background
   Deep layered star field with scroll-zoom parallax.
   Three star shells at different depths create real
   warp-into-space feel as user scrolls down.
   ============================================================ */

(function () {
  'use strict';

  const canvas   = document.getElementById('c3');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 300);
  camera.position.z = 6;

  /* ── RESIZE ──────────────────────────────────────────────── */
  function resize() {
    renderer.setSize(innerWidth, innerHeight);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  /* ── HELPERS ─────────────────────────────────────────────── */
  function inShell(minR, maxR) {
    const u = Math.random(), v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi   = Math.acos(2 * v - 1);
    const r     = minR + Math.random() * (maxR - minR);
    return [
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    ];
  }

  function makeLayer(count, minR, maxR, color, size, opacity) {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const [x, y, z] = inShell(minR, maxR);
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({
      color,
      size,
      transparent: true,
      opacity,
      sizeAttenuation: true,
      map: starTexture,
      alphaTest: 0.01,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
  }

  function makeNebula(count, sx, sy, sz, color, size, opacity) {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * sx;
      pos[i * 3 + 1] = (Math.random() - 0.5) * sy;
      pos[i * 3 + 2] = (Math.random() - 0.5) * sz - 8;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return new THREE.Points(geo, new THREE.PointsMaterial({
      color,
      size,
      transparent: true,
      opacity: Math.min(opacity, 0.25),
      sizeAttenuation: true,
      map: nebulaTexture,
      alphaTest: 0.01,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }));
  }

  // Create a soft circular star texture for point sprites
  function makeCircleTexture(colorHex) {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');

    // radial gradient: white center -> tinted -> transparent
    const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    // tint using provided color
    const c = '#' + (colorHex.toString(16).padStart(6, '0'));
    grad.addColorStop(0.5, c);
    grad.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.generateMipmaps = true;
    return tex;
  }

  // Create star and nebula textures once
  const starTexture   = makeCircleTexture(0xffffff);
  const nebulaTexture = makeCircleTexture(0x7dd3fc);

  /* ── BUILD SCENE ─────────────────────────────────────────── */
  // Layer 1 — distant tiny white stars (increased density)
  const l1 = makeLayer(1200, 30, 120, 0xffffff,  0.06, 0.5);
  // Layer 2 — mid blue-white stars
  const l2 = makeLayer(600, 10, 28,  0xadd8f7,  0.09, 0.55);
  // Layer 3 — close bright accent-blue stars
  const l3 = makeLayer(160,  3,  9,   0x7dd3fc,  0.14, 0.7);
  // Nebula clouds
  const nb1 = makeNebula(400, 40, 20, 10, 0x3b5bdb, 0.12, 0.12);
  const nb2 = makeNebula(200, 30, 15, 8,  0x7928ca, 0.10, 0.08);

  scene.add(l1, l2, l3, nb1, nb2);

  // Store base size and twinkle frequency per layer for simple twinkle animation
  l1.material.userData = { baseSize: 0.06, baseOpacity: 0.5, freq: 0.9, amp: 0.14 };
  l2.material.userData = { baseSize: 0.09, baseOpacity: 0.55, freq: 1.2, amp: 0.18 };
  l3.material.userData = { baseSize: 0.14, baseOpacity: 0.7, freq: 1.6, amp: 0.22 };

  /* ── MOUSE & SCROLL ──────────────────────────────────────── */
  let mx = 0, my = 0, tmx = 0, tmy = 0, scrollY = 0;

  window.addEventListener('mousemove', (e) => {
    mx = (e.clientX / innerWidth  - 0.5) * 2;
    my = (e.clientY / innerHeight - 0.5) * 2;
  });
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  /* ── ANIMATE ─────────────────────────────────────────────── */
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Smooth mouse lag
    tmx += (mx - tmx) * 0.025;
    tmy += (my - tmy) * 0.025;

    // Scroll zoom — fly forward through universe
    const maxScroll  = Math.max(1, document.body.scrollHeight - innerHeight);
    const sp         = scrollY / maxScroll;
    camera.position.z = 6 - sp * 80;

    // Gentle mouse tilt
    camera.rotation.x = tmy * 0.04;
    camera.rotation.y = tmx * 0.04;

    // Very slow layer rotation for living feel
    l1.rotation.y =  t * 0.003;
    l2.rotation.y = -t * 0.005;
    l3.rotation.y =  t * 0.008;
    l3.rotation.x =  t * 0.004;

    // Gentle per-layer twinkle (layer-level modulation)
    [l1, l2, l3].forEach((layer, i) => {
      const ud = layer.material.userData || {};
      const base = ud.baseSize || layer.material.size;
      const freq = ud.freq || (1 + i * 0.3);
      const amp  = ud.amp  || 0.15;
      // combine two sines for slightly organic shimmer
      const shimmer = Math.sin(t * freq + i) * 0.5 + Math.sin(t * (freq * 0.33) + i * 2) * 0.15;
      layer.material.size = base * (1 + shimmer * amp);
      const baseOp = ud.baseOpacity || layer.material.opacity;
      layer.material.opacity = Math.max(0.02, baseOp * (1 + Math.sin(t * freq * 0.7 + i) * 0.08));
    });

    renderer.render(scene, camera);
  }

  animate();
})();
