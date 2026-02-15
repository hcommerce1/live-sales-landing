// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import astroI18next from 'astro-i18next';
import vercel from '@astrojs/vercel';
import path from 'path';

// KaTeX plugins for math formulas
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
  adapter: vercel(),
  integrations: [
    react(),
    mdx({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
      syntaxHighlight: 'shiki',
      shikiConfig: {
        theme: 'github-dark',
        wrap: true,
      }
    }),
    astroI18next(),
  ],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve('./src'),
        '@components': path.resolve('./src/components'),
        '@layouts': path.resolve('./src/layouts'),
        '@lib': path.resolve('./src/lib'),
        '@styles': path.resolve('./src/styles'),
        '@locales': path.resolve('./src/locales'),
        '@content': path.resolve('./src/content'),
      },
    },
  },
});