/**
 * Simple logging utility for tracking external service calls
 * Logs are output to console (GitHub Actions / Cloudflare)
 */

export function logStart(
  service: string,
  operation: string,
  params?: Record<string, any>
): number {
  const timestamp = Date.now();
  console.log(`[${service}] ${operation} - STARTED`);
  
  if (params) {
    const sanitized = sanitizeParams(params);
    console.log(`  Parameters:`, sanitized);
  }
  
  return timestamp;
}

export function logSuccess(
  service: string,
  operation: string,
  startTime: number,
  result?: Record<string, any>
): void {
  const duration = Date.now() - startTime;
  console.log(`[${service}] ${operation} - SUCCESS (${duration}ms)`);
  
  if (result) {
    const sanitized = sanitizeParams(result);
    console.log(`  Result:`, sanitized);
  }
}

export function logError(
  service: string,
  operation: string,
  error: any
): void {
  console.error(`[${service}] ${operation} - FAILED`);
  console.error(`  Error:`, error instanceof Error ? error.message : error);
  
  if (error instanceof Error && error.stack) {
    console.error(`  Stack:`, error.stack);
  }
}

/**
 * Sanitize sensitive data from logs
 */
function sanitizeParams(params: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(params)) {
    const lowerKey = key.toLowerCase();
    
    // Mask sensitive fields
    if (
      lowerKey.includes('password') ||
      lowerKey.includes('secret') ||
      lowerKey.includes('token') ||
      lowerKey.includes('key')
    ) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string' && value.length > 100) {
      // Truncate long strings
      sanitized[key] = value.substring(0, 100) + '...';
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Format file size for logging
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

