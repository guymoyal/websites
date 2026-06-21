import fs from 'fs';
import path from 'path';

export interface ArticleAffiliate {
  slug: string;
  name: string;
  anchorText: string;
  blurb: string;
}

const DATA_FILE = path.join(process.cwd(), 'content', 'article-affiliates.json');

export function getArticleAffiliates(articleSlug: string): ArticleAffiliate[] {
  try {
    const map = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) as Record<string, ArticleAffiliate[]>;
    return Array.isArray(map[articleSlug]) ? map[articleSlug] : [];
  } catch {
    return [];
  }
}
