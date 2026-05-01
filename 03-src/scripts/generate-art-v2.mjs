#!/usr/bin/env node
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';

const API_KEY = process.env.AI302_API_KEY || '';
const ENDPOINT = 'https://api.302.ai/v1/images/generations';

const ASSETS = [
  // Background
  { id: 'tavern', promptFile: 'tavern-prompt.txt', size: '1536x1024', format: 'png', quality: 'high', category: 'background' },
  // NPCs
  { id: 'cornelis', promptFile: 'cornelis-prompt.txt', size: '1024x1536', format: 'png', quality: 'high', category: 'npc' },
  { id: 'anna', promptFile: 'anna-prompt.txt', size: '1024x1536', format: 'png', quality: 'high', category: 'npc' },
  { id: 'hendrik', promptFile: 'hendrik-prompt.txt', size: '1024x1536', format: 'png', quality: 'high', category: 'npc' },
  { id: 'maria_host', promptFile: 'maria_host-prompt.txt', size: '1024x1536', format: 'png', quality: 'high', category: 'npc' },
  { id: 'stranger', promptFile: 'stranger-prompt.txt', size: '1024x1536', format: 'png', quality: 'high', category: 'npc' },
  // Tulips
  { id: 'semper_augustus', promptFile: 'semper_augustus-prompt.txt', size: '1024x1024', format: 'png', quality: 'high', category: 'tulip' },
  { id: 'gouda', promptFile: 'gouda-prompt.txt', size: '1024x1024', format: 'png', quality: 'high', category: 'tulip' },
  { id: 'viceroy', promptFile: 'viceroy-prompt.txt', size: '1024x1024', format: 'png', quality: 'high', category: 'tulip' },
  { id: 'black_tulip', promptFile: 'black_tulip-prompt.txt', size: '1024x1024', format: 'png', quality: 'high', category: 'tulip' },
];

const PROMPT_DIR = resolve(dirname(import.meta.url.replace('file://', '')), '../../00-data/art-prompts');
const OUTPUT_DIR = resolve(dirname(import.meta.url.replace('file://', '')), '../../03-src/frontend/public/images');

function parseArgs(argv) {
  const args = { ids: null, category: null, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--dry-run') args.dryRun = true;
    if (argv[i] === '--ids') args.ids = argv[++i].split(',').map(s => s.trim());
    if (argv[i] === '--category') args.category = argv[++i];
  }
  return args;
}

async function generateImage(prompt, size, format, quality) {
  if (!API_KEY) {
    throw new Error('Missing AI302_API_KEY. Export it before generating images.');
  }

  const MAX_RETRIES = 3;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`  [attempt ${attempt}] Requesting ${size} ${quality}...`);
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-2',
          prompt,
          size,
          quality,
          n: 1,
          output_format: format,
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`API ${res.status}: ${err}`);
      }

      const data = await res.json();
      // GPT-image-2 returns base64 in data[0].b64_json
      if (data.data?.[0]?.b64_json) {
        return Buffer.from(data.data[0].b64_json, 'base64');
      }
      // Fallback: url
      if (data.data?.[0]?.url) {
        const imgRes = await fetch(data.data[0].url);
        return Buffer.from(await imgRes.arrayBuffer());
      }
      throw new Error(`Unexpected response: ${JSON.stringify(data).slice(0, 200)}`);
    } catch (err) {
      console.warn(`  [retry ${attempt}/${MAX_RETRIES}] ${err.message}`);
      if (attempt < MAX_RETRIES) await new Promise(r => setTimeout(r, attempt * 15000));
      else throw err;
    }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  mkdirSync(OUTPUT_DIR, { recursive: true });

  let assets = ASSETS;
  if (args.ids) assets = assets.filter(a => args.ids.includes(a.id));
  if (args.category) assets = assets.filter(a => a.category === args.category);

  const manifest = [];

  for (const asset of assets) {
    const promptPath = resolve(PROMPT_DIR, asset.promptFile);
    const prompt = readFileSync(promptPath, 'utf-8').trim();
    console.log(`\n[${asset.id}] (${asset.category}) ${prompt.slice(0, 80)}...`);

    if (args.dryRun) {
      manifest.push({ id: asset.id, category: asset.category, status: 'dry-run', promptFile: asset.promptFile });
      continue;
    }

    const buffer = await generateImage(prompt, asset.size, asset.format, asset.quality);
    const outPath = resolve(OUTPUT_DIR, `${asset.id}.png`);
    writeFileSync(outPath, buffer);
    console.log(`  ✅ Saved to ${outPath} (${(buffer.length / 1024).toFixed(0)}KB)`);

    manifest.push({ id: asset.id, category: asset.category, status: 'generated', path: outPath, size: buffer.length });
  }

  const manifestPath = resolve(OUTPUT_DIR, 'manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`\n[manifest] ${manifestPath}`);
  console.log(`Generated ${manifest.filter(m => m.status === 'generated').length}/${assets.length} assets.`);
}

main().catch(err => { console.error(err.message); process.exitCode = 1; });
