#!/usr/bin/env node
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const API_KEY = process.env.AI302_API_KEY;
if (!API_KEY) {
  console.error('Missing AI302_API_KEY');
  process.exit(1);
}

const BASE_URL = 'https://api.302.ai';
const OUTPUT_DIR = resolve(dirname(import.meta.url.replace('file://', '')), '../frontend/public/audio');

mkdirSync(OUTPUT_DIR, { recursive: true });

// 酒馆背景音乐 - 纯音乐模式，体现17世纪荷兰酒馆氛围
const musicConfig = {
  tags: 'medieval folk tavern music, renaissance, dutch golden age, lively pub atmosphere, acoustic guitar, lute, hammered dulcimer, harpsichord, violin, fiddle, hand drum, bodhran, tambourine, cheerful, upbeat, european folk, baroque, acoustic, drinking song instrumental, rustic, merry, foot-stomping, hand-clapping, wooden mug clinking sounds, crowd murmur ambience, bustling tavern, old world european inn, string instruments, percussion',
  negative_tags: 'electronic, synth, autotune, heavy metal, aggressive, modern pop, hip-hop, rap, trap, dubstep, flute, recorder, trumpet, horn, saxophone, clarinet, bagpipes, brass, woodwind,吹奏',
  mv: 'chirp-fenix',
  title: 'Tulip Mania Tavern BGM',
  make_instrumental: true,
};

async function submitTask() {
  console.log('Submitting music generation task...');
  console.log(`  Model: ${musicConfig.mv}`);
  console.log(`  Title: ${musicConfig.title}`);
  console.log(`  Mode: ${musicConfig.make_instrumental ? 'Instrumental' : 'With Lyrics'}`);

  const res = await fetch(`${BASE_URL}/suno/submit/music`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(musicConfig),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Submit failed ${res.status}: ${err}`);
  }

  const data = await res.json();
  console.log(`  Task ID: ${data.data}`);
  return data.data;
}

async function pollTask(taskId) {
  const maxAttempts = 60; // 最多等5分钟
  const interval = 5000; // 5秒轮询一次

  for (let i = 0; i < maxAttempts; i++) {
    console.log(`  Polling... (${i + 1}/${maxAttempts})`);

    const res = await fetch(`${BASE_URL}/suno/fetch/${taskId}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Fetch failed ${res.status}: ${err}`);
    }

    const data = await res.json();

    // 检查任务状态
    const task = data.data;
    if (!task) {
      console.log('  Waiting for task to start...');
      await new Promise(r => setTimeout(r, interval));
      continue;
    }

    const status = task.status;
    console.log(`  Status: ${status}`);

    if (status === 'complete' || status === 'completed' || status === 'SUCCESS') {
      return task;
    }

    if (status === 'error' || status === 'failed') {
      throw new Error(`Task failed: ${task.error_message || JSON.stringify(task)}`);
    }

    await new Promise(r => setTimeout(r, interval));
  }

  throw new Error('Timeout: music generation took too long');
}

async function downloadAudio(url, filename) {
  console.log(`  Downloading ${filename}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);

  const buffer = Buffer.from(await res.arrayBuffer());
  const outPath = resolve(OUTPUT_DIR, filename);
  writeFileSync(outPath, buffer);
  console.log(`  Saved ${outPath} (${(buffer.length / 1024).toFixed(0)}KB)`);
  return outPath;
}

async function generate() {
  // 1. 提交任务
  const taskId = await submitTask();

  // 2. 轮询等待完成
  console.log('\nWaiting for generation to complete...');
  const task = await pollTask(taskId);

  // 3. 下载生成的音频
  console.log('\nDownloading audio files...');
  const clips = task.clips || task.songs || task.data || [];

  if (clips.length === 0) {
    // 尝试直接从 task 获取音频 URL
    if (task.audio_url) {
      await downloadAudio(task.audio_url, 'tavern-bgm.mp3');
    } else {
      throw new Error('No audio clips found in task result');
    }
  }

  // 下载所有生成的音频片段
  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];
    const audioUrl = clip.audio_url || clip.audio;
    if (audioUrl) {
      const filename = i === 0 ? 'tavern-bgm.mp3' : `tavern-bgm-v${i + 1}.mp3`;
      await downloadAudio(audioUrl, filename);
    }
  }

  console.log('\nDone!');
}

generate().catch(err => { console.error(err.message); process.exitCode = 1; });
