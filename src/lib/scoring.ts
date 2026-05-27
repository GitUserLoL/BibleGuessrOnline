// Decay is calibrated for the full KJV Bible (31,102 verses).
// For smaller categories the rate scales inversely so a given fractional miss
// is penalised equally regardless of corpus size.
const BASE_DECAY = 0.0015;
const REFERENCE_VERSE_COUNT = 31102;

export function calculateScore(
  correctIndex: number,
  guessIndex: number,
  verseCount: number = REFERENCE_VERSE_COUNT
): number {
  const d = Math.abs(correctIndex - guessIndex);
  const rate = BASE_DECAY * (REFERENCE_VERSE_COUNT / verseCount);
  return Math.floor(5000 * Math.exp(-rate * Math.max(0, d - 5)));
}

export function getScoreColor(score: number): string {
  if (score >= 4500) return '#c9a644';
  if (score >= 3000) return '#22c55e';
  if (score >= 1500) return '#3b82f6';
  if (score >= 500) return '#f97316';
  return '#ef4444';
}

export function getScoreLabel(score: number): string {
  if (score >= 4500) return 'Incredible!';
  if (score >= 3000) return 'Great!';
  if (score >= 1500) return 'Good';
  if (score >= 500) return 'Close';
  return 'Way off';
}
