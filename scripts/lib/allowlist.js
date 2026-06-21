// Given all landing entries and the set of relevant slugs, return which slugs to
// keep (intersection) and which to prune (everything else).
function splitSlugs(entries, relevantSlugs) {
  const relevant = new Set(relevantSlugs);
  const keep = [];
  const prune = [];
  for (const e of entries) {
    if (!e?.slug) continue;
    if (relevant.has(e.slug)) keep.push(e.slug);
    else prune.push(e.slug);
  }
  return { keep, prune };
}

module.exports = { splitSlugs };
