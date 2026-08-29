/** Flip the mix twice a day. Same window => same order (ISR + pagination stay coherent). */
const WINDOW_MS = 12 * 60 * 60 * 1000;

export function rotationSeed(salt = 0): number {
  return Math.floor(Date.now() / WINDOW_MS) + salt;
}

/** Deterministic shuffle. Same seed always yields the same permutation. */
export function seededShuffle<T>(items: T[], seed: number): T[] {
  const out = items.slice();
  let s = (seed ^ Math.imul(out.length + 1, 0x9e3779b9)) >>> 0;
  if (s === 0) s = 1;
  for (let i = out.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

export function rotatePage<T>(pool: T[], take: number, skip = 0, salt = 0): T[] {
  if (!pool.length || take <= 0) return [];
  return seededShuffle(pool, rotationSeed(salt)).slice(skip, skip + take);
}

export const ROTATE_POOL_PAGES = 8;
