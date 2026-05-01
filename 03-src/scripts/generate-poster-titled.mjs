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

const prompt = `Create a dramatic movie-style game poster with a medieval Dutch Golden Age tavern scene. The scene shows 5 figures in warm candlelit chiaroscuro: a triumphant man holding a glowing goblet on the left, a confident woman in a deep red dress with crossed arms in the center, a young woman behind holding a book, a mysterious hooded figure in the shadows holding a document, and an animated man in a feathered hat gesturing with papers on the right. The foreground has a table with tulips, onions, garlic, quill, inkwell, and documents.

IMPORTANT: At the TOP of the image, add a large ornate Chinese title "郁金香狂潮" in an elegant medieval calligraphy style with gold metallic lettering and dramatic shadows. Below the main title, add a smaller subtitle "1637" in refined serif font. Surround the title with elaborate Baroque decorative flourishes, ornamental scrollwork, and filigree borders in gold. Add subtle vintage film grain texture. The overall style should evoke a high-end cinematic movie poster with premium production value. Dark atmospheric background with warm amber and crimson tones. 1536x1024 landscape format.`;

async function generate() {
  console.log('Generating poster with title...');
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-2',
      prompt,
      size: '1536x1024',
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
    const outPath = resolve(OUTPUT_DIR, 'poster-titled.png');
    writeFileSync(outPath, buffer);
    console.log(`Saved ${outPath} (${(buffer.length / 1024).toFixed(0)}KB)`);
  } else {
    throw new Error(`Unexpected response: ${JSON.stringify(data).slice(0, 200)}`);
  }
}

generate().catch(err => { console.error(err.message); process.exitCode = 1; });
