#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const API_KEY = process.env.AI302_API_KEY;
if (!API_KEY) {
  console.error('Missing AI302_API_KEY');
  process.exit(1);
}

const ENDPOINT = 'https://api.302.ai/v1/images/generations';
const OUTPUT_DIR = resolve(dirname(import.meta.url.replace('file://', '')), '../frontend/public/images');

const items = [
  {
    id: 'estate',
    prompt: 'A 17th century Dutch property deed document on aged parchment paper, ornate calligraphy, wax seal in dark red, golden border decorations, Baroque style illustration, warm candlelight lighting, dark background, detailed vintage real estate contract, oil painting style, 1024x1024 square format'
  },
  {
    id: 'voyage',
    prompt: 'A 17th century Dutch East India Company (VOC) shipping share certificate on aged parchment, vintage sailing ship illustration, ornate golden border, Baroque style, wax seal, warm candlelight, dark background, maritime trading document, oil painting style, 1024x1024 square format'
  }
];

async function generate(item) {
  console.log(`Generating ${item.id}...`);
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-2',
      prompt: item.prompt,
      size: '1024x1024',
      quality: 'high',
      n: 1,
      output_format: 'png',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err}`);
  }

  const data = await res.json();
  if (data.data?.[0]?.b64_json) {
    const buffer = Buffer.from(data.data[0].b64_json, 'base64');
    const outPath = resolve(OUTPUT_DIR, `${item.id}.png`);
    writeFileSync(outPath, buffer);
    console.log(`  Saved ${outPath} (${(buffer.length / 1024).toFixed(0)}KB)`);
  } else {
    throw new Error(`Unexpected response: ${JSON.stringify(data).slice(0, 200)}`);
  }
}

(async () => {
  for (const item of items) {
    await generate(item);
  }
  console.log('Done!');
})().catch(err => { console.error(err.message); process.exitCode = 1; });
