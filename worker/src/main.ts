import * as db from './services/db.js';
import { generatePrompts } from './services/llm/gemini.js';
import * as fluxImage from './services/image/flux.js';
import * as imagen4 from './services/image/imagen4.js';
import * as fluxVision from './services/upscale/flux-vision.js';
import * as seedvr from './services/upscale/seedvr.js';
import { embedMetadata, createMetadataFile } from './services/metadata/iptc.js';
import { getAccessToken } from './services/adobe/auth.js';
import { uploadBatchToAdobeStock, type ImageToUpload } from './services/adobe/upload.js';
import { logStart, logSuccess, logError, formatBytes } from './utils/logger.js';
import { getRandomAspectRatio } from './utils/aspect-ratio.js';
import fs from 'fs/promises';
import path from 'path';

async function downloadImage(url: string, filepath: string): Promise<void> {
  const startTime = logStart('DOWNLOAD', 'downloadImage', {
    url: url.substring(0, 50) + '...',
    filename: path.basename(filepath),
  });
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    const fileSize = buffer.byteLength;
    
    await fs.writeFile(filepath, Buffer.from(buffer));
    
    logSuccess('DOWNLOAD', 'downloadImage', startTime, {
      fileSize: formatBytes(fileSize),
      downloadSpeed: `${(fileSize / 1024 / ((Date.now() - startTime) / 1000)).toFixed(2)} KB/s`,
    });
  } catch (error) {
    logError('DOWNLOAD', 'downloadImage', error);
    throw error;
  }
}

async function processOneTopic() {
  console.log('='.repeat(60));
  console.log('Stock Uploader Worker - Starting');
  console.log('='.repeat(60));

  try {
    // Get oldest 'new' topic
    console.log('\n[Step 1] Fetching topic from database...');
    const topic = await db.getOldestNewTopic();

    if (!topic) {
      console.log('No topics with status "new" found. Exiting.');
      return;
    }

    console.log(`Found topic: "${topic.topic_name}"`);
    console.log(`  - ID: ${topic.id}`);
    console.log(`  - Image count: ${topic.image_count}`);
    console.log(`  - Model: ${topic.model}`);
    console.log(`  - Upscale model: ${topic.upscale_model}`);

    // Update status to processing
    console.log('\n[Step 2] Marking topic as processing...');
    await db.updateTopicStatus(topic.id, 'processing');

    // Get Adobe credentials
    console.log('\n[Step 3] Getting Adobe Stock credentials...');
    const adobeCreds = await db.getAdobeCredentials();
    
    let accessToken = '';
    let hasSftpCredentials = false;
    
    if (adobeCreds && adobeCreds.client_id && adobeCreds.client_secret) {
      const tokenData = await getAccessToken(
        adobeCreds.client_id,
        adobeCreds.client_secret
      );
      accessToken = tokenData.access_token;
      console.log('Adobe OAuth token obtained');
    } else {
      console.warn('No Adobe API credentials configured.');
    }
    
    // Check for SFTP credentials
    if (adobeCreds && adobeCreds.sftp_host && adobeCreds.sftp_username && adobeCreds.sftp_password) {
      hasSftpCredentials = true;
      console.log('Adobe Stock SFTP credentials available');
    } else {
      console.warn('No Adobe Stock SFTP credentials configured. Upload will be skipped.');
    }

    // Generate prompts with Gemini
    console.log('\n[Step 4] Generating prompts with Gemini...');
    const prompts = await generatePrompts(topic.topic_name, topic.image_count);
    console.log(`Generated ${prompts.length} prompts`);

    // Create output directory
    const outputDir = path.join(process.cwd(), 'output', `topic-${topic.id}`);
    await fs.mkdir(outputDir, { recursive: true });
    console.log(`Output directory: ${outputDir}`);

    // Process each prompt
    let successCount = 0;
    let errorCount = 0;
    let uploadedCount = 0;
    
    // Array to accumulate generated images for batch upload
    const generatedImages: ImageToUpload[] = [];
    
    for (let i = 0; i < prompts.length; i++) {
      const promptData = prompts[i];
      console.log(`\n[Step 5.${i + 1}] Processing prompt ${i + 1}/${prompts.length}`);
      console.log(`Title: ${promptData.title}`);
      
      const promptStartTime = Date.now();

      try {
        // Select random aspect ratio for this image
        const aspectRatio = getRandomAspectRatio(topic.model);
        
        // Generate image
        console.log('  → Generating image...');
        let imageUrl: string;
        
        if (topic.model === 'flux') {
          imageUrl = await fluxImage.generateImage(promptData.prompt, aspectRatio);
        } else {
          imageUrl = await imagen4.generateImage(promptData.prompt, aspectRatio);
        }
        
        console.log(`  ✓ Image generated: ${imageUrl}`);

        // Download generated image
        const tempImagePath = path.join(outputDir, `temp_${i + 1}.jpg`);
        await downloadImage(imageUrl, tempImagePath);

        // Upscale image
        console.log('  → Upscaling image...');
        let upscaledUrl: string;
        
        if (topic.upscale_model === 'flux-vision') {
          upscaledUrl = await fluxVision.upscaleImage(imageUrl);
        } else {
          upscaledUrl = await seedvr.upscaleImage(imageUrl);
        }
        
        console.log(`  ✓ Image upscaled: ${upscaledUrl}`);

        // Download upscaled image
        const finalImagePath = path.join(outputDir, `image_${i + 1}.jpg`);
        await downloadImage(upscaledUrl, finalImagePath);

        // Embed metadata
        console.log('  → Embedding metadata...');
        await embedMetadata(finalImagePath, {
          title: promptData.title,
          keywords: promptData.keywords,
          description: promptData.description,
        });

        // Create metadata sidecar file
        await createMetadataFile(finalImagePath, {
          title: promptData.title,
          keywords: promptData.keywords,
          description: promptData.description,
        });
        
        console.log(`  ✓ Metadata embedded`);

        // Add to batch upload queue (don't upload immediately)
        if (hasSftpCredentials && adobeCreds) {
          generatedImages.push({
            path: finalImagePath,
            metadata: {
              title: promptData.title,
              keywords: promptData.keywords,
              description: promptData.description,
            }
          });
          console.log('  → Added to upload queue');
        }

        // Clean up temp file
        try {
          await fs.unlink(tempImagePath);
        } catch (e) {
          // Ignore cleanup errors
        }

        const promptDuration = Date.now() - promptStartTime;
        console.log(`  ✓ Prompt ${i + 1} completed successfully (${promptDuration}ms)`);
        successCount++;
      } catch (error) {
        console.error(`  ✗ Error processing prompt ${i + 1}:`, error);
        errorCount++;
        // Continue with next prompt
      }
    }
    
    console.log(`\n[Summary] Processed ${prompts.length} prompts`);
    console.log(`  Success: ${successCount}`);
    console.log(`  Errors: ${errorCount}`);

    // Batch upload all generated images to Adobe Stock via SFTP
    if (hasSftpCredentials && adobeCreds && generatedImages.length > 0) {
      console.log(`\n[Step 6] Uploading ${generatedImages.length} images to Adobe Stock...`);
      console.log('  Using single SFTP connection for all files (batch upload)');
      
      uploadedCount = await uploadBatchToAdobeStock(
        generatedImages,
        {
          host: adobeCreds.sftp_host!,
          username: adobeCreds.sftp_username!,
          password: adobeCreds.sftp_password!,
        }
      );
      
      console.log(`\n✓ Upload complete: ${uploadedCount}/${generatedImages.length} images uploaded successfully`);
    } else if (!hasSftpCredentials || !adobeCreds) {
      console.log('\n[Step 6] Skipping Adobe Stock upload (no SFTP credentials configured)');
    }

    // Update upload statistics
    if (uploadedCount > 0) {
      console.log('\n[Step 7] Updating upload statistics...');
      await db.updateUploadStats(topic.id, uploadedCount);
    }

    // Mark as done
    console.log('\n[Step 8] Marking topic as done...');
    await db.updateTopicStatus(topic.id, 'done');

    console.log('\n' + '='.repeat(60));
    console.log(`✓ Topic "${topic.topic_name}" completed successfully!`);
    console.log(`  Output: ${outputDir}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n✗ Fatal error:', error);
    throw error;
  } finally {
    await db.close();
  }
}

// Run the worker
processOneTopic()
  .then(() => {
    console.log('\nWorker finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nWorker failed:', error);
    process.exit(1);
  });

