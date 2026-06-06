#!/usr/bin/env node
const esbuild = require('esbuild');
const { readFileSync } = require('fs');
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));

(async()=>{
  try{
    await esbuild.build({
      entryPoints: ['src/whatsapp-lead-widget.js'],
      bundle: true,
      minify: true,
      sourcemap: true,
      format: 'esm',
      target: ['es2017'],
      outfile: 'dist/whatsapp-lead-widget.js',
    });
    console.log('Built dist/whatsapp-lead-widget.js');
  }catch(err){
    console.error(err);
    process.exit(1);
  }
})();
