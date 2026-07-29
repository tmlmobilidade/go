export function getSentryClient(): string | undefined {
	//

	//
	// If the environment is production, return the SENTRY_NEXTJS_DSN
	// if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'prd') {
	// 	return undefined;
	// }

	//
	// Validate required environment variables

	if (!process.env.SENTRY_NEXTJS_DSN) {
		console.error(new Error('Missing SENTRY_NEXTJS_DSN. Please check your environment variables.'));
		return undefined;
	}

	return process.env.SENTRY_NEXTJS_DSN;
}
