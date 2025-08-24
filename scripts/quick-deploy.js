#!/usr/bin/env node

/**
 * Quick Deploy Script
 * Only deploys when specific files change to avoid full rebuilds
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Files that trigger a quick deploy (no full rebuild)
const QUICK_DEPLOY_FILES = [
  'public/sw.js',
  'public/robots.txt',
  'public/ads.txt',
  'public/sitemap.xml'
];

// Check if only quick-deploy files changed
function getChangedFiles() {
  try {
    const output = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    console.log('Could not get git diff, assuming full deploy needed');
    return ['*']; // Trigger full deploy
  }
}

function shouldQuickDeploy(changedFiles) {
  // If no changes, skip
  if (changedFiles.length === 0) return false;
  
  // If all changed files are in quick-deploy list, do quick deploy
  return changedFiles.every(file => 
    QUICK_DEPLOY_FILES.some(quickFile => file.includes(quickFile))
  );
}

function quickDeploy() {
  console.log('🚀 Quick deploying static files only...');
  
  // Copy public files to out directory without full rebuild
  if (!fs.existsSync('out')) {
    fs.mkdirSync('out', { recursive: true });
  }
  
  // Copy specific files
  QUICK_DEPLOY_FILES.forEach(file => {
    if (fs.existsSync(file)) {
      const filename = path.basename(file);
      fs.copyFileSync(file, path.join('out', filename));
      console.log(`✅ Copied ${file} → out/${filename}`);
    }
  });
  
  console.log('✨ Quick deploy completed!');
  console.log('💡 Upload the out/ directory to CloudFlare Pages manually or via API');
}

function fullDeploy() {
  console.log('🔄 Full build required...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Full build completed!');
}

// Main logic
const changedFiles = getChangedFiles();
console.log('📁 Changed files:', changedFiles);

if (shouldQuickDeploy(changedFiles)) {
  quickDeploy();
} else {
  fullDeploy();
}
