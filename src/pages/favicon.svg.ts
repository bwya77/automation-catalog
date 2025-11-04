import type { APIRoute } from 'astro';
import { loadEmojis } from '../utils/data';

export const GET: APIRoute = () => {
  const emojis = loadEmojis();
  const faviconEmoji = emojis.favicon;

  // Generate SVG with emoji and transparent background
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <text x="50" y="70" font-size="60" text-anchor="middle">${faviconEmoji}</text>
</svg>`;

  return new Response(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
