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

// Maps merchant text to one of the article categories. Used as a no-LLM fallback
// to give each merchant a category for article matching. First match wins.
const CATEGORY_RULES = [
  ['Writing & Content', ['writing', 'copywriting', 'content', 'blog', 'article', 'ebook', 'seo', 'translation']],
  ['Design & Creative', ['design', 'logo', 'art', 'image', 'photo', 'graphic', 'template', 'font', 'creative']],
  ['Audio & Video', ['audio', 'video', 'music', 'podcast', 'voice', 'sound', 'transcri', 'youtube', 'streaming']],
  ['Development', ['code', 'develop', ' api', 'software', 'hosting', 'domain', 'cloud', 'server', 'wordpress', 'website builder', 'no-code', 'no code']],
  ['Marketing', ['marketing', 'ads', 'advertis', 'analytics', 'email', 'crm', 'social media', 'campaign']],
  ['Education', ['course', 'learning', 'education', 'training', 'tutorial', 'academy', 'school']],
  ['Productivity', ['productiv', 'automation', 'workflow', 'task', 'note', 'calendar', 'meeting', 'assistant', 'chatbot']],
];

function inferCategory(entry) {
  const text = merchantText(entry);
  for (const [cat, keys] of CATEGORY_RULES) {
    if (keys.some((k) => text.includes(k))) return cat;
  }
  return 'General';
}

module.exports = { merchantText, isRelevant, prefilter, inferCategory, TIERS };
