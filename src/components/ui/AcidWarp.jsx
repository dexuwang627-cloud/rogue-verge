import { useRef, useEffect } from 'react';
import { isTouchDevice } from '../../utils/device';

// ---------------------------------------------------------------------------
// Inline 2D Simplex Noise (no npm package)
// ---------------------------------------------------------------------------
const SIMPLEX_GRAD3 = [
  [1, 1], [-1, 1], [1, -1], [-1, -1],
  [1, 0], [-1, 0], [0, 1], [0, -1],
];

function buildPerm() {
  const p = [];
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  return perm;
}

function createSimplex() {
  const perm = buildPerm();
  const F2 = 0.5 * (Math.sqrt(3) - 1);
  const G2 = (3 - Math.sqrt(3)) / 6;

  function noise2D(xin, yin) {
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const x0 = xin - (i - t);
    const y0 = yin - (j - t);
    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2;
    const y2 = y0 - 1 + 2 * G2;
    const ii = i & 255;
    const jj = j & 255;
    const gi0 = perm[ii + perm[jj]] % 8;
    const gi1 = perm[ii + i1 + perm[jj + j1]] % 8;
    const gi2 = perm[ii + 1 + perm[jj + 1]] % 8;

    let n0 = 0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) { t0 *= t0; n0 = t0 * t0 * (SIMPLEX_GRAD3[gi0][0] * x0 + SIMPLEX_GRAD3[gi0][1] * y0); }
    let n1 = 0;
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) { t1 *= t1; n1 = t1 * t1 * (SIMPLEX_GRAD3[gi1][0] * x1 + SIMPLEX_GRAD3[gi1][1] * y1); }
    let n2 = 0;
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) { t2 *= t2; n2 = t2 * t2 * (SIMPLEX_GRAD3[gi2][0] * x2 + SIMPLEX_GRAD3[gi2][1] * y2); }
    return 70 * (n0 + n1 + n2);
  }

  return noise2D;
}

// ---------------------------------------------------------------------------
// Organism class — reduced to 3 organisms with 2-3 sub-blobs each
// ---------------------------------------------------------------------------
const ORGANISM_COUNT = 3;
const RESOLUTION_SCALE = 0.33; // render at 1/3 resolution, CSS scales up
const SAMPLE_STEP = 2; // sample every 2nd pixel at reduced resolution

class Organism {
  constructor(cx, cy, size, noise2D) {
    this.baseCx = cx;
    this.baseCy = cy;
    this.cx = cx;
    this.cy = cy;
    this.vx = (Math.random() - 0.5) * 0.48;
    this.vy = (Math.random() - 0.5) * 0.36;
    this.size = size;
    this.phase = Math.random() * Math.PI * 2;
    this.noiseOffset = Math.random() * 100;
    this.breathScale = 1;
    this.noise2D = noise2D;

    const count = 2 + Math.floor(Math.random() * 2); // 2-3 sub-blobs
    this.subs = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
      const dist = size * 0.3 * Math.random();
      this.subs.push({
        offsetX: Math.cos(angle) * dist,
        offsetY: Math.sin(angle) * dist,
        r: size * (0.4 + Math.random() * 0.4),
        phase: Math.random() * Math.PI * 2,
        noiseScale: 0.8 + Math.random() * 0.4,
      });
    }
  }

  update(t, state, canvasW, canvasH) {
    const spd = state.speed * 1.2;
    this.cx += this.vx * spd;
    this.cy += this.vy * spd;

    const spreadTarget = state.spread;
    const halfW = canvasW * 0.5;
    const halfH = canvasH * 0.5;
    const targetX = this.baseCx * spreadTarget + halfW * (1 - spreadTarget);
    const targetY = this.baseCy * spreadTarget + halfH * (1 - spreadTarget);
    this.cx += (targetX - this.cx) * 0.001 * spd;
    this.cy += (targetY - this.cy) * 0.001 * spd;

    const margin = this.size * 0.5;
    if (this.cx < margin) { this.cx = margin; this.vx = Math.abs(this.vx); }
    if (this.cx > canvasW - margin) { this.cx = canvasW - margin; this.vx = -Math.abs(this.vx); }
    if (this.cy < margin) { this.cy = margin; this.vy = Math.abs(this.vy); }
    if (this.cy > canvasH - margin) { this.cy = canvasH - margin; this.vy = -Math.abs(this.vy); }

    if (state.convulse > 0.1) {
      const shake = state.convulse * this.size * 0.4;
      this.cx += (Math.random() - 0.5) * shake;
      this.cy += (Math.random() - 0.5) * shake;
    }

    this.breathScale = state.scale * (1 + Math.sin(t * 0.48 * spd + this.phase) * state.breathAmp);
  }

  field(px, py, t, state) {
    let sum = 0;
    const spd = state.speed * 1.2;
    const nStr = state.noiseStrength;
    const noise2D = this.noise2D;

    for (const sub of this.subs) {
      const squirmX = Math.sin(t * 0.7 * spd + sub.phase) * this.size * 0.12;
      const squirmY = Math.cos(t * 0.5 * spd + sub.phase * 1.3) * this.size * 0.12;

      const subCx = this.cx + (sub.offsetX + squirmX) * this.breathScale;
      const subCy = this.cy + (sub.offsetY + squirmY) * this.breathScale;
      const subR = sub.r * this.breathScale;

      const dx = px - subCx;
      const dy = py - subCy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const noiseX = (px + this.noiseOffset + t * 0.12 * spd) * 0.008 * sub.noiseScale;
      const noiseY = (py + this.noiseOffset + t * 0.09 * spd) * 0.008 * sub.noiseScale;
      const nVal = noise2D(noiseX, noiseY);
      const distortedDist = Math.max(0.001, dist - nVal * subR * nStr * 0.6);

      if (distortedDist < subR * 2.5) {
        const ratio = subR / distortedDist;
        sum += ratio * ratio;
      }
    }

    return sum;
  }
}

// ---------------------------------------------------------------------------
// AcidWarp component — aggressively optimized
// ---------------------------------------------------------------------------
export function AcidWarp({ state }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(state);
  const rafRef = useRef(null);

  useEffect(() => {
    stateRef.current = state;
  });

  useEffect(() => {
    if (isTouchDevice) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const noise2D = createSimplex();

    let renderW = 0; // internal canvas resolution (1/3 of viewport)
    let renderH = 0;
    let viewW = 0; // actual viewport size
    let viewH = 0;
    let organisms = [];
    let isMounted = true;

    let cachedImageData = null;

    function resize() {
      viewW = window.innerWidth;
      viewH = window.innerHeight;
      renderW = Math.ceil(viewW * RESOLUTION_SCALE);
      renderH = Math.ceil(viewH * RESOLUTION_SCALE);
      canvas.width = renderW;
      canvas.height = renderH;
      cachedImageData = ctx.createImageData(renderW, renderH);
      spawnOrganisms();
    }

    function spawnOrganisms() {
      organisms = [];
      const baseSize = Math.min(renderW, renderH) * 0.22;
      for (let i = 0; i < ORGANISM_COUNT; i++) {
        const cx = renderW * (0.15 + Math.random() * 0.7);
        const cy = renderH * (0.15 + Math.random() * 0.7);
        const size = baseSize * (0.7 + Math.random() * 0.6);
        organisms.push(new Organism(cx, cy, size, noise2D));
      }
    }

    let startTime = null;

    function render(timestamp) {
      if (!isMounted) return;
      if (startTime === null) startTime = timestamp;
      const t = (timestamp - startTime) * 0.001;

      const s = stateRef.current;
      const intensity = (s.intensity ?? 0.3) * 0.9; // 10% lower transparency
      const colorR = s.colorR ?? 40;

      ctx.clearRect(0, 0, renderW, renderH);

      for (const org of organisms) {
        org.update(t, s, renderW, renderH);
      }

      const step = SAMPLE_STEP;
      const threshold = 1.0;
      cachedImageData.data.fill(0);
      const data = cachedImageData.data;

      for (let py = 0; py < renderH; py += step) {
        for (let px = 0; px < renderW; px += step) {
          let totalField = 0;
          for (const org of organisms) {
            totalField += org.field(px, py, t, s);
          }

          if (totalField > threshold) {
            const excess = Math.min((totalField - threshold) / threshold, 1);
            const alpha = Math.round(excess * intensity * 255);
            const r = Math.min(255, colorR + Math.round(excess * 80));
            const g = Math.round(excess * 6);
            const b = Math.round(excess * 8);

            for (let dy = 0; dy < step && py + dy < renderH; dy++) {
              for (let dx = 0; dx < step && px + dx < renderW; dx++) {
                const idx = ((py + dy) * renderW + (px + dx)) * 4;
                data[idx] = r;
                data[idx + 1] = g;
                data[idx + 2] = b;
                data[idx + 3] = alpha;
              }
            }
          }
        }
      }

      ctx.putImageData(cachedImageData, 0, 0);
      rafRef.current = requestAnimationFrame(render);
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      } else if (!rafRef.current && isMounted) {
        rafRef.current = requestAnimationFrame(render);
      }
    };

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibilityChange);
    resize();
    rafRef.current = requestAnimationFrame(render);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  if (isTouchDevice) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
        imageRendering: 'auto', // smooth upscale from 1/3 res
      }}
    />
  );
}
