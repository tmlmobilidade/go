import * as Sentry from '@sentry/nextjs';

import { registerSentryNextRequestLogs } from '../connection/sentry-server.js';
import { initSentry } from '../connection/sentry.js';

interface ProcessLike {
	env?: Record<string, string | undefined>
}

export function createSentryInstrumentation(app: string, module: string) {
	return {
		onRequestError: Reflect.get(Sentry, 'captureRequestError') as typeof Sentry.captureRequestError,
		register() {
			initSentry(app, module);
			const processRef = Reflect.get(globalThis, 'process') as ProcessLike | undefined;
			if (processRef?.env?.NEXT_RUNTIME === 'nodejs') registerSentryNextRequestLogs({ app, module });
		},
	};
}

export function createSentryClientInstrumentation(app: string, module: string) {
	initSentry(app, module);

	return {
		onRouterTransitionStart: Reflect.get(Sentry, 'captureRouterTransitionStart') as typeof Sentry.captureRouterTransitionStart,
	};
}
