/** Hero 3D backdrop — a floating study desk, built entirely from primitives.
 *
 *   Open book with pages that keep turning (the one memorable element)
 *   Stack of books · graduation cap · pencils · idea lightbulb · set square
 *   Loose ruled sheets drifting in the depth
 *
 * Drop-in replacement for <HeroVideo />: same wrapper, same readability
 * gradients, no network requests, no attribution needed.
 *
 * Hydration-safe: first render (server AND client) is the plain dark layer
 * plus gradients. three.js loads post-mount via dynamic import, so it never
 * enters the SSR tree or the initial bundle.
 * Optimized: DPR capped, single animation loop, pause when offscreen,
 * fewer objects on touch devices, full dispose on unmount,
 * static frame for reduced motion.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import type * as T from "three";
import { reducedMotion } from "../lib/motion";

type Three = typeof import("three");

const COL = {
  violet: "#6a4cf5",
  magenta: "#d44df0",
  orange: "#ff7a3d",
  navy: "#2a2170",
  base: "#090909",
};

/** Small deterministic PRNG so the layout is identical on every load. */
function makeRng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One floating object and where it lives on screen. */
interface Item {
  root: T.Group;
  anchor: [number, number]; // desktop position in normalised screen coords (-1…1)
  portrait?: [number, number]; // optional different position on tall/narrow screens
  hideOnPortrait?: boolean;
  z: number;
  size: number;
  rot: [number, number, number]; // resting rotation
  spin: [number, number, number]; // rad/s
  sway: number; // gentle ±rad swing on Y (for objects that shouldn't fully turn)
  amp: number; // bob height
  speed: number;
  phase: number;
  base: T.Vector3;
}

function createScene(THREE: Three, mount: HTMLElement): () => void {
  const rand = makeRng(11);
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const reduced = reducedMotion();

  /* ---------- renderer / scene / camera ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(COL.base, 10, 26); // far objects melt into the dark base
  const camera = new THREE.PerspectiveCamera(
    50,
    mount.clientWidth / Math.max(1, mount.clientHeight),
    0.1,
    60,
  );
  camera.position.z = 10;

  /* ---------- lights: violet sky, warm key from the right, magenta rim ---------- */
  scene.add(new THREE.HemisphereLight(0x8f7bff, 0x120a24, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-4, 6, 6);
  scene.add(key);
  const warm = new THREE.PointLight(0xff7a3d, 180, 40, 2);
  warm.position.set(7, -3, 3);
  scene.add(warm);
  const rim = new THREE.PointLight(0xd44df0, 150, 40, 2);
  rim.position.set(-7, 4, 2);
  scene.add(rim);

  /* ---------- textures ---------- */
  // Ruled notebook paper with faint "handwriting" dashes
  const paperCv = document.createElement("canvas");
  paperCv.width = 256;
  paperCv.height = 340;
  {
    const ctx = paperCv.getContext("2d")!;
    ctx.fillStyle = "#f3efe6";
    ctx.fillRect(0, 0, 256, 340);
    for (let y = 60; y < 330; y += 22) {
      ctx.strokeStyle = "rgba(106,76,245,0.28)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(18, y);
      ctx.lineTo(238, y);
      ctx.stroke();
      ctx.fillStyle = "rgba(30,30,70,0.32)";
      let x = 54;
      while (x < 220) {
        const w = 8 + rand() * 26;
        ctx.fillRect(x, y - 6, Math.min(w, 226 - x), 3);
        x += w + 6;
      }
    }
    ctx.strokeStyle = "rgba(212,77,240,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(44, 0);
    ctx.lineTo(44, 340);
    ctx.stroke();
  }
  const paperTex = new THREE.CanvasTexture(paperCv);
  paperTex.colorSpace = THREE.SRGBColorSpace;

  // Soft glow
  const glowCv = document.createElement("canvas");
  glowCv.width = glowCv.height = 128;
  {
    const ctx = glowCv.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,0.9)");
    g.addColorStop(0.35, "rgba(255,255,255,0.28)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  }
  const glowTex = new THREE.CanvasTexture(glowCv);
  glowTex.colorSpace = THREE.SRGBColorSpace;

  /* ---------- tiny builders ---------- */
  const mat = (hex: string, extra: T.MeshStandardMaterialParameters = {}) =>
    new THREE.MeshStandardMaterial({ color: hex, roughness: 0.6, metalness: 0.05, ...extra });

  const box = (w: number, h: number, d: number, m: T.Material, x = 0, y = 0, z = 0) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    return mesh;
  };

  const glowSprite = (hex: string, scale: number, opacity: number) => {
    const s = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex,
        color: hex,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    s.scale.set(scale, scale, 1);
    return s;
  };

  const pageMat = mat("#e9e3d3", { roughness: 0.9 });

  /* ---------- 1. closed book ---------- */
  const buildBook = (cover: string) => {
    const g = new THREE.Group();
    const cm = mat(cover, { roughness: 0.5 });
    g.add(box(1.5, 0.24, 1.1, pageMat, 0.03, 0, 0));
    g.add(box(1.6, 0.04, 1.15, cm, 0, 0.14, 0));
    g.add(box(1.6, 0.04, 1.15, cm, 0, -0.14, 0));
    g.add(box(0.06, 0.32, 1.15, cm, -0.77, 0, 0));
    return g;
  };

  const buildStack = () => {
    const g = new THREE.Group();
    const covers = [COL.violet, COL.magenta, COL.orange];
    covers.forEach((c, i) => {
      const b = buildBook(c);
      b.position.set((rand() - 0.5) * 0.18, i * 0.34, 0);
      b.rotation.y = (rand() - 0.5) * 0.5;
      g.add(b);
    });
    g.position.y = -0.3;
    const wrap = new THREE.Group();
    wrap.add(g);
    return wrap;
  };

  /* ---------- 2. open book with turning pages ---------- */
  const flips: { pivot: T.Group; mesh: T.Mesh; mat: T.MeshStandardMaterial; phase: number; lift: number }[] = [];
  const buildOpenBook = () => {
    const g = new THREE.Group();
    g.add(box(2.9, 0.06, 1.9, mat(COL.violet, { roughness: 0.5 }), 0, -0.1, 0));
    g.add(box(1.32, 0.12, 1.7, pageMat, -0.68, -0.01, 0));
    g.add(box(1.32, 0.12, 1.7, pageMat, 0.68, -0.01, 0));

    // ruled sheets lying on top of each stack
    for (const x of [-0.66, 0.66]) {
      const geo = new THREE.PlaneGeometry(1.28, 1.66);
      geo.rotateX(-Math.PI / 2);
      const sheet = new THREE.Mesh(geo, mat("#ffffff", { map: paperTex, roughness: 0.9 }));
      sheet.position.set(x, 0.052, 0);
      g.add(sheet);
    }

    // pages that keep turning from right to left
    const PAGES = 4;
    for (let i = 0; i < PAGES; i++) {
      const pm = new THREE.MeshStandardMaterial({
        map: paperTex,
        side: THREE.DoubleSide,
        roughness: 0.9,
        transparent: true,
        color: 0xe0e0e0,
      });
      const geo = new THREE.PlaneGeometry(1.3, 1.7);
      geo.rotateX(-Math.PI / 2);
      geo.translate(0.65, 0, 0); // pivot at the spine
      const mesh = new THREE.Mesh(geo, pm);
      const pivot = new THREE.Group();
      const lift = 0.06 + i * 0.004;
      pivot.position.set(0, lift, 0);
      pivot.add(mesh);
      g.add(pivot);
      flips.push({ pivot, mesh, mat: pm, phase: i / PAGES, lift });
    }

    g.add(glowSprite(COL.violet, 9, 0.22)).position.set(0, 0.2, -0.8);
    return g;
  };

  /* ---------- 3. graduation cap ---------- */
  const buildCap = () => {
    const g = new THREE.Group();
    const navy = mat(COL.navy, { roughness: 0.7, side: THREE.DoubleSide });
    const board = box(1.5, 0.06, 1.5, navy, 0, 0.3, 0);
    board.rotation.y = Math.PI / 4;
    g.add(board);
    const skull = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.52, 0.36, 28, 1, true), navy);
    skull.position.y = 0.1;
    g.add(skull);
    const gold = mat("#ffb35a", { roughness: 0.4, metalness: 0.4 });
    const button = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 16), gold);
    button.position.y = 0.35;
    g.add(button);
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.05, 6), gold);
    cord.rotation.z = Math.PI / 2;
    cord.position.set(0.52, 0.345, 0);
    g.add(cord);
    const tassel = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.03, 0.3, 12), mat(COL.orange));
    tassel.position.set(1.05, 0.2, 0);
    g.add(tassel);
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 12), gold);
    knot.position.set(1.05, 0.35, 0);
    g.add(knot);
    g.position.x = -0.5;
    const wrap = new THREE.Group();
    wrap.add(g);
    return wrap;
  };

  /* ---------- 4. pencil ---------- */
  const buildPencil = (body: string) => {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 6), mat(body, { roughness: 0.45 })));
    const wood = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.26, 6), mat("#e8c9a0"));
    wood.position.y = 0.83;
    g.add(wood);
    const lead = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.09, 6), mat("#222230"));
    lead.position.y = 0.97;
    g.add(lead);
    const ferrule = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.085, 0.12, 16),
      mat("#b8bcc8", { metalness: 0.8, roughness: 0.3 }),
    );
    ferrule.position.y = -0.74;
    g.add(ferrule);
    const eraser = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.14, 16), mat("#f08aa8"));
    eraser.position.y = -0.87;
    g.add(eraser);
    return g;
  };

  /* ---------- 5. idea lightbulb ---------- */
  const bulbGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0xffe3b8,
    transparent: true,
    opacity: 0.38,
    roughness: 0.1,
    emissive: 0xff9a3d,
    emissiveIntensity: 0.6,
  });
  const bulbGlow = glowSprite(COL.orange, 3.6, 0.45);
  const buildBulb = () => {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.45, 32, 24), bulbGlassMat));
    g.add(
      new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffc26b })),
    );
    const metal = mat("#9aa0b4", { metalness: 0.8, roughness: 0.35 });
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.28, 0.25, 20), metal);
    neck.position.y = -0.5;
    g.add(neck);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.18, 20), mat("#3b3850"));
    cap.position.y = -0.69;
    g.add(cap);
    g.add(bulbGlow);
    return g;
  };

  /* ---------- 6. set square (maths) ---------- */
  const buildSetSquare = () => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(1.6, 0);
    shape.lineTo(0, 0.92);
    shape.lineTo(0, 0);
    const hole = new THREE.Path();
    hole.moveTo(0.28, 0.2);
    hole.lineTo(0.9, 0.2);
    hole.lineTo(0.28, 0.55);
    hole.lineTo(0.28, 0.2);
    shape.holes.push(hole);
    const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.05, bevelEnabled: false });
    geo.center();
    const m = new THREE.MeshPhysicalMaterial({
      color: 0xa98bff,
      transparent: true,
      opacity: 0.55,
      roughness: 0.2,
      side: THREE.DoubleSide,
    });
    const g = new THREE.Group();
    g.add(new THREE.Mesh(geo, m));
    return g;
  };

  /* ---------- 7. loose ruled sheet ---------- */
  const buildSheet = () => {
    const g = new THREE.Group();
    const m = new THREE.MeshStandardMaterial({
      map: paperTex,
      side: THREE.DoubleSide,
      roughness: 0.9,
      transparent: true,
      opacity: 0.55,
      color: 0xd0d0d0,
    });
    g.add(new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.2), m));
    return g;
  };

  /* ---------- assemble ---------- */
  const items: Item[] = [];
  const add = (root: T.Group, o: Partial<Item> & Pick<Item, "anchor" | "z" | "size">) => {
    const item: Item = {
      root,
      rot: [0, 0, 0],
      spin: [0, 0, 0],
      sway: 0,
      amp: 0.2,
      speed: 0.4,
      phase: rand() * Math.PI * 2,
      base: new THREE.Vector3(),
      ...o,
    };
    scene.add(root);
    items.push(item);
    return item;
  };

  add(buildOpenBook(), {
    anchor: [0.5, -0.42], portrait: [0, -0.62], z: -3, size: 1.55,
    rot: [0.62, -0.45, 0.05], sway: 0.3, amp: 0.15, speed: 0.45,
  });
  add(buildStack(), {
    anchor: [-0.62, -0.5], z: -4, size: 1.6, hideOnPortrait: true,
    rot: [0.3, 0.6, 0.08], sway: 0.2,
  });
  add(buildCap(), {
    anchor: [-0.45, 0.55], portrait: [-0.55, 0.62], z: -4.5, size: 1.7,
    rot: [0.4, 0, 0.15], spin: [0, 0.22, 0], amp: 0.3,
  });
  add(buildBulb(), {
    anchor: [0.7, 0.5], portrait: [0.58, 0.58], z: -4, size: 1.6,
    rot: [0, 0, 0.2], sway: 0.25, amp: 0.25, speed: 0.5,
  });
  add(buildSetSquare(), {
    anchor: [0.12, 0.78], z: -7, size: 1.9, hideOnPortrait: true,
    rot: [0.5, 0.3, 0.4], spin: [0.05, 0.12, 0.08],
  });
  add(buildPencil(COL.orange), {
    anchor: [-0.88, 0.05], portrait: [0.75, 0.0], z: -6, size: 1.7,
    rot: [0.2, 0, 0.9], spin: [0, 0.35, 0],
  });
  add(buildPencil(COL.violet), {
    anchor: [0.92, -0.15], z: -7, size: 1.7, hideOnPortrait: true,
    rot: [0.5, 0, -0.7], spin: [0, -0.3, 0],
  });
  add(buildPencil(COL.magenta), {
    anchor: [0.05, -0.85], z: -8, size: 1.7, hideOnPortrait: true,
    rot: [0, 0, 1.4], spin: [0, 0.28, 0],
  });

  // drifting sheets across the depth, kept off the centre where the headline sits
  const sheetCount = coarse ? 5 : 10;
  for (let i = 0; i < sheetCount; i++) {
    let nx = 0;
    let ny = 0;
    for (let tries = 0; tries < 20; tries++) {
      nx = (rand() - 0.5) * 1.9;
      ny = (rand() - 0.5) * 1.8;
      if (Math.abs(nx) > 0.3 || Math.abs(ny) > 0.45) break;
    }
    const it = add(buildSheet(), {
      anchor: [nx, ny], z: -5 - rand() * 5, size: 0.9 + rand() * 0.6,
      rot: [rand() * 2, rand() * 2, rand() * 2],
      spin: [(rand() - 0.5) * 0.15, (rand() - 0.5) * 0.15, (rand() - 0.5) * 0.1],
      amp: 0.3, speed: 0.2 + rand() * 0.3,
    });
    it.hideOnPortrait = i >= 4;
  }

  /* ---------- responsive layout ---------- */
  let fit = 1;
  const layout = () => {
    const aspect = mount.clientWidth / Math.max(1, mount.clientHeight);
    const portrait = aspect < 1.1;
    fit = Math.min(1, Math.max(0.5, aspect / 1.7));
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    items.forEach((it) => {
      it.root.visible = !(portrait && it.hideOnPortrait);
      const [nx, ny] = portrait && it.portrait ? it.portrait : it.anchor;
      const halfH = tanHalf * (camera.position.z - it.z);
      const halfW = halfH * aspect;
      it.base.set(nx * halfW * 0.92, ny * halfH * 0.92, it.z);
      it.root.scale.setScalar(it.size * fit);
    });
  };
  layout();

  /* ---------- per-frame update ---------- */
  const smooth = (k: number) => k * k * (3 - 2 * k);
  const CYCLE = 9; // seconds per page

  const update = (time: number) => {
    items.forEach((it) => {
      it.root.position.set(
        it.base.x,
        it.base.y + Math.sin(time * it.speed + it.phase) * it.amp,
        it.base.z,
      );
      it.root.rotation.set(
        it.rot[0] + time * it.spin[0],
        it.rot[1] + time * it.spin[1] + Math.sin(time * 0.25 + it.phase) * it.sway,
        it.rot[2] + time * it.spin[2],
      );
    });

    // turning pages: flip right → left, rest, fade, reappear on the right
    flips.forEach((f) => {
      const p = (time / CYCLE + f.phase) % 1;
      let theta = Math.PI;
      let opacity = 1;
      if (p < 0.45) {
        const k = p / 0.45;
        theta = smooth(k) * Math.PI;
        opacity = smooth(Math.min(1, p / 0.05));
      } else if (p > 0.9) {
        opacity = 1 - (p - 0.9) / 0.1;
      }
      f.pivot.rotation.z = theta;
      f.pivot.position.y = f.lift + Math.sin(theta) * 0.05;
      f.mesh.rotation.x = Math.sin(theta) * 0.1; // slight curl mid-turn
      f.mat.opacity = opacity;
    });

    // idea bulb pulse
    const pulse = Math.sin(time * 1.4);
    bulbGlassMat.emissiveIntensity = 0.55 + pulse * 0.25;
    bulbGlow.material.opacity = 0.4 + pulse * 0.15;
  };

  const render = () => {
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  };

  /* ---------- events ---------- */
  const mouse = { x: 0, y: 0 };
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
      update(3);
      render();
    }
  };
  window.addEventListener("resize", onResize);

  if (reduced) {
    // Accessibility: static frame only when the OS asks for less motion.
    update(3);
    render();
  } else {
    window.addEventListener("pointermove", onMove, { passive: true });
    renderer.setAnimationLoop((ms: number) => {
      if (!visible) return;
      update(ms * 0.001);
      camera.position.x += (mouse.x * 0.7 - camera.position.x) * 0.04;
      camera.position.y += (-mouse.y * 0.4 - camera.position.y) * 0.04;
      render();
    });
  }

  /* ---------- teardown ---------- */
  return () => {
    renderer.setAnimationLoop(null);
    io.disconnect();
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("resize", onResize);
    scene.traverse((o) => {
      const m = o as T.Mesh;
      m.geometry?.dispose();
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      mats.forEach((x) => x.dispose());
    });
    paperTex.dispose();
    glowTex.dispose();
    scene.clear();
    renderer.dispose();
    renderer.forceContextLoss();
    if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
  };
}

export default function HeroStudyBackdrop() {
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

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-[#090909]">
      {mounted && <div ref={mountRef} className="absolute inset-0" />}
      {/* Readability gradients over the 3D scene */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#090909]/60 via-[#090909]/30 to-[#090909]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_38%,transparent_30%,#090909_100%)]" />
    </div>
  );
}