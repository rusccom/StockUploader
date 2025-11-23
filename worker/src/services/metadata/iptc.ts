import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { logStart, logSuccess, logError } from '../../utils/logger.js';

const execPromise = promisify(exec);

export interface ImageMetadata {
  title: string;
  keywords: string[];
  description: string;
  creator?: string;
  copyright?: string;
}

/**
 * Embeds IPTC metadata into a JPEG file using exiftool
 * Note: Requires exiftool to be installed on the system
 */
export async function embedMetadata(
  imagePath: string,
  metadata: ImageMetadata
): Promise<void> {
  const startTime = logStart('EXIFTOOL', 'embedMetadata', {
    imagePath: path.basename(imagePath),
    title: metadata.title,
    keywordCount: metadata.keywords.length,
  });

  const args = [
    `-Title=${metadata.title}`,
    `-Description=${metadata.description}`,
    `-Keywords=${metadata.keywords.join(',')}`,
  ];

  if (metadata.creator) {
    args.push(`-Creator=${metadata.creator}`);
  }

  if (metadata.copyright) {
    args.push(`-Copyright=${metadata.copyright}`);
  }

  // Add overwrite original flag
  args.push('-overwrite_original');
  args.push(imagePath);

  const command = `exiftool ${args.join(' ')}`;
  console.log(`  Command: exiftool [${args.length} args]`);

  try {
    const { stdout, stderr } = await execPromise(command);
    
    if (stdout) {
      console.log(`  Stdout: ${stdout.trim()}`);
    }
    
    if (stderr) {
      console.log(`  Stderr: ${stderr.trim()}`);
      if (!stderr.includes('image files updated')) {
        console.warn('  Exiftool warning detected');
      }
    }
    
    logSuccess('EXIFTOOL', 'embedMetadata', startTime, {
      fieldsEmbedded: args.length - 2, // minus overwrite flag and path
    });
  } catch (error) {
    logError('EXIFTOOL', 'embedMetadata', error);
    // Continue even if metadata embedding fails
    console.warn('  Continuing without metadata...');
  }
}

/**
 * Alternative: Simple metadata file creation (JSON sidecar)
 * This can be used if exiftool is not available
 */
export async function createMetadataFile(
  imagePath: string,
  metadata: ImageMetadata
): Promise<string> {
  const startTime = logStart('METADATA', 'createMetadataFile', {
    imagePath: path.basename(imagePath),
  });
  
  try {
    const metadataPath = imagePath.replace(/\.(jpg|jpeg|png)$/i, '.json');
    
    const metadataContent = {
      title: metadata.title,
      description: metadata.description,
      keywords: metadata.keywords,
      creator: metadata.creator || '',
      copyright: metadata.copyright || '',
      format: 'IPTC',
    };

    const jsonContent = JSON.stringify(metadataContent, null, 2);
    await fs.writeFile(metadataPath, jsonContent);

    logSuccess('METADATA', 'createMetadataFile', startTime, {
      metadataPath: path.basename(metadataPath),
      size: jsonContent.length,
    });

    return metadataPath;
  } catch (error) {
    logError('METADATA', 'createMetadataFile', error);
    throw error;
  }
}

