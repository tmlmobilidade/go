export function getSentryClient(): string | undefined {
	return process.env.SENTRY_NEXTJS_DSN;
}
