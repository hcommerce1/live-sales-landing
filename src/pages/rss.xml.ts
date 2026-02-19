import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export const prerender = true;

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  return rss({
    title: 'LiveSales Blog',
    description: 'Automatyzacja danych, e-commerce, narzędzia AI — blog LiveSales',
    site: context.site!.toString(),
    items: posts
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map((post) => ({
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link: `/${post.data.lang}/blog/${post.slug}/`,
        categories: [post.data.category, ...post.data.tags],
      })),
    customData: `<language>pl</language>`,
  });
}
