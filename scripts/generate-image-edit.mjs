import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const API_URL = 'https://api.wavespeed.ai/api/v3';
const MODEL = 'google/nano-banana-2/edit';
const API_KEY = process.env.WAVESPEED_API_KEY;

// Usage: node scripts/generate-image-edit.mjs <output-filename> <prompt> -- <image1> [image2] ...
// Images after -- are local file paths that get converted to base64 data URIs

const args = process.argv.slice(2);
const doubleDashIdx = args.indexOf('--');

if (doubleDashIdx < 2 || doubleDashIdx >= args.length - 1) {
  console.error('Usage: node scripts/generate-image-edit.mjs <output-filename> <prompt> -- <image1> [image2] ...');
  process.exit(1);
}

const outputFilename = args[0];
const prompt = args.slice(1, doubleDashIdx).join(' ');
const imagePaths = args.slice(doubleDashIdx + 1);

function imageToDataUri(filePath) {
  const abs = path.resolve(filePath);
  const buf = fs.readFileSync(abs);
  const ext = path.extname(abs).toLowerCase().replace('.', '');
  const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
  return `data:${mime};base64,${buf.toString('base64')}`;
}

async function generate() {
  console.log(`Prompt: "${prompt}"`);
  console.log(`Images: ${imagePaths.join(', ')}`);
  console.log(`Output: ${outputFilename}`);

  const images = imagePaths.map(imageToDataUri);

  // Submit task
  const submitRes = await fetch(`${API_URL}/${MODEL}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      images,
      prompt,
      output_format: 'png',
      resolution: '1k',
      aspect_ratio: '21:9',
    }),
  });

  const submitData = await submitRes.json();
  if (submitData.code !== 200 || !submitData.data?.id) {
    console.error('Failed:', JSON.stringify(submitData, null, 2));
    process.exit(1);
  }

  const taskId = submitData.data.id;
  console.log(`Task ID: ${taskId}`);

  // Poll for result (max 120s)
  for (let i = 0; i < 120; i++) {
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
      fs.writeFileSync(outputFilename, buffer);

      console.log(`\nSaved: ${outputFilename}`);
      return;
    }

    if (statusData.data?.status === 'failed') {
      console.error('\nGeneration failed:', JSON.stringify(statusData, null, 2));
      process.exit(1);
    }
  }

  console.error('\nTimed out.');
  process.exit(1);
}

generate();
