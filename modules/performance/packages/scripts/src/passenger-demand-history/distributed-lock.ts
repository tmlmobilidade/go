/* * */

import { RedisDatabaseClient } from '@tmlmobilidade/go-clients-redis';
import { randomUUID } from 'node:crypto';

import { PASSENGER_DEMAND_HISTORY_LOCK_KEY } from './constants.js';

/* * */

const LOCK_TTL_MS = 5 * 60 * 1_000; // 5 minutes
const RENEW_INTERVAL_MS = 60 * 1_000; // 1 minute
const RETRY_INTERVAL_MS = 2 * 1_000; // 2 seconds

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

export interface PassengerDemandHistoryLockOptions {
	wait_timeout_ms?: number
}

export type PassengerDemandHistoryLockResult<T> =
  | { acquired: false }
  | { acquired: true, value: T };

export interface PassengerDemandHistoryLock {
	assertOwned: () => void
}

/* * */

function wait(durationMs: number) {
	return new Promise(resolve => setTimeout(resolve, durationMs));
}

export async function withPassengerDemandHistoryLock<T>(
	operation: (lock: PassengerDemandHistoryLock) => Promise<T>,
	options: PassengerDemandHistoryLockOptions = {},
): Promise<PassengerDemandHistoryLockResult<T>> {
	const client = await RedisDatabaseClient.getClient({ prefix: 'CACHEDB' });
	const token = randomUUID();
	const waitTimeoutMs = options.wait_timeout_ms ?? 0;
	const waitDeadline = Date.now() + waitTimeoutMs;
	let acquired: boolean;

	do {
		const result = await client.set(PASSENGER_DEMAND_HISTORY_LOCK_KEY, token, {
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
				keys: [PASSENGER_DEMAND_HISTORY_LOCK_KEY],
			});
			if (Number(renewed) !== 1) renewalError = new Error('Passenger-demand history refresh lock was lost.');
		} catch (error) {
			renewalError = error instanceof Error ? error : new Error(String(error));
		} finally {
			renewalInProgress = false;
		}
	}, RENEW_INTERVAL_MS);

	try {
		const lock: PassengerDemandHistoryLock = {
			assertOwned: () => {
				if (renewalError) throw renewalError;
			},
		};
		const value = await operation(lock);
		lock.assertOwned();
		return { acquired: true, value };
	} finally {
		clearInterval(renewalTimer);
		await client.eval(RELEASE_LOCK_SCRIPT, {
			arguments: [token],
			keys: [PASSENGER_DEMAND_HISTORY_LOCK_KEY],
		});
	}
}

/* * */
