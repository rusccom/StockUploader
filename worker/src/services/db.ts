import mysql from 'mysql2/promise';
import { logStart, logSuccess, logError } from '../utils/logger.js';

export interface Topic {
  id: number;
  topic_name: string;
  image_count: number;
  model: string;
  upscale_model: string;
  status: string;
  created_at: string;
  uploaded_count: number;
  uploaded_at: string | null;
}

export interface AdobeCredentials {
  client_id: string;
  client_secret: string;
  access_token?: string;
  token_expires_at?: string;
  sftp_host?: string;
  sftp_username?: string;
  sftp_password?: string;
}

let connection: mysql.Connection | null = null;

export async function connect() {
  if (!connection) {
    const startTime = logStart('DATABASE', 'connect', {
      hasDbUrl: !!process.env.DB_URL,
    });
    
    const dbUrl = process.env.DB_URL;
    if (!dbUrl) {
      throw new Error('DB_URL environment variable not set');
    }
    
    try {
      connection = await mysql.createConnection(dbUrl);
      logSuccess('DATABASE', 'connect', startTime);
    } catch (error) {
      logError('DATABASE', 'connect', error);
      throw error;
    }
  }
  return connection;
}

export async function getOldestNewTopic(): Promise<Topic | null> {
  const startTime = logStart('DATABASE', 'getOldestNewTopic');
  
  try {
    const conn = await connect();
    const [rows] = await conn.execute(
      `SELECT * FROM topics 
       WHERE status = 'new' 
       ORDER BY created_at ASC 
       LIMIT 1`
    );
    const topics = rows as Topic[];
    const result = topics.length > 0 ? topics[0] : null;
    
    logSuccess('DATABASE', 'getOldestNewTopic', startTime, {
      found: !!result,
      topicId: result?.id,
    });
    
    return result;
  } catch (error) {
    logError('DATABASE', 'getOldestNewTopic', error);
    throw error;
  }
}

export async function updateTopicStatus(
  id: number, 
  status: string
): Promise<void> {
  const startTime = logStart('DATABASE', 'updateTopicStatus', {
    topicId: id,
    newStatus: status,
  });
  
  try {
    const conn = await connect();
    await conn.execute(
      'UPDATE topics SET status = ? WHERE id = ?',
      [status, id]
    );
    
    logSuccess('DATABASE', 'updateTopicStatus', startTime);
  } catch (error) {
    logError('DATABASE', 'updateTopicStatus', error);
    throw error;
  }
}

export async function getAdobeCredentials(): Promise<AdobeCredentials | null> {
  const startTime = logStart('DATABASE', 'getAdobeCredentials');
  
  try {
    const conn = await connect();
    const [rows] = await conn.execute(
      'SELECT * FROM adobe_credentials WHERE id = 1'
    );
    const creds = rows as AdobeCredentials[];
    const result = creds.length > 0 ? creds[0] : null;
    
    logSuccess('DATABASE', 'getAdobeCredentials', startTime, {
      found: !!result,
      hasClientId: !!result?.client_id,
      hasSftpUsername: !!result?.sftp_username,
    });
    
    return result;
  } catch (error) {
    logError('DATABASE', 'getAdobeCredentials', error);
    throw error;
  }
}

export async function updateUploadStats(
  id: number,
  uploadedCount: number
): Promise<void> {
  const startTime = logStart('DATABASE', 'updateUploadStats', {
    topicId: id,
    uploadedCount,
  });
  
  try {
    const conn = await connect();
    await conn.execute(
      'UPDATE topics SET uploaded_count = ?, uploaded_at = NOW() WHERE id = ?',
      [uploadedCount, id]
    );
    
    logSuccess('DATABASE', 'updateUploadStats', startTime, {
      uploadedCount,
    });
  } catch (error) {
    logError('DATABASE', 'updateUploadStats', error);
    throw error;
  }
}

export async function close() {
  if (connection) {
    const startTime = logStart('DATABASE', 'close');
    
    try {
      await connection.end();
      connection = null;
      logSuccess('DATABASE', 'close', startTime);
    } catch (error) {
      logError('DATABASE', 'close', error);
      throw error;
    }
  }
}

