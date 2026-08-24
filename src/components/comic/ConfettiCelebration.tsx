'use client';

import confetti from 'canvas-confetti';

export function triggerComicConfetti(universe: 'mcu' | 'dcu' = 'mcu') {
  const colors =
    universe === 'mcu'
      ? ['#E62429', '#F59E0B', '#FF3366', '#FFD700', '#FFFFFF', '#141624']
      : ['#00EAFF', '#005792', '#FBBF24', '#00D2D3', '#FFFFFF', '#080E1E'];

  // Left comic cannon
  confetti({
    particleCount: 100,
    angle: 60,
    spread: 80,
    origin: { x: 0.05, y: 0.75 },
    colors,
    zIndex: 99999,
    scalar: 1.2,
    ticks: 250,
  });

  // Right comic cannon
  confetti({
    particleCount: 100,
    angle: 120,
    spread: 80,
    origin: { x: 0.95, y: 0.75 },
    colors,
    zIndex: 99999,
    scalar: 1.2,
    ticks: 250,
  });

  // Center star burst
  setTimeout(() => {
    confetti({
      particleCount: 70,
      spread: 100,
      origin: { x: 0.5, y: 0.5 },
      colors,
      zIndex: 99999,
      scalar: 1.4,
      ticks: 200,
    });
  }, 200);
}

export function triggerGrandCelebration(universe: 'mcu' | 'dcu' = 'mcu') {
  const duration = 3.5 * 1000;
  const animationEnd = Date.now() + duration;
  const colors =
    universe === 'mcu'
      ? ['#E62429', '#F59E0B', '#FF3366', '#FFD700', '#FFFFFF']
      : ['#00EAFF', '#005792', '#FBBF24', '#00D2D3', '#FFFFFF'];

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
      zIndex: 99999,
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
      zIndex: 99999,
    });

    if (Date.now() < animationEnd) {
      requestAnimationFrame(frame);
    }
  };

  frame();
}
