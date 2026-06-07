import { getArticles } from '@/lib/content';
import { getCategories, getTools } from '@/lib/tools';

export type SiteStats = {
  toolCount: number;
  categoryCount: number;
  articleCount: number;
};

export async function getSiteStats(): Promise<SiteStats> {
  const [tools, categories, articles] = await Promise.all([
    getTools(),
    getCategories(),
    getArticles(),
  ]);
  return {
    toolCount: tools.length,
    categoryCount: categories.length,
    articleCount: articles.length,
  };
}
