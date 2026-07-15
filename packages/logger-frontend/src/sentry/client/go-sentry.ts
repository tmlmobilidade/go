export function getSentryClient(): string | undefined {
	//

	//
	// If we are on Development, return an empty string
	if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'dev') {
		return undefined;
	}

	//
	// Validate required environment variables

	if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
		throw new Error('Missing SENTRY_NEXTJS_DSN. Please check your environment variables.');
	}

	return process.env.NEXT_PUBLIC_SENTRY_DSN;
}
