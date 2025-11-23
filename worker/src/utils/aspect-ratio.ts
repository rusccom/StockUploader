/**
 * Utility for selecting random aspect ratios based on generation model
 */

const FLUX_ASPECT_RATIOS = ['3:2', '16:9', '2:3', '9:16'] as const;
const IMAGEN4_ASPECT_RATIOS = ['16:9', '9:16', '4:3', '3:4'] as const;

type FluxAspectRatio = typeof FLUX_ASPECT_RATIOS[number];
type Imagen4AspectRatio = typeof IMAGEN4_ASPECT_RATIOS[number];

/**
 * Get a random aspect ratio for the specified model
 * @param model - The generation model ('flux' or 'imagen4')
 * @returns A random aspect ratio string suitable for the model
 */
export function getRandomAspectRatio(
  model: 'flux' | 'imagen4'
): FluxAspectRatio | Imagen4AspectRatio {
  const ratios = model === 'flux' ? FLUX_ASPECT_RATIOS : IMAGEN4_ASPECT_RATIOS;
  const randomIndex = Math.floor(Math.random() * ratios.length);
  const selectedRatio = ratios[randomIndex];
  
  console.log(`  [ASPECT_RATIO] Selected ${selectedRatio} for ${model}`);
  
  return selectedRatio;
}

