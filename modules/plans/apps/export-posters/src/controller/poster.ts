/* * */

interface TokenResponse {
	access_token: string
	expires_in: number
}

/* * */

export class PostersController {
	private accessToken: null | string = null;
	private tokenExpiresAt = 0;

	/**
	 * Returns a valid ZPHERES access token, requesting a new one when needed.
	 */
	async generateToken(): Promise<string> {
		//

		//
		// Reuse the current token while it is still valid.

		if (this.accessToken && Date.now() < this.tokenExpiresAt) {
			return this.accessToken;
		}

		//
		// Request a new token from the ZPHERES API.

		const body = new URLSearchParams({
			client_id: process.env.CLIENT_ID,
			client_secret: process.env.CLIENT_SECRET,
			grant_type: 'client_credentials',
			scope: 'https://zpherescom.onmicrosoft.com/api/.default',
		});

		const response = await fetch(process.env.ZPHERES_API_TOKEN_URL, {
			body,
			method: 'POST',
		});

		if (!response.ok) {
			const responseBody = await response.text();
			throw new Error(`ZPHERES token request failed (${response.status}): ${responseBody.slice(0, 1_000)}`);
		}

		const tokenData = await response.json() as TokenResponse;

		if (!tokenData.access_token || !tokenData.expires_in) {
			throw new Error('ZPHERES token response is missing access_token or expires_in.');
		}

		//
		// Refresh one minute before expiry to avoid using a token while it expires.

		this.accessToken = tokenData.access_token;
		this.tokenExpiresAt = Date.now() + Math.max(tokenData.expires_in - 60, 0) * 1_000;

		return this.accessToken;
	}
}
