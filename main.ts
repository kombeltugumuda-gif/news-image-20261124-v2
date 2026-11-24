// make.fun news-image-20261124 entry: "The World on Tuesday, 24 November 2026".
// Node 22, standard library only, no network. The front page is pre-rendered (poster/frontpage.html,
// rendered by poster/render.mjs) into entry.png beside this file; this program writes those exact bytes
// to the output directory, so both grader runs produce identical output.
//
// Locally:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const image = readFileSync(new URL('./entry.png', import.meta.url));

// Refuse to emit anything the gate would reject: a PNG of at most 1 MiB and 1024 x 1024.
const PNG_SIGNATURE = '89504e470d0a1a0a';
if (image.subarray(0, 8).toString('hex') !== PNG_SIGNATURE) throw new Error('entry.png is not a PNG');
if (image.length > 1024 * 1024) throw new Error(`entry.png is ${image.length} bytes, over 1 MiB`);
const width = image.readUInt32BE(16);
const height = image.readUInt32BE(20);
if (width > 1024 || height > 1024) throw new Error(`entry.png is ${width}x${height}, over 1024x1024`);

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), image);
console.log(`wrote ${join(outDir, 'entry.png')} (${width}x${height}, ${image.length} bytes)`);
