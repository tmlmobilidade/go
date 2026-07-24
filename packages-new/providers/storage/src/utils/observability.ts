/* * */

import { type OperationContext } from '@/types/operation-context.js';
mport { Logger } from '@tmlmobilidade/logger-logger-backend';

/* * */

/**
 * Interface defining the contract for observability in storage operations.
 *
 * @interface Observability
 * @property {function} onOperationEnd - Callback to be invoked when an operation ends.
 * @property {function} onOperationStart - Callback to be invoked when an operation starts.
 * @property {function} onStep - Callback to be invoked when a step in an operation is executed.
 */
export interface Observability {
	onOperationEnd: (ctx: OperationContext & { durationMs: number, outcome: 'error' | 'success' }) => void
	onOperationStart: (ctx: OperationContext) => void
	onStep: (ctx: OperationContext & { phase: 'compensate' | 'execute', step: string }) => void
}

/**
 * No-op implementation of the Observability interface.
 *
 * @type {Observability}
 * @property {function} onOperationEnd - Does nothing.
 * @property {function} onOperationStart - Does nothing.
 * @property {function} onStep - Does nothing.
 */
export const noopObservability: Observability = {
	onOperationEnd: () => undefined,
	onOperationStart: () => undefined,
	onStep: () => undefined,
};

/**
 * Creates an Observability implementation that logs to the console using the Logger.
 *
 * @returns {Observability} The logger-based observability implementation.
 */
export function createLoggerObservability(): Observability {
	//

	return {
		onOperationEnd: (ctx) => {
			const { durationMs, outcome, ...rest } = ctx;
			const message = outcome === 'success'
				? `[storage] ${rest.operation} succeeded (${durationMs}ms)`
				: `[storage] ${rest.operation} failed (${durationMs}ms)`;

			if (outcome === 'success') {
				Logger.info({ contextOrSpacesAfter: rest, message });
			} else {
				Logger.error({ contextOrErrorOrSpacesAfter: rest, message });
			}
		},
		onOperationStart: (ctx) => {
			Logger.info({ contextOrSpacesAfter: ctx, message: `[storage] ${ctx.operation} started` });
		},
		onStep: (ctx) => {
			Logger.info({
				contextOrSpacesAfter: ctx,
				message: `[storage] ${ctx.operation} ${ctx.phase} ${ctx.step}`,
			});
		},
	};
}
