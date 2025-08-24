const fs = require('fs-extra');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

class LogoGenerator {
  constructor() {
    this.replicateApiToken = process.env.REPLICATE_API_TOKEN;
    this.imagesDir = path.join(__dirname, '../public/images');
  }

  async generateLogo() {
    console.log('🤖 Generating AI Buzz Tools logo with smiling robot...');
    
    if (!this.replicateApiToken) {
      console.error('❌ REPLICATE_API_TOKEN is required');
      return;
    }

    try {
      await fs.ensureDir(this.imagesDir);
      
      const logoPrompt = `AI Buzz Tools logo, cute smiling robot mascot, friendly cartoon style, modern tech company logo, blue and purple gradient colors, clean vector design, professional but fun, robot with big smile and happy eyes, technology theme, high quality logo design, transparent background suitable`;
      
      console.log('🎨 Generating logo with Replicate...');
      
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.replicateApiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
          input: {
            prompt: logoPrompt,
            width: 512,
            height: 512,
            scheduler: 'K_EULER',
            num_outputs: 1,
            guidance_scale: 7.5,
            num_inference_steps: 30,
            seed: Math.floor(Math.random() * 1000000),
          },
        }),
      });

      const prediction = await response.json();
      
      if (prediction.error) {
        console.error('Replicate prediction error:', prediction.error);
        throw new Error(prediction.error);
      }

      console.log(`⏳ Waiting for logo generation (ID: ${prediction.id})...`);
      
      // Poll for completion
      let result = prediction;
      let attempts = 0;
      const maxAttempts = 60;
      
      while ((result.status === 'starting' || result.status === 'processing') && attempts < maxAttempts) {
        if (attempts % 10 === 0) {
          console.log(`⏳ Still processing logo... (${attempts}s)`);
        }
        await new Promise(resolve => setTimeout(() => resolve(), 1000));
        attempts++;
        
        const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
          headers: {
            'Authorization': `Token ${this.replicateApiToken}`,
          },
        });
        
        result = await statusResponse.json();
      }

      if (result.status === 'succeeded' && result.output && result.output.length > 0) {
        console.log(`✅ Logo generated successfully!`);
        
        // Download and save the logo
        const logoUrl = result.output[0];
        await this.downloadAndSaveLogo(logoUrl);
        
        console.log('🎉 AI Buzz Tools logo is ready!');
        return true;
      }

      console.error('Logo generation failed:', result);
      throw new Error(`Logo generation failed with status: ${result.status}`);

    } catch (error) {
      console.error('❌ Logo generation failed:', error);
      return false;
    }
  }

  async downloadAndSaveLogo(logoUrl) {
    try {
      console.log('📥 Downloading logo...');
      
      const response = await fetch(logoUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const logoPath = path.join(this.imagesDir, 'logo.png');

      // Save the original logo
      await fs.writeFile(logoPath, Buffer.from(buffer));
      
      console.log(`✅ Logo saved to: ${logoPath}`);

    } catch (error) {
      console.error('Error downloading logo:', error);
      throw error;
    }
  }
}

async function main() {
  const generator = new LogoGenerator();
  await generator.generateLogo();
}

if (require.main === module) {
  main();
}

module.exports = { LogoGenerator };