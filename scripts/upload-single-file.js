#!/usr/bin/env node

/**
 * Upload single file to CloudFlare Pages via API
 * Usage: node upload-single-file.js <file-path>
 */

const fs = require('fs');
const path = require('path');

// You'll need to set these environment variables
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const PROJECT_NAME = process.env.CLOUDFLARE_PROJECT_NAME || 'ai-buzz-world';

async function uploadSingleFile(filePath) {
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID) {
    console.error('❌ Missing CloudFlare credentials');
    console.log('Set these environment variables:');
    console.log('- CLOUDFLARE_API_TOKEN');
    console.log('- CLOUDFLARE_ACCOUNT_ID');
    console.log('- CLOUDFLARE_PROJECT_NAME (optional)');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const fileName = path.basename(filePath);
  const fileContent = fs.readFileSync(filePath, 'utf8');
  
  console.log(`📤 Uploading ${fileName} to CloudFlare Pages...`);
  
  // Note: This is a conceptual example
  // CloudFlare Pages API doesn't support single file uploads
  // You'd need to create a deployment with the updated file
  
  console.log('⚠️  CloudFlare Pages requires full deployments');
  console.log('💡 Consider using CloudFlare Workers for dynamic files like sw.js');
  console.log('🔗 See: docs/service-worker-deployment.md');
}

// Parse command line arguments
const filePath = process.argv[2];
if (!filePath) {
  console.log('Usage: node upload-single-file.js <file-path>');
  console.log('Example: node upload-single-file.js public/sw.js');
  process.exit(1);
}

uploadSingleFile(filePath);
