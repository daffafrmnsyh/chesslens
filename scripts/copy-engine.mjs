import {copyFile,mkdir,readdir} from 'node:fs/promises';
const dir='node_modules/stockfish/bin';
await mkdir('public/engine',{recursive:true});
for(const f of await readdir(dir)) if (/^stockfish-18-lite-single\.(js|wasm)$/.test(f)) await copyFile(`${dir}/${f}`,`public/engine/${f}`);
await copyFile('node_modules/stockfish/Copying.txt','public/engine/COPYING.txt');
