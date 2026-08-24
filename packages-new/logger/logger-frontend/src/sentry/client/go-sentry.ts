interface ProcessLike {
	env?: Record<string, string | undefined>
}

export const SENTRY_TUNNEL_CLIENT_DSN = 'https://public@sentry-tunnel.invalid/1';

export interface SentryClientConfig {
	dsn: string
	tunnel?: string
}

let SENTRY_CLIENT_CONFIG_PROMISE: Promise<SentryClientConfig | undefined> | undefined;

export function getSentryClientConfig(): Promise<SentryClientConfig | undefined> {
	SENTRY_CLIENT_CONFIG_PROMISE ??= resolveSentryClientConfig();
	return SENTRY_CLIENT_CONFIG_PROMISE;
}

export async function getSentryClient(): Promise<string | undefined> {
	return (await getSentryClientConfig())?.dsn;
}

export async function validateSentryClient(): Promise<void> {
	await getSentryClientConfig();
}

async function resolveSentryClientConfig(): Promise<SentryClientConfig | undefined> {
	if (!('document' in globalThis)) {
		const dsn = getSentryDsn();

		if (!dsn) reportMissingSentryDsn();
		return dsn ? { dsn } : undefined;
	}

	const tunnel = process.env.NEXT_PUBLIC_SENTRY_TUNNEL;
	if (!tunnel) {
		console.error(new Error('Missing NEXT_PUBLIC_SENTRY_TUNNEL. Please check your Next.js configuration.'));
		return undefined;
	}

	try {
		const response = await fetch(tunnel, { cache: 'no-store' });
		if (!response.ok) {
			reportMissingSentryDsn();
			return undefined;
		}

		return { dsn: SENTRY_TUNNEL_CLIENT_DSN, tunnel };
	} catch {
		console.error(new Error('Unable to load the Sentry client configuration.'));
		return undefined;
	}
}

export function getSentryDsn(): string | undefined {
	const processRef = Reflect.get(globalThis, 'process') as ProcessLike | undefined;
	return processRef?.env?.SENTRY_NEXTJS_DSN;
}

function reportMissingSentryDsn(): void {
	console.error(new Error('Missing SENTRY_NEXTJS_DSN. Please check your environment variables.'));
}
