/* * */

import { Dates } from '@tmlmobilidade/dates';
import { RedisDatabaseClient } from '@tmlmobilidade/go-clients-redis';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type MetricRefresh, type MetricRefreshType } from '@tmlmobilidade/go-types-performance';
import { type OperationalDateInt, type UnixTimestamp, validateUnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { randomUUID } from 'node:crypto';

/* * */

const LOCK_TTL_MS = 5 * 60 * 1_000;
const RENEW_INTERVAL_MS = 60 * 1_000;
const RETRY_INTERVAL_MS = 2 * 1_000;

const RELEASE_LOCK_SCRIPT = `
	if redis.call('get', KEYS[1]) == ARGV[1] then
		return redis.call('del', KEYS[1])
	end
	return 0
`;

const RENEW_LOCK_SCRIPT = `
	if redis.call('get', KEYS[1]) == ARGV[1] then
		return redis.call('pexpire', KEYS[1], ARGV[2])
	end
	return 0
`;

/* * */

export interface MetricRefreshLock {
	assertOwned: () => void
}

export interface MetricRefreshStats {
	result_rows_qty: number
	source_rows_qty: number
	source_watermark: null | UnixTimestamp
}

export interface MetricRefreshTracking {
	range_end: OperationalDateInt
	range_start: OperationalDateInt
	refresh_type: MetricRefreshType
}

interface RunMetricRefreshOptions {
	definition_version: string
	get_tracking: (lock: MetricRefreshLock) => MetricRefreshTracking | Promise<MetricRefreshTracking>
	lock_key: string
	lock_lost_message: string
	metric_name: string
	wait_timeout_ms?: number
}

export type MetricRefreshExecutionResult<T> =
  | { acquired: false }
  | { acquired: true, value: T };

/* * */

function wait(durationMs: number) {
	return new Promise(resolve => setTimeout(resolve, durationMs));
}

function toErrorMessage(error: unknown) {
	return (error instanceof Error ? error.message : String(error)).slice(0, 2_000);
}

async function insertRefreshState(refresh: MetricRefresh) {
	await labDb.performance.metricRefreshes.insert('JSONEachRow', [refresh]);
}

async function trackMetricRefresh<T extends MetricRefreshStats>(
	options: Pick<RunMetricRefreshOptions, 'definition_version' | 'metric_name'>,
	tracking: MetricRefreshTracking,
	run: () => Promise<T>,
) {
	const startedAt = Dates.now('utc').unix_timestamp;
	const runningRefresh: MetricRefresh = {
		completed_at: null,
		definition_version: options.definition_version,
		error_message: null,
		metric_name: options.metric_name,
		range_end: tracking.range_end,
		range_start: tracking.range_start,
		refresh_id: randomUUID(),
		refresh_type: tracking.refresh_type,
		result_rows_qty: 0,
		source_rows_qty: 0,
		source_watermark: null,
		started_at: startedAt,
		status: 'running',
		updated_at: startedAt,
	};

	await insertRefreshState(runningRefresh);

	try {
		const stats = await run();
		const completedAt = validateUnixTimestamp(Math.max(Dates.now('utc').unix_timestamp, startedAt + 1));
		await insertRefreshState({
			...runningRefresh,
			completed_at: completedAt,
			...stats,
			status: 'succeeded',
			updated_at: completedAt,
		});
		return stats;
	} catch (error) {
		const completedAt = validateUnixTimestamp(Math.max(Dates.now('utc').unix_timestamp, startedAt + 1));
		await insertRefreshState({
			...runningRefresh,
			completed_at: completedAt,
			error_message: toErrorMessage(error),
			status: 'failed',
			updated_at: completedAt,
		});
		throw error;
	}
}

export async function runMetricRefresh<T extends MetricRefreshStats>(
	options: RunMetricRefreshOptions,
	operation: (lock: MetricRefreshLock) => Promise<T>,
): Promise<MetricRefreshExecutionResult<T>> {
	const client = await RedisDatabaseClient.getClient({ prefix: 'CACHEDB' });
	const token = randomUUID();
	const waitTimeoutMs = options.wait_timeout_ms ?? 0;
	const waitDeadline = Date.now() + waitTimeoutMs;
	let acquired: boolean;

	do {
		const result = await client.set(options.lock_key, token, {
			condition: 'NX',
			expiration: { type: 'PX', value: LOCK_TTL_MS },
		});
		acquired = result === 'OK';
		if (!acquired && Date.now() < waitDeadline) await wait(RETRY_INTERVAL_MS);
	} while (!acquired && Date.now() < waitDeadline);

	if (!acquired) return { acquired: false };

	let renewalError: Error | null = null;
	let renewalInProgress = false;
	const renewalTimer = setInterval(async () => {
		if (renewalInProgress || renewalError) return;
		renewalInProgress = true;
		try {
			const renewed = await client.eval(RENEW_LOCK_SCRIPT, {
				arguments: [token, String(LOCK_TTL_MS)],
				keys: [options.lock_key],
			});
			if (Number(renewed) !== 1) renewalError = new Error(options.lock_lost_message);
		} catch (error) {
			renewalError = error instanceof Error ? error : new Error(String(error));
		} finally {
			renewalInProgress = false;
		}
	}, RENEW_INTERVAL_MS);

	try {
		const lock: MetricRefreshLock = {
			assertOwned: () => {
				if (renewalError) throw renewalError;
			},
		};
		const tracking = await options.get_tracking(lock);
		const value = await trackMetricRefresh(options, tracking, () => operation(lock));
		lock.assertOwned();
		return { acquired: true, value };
	} finally {
		clearInterval(renewalTimer);
		await client.eval(RELEASE_LOCK_SCRIPT, {
			arguments: [token],
			keys: [options.lock_key],
		});
	}
}

/* * */
