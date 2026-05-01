#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const API_KEY =
  process.env.AI302_API_KEY ||
  process.env.API302_KEY ||
  process.env.THREE_ZERO_TWO_AI_API_KEY ||
  '';

const ENDPOINT = 'https://api.302.ai/v1/images/generations';
const OUTPUT_ROOT = resolve(process.cwd(), '../00-data/art-prompts');

// ==========================================
// 风格定义
// ==========================================

const BACKGROUND_STYLE = [
  'A warm, atmospheric 17th century Dutch tavern interior, inspired by Rembrandt\'s "The Night Watch".',
  'Warm candlelit atmosphere with deep shadows and golden highlights.',
  'Wooden interior with oak tables, heavy timber beams, and warm lighting from wall sconces.',
  'Rich, warm color palette: amber, brown, gold, and deep reds.',
  'Historical accuracy: 1637 Netherlands, cozy tavern setting with period-appropriate details.',
  'No characters in the frame, pure atmospheric background.',
  'Composition suitable for a game scene background, with clear focal points for UI elements.',
  'Style: oil painting texture mixed with modern illustration clarity.',
  'Resolution: high detail, suitable for 1920x1080 game background.',
].join(' ');

const NPC_STYLE = [
  'Full-body character portrait in 17th century Dutch attire.',
  'Style: thick oil painting texture combined with American comic book stylization.',
  'Characters are attractive and idealized, with strong facial expressions.',
  'Period-accurate Dutch clothing: lace collars, velvet jackets, wool coats, and period accessories.',
  'Emotional range: from calm and composed to excited and panicked.',
  'Clean, readable composition suitable for game UI.',
  'No text, no speech bubbles, no background elements.',
  'Character centered, full body visible, with room for dialogue box below.',
].join(' ');

const TULIP_STYLE = [
  'Botanical illustration style with oil painting texture.',
  'Detailed tulip flower with rich, vibrant colors.',
  'Historical accuracy: 17th century tulip varieties.',
  'Clean, isolated flower on neutral background suitable for game UI.',
  'Multiple views: front view, side view, and detail shots.',
  'Colors: rich reds, yellows, purples, and deep blacks for rare varieties.',
  'Style combines scientific illustration with artistic warmth.',
  'No text, no labels, no background clutter.',
].join(' ');

// ==========================================
// 资产定义
// ==========================================

const BACKGROUNDS = {
  tavern: {
    title: 'Dutch Tavern Background',
    description: 'A warm 17th century Dutch tavern interior with candlelit atmosphere.',
    style: BACKGROUND_STYLE,
    aspectRatio: '16:9',
    resolution: '2k',
  },
};

const NPCs = {
  jan: {
    title: 'Jan - Tavern Owner',
    description: 'A calm, wise middle-aged man in a tavern owner\'s attire.',
    personality: 'Calm, rational, experienced',
    style: NPC_STYLE,
    aspectRatio: '2:3',
    resolution: '2k',
    mood: 'calm',
    details: 'Middle-aged man, wearing glasses, holding a wine glass, clean and well-groomed.',
  },
  willem: {
    title: 'Willem - Radical Speculator',
    description: 'An excited young man with wild hair and manic energy.',
    personality: 'Frenzied, greedy, impulsive',
    style: NPC_STYLE,
    aspectRatio: '2:3',
    resolution: '2k',
    mood: 'excited',
    details: 'Young man with wild hair and eyes, exaggerated hand gestures, wearing flamboyant clothing.',
  },
  maria: {
    title: 'Maria - Cautious Merchant',
    description: 'A composed middle-aged woman with a ledger in hand.',
    personality: 'Cautious, conservative, shrewd',
    style: NPC_STYLE,
    aspectRatio: '2:3',
    resolution: '2k',
    mood: 'cautious',
    details: 'Middle-aged woman, calculating ledger, wearing modest merchant attire, serious expression.',
  },
  pieter: {
    title: 'Pieter - Retired Flower Merchant',
    description: 'An elderly man with white hair and deep, thoughtful eyes.',
    personality: 'Nostalgic, contemplative, experienced',
    style: NPC_STYLE,
    aspectRatio: '2:3',
    resolution: '2k',
    mood: 'calm',
    details: 'Elderly man, white hair, deep thoughtful eyes, wearing worn but dignified clothing.',
  },
  lucas: {
    title: 'Lucas - Traveler',
    description: 'A curious young man with a traveler\'s backpack.',
    personality: 'Curious, inquisitive, observer',
    style: NPC_STYLE,
    aspectRatio: '2:3',
    resolution: '2k',
    mood: 'calm',
    details: 'Young man, traveler\'s backpack, curious expression, wearing practical travel clothing.',
  },
};

const TULIPS = {
  semper_augustus: {
    title: 'Semper Augustus - Red Tulip',
    description: 'The most expensive tulip variety, with deep red petals and white streaks.',
    style: TULIP_STYLE,
    aspectRatio: '1:1',
    resolution: '2k',
    colors: 'Deep red with white streaks and flames.',
    details: 'Historically accurate Semper Augustus variety, prized for its dramatic red and white pattern.',
  },
  gouda: {
    title: 'Gouda - Yellow Tulip',
    description: 'A beautiful yellow tulip with warm golden tones.',
    style: TULIP_STYLE,
    aspectRatio: '1:1',
    resolution: '2k',
    colors: 'Warm golden yellow with subtle variations.',
    details: 'Classic Gouda variety, known for its rich yellow coloration.',
  },
  viceroy: {
    title: 'Viceroy - Purple Tulip',
    description: 'An elegant purple tulip with deep violet tones.',
    style: TULIP_STYLE,
    aspectRatio: '1:1',
    resolution: '2k',
    colors: 'Deep purple with violet highlights.',
    details: 'Viceroy variety, prized for its rich purple color.',
  },
  black_tulip: {
    title: 'Black Tulip - Rare Variety',
    description: 'A mysterious black tulip, the rarest variety.',
    style: TULIP_STYLE,
    aspectRatio: '1:1',
    resolution: '2k',
    colors: 'Deep black with subtle purple undertones.',
    details: 'Rare black tulip variety, extremely valuable and mysterious.',
  },
};

// ==========================================
// 工具函数
// ==========================================

function parseArgs(argv) {
  const args = {
    types: ['backgrounds', 'npcs', 'tulips'],
    dryRun: true, // 默认为 dry-run，需要用户审批 prompt
    outDir: OUTPUT_ROOT,
    resolution: '2k',
    outputFormat: 'png',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    if (current === '--dry-run') args.dryRun = true;
    if (current === '--execute') args.dryRun = false;
    if (current === '--types') args.types = argv[index + 1].split(',').map(t => t.trim().toLowerCase());
    if (current === '--out') args.outDir = resolve(process.cwd(), argv[index + 1]);
    if (current === '--resolution') args.resolution = argv[index + 1];
    if (current === '--format') args.outputFormat = argv[index + 1];
  }

  return args;
}

function buildPrompt(assetId, asset) {
  return [
    asset.style,
    `Title: ${asset.title}.`,
    `Description: ${asset.description}.`,
    asset.details ? `Details: ${asset.details}.` : '',
    asset.colors ? `Colors: ${asset.colors}.` : '',
    asset.mood ? `Mood: ${asset.mood}.` : '',
    'No text, no letters, no Chinese characters, no words, no labels, no titles, no signatures.',
    'Clean composition suitable for game UI.',
  ].filter(Boolean).join(' ');
}

async function requestImage(prompt, args) {
  const MAX_RETRIES = 5;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-image-2',
          prompt,
          n: 1,
          size: args.resolution === '2k' ? '1024x1024' : '512x512',
          response_format: args.outputFormat === 'png' ? 'b64_json' : 'url',
        }),
      });

      if (!response.ok) {
        throw new Error(`302AI request failed with ${response.status} ${response.statusText}`);
      }

      const payload = await response.json();
      return payload;
    } catch (error) {
      console.warn(`[retry ${attempt}/${MAX_RETRIES}] ${error.message}`);
      if (attempt < MAX_RETRIES) {
        const delay = attempt * 10_000;
        console.warn(`  waiting ${delay / 1000}s before retry...`);
        await new Promise(resolve => { setTimeout(resolve, delay); });
      } else {
        throw error;
      }
    }
  }
}

async function downloadImage(url, targetPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Image download failed with ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  mkdirSync(resolve(targetPath, '..'), { recursive: true });
  writeFileSync(targetPath, buffer);
}

// ==========================================
// 主函数
// ==========================================

async function main() {
  const args = parseArgs(process.argv.slice(2));
  mkdirSync(args.outDir, { recursive: true });

  const manifest = [];
  const assets = [];

  if (args.types.includes('backgrounds')) {
    Object.entries(BACKGROUNDS).forEach(([id, asset]) => {
      assets.push({ id, asset, type: 'background' });
    });
  }

  if (args.types.includes('npcs')) {
    Object.entries(NPCs).forEach(([id, asset]) => {
      assets.push({ id, asset, type: 'npc' });
    });
  }

  if (args.types.includes('tulips')) {
    Object.entries(TULIPS).forEach(([id, asset]) => {
      assets.push({ id, asset, type: 'tulip' });
    });
  }

  for (const { id, asset, type } of assets) {
    const prompt = buildPrompt(id, asset);
    const promptPath = resolve(args.outDir, `${id}-prompt.txt`);
    writeFileSync(promptPath, `${prompt}\n`);

    console.log(`[prompt] ${id}:`);
    console.log(`  ${promptPath}`);
    console.log(`  ${asset.title}: ${asset.description}`);

    if (args.dryRun) {
      manifest.push({ id, type, promptPath, prompt, status: 'dry-run' });
      continue;
    }

    if (!API_KEY) {
      throw new Error('Missing AI302_API_KEY. Re-run with --dry-run or export AI302_API_KEY first.');
    }

    console.log(`[generating] ${id}...`);
    const payload = await requestImage(prompt, args);
    const ts = Date.now();
    const fileName = `${id}-${ts}.${args.outputFormat}`;
    const filePath = resolve(args.outDir, fileName);

    if (payload.data && payload.data[0]) {
      const imageData = payload.data[0];
      if (imageData.b64_json) {
        // Base64 encoded
        const buffer = Buffer.from(imageData.b64_json, 'base64');
        mkdirSync(args.outDir, { recursive: true });
        writeFileSync(filePath, buffer);
      } else if (imageData.url) {
        // URL
        await downloadImage(imageData.url, filePath);
      }
    }

    manifest.push({
      id,
      type,
      promptPath,
      prompt,
      filePath,
      requestId: payload?.created ?? null,
      status: 'generated',
    });

    console.log(`[generated] ${id} -> ${filePath}`);
  }

  const manifestPath = resolve(args.outDir, 'manifest.json');
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\n[manifest] ${manifestPath}`);

  if (args.dryRun) {
    console.log(`\n[dry-run] All prompts generated. Review them, then run with --execute to generate images.`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
