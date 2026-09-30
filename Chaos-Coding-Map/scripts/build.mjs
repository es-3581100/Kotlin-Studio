import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
const root=new URL('..',import.meta.url); const dist=new URL('../dist/',import.meta.url);
await rm(dist,{recursive:true,force:true}); await mkdir(dist,{recursive:true});
for(const [src,dst] of [['index.html','index.html'],['src/styles.css','styles.css'],['src/app.js','app.js'],['src/core','core'],['src/ui','ui'],['data','data'],['public/original','original'],['public/sources','sources']]){
  const s=new URL('../'+src,import.meta.url), d=new URL('../dist/'+dst,import.meta.url); if(existsSync(s)) await cp(s,d,{recursive:true});
}
console.log('dist ready');
