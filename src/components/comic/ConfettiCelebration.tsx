'use client';

import confetti from 'canvas-confetti';

export function triggerComicConfetti(universe: 'mcu' | 'dcu' = 'mcu') {
  const colors =
    universe === 'mcu'
      ? ['#E62429', '#F59E0B', '#FF3366', '#FFFFFF', '#111217']
      : ['#00EAFF', '#005792', '#FBBF24', '#FFFFFF', '#080E1E'];

  // Left cannon
  confetti({
    particleCount: 80,
    angle: 60,
    spread: 70,
    origin: { x: 0.1, y: 0.8 },
    colors,
  });

  // Right cannon
  confetti({
    particleCount: 80,
    angle: 120,
    spread: 70,
    origin: { x: 0.9, y: 0.8 },
    colors,
  });
}
