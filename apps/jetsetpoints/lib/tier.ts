export type Tier = 'Silver' | 'Gold' | 'Platinum';

export function getTier(pointsBalance: number): {
  tier: Tier;
  nextTierAt: number | null;
  progressToNext: number;
} {
  // Silver: <5k, Gold: 5k–20k, Platinum: >20k
  if (pointsBalance >= 20000) {
    return { tier: 'Platinum', nextTierAt: null, progressToNext: 1 };
  }
  if (pointsBalance >= 5000) {
    const nextTierAt = 20000;
    const range = nextTierAt - 5000;
    const progress = Math.min(1, (pointsBalance - 5000) / range);
    return { tier: 'Gold', nextTierAt, progressToNext: progress };
  }
  const nextTierAt = 5000;
  const progress = Math.min(1, pointsBalance / nextTierAt);
  return { tier: 'Silver', nextTierAt, progressToNext: progress };
} 