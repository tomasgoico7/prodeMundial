import type { MetadataRoute } from 'next';

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://elprodedelagambeta.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/register`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/login`, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
