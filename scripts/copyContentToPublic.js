const fs = require('fs');
const path = require('path');

// Copy content JSON files to public/content for static export
async function copyContentToPublic() {
  const contentDir = path.join(__dirname, '..', 'content');
  const publicContentDir = path.join(__dirname, '..', 'public', 'content');

  // Create public/content directory if it doesn't exist
  if (!fs.existsSync(publicContentDir)) {
    fs.mkdirSync(publicContentDir, { recursive: true });
  }

  // Files to copy
  const filesToCopy = [
    'tools.json',
    'tool-cards.json',
    'categories.json',
    'articles.json',
    'config.json'
  ];

  console.log('📋 Copying content files to public/content...');

  let copied = 0;
  let skipped = 0;

  for (const file of filesToCopy) {
    const sourcePath = path.join(contentDir, file);
    const destPath = path.join(publicContentDir, file);

    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Copied ${file}`);
      copied++;
    } else {
      console.log(`⏭️  Skipped ${file} (not found)`);
      skipped++;
    }
  }

  console.log(`\n✨ Done! Copied: ${copied}, Skipped: ${skipped}`);
}

// Run if called directly
if (require.main === module) {
  copyContentToPublic().catch(console.error);
}

module.exports = { copyContentToPublic };
