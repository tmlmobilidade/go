/**
 * Sentry instrumentation utilities for frontend and client environments.
 *
 * This module exports two factory functions for integrating Sentry logging and
 * instrumentation in TML Next.js frontend apps. They provide a consistent API for
 * error/request logging and performance monitoring, and ensure correct Sentry
 * initialization and runtime context handling.
 */

import * as Sentry from '@sentry/nextjs';

import { registerSentryNextRequestLogs } from '../connection/sentry-server.js';
import { initSentry } from '../connection/sentry.js';

/**
 * A minimal representation of the Node.js process,
 * used for runtime detection.
 */
interface ProcessLike {
	env?: Record<string, string | undefined>
}

/**
 * Creates an object encapsulating Sentry instrumentation for a given app/module
 * in frontend (server) environments.
 *
 * - onRequestError: Handler for request error events, compatible with Sentry's API.
 * - register: Initializes Sentry for the (app, module), and installs request log
 *   forwarding in Node.js runtimes.
 *
 * @param app - The current app name (e.g., 'frontend')
 * @param module - The domain module name (e.g., 'core')
 */
export function createSentryInstrumentation(app: string, module: string) {
	return {
		/**
		 * Error handler to be used for capturing request errors.
		 */
		onRequestError: Reflect.get(Sentry, 'captureRequestError') as typeof Sentry.captureRequestError,

		/**
		 * Initiates Sentry instrumentation and enables request log forwarding
		 * if running in a 'nodejs' Next.js runtime.
		 */
		register() {
			initSentry(app, module);
			const processRef = Reflect.get(globalThis, 'process') as ProcessLike | undefined;
			if (processRef?.env?.NEXT_RUNTIME === 'nodejs') {
				registerSentryNextRequestLogs({ app, module });
			}
		},
	};
}

/**
 * Creates an object encapsulating Sentry client-side instrumentation for a given
 * app/module combination.
 *
 * - onRouterTransitionStart: Handler for tracking router transitions in Sentry.
 *
 * @param app - The current app name (e.g., 'frontend')
 * @param module - The domain module name (e.g., 'core')
 */
export function createSentryClientInstrumentation(app: string, module: string) {
	initSentry(app, module);

	return {
		/**
		 * Handler for capturing router transition start events.
		 */
		onRouterTransitionStart: Reflect.get(Sentry, 'captureRouterTransitionStart') as typeof Sentry.captureRouterTransitionStart,
	};
}
