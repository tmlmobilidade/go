import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { getRequiredEnv } from './get-required-env.js';

const TOKEN_TIMEOUT_MS = 30_000;

interface TokenResponse {
	access_token: string
	expires_in: number
}

/**
* Returns a valid access token, requesting a new one when needed.
*/
export async function generateToken(): Promise<string> {
	//

	//
	// Reuse the current token while it is still valid.

	if (this.accessToken && Date.now() < this.tokenExpiresAt) {
		return this.accessToken;
	}

	//
	// Request a new token from the API.

	const body = new URLSearchParams({
		client_id: getRequiredEnv('CLIENT_ID'),
		client_secret: getRequiredEnv('CLIENT_SECRET'),
		grant_type: 'client_credentials',
		scope: getRequiredEnv('ZPHERES_API_SCOPE'),
	});

	Logger.info({ message: 'Requesting ZPHERES access token.' });
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

	Logger.info({ message: 'Reading ZPHERES token response body.' });
	const tokenData = await response.json().catch((error: unknown) => {
		throw new Error('Failed to read ZPHERES token response body within the request timeout or parse it as JSON.', { cause: error });
	}) as TokenResponse;

	if (!tokenData.access_token || !tokenData.expires_in) {
		throw new Error('Token response is missing access_token or expires_in.');
	}

	//
	// Refresh one minute before expiry to avoid using a token while it expires.

	this.accessToken = tokenData.access_token;
	this.tokenExpiresAt = Date.now() + Math.max(tokenData.expires_in - 60, 0) * 1_000;
	Logger.info({ message: 'Received ZPHERES access token.' });

	return this.accessToken;
}
