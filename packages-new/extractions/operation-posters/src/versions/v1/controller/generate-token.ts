import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { getRequiredEnv } from '../lib/get-required-env.js';
import { TOKEN_TIMEOUT_MS } from '../types/consts.js';
import { TokenResponse } from '../types/interfaces.js';

let ACCESS_TOKEN: string | undefined;
let TOKEN_EXPIRES_AT = 0;

/**
* Returns a valid access token, requesting a new one when needed.
*/
export async function generateToken(): Promise<string> {
	//

	//
	// A. Reuse the current token while it is still valid.

	if (ACCESS_TOKEN && Date.now() < TOKEN_EXPIRES_AT) {
		return ACCESS_TOKEN;
	}

	//
	// B. Request a new token from the API.

	const body = new URLSearchParams({
		client_id: getRequiredEnv('CLIENT_ID'),
		client_secret: getRequiredEnv('CLIENT_SECRET'),
		grant_type: 'client_credentials',
		scope: getRequiredEnv('ZPHERES_API_SCOPE'),
	});

	Logger.info({ message: 'Requesting ZPHERES access token.' });

	//
	// C. Send the request to the API

	const response = await fetch(getRequiredEnv('ZPHERES_API_TOKEN_URL'), {
		body,
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		method: 'POST',
		signal: AbortSignal.timeout(TOKEN_TIMEOUT_MS),
	});

	if (!response.ok) {
		const responseBody = await response.text();
		throw new Error(`Token request failed (${response.status}): ${responseBody.slice(0, 1_000)}`);
	}

	//
	// D. Read the ZPHERES token response body

	Logger.info({ message: 'Reading ZPHERES token response body.' });

	const tokenData = await response.json().catch((error: unknown) => {
		throw new Error('Failed to read ZPHERES token response body within the request timeout or parse it as JSON.', { cause: error });
	}) as TokenResponse;

	if (!tokenData.access_token || !tokenData.expires_in) {
		throw new Error('Token response is missing access_token or expires_in.');
	}

	//
	// E. Refresh one minute before expiry to avoid using a token while it expires.

	ACCESS_TOKEN = tokenData.access_token;
	TOKEN_EXPIRES_AT = Date.now() + Math.max(tokenData.expires_in - 60, 0) * 1_000;

	Logger.info({ message: 'Received ZPHERES access token.' });

	//
	// F. Return the access token

	return ACCESS_TOKEN;
}
