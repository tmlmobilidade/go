/**
 * Sentry instrumentation utilities for frontend and client environments.
 *
 * This module exports two factory functions for integrating Sentry logging and
 * instrumentation in TML Next.js frontend apps. They provide a consistent API for
 * error/request logging and performance monitoring, and ensure correct Sentry
 * initialization and runtime context handling.
 */

import * as Sentry from '@sentry/nextjs';

import { getRuntimeLogContext } from '../../logger/utils/runtime-log-context.js';
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
 * Creates an object encapsulating Sentry instrumentation for frontend server environments.
 *
 * - onRequestError: Handler for request error events, compatible with Sentry's API.
 * - register: Initializes Sentry using environment context and installs request log
 *   forwarding in Node.js runtimes.
 */
export function createSentryInstrumentation() {
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
			initSentry();
			const processRef = Reflect.get(globalThis, 'process') as ProcessLike | undefined;
			if (processRef?.env?.NEXT_RUNTIME === 'nodejs') {
				registerSentryNextRequestLogs(getRuntimeLogContext());
			}
		},
	};
}

/**
 * Creates an object encapsulating Sentry client-side instrumentation using
 * environment context.
 *
 * - onRouterTransitionStart: Handler for tracking router transitions in Sentry.
 */
export function createSentryClientInstrumentation() {
	initSentry();

	return {
		/**
		 * Handler for capturing router transition start events.
		 */
		onRouterTransitionStart: Reflect.get(Sentry, 'captureRouterTransitionStart') as typeof Sentry.captureRouterTransitionStart,
	};
}
