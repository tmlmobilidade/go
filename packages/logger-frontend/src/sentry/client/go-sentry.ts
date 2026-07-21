export function getSentryClient(): string | undefined {
	//

	//
	// Validate required environment variables

	if (!process.env.SENTRY_NEXTJS_DSN) {
		throw new Error('Missing SENTRY_NEXTJS_DSN. Please check your environment variables.');
	}

	return process.env.SENTRY_NEXTJS_DSN;
}
