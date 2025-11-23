interface Env {
  GITHUB_TOKEN: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const startTime = Date.now();
  console.log('[API_TRIGGER] POST request - STARTED');
  
  try {
    const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = context.env;
    
    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
      console.error('[API_TRIGGER] Missing GitHub configuration');
      return new Response(
        JSON.stringify({ error: 'GitHub configuration not set' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Trigger GitHub Actions workflow via workflow_dispatch
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/daily_generation.yml/dispatches`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'StockUploader'
        },
        body: JSON.stringify({
          ref: 'main'
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[API_TRIGGER] GitHub API error:', errorText);
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const duration = Date.now() - startTime;
    console.log(`[API_TRIGGER] POST request - SUCCESS (${duration}ms)`);
    console.log('[API_TRIGGER] Worker triggered successfully');
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Worker started successfully' 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[API_TRIGGER] POST request - FAILED (${duration}ms)`);
    console.error('[API_TRIGGER] Error:', error);
    
    return new Response(
      JSON.stringify({ error: 'Failed to trigger worker' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

