/** Landing hero backdrop — "the three fields of study", built from particles.
 *
 *   Maths           → Fibonacci (golden-angle) sphere wrapped by a Lissajous curve
 *   Science         → an atom with orbiting electrons + a slowly turning DNA helix
 *   Social science  → a community network with signals travelling along its edges
 *   Ambient         → drifting dust + faint floating symbols (π ∑ ∫ H₂O σ …)
 *
 * Hydration-safe by construction: first render (server AND client) is an
 * empty placeholder div. three.js loads post-mount via dynamic import, so it
 * never enters the SSR tree and stays out of the initial bundle.
 * Optimized: DPR capped, single animation loop, pause when offscreen,
 * fewer particles on touch devices, full dispose on unmount,
 * static frame for reduced motion.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import type { BufferAttribute, Sprite } from "three";
import { reducedMotion } from "../lib/motion";

type Three = typeof import("three");

const BRAND = {
  violet: "#6a4cf5",
  magenta: "#d44df0",
  orange: "#ff7a3d",
  white: "#ffffff",
};

// Maths, science and social-science symbols.
const GLYPHS = [
  "π", "∑", "∫", "√x", "∞", "θ", "x²",
  "Δ", "λ", "ψ", "H₂O", "e⁻",
  "σ", "μ", "ρ",
];

/** Small deterministic PRNG so the layout is identical on every load. */
function makeRng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createScene(THREE: Three, mount: HTMLElement): () => void {
  const rand = makeRng(7);
  const gauss = () => (rand() + rand() + rand() - 1.5) / 1.5; // ≈ [-1, 1], bell-shaped
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const q = coarse ? 0.55 : 1; // particle budget multiplier
  const reduced = reducedMotion();

  const disposables: { dispose(): void }[] = [];
  const own = <T extends { dispose(): void }>(o: T): T => {
    disposables.push(o);
    return o;
  };

  const C = {
    violet: new THREE.Color(BRAND.violet),
    magenta: new THREE.Color(BRAND.magenta),
    orange: new THREE.Color(BRAND.orange),
    white: new THREE.Color(BRAND.white),
  };
  const tmp = new THREE.Color();

  /* ---------- renderer / scene / camera ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    55,
    mount.clientWidth / Math.max(1, mount.clientHeight),
    0.1,
    60,
  );
  camera.position.z = 9;

  /* ---------- shared textures + helpers ---------- */
  // Soft round glow so particles read as light, not square pixels.
  const dotCanvas = document.createElement("canvas");
  dotCanvas.width = dotCanvas.height = 64;
  {
    const ctx = dotCanvas.getContext("2d")!;
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.85)");
    g.addColorStop(0.6, "rgba(255,255,255,0.18)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  }
  const dotTex = own(new THREE.CanvasTexture(dotCanvas));
  dotTex.colorSpace = THREE.SRGBColorSpace;

  const mkPoints = (pos: Float32Array, col: Float32Array, size: number, opacity: number) => {
    const geo = own(new THREE.BufferGeometry());
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const mat = own(
      new THREE.PointsMaterial({
        size,
        map: dotTex,
        vertexColors: true,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    );
    return new THREE.Points(geo, mat);
  };

  const mkLines = (pos: Float32Array, col: Float32Array, opacity: number) => {
    const geo = own(new THREE.BufferGeometry());
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const mat = own(
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    return new THREE.LineSegments(geo, mat);
  };

  const setCol = (arr: Float32Array, i: number, c: { r: number; g: number; b: number }) => {
    arr[i * 3] = c.r;
    arr[i * 3 + 1] = c.g;
    arr[i * 3 + 2] = c.b;
  };

  /* =========================================================
   * 0. AMBIENT DUST — the quiet background layer
   * ======================================================= */
  const dustN = Math.round(260 * q);
  const dustPos = new Float32Array(dustN * 3);
  const dustCol = new Float32Array(dustN * 3);
  const dustPalette = [C.violet, C.magenta, C.orange, C.white];
  for (let i = 0; i < dustN; i++) {
    dustPos[i * 3] = (rand() - 0.5) * 26;
    dustPos[i * 3 + 1] = (rand() - 0.5) * 14;
    dustPos[i * 3 + 2] = (rand() - 0.5) * 10 - 2;
    setCol(dustCol, i, dustPalette[i % 4]);
  }
  const dust = mkPoints(dustPos, dustCol, 0.045, 0.5);
  scene.add(dust);

  /* =========================================================
   * 1. MATHS — golden-angle sphere + Lissajous curve
   * ======================================================= */
  const maths = new THREE.Group();
  {
    const N = Math.round(380 * q);
    const R = 2.0;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const pos = new Float32Array(N * 3);
    const col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2; // +1 … -1
      const r = Math.sqrt(1 - y * y);
      const th = golden * i;
      pos[i * 3] = Math.cos(th) * r * R;
      pos[i * 3 + 1] = y * R;
      pos[i * 3 + 2] = Math.sin(th) * r * R;
      tmp.copy(C.violet).lerp(C.magenta, (y + 1) / 2);
      if (i % 23 === 0) tmp.copy(C.white); // a few bright "seed" points
      setCol(col, i, tmp);
    }
    maths.add(mkPoints(pos, col, 0.07, 0.85));

    // Lissajous curve x=sin(3t+π/2), y=sin(2t), z=sin(5t) wrapping the sphere
    const M = Math.round(240 * q);
    const lp = new Float32Array(M * 3);
    const lc = new Float32Array(M * 3);
    for (let i = 0; i < M; i++) {
      const t = (i / M) * Math.PI * 2;
      lp[i * 3] = 2.7 * Math.sin(3 * t + Math.PI / 2);
      lp[i * 3 + 1] = 2.7 * Math.sin(2 * t);
      lp[i * 3 + 2] = 2.7 * Math.sin(5 * t);
      const k = Math.abs((i / M) * 2 - 1); // ping-pong so it loops smoothly
      tmp.copy(C.orange).lerp(C.white, k * 0.8);
      setCol(lc, i, tmp);
    }
    maths.add(mkPoints(lp, lc, 0.075, 0.9));
  }
  scene.add(maths);

  /* =========================================================
   * 2a. SCIENCE — atom with orbiting electrons
   * ======================================================= */
  const atom = new THREE.Group();
  const A = 2.1;
  const B = 1.0;
  const electrons: { attr: BufferAttribute; speed: number; phase: number }[] = [];
  {
    // nucleus
    const NUC = 14;
    const np = new Float32Array(NUC * 3);
    const nc = new Float32Array(NUC * 3);
    for (let i = 0; i < NUC; i++) {
      np[i * 3] = gauss() * 0.22;
      np[i * 3 + 1] = gauss() * 0.22;
      np[i * 3 + 2] = gauss() * 0.22;
      setCol(nc, i, i % 2 ? C.orange : C.white);
    }
    atom.add(mkPoints(np, nc, 0.2, 0.95));

    // three orbits: fanned around the vertical axis, sharing one tilt
    for (let k = 0; k < 3; k++) {
      const fan = new THREE.Group();
      fan.rotation.y = (k * Math.PI) / 3;
      const tilt = new THREE.Group();
      tilt.rotation.x = 1.1;
      fan.add(tilt);

      const RING = Math.round(90 * q);
      const rp = new Float32Array(RING * 3);
      const rc = new Float32Array(RING * 3);
      for (let i = 0; i < RING; i++) {
        const a = (i / RING) * Math.PI * 2;
        rp[i * 3] = Math.cos(a) * A;
        rp[i * 3 + 1] = Math.sin(a) * B;
        setCol(rc, i, tmp.copy(C.violet).lerp(C.magenta, k / 2));
      }
      tilt.add(mkPoints(rp, rc, 0.035, 0.45));

      const ep = new Float32Array(2 * 3);
      const ec = new Float32Array(2 * 3);
      setCol(ec, 0, C.white);
      setCol(ec, 1, C.magenta);
      const electronPts = mkPoints(ep, ec, 0.22, 1);
      tilt.add(electronPts);
      electrons.push({
        attr: electronPts.geometry.getAttribute("position") as BufferAttribute,
        speed: 0.7 + k * 0.25,
        phase: k * 2.1,
      });
      atom.add(fan);
    }
  }
  scene.add(atom);

  /* =========================================================
   * 2b. SCIENCE — DNA double helix
   * ======================================================= */
  const dna = new THREE.Group();
  {
    const S = Math.round(46 * q);
    const pos = new Float32Array(S * 2 * 3);
    const col = new Float32Array(S * 2 * 3);
    const rungs: number[] = [];
    const rungCols: number[] = [];
    for (let i = 0; i < S; i++) {
      const u = i / (S - 1);
      const y = (u - 0.5) * 4.4;
      const ang = u * Math.PI * 2 * 2.5;
      const ax = Math.cos(ang) * 0.75;
      const az = Math.sin(ang) * 0.75;
      const bx = Math.cos(ang + Math.PI) * 0.75;
      const bz = Math.sin(ang + Math.PI) * 0.75;
      pos.set([ax, y, az], i * 3);
      pos.set([bx, y, bz], (S + i) * 3);
      setCol(col, i, C.violet);
      setCol(col, S + i, C.orange);
      if (i % 2 === 0) {
        rungs.push(ax, y, az, bx, y, bz);
        rungCols.push(C.magenta.r, C.magenta.g, C.magenta.b, C.magenta.r, C.magenta.g, C.magenta.b);
      }
    }
    dna.add(mkPoints(pos, col, 0.09, 0.95));
    dna.add(mkLines(new Float32Array(rungs), new Float32Array(rungCols), 0.28));
    dna.rotation.z = 0.35;
  }
  scene.add(dna);

  /* =========================================================
   * 3. SOCIAL SCIENCE — communities + signals along edges
   * ======================================================= */
  const network = new THREE.Group();
  const edges: [number, number][] = [];
  let npos: Float32Array;
  const packets: { e: number; t: number; speed: number; dir: 1 | -1 }[] = [];
  let packetAttr: BufferAttribute | null = null;
  {
    const NN = Math.max(24, Math.round(48 * q));
    const centers = [
      [-2.5, 0.2, 0],
      [0, -0.4, 0.8],
      [2.5, 0.3, -0.5],
    ];
    const palette = [C.violet, C.magenta, C.orange];
    npos = new Float32Array(NN * 3);
    const ncol = new Float32Array(NN * 3);
    const comm: number[] = [];
    for (let i = 0; i < NN; i++) {
      const c = i % 3;
      comm.push(c);
      npos[i * 3] = centers[c][0] + gauss() * 1.3;
      npos[i * 3 + 1] = centers[c][1] + gauss() * 1.0;
      npos[i * 3 + 2] = centers[c][2] + gauss() * 1.0;
      setCol(ncol, i, tmp.copy(palette[c]).lerp(C.white, 0.25));
    }
    const dist = (a: number, b: number) =>
      Math.hypot(
        npos[a * 3] - npos[b * 3],
        npos[a * 3 + 1] - npos[b * 3 + 1],
        npos[a * 3 + 2] - npos[b * 3 + 2],
      );
    const seen = new Set<number>();
    const deg = new Array(NN).fill(0);
    const addEdge = (a: number, b: number) => {
      if (a === b) return;
      const k = a < b ? a * 1000 + b : b * 1000 + a;
      if (seen.has(k)) return;
      seen.add(k);
      edges.push([a, b]);
      deg[a]++;
      deg[b]++;
    };
    // each person links to their two closest neighbours…
    for (let i = 0; i < NN; i++) {
      const order = Array.from({ length: NN }, (_, j) => j)
        .filter((j) => j !== i)
        .sort((a, b) => dist(i, a) - dist(i, b));
      addEdge(i, order[0]);
      addEdge(i, order[1]);
    }
    // …plus a few bridges between communities
    const bridges = Math.round(6 * q) + 2;
    for (let k = 0; k < bridges; k++) {
      const a = Math.floor(rand() * NN);
      let b = Math.floor(rand() * NN);
      for (let tries = 0; tries < 20 && comm[a] === comm[b]; tries++) b = Math.floor(rand() * NN);
      addEdge(a, b);
    }

    network.add(mkPoints(npos, ncol, 0.11, 0.9));

    // hubs (well-connected nodes) glow brighter
    const hubIdx = deg.map((d, i) => (d >= 4 ? i : -1)).filter((i) => i >= 0);
    if (hubIdx.length) {
      const hp = new Float32Array(hubIdx.length * 3);
      const hc = new Float32Array(hubIdx.length * 3);
      hubIdx.forEach((n, i) => {
        hp.set([npos[n * 3], npos[n * 3 + 1], npos[n * 3 + 2]], i * 3);
        setCol(hc, i, C.white);
      });
      network.add(mkPoints(hp, hc, 0.22, 0.95));
    }

    // edges
    const lp = new Float32Array(edges.length * 6);
    const lc = new Float32Array(edges.length * 6);
    edges.forEach(([a, b], i) => {
      lp.set([npos[a * 3], npos[a * 3 + 1], npos[a * 3 + 2]], i * 6);
      lp.set([npos[b * 3], npos[b * 3 + 1], npos[b * 3 + 2]], i * 6 + 3);
      lc.set([ncol[a * 3], ncol[a * 3 + 1], ncol[a * 3 + 2]], i * 6);
      lc.set([ncol[b * 3], ncol[b * 3 + 1], ncol[b * 3 + 2]], i * 6 + 3);
    });
    network.add(mkLines(lp, lc, 0.22));

    // signals travelling between people
    const P = Math.round(10 * q);
    const pp = new Float32Array(P * 3);
    const pc = new Float32Array(P * 3);
    for (let i = 0; i < P; i++) {
      packets.push({
        e: Math.floor(rand() * edges.length),
        t: rand(),
        speed: 0.25 + rand() * 0.35,
        dir: rand() > 0.5 ? 1 : -1,
      });
      setCol(pc, i, C.white);
    }
    const packetPts = mkPoints(pp, pc, 0.16, 1);
    packetAttr = packetPts.geometry.getAttribute("position") as BufferAttribute;
    network.add(packetPts);
  }
  scene.add(network);

  /* =========================================================
   * 4. FLOATING SYMBOLS — π ∑ ∫ H₂O σ …
   * ======================================================= */
  const tints = [C.violet, C.magenta, C.orange, C.white];
  const glyphs: { sprite: Sprite; baseY: number; speed: number; phase: number }[] = [];
  {
    const count = Math.min(GLYPHS.length, coarse ? 8 : GLYPHS.length);
    for (let i = 0; i < count; i++) {
      const cv = document.createElement("canvas");
      cv.width = cv.height = 128;
      const ctx = cv.getContext("2d")!;
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `600 ${GLYPHS[i].length > 2 ? 44 : 72}px "Times New Roman", Georgia, serif`;
      ctx.fillText(GLYPHS[i], 64, 68);
      const tex = own(new THREE.CanvasTexture(cv));
      tex.colorSpace = THREE.SRGBColorSpace;
      const mat = own(
        new THREE.SpriteMaterial({
          map: tex,
          color: tints[i % tints.length],
          transparent: true,
          opacity: 0.14 + rand() * 0.14,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      const sprite = new THREE.Sprite(mat);
      const s = 0.55 + rand() * 0.5;
      sprite.scale.set(s, s, 1);
      const x = (rand() - 0.5) * 18;
      const y = (rand() - 0.5) * 9;
      sprite.position.set(x, y, -4 + rand() * 4);
      scene.add(sprite);
      glyphs.push({ sprite, baseY: y, speed: 0.25 + rand() * 0.3, phase: rand() * Math.PI * 2 });
    }
  }

  /* ---------- responsive layout ---------- */
  const layout = () => {
    const aspect = mount.clientWidth / Math.max(1, mount.clientHeight);
    const halfH = Math.tan(THREE.MathUtils.degToRad(55 / 2)) * camera.position.z;
    const halfW = halfH * aspect;

    if (aspect >= 1.15) {
      const sc = Math.min(1, aspect / 1.8);
      atom.position.set(-halfW * 0.68, halfH * 0.28, -1);
      atom.scale.setScalar(sc);
      maths.position.set(halfW * 0.68, halfH * 0.2, -1.5);
      maths.scale.setScalar(sc * 0.9);
      network.position.set(0, -halfH * 0.72, -2.5);
      network.scale.setScalar(Math.min(1, halfW / 7));
      dna.visible = aspect > 1.5;
      dna.position.set(halfW * 0.8, -halfH * 0.55, -1);
      dna.scale.setScalar(sc * 0.8);
    } else {
      // portrait / phone: symbols sit in the top corners, network along the bottom
      atom.position.set(-halfW * 0.5, halfH * 0.62, -1);
      atom.scale.setScalar((halfW * 0.42) / A);
      maths.position.set(halfW * 0.5, halfH * 0.58, -1.5);
      maths.scale.setScalar((halfW * 0.42) / 2.7);
      network.position.set(0, -halfH * 0.7, -2.5);
      network.scale.setScalar((halfW * 0.9) / 4);
      dna.visible = false;
    }
  };
  layout();

  /* ---------- per-frame update ---------- */
  const mouse = { x: 0, y: 0 };
  let lastT = 0;

  const update = (time: number) => {
    const dt = Math.min(0.05, Math.max(0, time - lastT));
    lastT = time;

    dust.rotation.y = time * 0.01;
    dust.rotation.x = time * 0.004;

    maths.rotation.y = time * 0.14;
    maths.rotation.x = Math.sin(time * 0.2) * 0.25;

    atom.rotation.y = time * 0.08;
    electrons.forEach((el, k) => {
      for (let j = 0; j < 2; j++) {
        const a = time * el.speed + el.phase + j * Math.PI;
        el.attr.setXYZ(j, Math.cos(a) * A, Math.sin(a) * B, 0);
      }
      el.attr.needsUpdate = true;
      void k;
    });

    dna.rotation.y = time * 0.35;

    network.rotation.y = Math.sin(time * 0.15) * 0.35;
    if (packetAttr) {
      packets.forEach((p, i) => {
        p.t += dt * p.speed;
        if (p.t > 1) {
          p.t = 0;
          p.e = Math.floor(rand() * edges.length);
          p.dir = rand() > 0.5 ? 1 : -1;
        }
        const [a, b] = p.dir === 1 ? edges[p.e] : [edges[p.e][1], edges[p.e][0]];
        packetAttr!.setXYZ(
          i,
          npos[a * 3] + (npos[b * 3] - npos[a * 3]) * p.t,
          npos[a * 3 + 1] + (npos[b * 3 + 1] - npos[a * 3 + 1]) * p.t,
          npos[a * 3 + 2] + (npos[b * 3 + 2] - npos[a * 3 + 2]) * p.t,
        );
      });
      packetAttr.needsUpdate = true;
    }

    glyphs.forEach((g) => {
      g.sprite.position.y = g.baseY + Math.sin(time * g.speed + g.phase) * 0.3;
      g.sprite.material.rotation = Math.sin(time * 0.3 + g.phase) * 0.2;
    });
  };

  const render = () => {
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  };

  /* ---------- events ---------- */
  const onMove = (e: PointerEvent) => {
    const r = mount.getBoundingClientRect();
    mouse.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    mouse.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
  };

  let visible = true;
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
  });
  io.observe(mount);

  const onResize = () => {
    camera.aspect = mount.clientWidth / Math.max(1, mount.clientHeight);
    camera.updateProjectionMatrix();
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    layout();
    if (reduced) {
      update(0);
      render();
    }
  };
  window.addEventListener("resize", onResize);

  if (reduced) {
    // Accessibility: static frame only when the OS asks for less motion.
    update(0);
    render();
  } else {
    window.addEventListener("pointermove", onMove, { passive: true });
    renderer.setAnimationLoop((ms: number) => {
      if (!visible) return;
      update(ms * 0.001);
      camera.position.x += (mouse.x * 0.9 - camera.position.x) * 0.04;
      camera.position.y += (-mouse.y * 0.5 - camera.position.y) * 0.04;
      render();
    });
  }

  /* ---------- teardown ---------- */
  return () => {
    renderer.setAnimationLoop(null);
    io.disconnect();
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("resize", onResize);
    scene.clear();
    disposables.forEach((d) => d.dispose());
    renderer.dispose();
    renderer.forceContextLoss();
    if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
  };
}

export default function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const mount = mountRef.current;
    if (!mount) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    import("three").then((THREE) => {
      if (cancelled || !mount.isConnected) return;
      cleanup = createScene(THREE, mount);
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [mounted]);

  if (!mounted) return <div aria-hidden className="absolute inset-0" />;
  return <div ref={mountRef} aria-hidden className="absolute inset-0" />;
}