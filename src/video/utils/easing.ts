/** Ease in-out cubic */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Ease out quad */
export function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

/** Ease out elastic — great for bouncy cursor landing */
export function easeOutElastic(t: number): number {
  if (t === 0 || t === 1) return t;
  const c4 = (2 * Math.PI) / 3;
  return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

/** Smooth step (Hermite interpolation) */
export function smoothStep(t: number): number {
  return t * t * (3 - 2 * t);
}
