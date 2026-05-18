#!/usr/bin/env node
/**
 * @deprecated Use `yarn generate:content` (DeepSeek). Gemini is no longer used for article generation.
 */
console.warn(
  '\n⚠️  generateContentWithGemini is deprecated. Running DeepSeek-based generate:content instead.\n' +
    '   Set DEEPSEEK_API_KEY in .env.local\n'
);
const { generateContent } = require('./generateContent');
generateContent().catch((e) => {
  console.error(e);
  process.exit(1);
});
