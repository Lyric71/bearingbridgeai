import type { APIRoute } from 'astro';
import { generateImage, WaveSpeedError } from '../../lib/wavespeed';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.WAVESPEED_API_KEY;
  if (!apiKey) {
    return json({ error: 'API key not configured.' }, 500);
  }

  let body: { prompt?: string; size?: string };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return json({ error: 'Prompt is required.' }, 400);
  }

  try {
    const result = await generateImage(prompt, apiKey, { size: body.size });
    return json({ success: true, ...result });
  } catch (err) {
    if (err instanceof WaveSpeedError) {
      return json({ error: err.message }, err.status);
    }
    return json({ error: 'Unexpected error during image generation.' }, 502);
  }
};
