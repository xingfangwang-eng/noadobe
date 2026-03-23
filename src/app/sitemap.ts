import { MetadataRoute } from 'next';
import keywordsData from '@/data/keywords.json';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://noadobe.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const keywordPages = keywordsData.map((item) => ({
    url: `${siteUrl}/${item.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...keywordPages,
  ];
}
