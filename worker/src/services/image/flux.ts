import { fal } from '@fal-ai/client';
import { logStart, logSuccess, logError } from '../../utils/logger.js';

export async function generateImage(
  prompt: string,
  aspectRatio?: string
): Promise<string> {
  const ratio = aspectRatio || '3:2';
  
  const startTime = logStart('FAL_FLUX', 'generateImage', {
    model: 'flux-pro/v1.1-ultra',
    promptLength: prompt.length,
    promptPreview: prompt.substring(0, 80) + '...',
    aspectRatio: ratio,
  });
  
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    throw new Error('FAL_KEY not set');
  }

  fal.config({
    credentials: apiKey,
  });

  try {
    console.log('  Submitting to FAL AI queue...');
    
    const result = await fal.subscribe('fal-ai/flux-pro/v1.1-ultra', {
      input: {
        prompt: prompt,
        num_images: 1,
        enable_safety_checker: true,
        output_format: 'jpeg',
        aspect_ratio: ratio,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          update.logs.map((log) => log.message).forEach((msg) => 
            console.log(`    [FAL] ${msg}`)
          );
        }
      },
    });

    if (!result.data.images || result.data.images.length === 0) {
      throw new Error('No image generated');
    }

    const imageUrl = result.data.images[0].url;
    
    logSuccess('FAL_FLUX', 'generateImage', startTime, {
      imageUrl: imageUrl.substring(0, 50) + '...',
      format: 'jpeg',
      aspectRatio: ratio,
    });

    return imageUrl;
  } catch (error) {
    logError('FAL_FLUX', 'generateImage', error);
    throw error;
  }
}

