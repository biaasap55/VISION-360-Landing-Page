#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Load .env if present (for local builds; Vercel/Netlify inject env natively)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  });
}

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY. Create a .env file or set env vars.');
  process.exit(1);
}

const src = path.join(__dirname, 'index.html');
const distDir = path.join(__dirname, 'dist');
const dest = path.join(distDir, 'index.html');

if (!fs.existsSync(distDir)) fs.mkdirSync(distDir);

let html = fs.readFileSync(src, 'utf8');
html = html.replace('%%SUPABASE_URL%%', url);
html = html.replace('%%SUPABASE_ANON_KEY%%', key);

fs.writeFileSync(dest, html);

// Copy assets
const assetsDir = path.join(__dirname, 'assets');
const distAssets = path.join(distDir, 'assets');
if (fs.existsSync(assetsDir)) {
  if (!fs.existsSync(distAssets)) fs.mkdirSync(distAssets);
  fs.readdirSync(assetsDir).forEach(f => {
    fs.copyFileSync(path.join(assetsDir, f), path.join(distAssets, f));
  });
}

console.log('Build complete → dist/');
