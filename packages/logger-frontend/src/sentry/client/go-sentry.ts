export function getSentryClient(): string {
	//

	//
	// If we are on Development, return an empty string
	if (process.env.ENVIRONMENT === 'dev') {
		return undefined;
	}

	//
	// Validate required environment variables

	if (!process.env.SENTRY_NEXTJS_DSN) {
		throw new Error('Missing SENTRY_NEXTJS_DSN, please set the SENTRY_NEXTJS_DSN environment variable for this work my friend!');
	}

	return process.env.SENTRY_NEXTJS_DSN;
}
