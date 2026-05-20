/* * */

import { Logger } from '@tmlmobilidade/logger';

/* * */

/**
 * Runs metric syncs in a scope, records failures, and logs a single summary at the end.
 */
export class MetricSyncRunner {
	readonly #failures: string[] = [];
	readonly #scope: string;

	constructor(scope: string) {
		this.#scope = scope;
	}

	get failures(): readonly string[] {
		return this.#failures;
	}

	get hasFailures(): boolean {
		return this.#failures.length > 0;
	}

	/**
	 * Runs one metric sync. Logs errors immediately; records the name on failure.
	 */
	async run(name: string, fn: () => Promise<void>): Promise<boolean> {
		try {
			await fn();
			return true;
		} catch (error) {
			this.#failures.push(name);
			Logger.error(`Failed metric sync: ${name}`);
			Logger.error(error);
			return false;
		}
	}

	/**
	 * Runs several metric syncs in parallel. Each failure is recorded independently.
	 */
	async runParallel(jobs: { fn: () => Promise<void>, name: string }[]): Promise<boolean[]> {
		return Promise.all(jobs.map(({ fn, name }) => this.run(name, fn)));
	}

	/**
	 * Logs either a success message or a failure summary for this scope.
	 */
	finish({ successMessage }: { successMessage: string }): void {
		if (this.hasFailures) {
			Logger.error(
				`${this.#scope} completed with ${this.#failures.length} failure(s): ${this.#failures.join(', ')}`,
			);
			return;
		}

		Logger.success(successMessage);
	}
}
