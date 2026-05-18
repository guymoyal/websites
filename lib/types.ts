export interface AITool {
  id: string;
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  category: string;
  subcategory?: string;
  website: string;
  pricing: 'Free' | 'Freemium' | 'Paid' | 'Enterprise';
  pricingDetails?: string;
  features: string[];
  tags: string[];
  logo?: string;
  screenshots: string[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  lastUpdated?: string;
  status: 'active' | 'inactive';
}

export interface ToolCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  toolCount: number;
  featured: boolean;
}

export interface SearchFilters {
  category?: string;
  pricing?: string;
  rating?: number;
  tags?: string[];
  featured?: boolean;
}

export interface Article {
  title: string;
  slug: string;
  metaDescription: string;
  keywords: string[];
  category: string;
  readingTime: number;
  targetAudience: string;
  content: string;
  publishedAt: string;
  updatedAt: string;
  featured: boolean;
  image?: string;
  imagePrompt?: string;
  status: 'published' | 'draft';
}

export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  topic: string;
  navigation: Array<{ name: string; href: string }>;
  social: {
    twitter: string;
    linkedin: string;
    github: string;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    keywords: string[];
  };
}