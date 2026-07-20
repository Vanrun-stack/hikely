import { MetadataRoute } from 'next';
import { apiServer } from '@/lib/api-server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://hikely.app';

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/hikes`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  // Dynamic hike pages
  let hikeRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: hikes } = await apiServer.hikes.getAll({ limit: 1000, page: 1 });
    hikeRoutes = hikes.map((hike: any) => ({
      url: `${baseUrl}/hikes/${hike.slug}`,
      lastModified: new Date(hike.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch { /* Fail silently in build */ }

  return [...staticRoutes, ...hikeRoutes];
}
