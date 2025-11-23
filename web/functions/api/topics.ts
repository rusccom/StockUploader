import mysql from 'mysql2/promise';

interface Env {
  DB_URL: string;
}

interface Topic {
  id: number;
  topic_name: string;
  image_count: number;
  model: string;
  upscale_model: string;
  status: string;
  created_at: string;
}

async function getDbConnection(dbUrl: string) {
  return await mysql.createConnection(dbUrl);
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const startTime = Date.now();
  console.log('[API_TOPICS] GET request - STARTED');
  
  try {
    const connection = await getDbConnection(context.env.DB_URL);
    console.log('[API_TOPICS] Database connected');
    
    const [rows] = await connection.execute(
      'SELECT * FROM topics ORDER BY created_at DESC'
    );
    
    await connection.end();
    
    const duration = Date.now() - startTime;
    const rowCount = (rows as Topic[]).length;
    console.log(`[API_TOPICS] GET request - SUCCESS (${duration}ms)`);
    console.log(`[API_TOPICS] Returned ${rowCount} topics`);
    
    return new Response(JSON.stringify(rows), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[API_TOPICS] GET request - FAILED (${duration}ms)`);
    console.error('[API_TOPICS] Error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to fetch topics' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const startTime = Date.now();
  console.log('[API_TOPICS] POST request - STARTED');
  
  try {
    const body = await context.request.json() as Partial<Topic>;
    console.log('[API_TOPICS] Request body:', {
      topic_name: body.topic_name,
      image_count: body.image_count,
      model: body.model,
      upscale_model: body.upscale_model,
    });
    
    if (!body.topic_name || !body.model || !body.upscale_model) {
      console.warn('[API_TOPICS] Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const connection = await getDbConnection(context.env.DB_URL);
    console.log('[API_TOPICS] Database connected');
    
    const [result] = await connection.execute(
      `INSERT INTO topics (topic_name, image_count, model, upscale_model, status) 
       VALUES (?, ?, ?, ?, 'new')`,
      [
        body.topic_name,
        body.image_count || 20,
        body.model,
        body.upscale_model,
      ]
    );
    
    await connection.end();
    
    const insertId = (result as any).insertId;
    const duration = Date.now() - startTime;
    console.log(`[API_TOPICS] POST request - SUCCESS (${duration}ms)`);
    console.log(`[API_TOPICS] Created topic ID: ${insertId}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        id: insertId
      }),
      { 
        status: 201, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[API_TOPICS] POST request - FAILED (${duration}ms)`);
    console.error('[API_TOPICS] Error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to create topic' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

