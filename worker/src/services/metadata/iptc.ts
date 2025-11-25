import fs from 'fs/promises';
import path from 'path';
import piexif from 'piexifjs';
import { logStart, logSuccess, logError } from '../../utils/logger.js';

export interface ImageMetadata {
  title: string;
  keywords: string[];
  description: string;
  creator?: string;
  copyright?: string;
}

/**
 * Embeds EXIF metadata into a JPEG file using piexifjs
 * Note: IPTC keywords are passed via CSV during SFTP upload
 */
export async function embedMetadata(
  imagePath: string,
  metadata: ImageMetadata
): Promise<void> {
  const startTime = logStart('PIEXIF', 'embedMetadata', {
    imagePath: path.basename(imagePath),
    title: metadata.title,
    keywordCount: metadata.keywords.length,
  });

  try {
    const jpegData = await fs.readFile(imagePath);
    const jpegBinary = jpegData.toString('binary');
    
    // Load existing EXIF or create new
    let exifObj: piexif.IExif;
    try {
      exifObj = piexif.load(jpegBinary);
    } catch {
      exifObj = { '0th': {}, Exif: {}, GPS: {}, Interop: {}, '1st': {} };
    }

    // Set EXIF tags
    exifObj['0th'][piexif.ImageIFD.ImageDescription] = metadata.description;
    
    if (metadata.creator) {
      exifObj['0th'][piexif.ImageIFD.Artist] = metadata.creator;
    }
    
    if (metadata.copyright) {
      exifObj['0th'][piexif.ImageIFD.Copyright] = metadata.copyright;
    }

    // Dump and insert EXIF
    const exifBytes = piexif.dump(exifObj);
    const newJpegBinary = piexif.insert(exifBytes, jpegBinary);
    const newJpegBuffer = Buffer.from(newJpegBinary, 'binary');

    await fs.writeFile(imagePath, newJpegBuffer);

    logSuccess('PIEXIF', 'embedMetadata', startTime, {
      fieldsEmbedded: 3,
      note: 'Keywords passed via CSV during SFTP upload',
    });
  } catch (error) {
    logError('PIEXIF', 'embedMetadata', error);
    // Continue even if metadata embedding fails
    console.warn('  Continuing without embedded metadata...');
  }
}

/**
 * Creates JSON sidecar file with metadata
 * Used as backup/reference for image metadata
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
