export function pointsAfterHints(challenge, hintsUsedCount) {
  const cost = challenge.hints
    .slice(0, hintsUsedCount)
    .reduce((sum, h) => sum + (h.cost || 0), 0);
  return Math.max(0, challenge.points - cost);
}

export function summarize(allChallenges, progress) {
  const byTier = {};
  const byCategory = {};
  let totalPossible = 0;
  let totalEarned = 0;
  let solvedCount = 0;

  for (const c of allChallenges) {
    totalPossible += c.points;
    byTier[c.tier] ??= { possible: 0, earned: 0, solved: 0, total: 0 };
    byCategory[c.category] ??= { possible: 0, earned: 0, solved: 0, total: 0 };
    byTier[c.tier].possible += c.points;
    byTier[c.tier].total += 1;
    byCategory[c.category].possible += c.points;
    byCategory[c.category].total += 1;

    const state = progress.challenges[c.id];
    if (state?.solved) {
      solvedCount += 1;
      totalEarned += state.pointsEarned;
      byTier[c.tier].earned += state.pointsEarned;
      byTier[c.tier].solved += 1;
      byCategory[c.category].earned += state.pointsEarned;
      byCategory[c.category].solved += 1;
    }
  }

  return { totalPossible, totalEarned, solvedCount, total: allChallenges.length, byTier, byCategory };
}
