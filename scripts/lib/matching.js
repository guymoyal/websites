function tokens(s) {
  return String(s || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

// Higher = better fit. Category match is worth more than keyword overlap.
function scoreMerchant(article, merchant) {
  let score = 0;
  if (merchant.category && merchant.category === article.category) score += 10;
  const haystack = new Set([
    ...tokens(merchant.name),
    ...(merchant.anchorIdeas || []).flatMap(tokens),
    ...tokens(merchant.category),
  ]);
  for (const kw of article.keywords || []) {
    for (const t of tokens(kw)) if (haystack.has(t)) score += 1;
  }
  return score;
}

// Returns up to `limit` merchants with score > 0, best first. By default only
// active (connected) merchants are linked so every link earns; pass
// { requireActive: false } to also include not-yet-connected merchants.
function matchMerchants(article, merchants, limit = 3, { requireActive = true, minScore = 1 } = {}) {
  return merchants
    .filter((m) => !requireActive || m.connectionStatus === 'active')
    .map((m) => ({ m, score: scoreMerchant(article, m) }))
    .filter((x) => x.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.m);
}

module.exports = { scoreMerchant, matchMerchants, tokens };
