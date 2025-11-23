import mysql from 'mysql2/promise';

interface Env {
  DB_URL: string;
}

interface AdobeCredentials {
  client_id: string;
  client_secret: string;
  sftp_host?: string;
  sftp_username?: string;
  sftp_password?: string;
}

async function getDbConnection(dbUrl: string) {
  return await mysql.createConnection(dbUrl);
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const startTime = Date.now();
  console.log('[API_ADOBE] GET request - STARTED');
  
  try {
    const connection = await getDbConnection(context.env.DB_URL);
    console.log('[API_ADOBE] Database connected');
    
    const [rows] = await connection.execute(
      'SELECT client_id, client_secret, sftp_host, sftp_username, sftp_password FROM adobe_credentials WHERE id = 1'
    );
    
    await connection.end();
    
    const credentials = (rows as any[])[0] || { 
      client_id: '', 
      client_secret: '',
      sftp_host: 'sftp.contributor.adobestock.com',
      sftp_username: '',
      sftp_password: ''
    };
    
    const duration = Date.now() - startTime;
    console.log(`[API_ADOBE] GET request - SUCCESS (${duration}ms)`);
    console.log('[API_ADOBE] Credentials found:', !!credentials.client_id);
    
    return new Response(JSON.stringify(credentials), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[API_ADOBE] GET request - FAILED (${duration}ms)`);
    console.error('[API_ADOBE] Error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to fetch settings' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const startTime = Date.now();
  console.log('[API_ADOBE] POST request - STARTED');
  
  try {
    const body = await context.request.json() as AdobeCredentials;
    console.log('[API_ADOBE] Request body:', {
      client_id: body.client_id?.substring(0, 10) + '...',
      has_secret: !!body.client_secret,
      sftp_host: body.sftp_host,
      has_sftp_username: !!body.sftp_username,
      has_sftp_password: !!body.sftp_password,
    });
    
    if (!body.client_id || !body.client_secret) {
      console.warn('[API_ADOBE] Missing API credentials');
      return new Response(
        JSON.stringify({ error: 'Missing API credentials' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (!body.sftp_host || !body.sftp_username || !body.sftp_password) {
      console.warn('[API_ADOBE] Missing SFTP credentials');
      return new Response(
        JSON.stringify({ error: 'Missing SFTP credentials' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const connection = await getDbConnection(context.env.DB_URL);
    console.log('[API_ADOBE] Database connected');
    
    await connection.execute(
      `UPDATE adobe_credentials 
       SET client_id = ?, client_secret = ?, sftp_host = ?, sftp_username = ?, sftp_password = ?
       WHERE id = 1`,
      [body.client_id, body.client_secret, body.sftp_host, body.sftp_username, body.sftp_password]
    );
    
    await connection.end();
    
    const duration = Date.now() - startTime;
    console.log(`[API_ADOBE] POST request - SUCCESS (${duration}ms)`);
    console.log('[API_ADOBE] Credentials updated');
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[API_ADOBE] POST request - FAILED (${duration}ms)`);
    console.error('[API_ADOBE] Error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to update settings' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

