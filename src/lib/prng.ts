export function generateSeededIndices(seed: number, count: number, maxRange: number): number[] {
  let currentSeed = seed;

  const random = () => {
    let t = (currentSeed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const indices: number[] = [];
  for (let i = 0; i < count; i++) {
    indices.push(Math.floor(random() * maxRange));
  }
  return indices;
}

export function generateGameSeed(): number {
  return Math.floor(Math.random() * 2147483647);
}
