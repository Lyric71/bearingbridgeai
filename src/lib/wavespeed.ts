/**
 * WaveSpeed AI text-to-image client (https://wavespeed.ai).
 *
 * The API is asynchronous: a POST submits the task and returns a task ID,
 * then the result endpoint is polled until the image is ready. See
 * scripts/generate-image.mjs for the standalone CLI equivalent.
 */

const WAVESPEED_API_URL = 'https://api.wavespeed.ai/api/v3';
const DEFAULT_MODEL = 'google/nano-banana-2/text-to-image';

export interface GenerateImageOptions {
  /** Aspect ratio, e.g. '1:1', '16:9'. Defaults to '1:1'. */
  size?: string;
  outputFormat?: 'png' | 'jpg';
  quality?: string;
  /** Max seconds to wait for the result. Defaults to 60. */
  timeoutSeconds?: number;
  model?: string;
}

export interface GenerateImageResult {
  /** Temporary URL of the generated image — download or rehost it. */
  imageUrl: string;
  timings?: Record<string, unknown>;
}

/** Error with the HTTP status the API route should respond with. */
export class WaveSpeedError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'WaveSpeedError';
    this.status = status;
  }
}

export async function generateImage(
  prompt: string,
  apiKey: string,
  options: GenerateImageOptions = {},
): Promise<GenerateImageResult> {
  const {
    size = '1:1',
    outputFormat = 'png',
    quality = '1K',
    timeoutSeconds = 60,
    model = DEFAULT_MODEL,
  } = options;

  // Step 1 — submit the task
  const submitRes = await fetch(`${WAVESPEED_API_URL}/${model}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt.trim(),
      output_format: outputFormat,
      quality,
      size,
      aspect_ratio: size,
    }),
  });

  const submitData = await submitRes.json();
  if (submitData.code !== 200 || !submitData.data?.id) {
    throw new WaveSpeedError(
      submitData.message || 'Failed to submit generation task.',
      502,
    );
  }

  const taskId: string = submitData.data.id;

  // Step 2 — poll for the result, once per second
  for (let i = 0; i < timeoutSeconds; i++) {
    await new Promise((r) => setTimeout(r, 1000));

    const statusRes = await fetch(
      `${WAVESPEED_API_URL}/predictions/${taskId}/result`,
      { headers: { Authorization: `Bearer ${apiKey}` } },
    );

    const statusData = await statusRes.json();
    const status = statusData.data?.status;

    if (status === 'completed') {
      return {
        imageUrl: statusData.data.outputs[0],
        timings: statusData.data.timings,
      };
    }

    if (status === 'failed') {
      throw new WaveSpeedError('Image generation failed.', 502);
    }
  }

  throw new WaveSpeedError(
    `Image generation timed out (${timeoutSeconds}s).`,
    504,
  );
}
