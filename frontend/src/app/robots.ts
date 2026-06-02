import type { MetadataRoute } from 'next';

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://elprodedelagambeta.vercel.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Las secciones que requieren login no aportan al SEO y no deben indexarse.
      disallow: ['/dashboard', '/predictions', '/groups'],
    },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
