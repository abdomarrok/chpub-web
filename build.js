#!/usr/bin/env node
/**
 * build.js — Minification and Build Script
 * Minifies JS, CSS, and HTML for production deployment
 * 
 * Usage:
 *   npm run build          - Build everything
 *   npm run build:js       - Minify only JavaScript
 *   npm run build:css      - Minify only CSS
 *   npm run clean          - Remove dist/ folder
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { minify as minifyJS } from 'terser';
import { minify as minifyHTML } from 'html-minifier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = __dirname;
const distDir = path.join(baseDir, 'dist');
const args = process.argv.slice(2);

// Helper functions
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const copyDir = (src, dest) => {
  ensureDir(dest);
  if (!fs.existsSync(src)) return;
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  entries.forEach(entry => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
};

// Minify JavaScript
const minifyJavaScript = async () => {
  console.log('📦 Minifying JavaScript...');
  const jsDir = path.join(baseDir, 'js');
  const distJsDir = path.join(distDir, 'js');
  ensureDir(distJsDir);
  
  const files = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
  
  for (const file of files) {
    const srcFile = path.join(jsDir, file);
    const distFile = path.join(distJsDir, file);
    const code = fs.readFileSync(srcFile, 'utf8');
    
    try {
      const result = await minifyJS(code, {
        compress: {
          passes: 2,
          drop_console: false // Keep console.error for debugging
        },
        mangle: true,
        output: {
          comments: false
        }
      });
      
      fs.writeFileSync(distFile, result.code);
      const originalSize = code.length;
      const minifiedSize = result.code.length;
      const reduction = ((1 - minifiedSize / originalSize) * 100).toFixed(1);
      console.log(`  ✓ ${file} → ${reduction}% reduction`);
    } catch (err) {
      console.error(`  ✗ Error minifying ${file}:`, err.message);
    }
  }
};

// Minify CSS
const minifyStylesheets = () => {
  console.log('🎨 Minifying CSS...');
  const cssDir = path.join(baseDir, 'css');
  const distCssDir = path.join(distDir, 'css');
  ensureDir(distCssDir);
  
  const files = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
  
  for (const file of files) {
    const srcFile = path.join(cssDir, file);
    const distFile = path.join(distCssDir, file);
    const code = fs.readFileSync(srcFile, 'utf8');
    
    try {
      // Basic CSS minification (remove comments, whitespace)
      let minified = code
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ')             // Collapse whitespace
        .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around braces
        .trim();
      
      fs.writeFileSync(distFile, minified);
      const reduction = ((1 - minified.length / code.length) * 100).toFixed(1);
      console.log(`  ✓ ${file} → ${reduction}% reduction`);
    } catch (err) {
      console.error(`  ✗ Error minifying ${file}:`, err.message);
    }
  }
};

// Minify HTML
const minifyMarkup = () => {
  console.log('📄 Minifying HTML...');
  const srcHtml = path.join(baseDir, 'index.html');
  const distHtml = path.join(distDir, 'index.html');
  
  if (!fs.existsSync(srcHtml)) {
    console.log('  ✗ index.html not found');
    return;
  }
  
  try {
    const code = fs.readFileSync(srcHtml, 'utf8');
    const minified = minifyHTML(code, {
      removeComments: true,
      collapseWhitespace: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true,
      removeOptionalTags: false,
      removeRedundantAttributes: true
    });
    
    fs.writeFileSync(distHtml, minified);
    const reduction = ((1 - minified.length / code.length) * 100).toFixed(1);
    console.log(`  ✓ index.html → ${reduction}% reduction`);
  } catch (err) {
    console.error(`  ✗ Error minifying HTML:`, err.message);
  }
};

// Copy assets
const copyAssets = () => {
  console.log('📁 Copying assets...');
  const assetsDir = path.join(baseDir, 'assets');
  const distAssetsDir = path.join(distDir, 'assets');
  
  if (fs.existsSync(assetsDir)) {
    copyDir(assetsDir, distAssetsDir);
    console.log('  ✓ Assets copied');
  }
};

// Main build process
const build = async () => {
  console.log('\n🚀 Building production assets...\n');
  
  const onlyJs = args.includes('--js-only');
  const onlyCss = args.includes('--css-only');
  
  try {
    if (!onlyCss) await minifyJavaScript();
    if (!onlyJs) minifyStylesheets();
    if (!onlyJs && !onlyCss) {
      minifyMarkup();
      copyAssets();
    }
    
    console.log('\n✅ Build complete! Output in ./dist/\n');
  } catch (err) {
    console.error('\n❌ Build failed:', err.message);
    process.exit(1);
  }
};

build();
