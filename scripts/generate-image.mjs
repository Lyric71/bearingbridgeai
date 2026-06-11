import 'dotenv/config';
import fs from 'fs';

const API_URL = 'https://api.wavespeed.ai/api/v3';
const MODEL = 'google/nano-banana-2/text-to-image';
const API_KEY = process.env.WAVESPEED_API_KEY;

const args = process.argv.slice(2);
const sizeFlagIdx = args.findIndex((a) => a === '--size');
let size = '1:1';
if (sizeFlagIdx !== -1 && args[sizeFlagIdx + 1]) {
  size = args[sizeFlagIdx + 1];
  args.splice(sizeFlagIdx, 2);
}
const outFlagIdx = args.findIndex((a) => a === '--out');
let outPath = null;
if (outFlagIdx !== -1 && args[outFlagIdx + 1]) {
  outPath = args[outFlagIdx + 1];
  args.splice(outFlagIdx, 2);
}
const prompt = args.join(' ');

if (!prompt) {
  console.error('Usage: node scripts/generate-image.mjs [--size 16:9] [--out path/to/file.png] <prompt>');
  process.exit(1);
}

async function generate() {
  console.log(`Prompt: "${prompt}"`);

  // Submit task
  const submitRes = await fetch(`${API_URL}/${MODEL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, output_format: 'png', quality: '1K', size, aspect_ratio: size }),
  });

  const submitData = await submitRes.json();
  if (submitData.code !== 200 || !submitData.data?.id) {
    console.error('Failed:', submitData.message || submitData);
    process.exit(1);
  }

  const taskId = submitData.data.id;

  // Poll for result (max 300s)
  for (let i = 0; i < 300; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    process.stdout.write('.');

    const statusRes = await fetch(`${API_URL}/predictions/${taskId}/result`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
    });

    const statusData = await statusRes.json();

    if (statusData.data?.status === 'completed') {
      const imageUrl = statusData.data.outputs[0];

      // Download and save
      const imgRes = await fetch(imageUrl);
      const buffer = Buffer.from(await imgRes.arrayBuffer());
      const filename = outPath ?? `generated-${Date.now()}.png`;
      const dir = filename.includes('/') || filename.includes('\\')
        ? filename.replace(/[\\/][^\\/]*$/, '')
        : null;
      if (dir) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filename, buffer);

      console.log(`\nSaved: ${filename}`);
      return;
    }

    if (statusData.data?.status === 'failed') {
      console.error('\nGeneration failed.');
      process.exit(1);
    }
  }

  console.error('\nTimed out.');
  process.exit(1);
}

generate();
