import { fal } from '@fal-ai/client';
import { logStart, logSuccess, logError } from '../../utils/logger.js';

export async function upscaleImage(imageUrl: string): Promise<string> {
  const startTime = logStart('FAL_UPSCALE', 'upscaleFluxVision', {
    model: 'flux-vision-upscaler',
    imageUrl: imageUrl.substring(0, 50) + '...',
    upscaleFactor: 2,
  });
  
  const apiKey = process.env.FAL_KEY;
  if (!apiKey) {
    throw new Error('FAL_KEY not set');
  }

  fal.config({
    credentials: apiKey,
  });

  try {
    console.log('  Submitting to FAL AI upscale queue...');
    
    const result = await fal.subscribe('fal-ai/flux-vision-upscaler', {
      input: {
        image_url: imageUrl,
        upscale_factor: 2,
        creativity: 0.3,
        guidance: 1,
        steps: 20,
        enable_safety_checker: true,
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

    if (!result.data.image) {
      throw new Error('No upscaled image returned');
    }

    const upscaledUrl = result.data.image.url;
    
    logSuccess('FAL_UPSCALE', 'upscaleFluxVision', startTime, {
      upscaledUrl: upscaledUrl.substring(0, 50) + '...',
      method: 'flux-vision',
    });

    return upscaledUrl;
  } catch (error) {
    logError('FAL_UPSCALE', 'upscaleFluxVision', error);
    throw error;
  }
}

