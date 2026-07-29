export function getSentryClient(): string | undefined {
	//

	//
	// If the environment is production, return the SENTRY_NEXTJS_DSN
	if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'prd') {
		return undefined;
	}

	//
	// Validate required environment variables

	if (!process.env.SENTRY_NEXTJS_DSN) {
		throw new Error('Missing SENTRY_NEXTJS_DSN. Please check your environment variables.');
	} else {
		console.log('SENTRY_NEXTJS_DSN', process.env.SENTRY_NEXTJS_DSN);
	}

	return process.env.SENTRY_NEXTJS_DSN;
}
