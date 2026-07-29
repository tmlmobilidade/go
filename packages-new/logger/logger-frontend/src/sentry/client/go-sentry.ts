export function getSentryClient(): string | undefined {
	return process.env.SENTRY_NEXTJS_DSN;
}

export function validateSentryClient(): void {
	const dsn = getSentryClient();

	if (!dsn) {
		console.error(new Error('Missing SENTRY_NEXTJS_DSN. Please check your environment variables.'));
	}
}
