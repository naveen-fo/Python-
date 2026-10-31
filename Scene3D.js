import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const COLORS = { Basic: 0x4f7cff, Intermediate: 0x2dd4bf, Advanced: 0xfbbf24 };
const spot = (i) => new THREE.Vector3(Math.sin(i * 0.75) * 5, Math.cos(i * 0.75) * 2.5 + i * 0.35, -i * 4);

function label(canvas, text) {
  const c = canvas.getContext('2d');
  c.clearRect(0, 0, 128, 128);
  c.fillStyle = '#ffffff';
  c.font = 'bold 64px system-ui, sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(text, 64, 68);
}

// The whole site is this 3D world: each lesson is a planet on a glowing path.
// The camera flies to the current lesson. Tap a planet to open it.
export default function Scene3D({ lessons, current, done, open, onSelect }) {
  const host = useRef(null);
  const live = useRef({});
  const api = useRef({});
  live.current = { current, done, open, onSelect };

  useEffect(() => {
    const el = host.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      return undefined; // no WebGL: the lesson list still works
    }
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const dom = renderer.domElement;
    el.appendChild(dom);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1020);
    scene.fog = new THREE.Fog(0x0b1020, 22, 80);
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 200);
    scene.add(new THREE.HemisphereLight(0xbcd0ff, 0x1a1030, 1.4));
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(6, 10, 8);
    scene.add(sun);

    // Two Python-coloured knots at the start of the path
    const knotGeo = new THREE.TorusKnotGeometry(1.2, 0.34, 140, 20, 2, 3);
    const knotA = new THREE.Mesh(knotGeo, new THREE.MeshStandardMaterial({ color: 0x3776ab, roughness: 0.3, metalness: 0.3 }));
    const knotB = new THREE.Mesh(knotGeo, new THREE.MeshStandardMaterial({ color: 0xffd43b, roughness: 0.3, metalness: 0.3 }));
    knotA.position.set(-5.5, 3.5, -1);
    knotB.position.set(5.5, 3.5, -1);
    scene.add(knotA, knotB);

    // Glowing path through all lessons
    const curve = new THREE.CatmullRomCurve3(lessons.map((_, i) => spot(i)));
    scene.add(
      new THREE.Mesh(
        new THREE.TubeGeometry(curve, 240, 0.05, 8, false),
        new THREE.MeshBasicMaterial({ color: 0x6b7bb0, transparent: true, opacity: 0.55 })
      )
    );

    // Stars
    const N = 1200;
    const arr = new Float32Array(N * 3);
    for (let k = 0; k < N; k++) {
      arr[k * 3] = (Math.random() - 0.5) * 90;
      arr[k * 3 + 1] = (Math.random() - 0.5) * 50 + 10;
      arr[k * 3 + 2] = 20 - Math.random() * (lessons.length * 4 + 60);
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xaec2ff, size: 0.14, sizeAttenuation: true })));

    // One planet per lesson
    const nodeGeo = new THREE.IcosahedronGeometry(0.9, 1);
    const nodes = lessons.map((l, i) => {
      const color = COLORS[l.level];
      const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3, roughness: 0.35, metalness: 0.2, flatShading: true });
      const mesh = new THREE.Mesh(nodeGeo, mat);
      mesh.userData.index = i;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 128;
      const tex = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
      sprite.scale.set(1.1, 1.1, 1.1);
      sprite.position.set(0, 0, 1.2);
      const group = new THREE.Group();
      const base = spot(i);
      group.position.copy(base);
      group.add(mesh, sprite);
      scene.add(group);
      return { group, mesh, base, canvas, tex, mat };
    });

    const paint = () => {
      nodes.forEach((n, i) => {
        const isDone = live.current.done.includes(lessons[i].id);
        label(n.canvas, isDone ? '✓' : String(i + 1));
        n.tex.needsUpdate = true;
        n.mat.emissiveIntensity = isDone ? 0.75 : 0.3;
      });
    };
    api.current.paint = paint;
    paint();

    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.05, 12, 64), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    scene.add(ring);

    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    // Picking and parallax
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const par = { x: 0, y: 0 };
    let down = null;
    const pick = (e) => {
      const r = dom.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      return ray.intersectObjects(nodes.map((n) => n.mesh))[0];
    };
    const onMove = (e) => {
      const r = dom.getBoundingClientRect();
      par.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      par.y = -((e.clientY - r.top) / r.height - 0.5) * 2;
      dom.style.cursor = pick(e) ? 'pointer' : 'default';
    };
    const onDown = (e) => { down = { x: e.clientX, y: e.clientY }; };
    const onUp = (e) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      down = null;
      if (moved > 8) return;
      const hit = pick(e);
      if (hit) live.current.onSelect(hit.object.userData.index);
    };
    dom.addEventListener('pointermove', onMove);
    dom.addEventListener('pointerdown', onDown);
    dom.addEventListener('pointerup', onUp);

    // Animation
    const clock = new THREE.Clock();
    const camPos = new THREE.Vector3();
    const camLook = new THREE.Vector3();
    const tp = new THREE.Vector3();
    const tl = new THREE.Vector3();
    let first = true;
    renderer.setAnimationLoop(() => {
      if (document.hidden) return;
      const t = clock.getElapsedTime();
      const { current, open: sheetOpen } = live.current;
      nodes.forEach((n, i) => {
        n.group.position.y = n.base.y + Math.sin(t * 1.2 + i) * 0.18 * motion;
        n.mesh.rotation.y = t * 0.4 * motion + i;
        n.mesh.rotation.x = t * 0.2 * motion;
      });
      knotA.rotation.set(t * 0.3 * motion, t * 0.5 * motion, 0);
      knotB.rotation.set(-t * 0.3 * motion, -t * 0.5 * motion, 0);

      const p = nodes[current].base;
      ring.position.copy(nodes[current].group.position);
      ring.lookAt(camera.position);
      ring.scale.setScalar(1 + Math.sin(t * 3) * 0.05 * motion);

      const dist = camera.aspect < 0.8 ? 11 : 8;
      const shift = camera.aspect < 1.1 && sheetOpen ? -3 : 0; // keep the planet visible above the lesson sheet on phones
      tp.set(p.x + par.x * 0.8, p.y + 1.5 + par.y * 0.5, p.z + dist);
      tl.set(p.x, p.y + shift, p.z);
      const k = first ? 1 : motion ? 0.05 : 0.2;
      first = false;
      camPos.lerp(tp, k);
      camLook.lerp(tl, k);
      camera.position.copy(camPos);
      camera.lookAt(camLook);
      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      ro.disconnect();
      dom.removeEventListener('pointermove', onMove);
      dom.removeEventListener('pointerdown', onDown);
      dom.removeEventListener('pointerup', onUp);
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        const m = o.material;
        if (m) (Array.isArray(m) ? m : [m]).forEach((x) => { if (x.map) x.map.dispose(); x.dispose(); });
      });
      renderer.dispose();
      if (dom.parentNode === el) el.removeChild(dom);
      api.current = {};
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessons]);

  useEffect(() => {
    if (api.current.paint) api.current.paint();
  }, [done]);

  return React.createElement('div', { ref: host, className: 'scene', 'aria-hidden': 'true' });
}
