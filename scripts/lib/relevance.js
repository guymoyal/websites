const CORE = ['ai ', 'a.i', 'artificial intelligence', 'machine learning', 'saas', 'software',
  'app ', ' api', 'automation', 'chatbot', 'gpt', 'no-code', 'no code'];
const ADJ = ['hosting', 'domain', 'vpn', 'cloud', 'website builder', 'wordpress', 'server',
  'cyber', 'security', 'course', 'learning', 'education', 'ebook', 'freelanc', 'design',
  'template', 'stock photo', 'marketing', 'seo', 'email', 'crm', 'analytics'];
const GADGET = ['electronics', 'gadget', 'laptop', 'computer', 'tech', 'marketplace',
  'aliexpress', 'amazon', 'gearbest', 'banggood'];

const TIERS = { strict: CORE, moderate: [...CORE, ...ADJ], broad: [...CORE, ...ADJ, ...GADGET] };

function merchantText(entry) {
  return `${entry?.program?.name || ''} ${entry?.program?.description || ''}`.toLowerCase().trim();
}

function isRelevant(entry, tier = 'broad') {
  const keys = TIERS[tier] || TIERS.broad;
  const text = merchantText(entry);
  return keys.some((k) => text.includes(k));
}

function prefilter(entries, tier = 'broad') {
  return entries.filter((e) => isRelevant(e, tier));
}

module.exports = { merchantText, isRelevant, prefilter, TIERS };
