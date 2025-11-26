import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { logStart, logSuccess, logError, formatBytes } from '../../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface PromptData {
  prompt: string;
  title: string;
  keywords: string[];
  description: string;
}

async function loadSystemPrompt(): Promise<string> {
  const startTime = logStart('GEMINI', 'loadSystemPrompt');
  
  try {
    const promptPath = path.join(
      __dirname, 
      '../../../prompts/system-prompt.json'
    );
    const promptData = await fs.readFile(promptPath, 'utf-8');
    const promptJson = JSON.parse(promptData);
    
    logSuccess('GEMINI', 'loadSystemPrompt', startTime, {
      promptLength: promptJson.content.length,
    });
    
    return promptJson.content;
  } catch (error) {
    logError('GEMINI', 'loadSystemPrompt', error);
    throw error;
  }
}

export async function generatePrompts(
  topic: string,
  count: number
): Promise<PromptData[]> {
  const startTime = logStart('GEMINI', 'generatePrompts', {
    topic,
    requestedCount: count,
  });
  
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not set');
  }

  try {
    const systemPrompt = await loadSystemPrompt();

    const userMessage = `Generate ${count} unique and diverse stock photography prompts for the topic: "${topic}". 
  
Each prompt should be different and cover various aspects, angles, or scenarios related to this topic. 
Ensure variety in composition, lighting, subjects, and mood while maintaining professional stock photo quality.

Return ONLY valid JSON array format as specified in the system prompt.`;

    const requestBody = JSON.stringify({
      model: 'google/gemini-3-pro-preview',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    console.log(`  API: OpenRouter (Gemini 3 Pro)`);
    console.log(`  Request size: ${formatBytes(requestBody.length)}`);

    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: requestBody,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON response
    const prompts: PromptData[] = JSON.parse(content);

    if (!Array.isArray(prompts) || prompts.length === 0) {
      throw new Error('Invalid response from Gemini');
    }

    logSuccess('GEMINI', 'generatePrompts', startTime, {
      generatedCount: prompts.length,
      responseSize: formatBytes(content.length),
      avgPromptLength: Math.round(
        prompts.reduce((sum, p) => sum + p.prompt.length, 0) / prompts.length
      ),
    });

    return prompts;
  } catch (error) {
    logError('GEMINI', 'generatePrompts', error);
    throw error;
  }
}

