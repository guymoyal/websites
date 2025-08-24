interface ImageGenerationOptions {
  prompt: string;
  width?: number;
  height?: number;
  style?: 'realistic' | 'artistic' | 'minimalist';
}

interface GeneratedImage {
  url: string;
  width: number;
  height: number;
  alt: string;
}

export class AIImageGenerator {
  private apiKey: string;
  private provider: 'replicate' | 'openai' | 'placeholder';

  constructor(apiKey: string, provider: 'replicate' | 'openai' | 'placeholder' = 'replicate') {
    this.apiKey = apiKey;
    this.provider = provider;
  }

  async generateImage(options: ImageGenerationOptions): Promise<GeneratedImage> {
    switch (this.provider) {
      case 'replicate':
        return this.generateWithReplicate(options);
      case 'openai':
        return this.generateWithOpenAI(options);
      case 'placeholder':
        return this.generatePlaceholder(options);
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }

  private async generateWithReplicate(options: ImageGenerationOptions): Promise<GeneratedImage> {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4',
        input: {
          prompt: this.enhancePrompt(options.prompt, options.style),
          width: options.width || 1024,
          height: options.height || 768,
          num_outputs: 1,
          guidance_scale: 7.5,
          num_inference_steps: 50,
        },
      }),
    });

    const prediction = await response.json();
    
    if (prediction.error) {
      throw new Error(prediction.error);
    }

    // Poll for completion
    let result = prediction;
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds timeout
    
    while ((result.status === 'starting' || result.status === 'processing') && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
      
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          'Authorization': `Token ${this.apiKey}`,
        },
      });
      
      result = await statusResponse.json();
    }

    if (result.status === 'succeeded' && result.output && result.output.length > 0) {
      return {
        url: result.output[0],
        width: options.width || 1024,
        height: options.height || 768,
        alt: options.prompt
      };
    }

    throw new Error(`Image generation failed with status: ${result.status}`);
  }

  private async generateWithOpenAI(options: ImageGenerationOptions): Promise<GeneratedImage> {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: this.enhancePrompt(options.prompt, options.style),
        n: 1,
        size: `${options.width || 1024}x${options.height || 1024}`,
        quality: 'standard',
        style: options.style === 'realistic' ? 'natural' : 'vivid'
      }),
    });

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error.message);
    }

    return {
      url: result.data[0].url,
      width: options.width || 1024,
      height: options.height || 1024,
      alt: options.prompt
    };
  }

  private async generatePlaceholder(options: ImageGenerationOptions): Promise<GeneratedImage> {
    // Generate a placeholder image URL
    const width = options.width || 1024;
    const height = options.height || 768;
    
    return {
      url: `https://via.placeholder.com/${width}x${height}/3B82F6/FFFFFF?text=${encodeURIComponent(options.prompt.substring(0, 50))}`,
      width,
      height,
      alt: options.prompt
    };
  }

  private enhancePrompt(prompt: string, style?: string): string {
    let enhancedPrompt = prompt;
    
    // Add style modifiers
    switch (style) {
      case 'realistic':
        enhancedPrompt += ', photorealistic, high quality, professional photography';
        break;
      case 'artistic':
        enhancedPrompt += ', artistic illustration, creative design, vibrant colors';
        break;
      case 'minimalist':
        enhancedPrompt += ', minimalist design, clean lines, simple composition';
        break;
      default:
        enhancedPrompt += ', professional, clean, modern design';
    }

    return enhancedPrompt;
  }

  async generateHeroImage(topic: string): Promise<GeneratedImage> {
    return this.generateImage({
      prompt: `Hero banner for ${topic} website, modern technology theme, professional and engaging`,
      width: 1920,
      height: 1080,
      style: 'realistic'
    });
  }

  async generateArticleImage(title: string, category: string): Promise<GeneratedImage> {
    return this.generateImage({
      prompt: `Professional illustration for article about "${title}" in ${category} category, informative and engaging`,
      width: 1024,
      height: 768,
      style: 'artistic'
    });
  }

  async generateComparisonImage(products: string[]): Promise<GeneratedImage> {
    return this.generateImage({
      prompt: `Comparison illustration showing ${products.join(' vs ')}, side-by-side comparison, professional design`,
      width: 1200,
      height: 800,
      style: 'minimalist'
    });
  }
}

// Utility functions for image optimization
export function getOptimizedImageUrl(url: string, width: number, height: number): string {
  // This would integrate with your CDN or image optimization service
  // For now, return the original URL
  return url;
}

export function generateImageAlt(title: string, category: string): string {
  return `Illustration for ${title} - ${category} guide and tips`;
}

export function getImagePlaceholder(width: number, height: number): string {
  return `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="14" fill="#9ca3af">
        ${width} × ${height}
      </text>
    </svg>`
  ).toString('base64')}`;
}

// Factory function to create image generator based on environment
export function createImageGenerator(): AIImageGenerator {
  const replicateToken = process.env.REPLICATE_API_TOKEN;
  const openaiKey = process.env.OPENAI_API_KEY;
  const provider = process.env.IMAGE_PROVIDER as 'replicate' | 'openai' | 'placeholder' || 'placeholder';
  
  if (provider === 'replicate' && replicateToken) {
    return new AIImageGenerator(replicateToken, 'replicate');
  } else if (provider === 'openai' && openaiKey) {
    return new AIImageGenerator(openaiKey, 'openai');
  } else {
    return new AIImageGenerator('', 'placeholder');
  }
}