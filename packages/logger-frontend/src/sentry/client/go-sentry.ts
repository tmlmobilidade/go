export function getSentryClient(): string {
	//

	//
	// Validate required environment variables

	if (!process.env.SENTRY_NEXTJS_DSN) {
		//
		// Check if are on Development
		if (process.env.ENVIRONMENT === 'development') {
			return '';
		}

		//
		// Throw error
		throw new Error('Missing SENTRY_NEXTJS_DSN, please set the SENTRY_NEXTJS_DSN environment variable for this work my friend!');
	}

	return process.env.SENTRY_NEXTJS_DSN;
}
