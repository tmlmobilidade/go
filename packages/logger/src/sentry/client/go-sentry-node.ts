import * as Sentry from '@sentry/node';

export async function getSentryNodeClient() {
	//

	//
	// Validate required environment variables

	if (!process.env.SENTRY_NODE_DSN) {
		throw new Error('Missing SENTRY_DSN, please set the SENTRY_DSN environment variable for this work my friend!');
	}

	return Sentry.init({ dsn: process.env.SENTRY_NODE_DSN });
}
