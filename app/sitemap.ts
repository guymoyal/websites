import { MetadataRoute } from 'next'
import { getArticles, getAllCategories, categorySlug } from '@/lib/content'
import { getTools } from '@/lib/tools'
import { getCategories } from '@/lib/tools'
import { getPartnerLandings } from '@/lib/partnerLandings'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://aibuzz.world'
  
  // Get all dynamic content
  const articles = await getArticles()
  const tools = await getTools()
  const categories = await getCategories()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Dynamic tool pages
  const toolPages: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${baseUrl}/tools/${tool.slug}`,
    lastModified: new Date(tool.updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Dynamic category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Blog category pages
  const blogCategories = await getAllCategories()
  const blogCategoryPages: MetadataRoute.Sitemap = blogCategories.map((category) => ({
    url: `${baseUrl}/blog/category/${categorySlug(category)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Dynamic article pages
  const articlePages: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: new Date(article.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const partnerLandings = getPartnerLandings()
  const partnerPages: MetadataRoute.Sitemap = [
    ...(partnerLandings.length > 0
      ? [{
          url: `${baseUrl}/partners`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        }]
      : []),
    ...partnerLandings.map((l) => ({
      url: `${baseUrl}/${l.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ]

  return [...staticPages, ...toolPages, ...categoryPages, ...blogCategoryPages, ...articlePages, ...partnerPages]
}
