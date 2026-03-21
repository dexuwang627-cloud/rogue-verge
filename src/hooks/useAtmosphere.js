import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------------------------
// Dormant baseline state — values used when no section is active
// ---------------------------------------------------------------------------
const DORMANT = {
  intensity: 0.25,
  noiseStrength: 0.4,
  speed: 0.8,
  spread: 1.2,
  colorR: 30,
  breathAmp: 0.1,
  convulse: 0,
  scale: 0.8,
};

// ---------------------------------------------------------------------------
// Awakened offsets applied on top of every tween target
// ---------------------------------------------------------------------------
const AWAKENED_INTENSITY_BONUS = 0.15;
const AWAKENED_COLOR_R_BONUS = 15;
const AWAKENED_HEARTBEAT_EXTRA_DECAY_S = 1;

// ---------------------------------------------------------------------------
// Utility: merge awakened bonuses into a state patch
// Heartbeat burst targets intentionally skip the bonus so the decay contrast
// stays dramatic — bonuses are applied to the decay (resting) target instead.
// ---------------------------------------------------------------------------
function applyAwakened(patch, isAwakened, { applyIntensity = true, applyColorR = true } = {}) {
  if (!isAwakened) return patch;
  const result = { ...patch };
  if (applyIntensity && result.intensity !== undefined) {
    result.intensity = result.intensity + AWAKENED_INTENSITY_BONUS;
  }
  if (applyColorR && result.colorR !== undefined) {
    result.colorR = result.colorR + AWAKENED_COLOR_R_BONUS;
  }
  return result;
}

// ---------------------------------------------------------------------------
// useAtmosphere
// ---------------------------------------------------------------------------
export function useAtmosphere({ isAwakened = false } = {}) {
  // acidState is a plain object mutated directly by GSAP — NOT React state
  const acidStateRef = useRef(null);
  if (acidStateRef.current === null) {
    acidStateRef.current = { ...DORMANT };
  }

  // Ref to pass to <HeartbeatFlash ref={flashRef} />
  const flashRef = useRef(null);

  // Track which heartbeats have already fired (only fire once per mount)
  const firedHeartbeats = useRef(new Set());

  // Store all ScrollTrigger instances created by this hook for targeted cleanup
  const triggerRefs = useRef([]);

  useEffect(() => {
    const acidState = acidStateRef.current;
    const triggers = triggerRefs.current;

    // ------------------------------------------------------------------
    // Helper: create a ScrollTrigger and store its reference
    // ------------------------------------------------------------------
    function makeTrigger(vars) {
      const st = ScrollTrigger.create(vars);
      triggers.push(st);
      return st;
    }

    // ------------------------------------------------------------------
    // #codex-opening — dormant baseline
    // ------------------------------------------------------------------
    makeTrigger({
      trigger: '#codex-opening',
      start: 'top top',
      end: 'bottom center',
      onEnter: () => {
        gsap.to(acidState, {
          ...applyAwakened(DORMANT, isAwakened),
          duration: 1.2,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      },
      onEnterBack: () => {
        gsap.to(acidState, {
          ...applyAwakened(DORMANT, isAwakened),
          duration: 1.2,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      },
    });

    // ------------------------------------------------------------------
    // #codex-genesis
    // ------------------------------------------------------------------
    const GENESIS_TARGET = {
      intensity: 0.45,
      noiseStrength: 0.6,
      speed: 1.0,
      spread: 1.0,
      colorR: 45,
      breathAmp: 0.15,
      scale: 1.0,
    };

    makeTrigger({
      trigger: '#codex-genesis',
      start: 'top center',
      end: 'bottom center',
      onEnter: () => {
        gsap.to(acidState, {
          ...applyAwakened(GENESIS_TARGET, isAwakened),
          duration: 1.5,
          ease: 'power2.inOut',
          overwrite: 'auto',
        });
      },
      onEnterBack: () => {
        gsap.to(acidState, {
          ...applyAwakened(GENESIS_TARGET, isAwakened),
          duration: 1.5,
          ease: 'power2.inOut',
          overwrite: 'auto',
        });
      },
      onLeaveBack: () => {
        gsap.to(acidState, {
          ...applyAwakened(DORMANT, isAwakened),
          duration: 1.2,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      },
    });

    // ------------------------------------------------------------------
    // #codex-heartbeat-1
    // Burst then decay. Only fires once per mount.
    // ------------------------------------------------------------------
    const HB1_BURST = {
      convulse: 1,
      intensity: 0.9,
      noiseStrength: 1.0,
      speed: 2.4,
      colorR: 80,
      breathAmp: 0.4,
      scale: 1.5,
    };
    const HB1_DECAY = {
      convulse: 0,
      intensity: 0.5,
      noiseStrength: 0.7,
      speed: 1.2,
      colorR: 50,
      breathAmp: 0.2,
      scale: 1.1,
    };

    makeTrigger({
      trigger: '#codex-heartbeat-1',
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter: () => {
        if (firedHeartbeats.current.has('hb1')) return;
        firedHeartbeats.current.add('hb1');

        // Burst
        gsap.to(acidState, {
          ...HB1_BURST,
          duration: 0.3,
          ease: 'power4.out',
          overwrite: 'auto',
          onStart: () => {
            flashRef.current?.trigger();
          },
        });

        // Decay
        const decayDuration = isAwakened
          ? 2.5 + AWAKENED_HEARTBEAT_EXTRA_DECAY_S
          : 2.5;
        gsap.to(acidState, {
          ...applyAwakened(HB1_DECAY, isAwakened),
          duration: decayDuration,
          delay: 0.5,
          ease: 'power2.out',
          overwrite: false,
        });
      },
    });

    // ------------------------------------------------------------------
    // #codex-manifesto
    // ------------------------------------------------------------------
    const MANIFESTO_TARGET = {
      intensity: 0.5,
      noiseStrength: 0.7,
      speed: 1.1,
      spread: 0.9,
      colorR: 50,
      breathAmp: 0.18,
      scale: 1.05,
    };

    makeTrigger({
      trigger: '#codex-manifesto',
      start: 'top center',
      end: 'bottom center',
      onEnter: () => {
        gsap.to(acidState, {
          ...applyAwakened(MANIFESTO_TARGET, isAwakened),
          duration: 1.5,
          ease: 'power2.inOut',
          overwrite: 'auto',
        });
      },
      onEnterBack: () => {
        gsap.to(acidState, {
          ...applyAwakened(MANIFESTO_TARGET, isAwakened),
          duration: 1.5,
          ease: 'power2.inOut',
          overwrite: 'auto',
        });
      },
    });

    // ------------------------------------------------------------------
    // #codex-heartbeat-2
    // Burst then decay. Only fires once per mount.
    // ------------------------------------------------------------------
    const HB2_BURST = {
      convulse: 1,
      intensity: 1.0,
      noiseStrength: 1.0,
      speed: 2.8,
      colorR: 100,
      breathAmp: 0.5,
      scale: 1.8,
      spread: 0.6,
    };
    const HB2_DECAY = {
      convulse: 0,
      intensity: 0.55,
      noiseStrength: 0.75,
      speed: 1.2,
      colorR: 55,
      breathAmp: 0.2,
      scale: 1.1,
      spread: 1.0,
    };

    makeTrigger({
      trigger: '#codex-heartbeat-2',
      start: 'top 60%',
      end: 'bottom 40%',
      onEnter: () => {
        if (firedHeartbeats.current.has('hb2')) return;
        firedHeartbeats.current.add('hb2');

        // Burst
        gsap.to(acidState, {
          ...HB2_BURST,
          duration: 0.2,
          ease: 'power4.out',
          overwrite: 'auto',
          onStart: () => {
            flashRef.current?.trigger();
          },
        });

        // Decay
        const decayDuration = isAwakened
          ? 3 + AWAKENED_HEARTBEAT_EXTRA_DECAY_S
          : 3;
        gsap.to(acidState, {
          ...applyAwakened(HB2_DECAY, isAwakened),
          duration: decayDuration,
          delay: 0.4,
          ease: 'power2.out',
          overwrite: false,
        });
      },
    });

    // ------------------------------------------------------------------
    // #codex-final
    // ------------------------------------------------------------------
    const FINAL_TARGET = {
      intensity: 0.2,
      noiseStrength: 0.5,
      speed: 0.6,
      spread: 1.5,
      colorR: 25,
      breathAmp: 0.08,
      scale: 0.6,
    };

    makeTrigger({
      trigger: '#codex-final',
      start: 'top center',
      end: 'bottom bottom',
      onEnter: () => {
        gsap.to(acidState, {
          ...applyAwakened(FINAL_TARGET, isAwakened),
          duration: 3,
          ease: 'power1.inOut',
          overwrite: 'auto',
        });
      },
      onEnterBack: () => {
        gsap.to(acidState, {
          ...applyAwakened(FINAL_TARGET, isAwakened),
          duration: 3,
          ease: 'power1.inOut',
          overwrite: 'auto',
        });
      },
    });

    // ------------------------------------------------------------------
    // Cleanup: kill only the triggers this hook created
    // ------------------------------------------------------------------
    return () => {
      triggers.forEach(st => st.kill());
      triggers.length = 0;
    };
  }, [isAwakened]); // re-run when awakened state changes

  return { acidState: acidStateRef.current, flashRef };
}
