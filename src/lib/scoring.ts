export function calculateScore(correctIndex: number, guessIndex: number): number {
  const d = Math.abs(correctIndex - guessIndex);
  return Math.floor(5000 * Math.exp(-0.0015 * Math.max(0, d - 5)));
}

export function getScoreColor(score: number): string {
  if (score >= 4500) return '#f59e0b';
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
