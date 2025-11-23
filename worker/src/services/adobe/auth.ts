import { logStart, logSuccess, logError } from '../../utils/logger.js';

export interface AdobeToken {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export async function getAccessToken(
  clientId: string,
  clientSecret: string
): Promise<AdobeToken> {
  const startTime = logStart('ADOBE_AUTH', 'getAccessToken', {
    clientId: clientId.substring(0, 10) + '...',
    hasClientSecret: !!clientSecret,
  });

  // Adobe OAuth2 endpoint
  const tokenUrl = 'https://ims-na1.adobelogin.com/ims/token/v3';

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'openid,AdobeID,read_organizations,additional_info.projectedProductContext',
  });

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Adobe auth failed: ${error}`);
    }

    const data: AdobeToken = await response.json();
    
    logSuccess('ADOBE_AUTH', 'getAccessToken', startTime, {
      expiresIn: data.expires_in,
      tokenType: data.token_type,
    });
    
    return data;
  } catch (error) {
    logError('ADOBE_AUTH', 'getAccessToken', error);
    throw error;
  }
}

