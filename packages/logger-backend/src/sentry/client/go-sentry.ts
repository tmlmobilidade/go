export function getSentryClient(): string | undefined {
	//

	//
	// If we are on Development, return an empty string
	if (process.env.ENVIRONMENT === 'dev') {
		return undefined;
	}

	//
	// Validate required environment variables
	if (!process.env.SENTRY_NODE_DSN) {
		throw new Error('Missing SENTRY_NODE_DSN. Please check your environment variables.');
	}

	return process.env.SENTRY_NODE_DSN;
}
