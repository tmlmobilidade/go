/* * */
import { type OperationHooks } from '@/types/hooks.js';
import { type OperationContext } from '@/types/operation-context.js';
import { CompensationError, StorageError, toStorageError } from '@tmlmobilidade/go-clients-oci-storage';

import { noopObservability, type Observability } from './observability.js';

/* * */

export interface SagaStep {
	compensate?: () => Promise<void>
	execute: () => Promise<void>
	name: string
}

export interface RunSagaOptions<TContext extends OperationContext, TResult> {
	context: TContext
	hooks?: OperationHooks<TContext, TResult>
	observability?: Observability
	result: () => Promise<TResult> | TResult
	steps: SagaStep[]
}

/**
 * Runs a saga consisting of a sequence of steps, handling compensation in case of errors and
 * invoking lifecycle hooks and observability callbacks.
 *
 * @template TContext - The type of the operation context.
 * @template TResult - The type of the result returned by the saga.
 * @param {RunSagaOptions<TContext, TResult>} options - Options for running the saga, including context, hooks, observability, result function, and saga steps.
 * @returns {Promise<TResult>} The result of the saga execution.
 *
 * @throws {StorageError} If a step fails, throws a StorageError or CompensationError (if compensations fail).
 *
 * @remarks
 * - If a step fails during execution, all completed steps are compensated in reverse order using their `compensate` methods (if provided).
 * - Lifecycle hooks are invoked at the start, on success, on rollback, on error, and finally.
 * - Observability callbacks are fired at various phases (operation start, step execution/compensation, operation end).
 */
export async function runSaga<TContext extends OperationContext, TResult>(options: RunSagaOptions<TContext, TResult>): Promise<TResult> {
	//

	const { context, result, steps } = options;
	const hooks = options.hooks ?? {};
	const observability = options.observability ?? noopObservability;
	const startedAt = Date.now();
	const completed: SagaStep[] = [];

	observability.onOperationStart(context);
	await hooks.onStart?.(context);

	try {
		//

		/**
		 * Execute each saga step in sequence:
		 * - For every step, trigger an observability event before execution.
		 * - Await the step's execution logic.
		 * - Once successful, record the step as completed to enable compensation if needed.
		 */
		for (const step of steps) {
			observability.onStep({ ...context, phase: 'execute', step: step.name });
			await step.execute();
			completed.push(step);
		}

		const value = await result();

		await hooks.onSuccess?.(context, value);
		observability.onOperationEnd({ ...context, durationMs: Date.now() - startedAt, outcome: 'success' });

		return value;
	} catch (error) {
		//

		const storageError = toStorageError(error, { operation: context.operation });
		const suppressed: unknown[] = [];

		/**
		 * Compensate all completed steps in reverse order, if they have a compensate handler.
		 * For each step that defines a compensate function:
		 *   1. Fires an observability callback before compensation.
		 *   2. Awaits the compensation.
		 *   3. If compensation throws, collects the error for reporting as suppressed.
		 */
		for (const step of completed.reverse()) {
			if (!step.compensate) continue;
			try {
				observability.onStep({ ...context, phase: 'compensate', step: step.name });
				await step.compensate();
			} catch (compensationFailure) {
				suppressed.push(compensationFailure);
			}
		}

		/**
		 * If compensations failed, create a CompensationError to wrap the original error and include suppressed errors.
		 * Otherwise, use the original error directly.
		 */
		const finalError: StorageError = suppressed.length > 0
			? new CompensationError(storageError.message, { cause: storageError, context: { ...storageError.context, ...context }, suppressed })
			: storageError;

		await hooks.onRollback?.(context, finalError);
		await hooks.onError?.(context, finalError);
		observability.onOperationEnd({ ...context, durationMs: Date.now() - startedAt, outcome: 'error' });

		throw finalError;
	} finally {
		//

		await hooks.onFinally?.(context);
	}
}

/**
 * Runs a single-step storage operation (such as read or validation) with standard lifecycle hooks and observability.
 *
 * @template TContext - The type of the operation context.
 * @template TResult - The type of the result returned by the operation.
 * @param options - Configuration for the operation.
 * @param options.context - The context for the operation, passed to all lifecycle hooks and observability.
 * @param options.execute - An async function that performs the main operation and returns the result.
 * @param options.hooks - Lifecycle hooks for the operation (start, success, error, rollback, finally).
 * @param [options.observability] - Optional observability integration for reporting operation/step lifecycle events.
 * @returns A promise that resolves with the result of the operation, or rejects with a StorageError if it fails.
 */
export async function runOperation<TContext extends OperationContext, TResult>(
	options: {
		context: TContext
		execute: () => Promise<TResult>
		hooks?: OperationHooks<TContext, TResult>
		observability?: Observability
	},
): Promise<TResult> {
	let value!: TResult;

	return runSaga({
		context: options.context,
		hooks: options.hooks,
		observability: options.observability,
		result: () => value,
		steps: [{
			execute: async () => { value = await options.execute(); },
			name: 'execute',
		}],
	});
}
