import { useEffect, useRef } from 'react';

// Simplex noise in JS (2D)
// Based on Stefan Gustavson's implementation
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;
const GRAD = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];

function buildPermTable() {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = p[i]; p[i] = p[j]; p[j] = tmp;
  }
  const perm = new Uint8Array(512);
  const permMod8 = new Uint8Array(512);
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
    permMod8[i] = perm[i] % 8;
  }
  return { perm, permMod8 };
}

const { perm, permMod8 } = buildPermTable();

function noise2D(x, y) {
  const s = (x + y) * F2;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);
  const t = (i + j) * G2;
  const x0 = x - (i - t);
  const y0 = y - (j - t);

  const i1 = x0 > y0 ? 1 : 0;
  const j1 = x0 > y0 ? 0 : 1;
  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1 + 2 * G2;
  const y2 = y0 - 1 + 2 * G2;

  const ii = i & 255;
  const jj = j & 255;

  let n0 = 0, n1 = 0, n2 = 0;

  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 >= 0) {
    const g = GRAD[permMod8[ii + perm[jj]]];
    t0 *= t0;
    n0 = t0 * t0 * (g[0] * x0 + g[1] * y0);
  }

  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 >= 0) {
    const g = GRAD[permMod8[ii + i1 + perm[jj + j1]]];
    t1 *= t1;
    n1 = t1 * t1 * (g[0] * x1 + g[1] * y1);
  }

  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 >= 0) {
    const g = GRAD[permMod8[ii + 1 + perm[jj + 1]]];
    t2 *= t2;
    n2 = t2 * t2 * (g[0] * x2 + g[1] * y2);
  }

  return 70 * (n0 + n1 + n2);
}

function fbm(x, y, octaves) {
  let v = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < octaves; i++) {
    v += amp * noise2D(x * freq, y * freq);
    freq *= 2;
    amp *= 0.5;
  }
  return v;
}

function getScale() {
  if (typeof window === 'undefined') return 0.25;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  return isTouch ? 0.15 : 0.25;
}

export function ShaderBackground({ isAwakened = false }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const awakenedRef = useRef(0);
  const targetRef = useRef(0);

  useEffect(() => {
    targetRef.current = isAwakened ? 1.0 : 0.0;
  }, [isAwakened]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scale = getScale();
    let w = 0;
    let h = 0;
    let imageData = null;

    const resize = () => {
      w = Math.floor(canvas.clientWidth * scale);
      h = Math.floor(canvas.clientHeight * scale);
      canvas.width = w;
      canvas.height = h;
      imageData = ctx.createImageData(w, h);
    };
    resize();

    let resizeTimer = null;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    };
    window.addEventListener('resize', onResize);

    let visible = true;
    const onVisibility = () => { visible = !document.hidden; };
    document.addEventListener('visibilitychange', onVisibility);

    const startTime = Date.now();
    let lastFrame = 0;

    const render = (now) => {
      rafRef.current = requestAnimationFrame(render);
      if (!visible || !imageData) return;

      // Throttle to ~15fps for performance (subtle bg doesn't need 60fps)
      if (now - lastFrame < 66) return;
      lastFrame = now;

      // Smooth lerp awakened
      awakenedRef.current += (targetRef.current - awakenedRef.current) * 0.03;
      const aw = awakenedRef.current;

      const t = (Date.now() - startTime) / 1000 * 0.04;
      const data = imageData.data;
      const aspect = w / h;

      for (let y = 0; y < h; y++) {
        const uy = y / h;
        for (let x = 0; x < w; x++) {
          const ux = x / w;
          const px = ux * aspect;
          const py = uy;

          const n1 = fbm(px * 3 + t, py * 3 + t * 0.7, 3);
          const n2 = fbm(px * 5 - t * 0.5, py * 5 - t * 0.3, 2);
          const n = (n1 + n2 * 0.5) * 0.5 + 0.5;

          // Vignette
          const dx = ux - 0.5;
          const dy = uy - 0.5;
          const dist = Math.sqrt(dx * dx + dy * dy) * 1.4;
          const vig = Math.max(0, 1 - smoothstep(0.3, 1.2, dist));

          // dormant: cold blue-gray, awakened: dark red
          const dr = (0.025 + n * 0.06) * vig;
          const dg = (0.030 + n * 0.06) * vig;
          const db = (0.055 + n * 0.09) * vig;
          const ar = (0.055 + n * 0.09) * vig;
          const ag = (0.018 + n * 0.03) * vig;
          const ab = (0.020 + n * 0.035) * vig;

          const r = lerp(dr, ar, aw);
          const g = lerp(dg, ag, aw);
          const b = lerp(db, ab, aw);

          const idx = (y * w + x) * 4;
          data[idx]     = Math.floor(r * 255);
          data[idx + 1] = Math.floor(g * 255);
          data[idx + 2] = Math.floor(b * 255);
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{
        pointerEvents: 'none',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#020202',
        imageRendering: 'auto',
      }}
      aria-hidden="true"
    />
  );
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}
