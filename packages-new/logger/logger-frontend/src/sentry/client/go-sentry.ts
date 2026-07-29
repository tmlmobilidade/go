export function getSentryClient(): string | undefined {
	const dsn = process.env.SENTRY_NEXTJS_DSN;

	if (!dsn && 'document' in globalThis) {
		console.error(new Error('Missing SENTRY_NEXTJS_DSN. Please check your environment variables.'));
		return undefined;
	}

	return dsn;
}
