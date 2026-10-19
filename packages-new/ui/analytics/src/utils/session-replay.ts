import { type Types } from '@amplitude/analytics-browser';

import { type AnalyticsReplayController } from '../types/replay/controller';
import { createReplayBlock } from './replay-block';
import { createReplayCapture } from './replay-capture';
import { shouldRetainReplayEvent } from './replay-retention';

/* * */

export const REPLAY_BLOCK_DURATION_MS = 120_000;

/** Serializes recorder transitions; network uploads run independently of the next block. */
export function createSessionReplayController(
	client: Types.BrowserClient,
	onError: (cause: unknown) => void,
	captureFactory: typeof createReplayCapture = createReplayCapture,
): AnalyticsReplayController {
	let capture: ReturnType<typeof createReplayCapture> | undefined;
	let requested = false;
	let generation = 0;
	let rotating = false;
	let pendingError = false;
	let timeout: ReturnType<typeof setTimeout> | undefined;
	let transition = Promise.resolve();
	let starting = Promise.resolve(false);

	const enqueue = <T>(operation: () => Promise<T>): Promise<T> => {
		const result = transition.then(operation);
		transition = result.then(() => undefined, () => undefined);
		return result;
	};

	const finish = async (allowRetention: boolean) => {
		const previous = capture;
		capture = undefined;
		await previous?.finish(allowRetention);
	};

	const isCurrent = (value: number) => requested && generation === value && !client.getOptOut();

	const fail = (cause: unknown, value: number) => {
		if (generation === value) {
			requested = false;
			pendingError = false;
			rotating = false;
			generation++;
			clearTimeout(timeout);
			capture?.pause();
			void enqueue(() => finish(false)).catch(onError);
		}
		onError(cause);
	};

	const begin = async (value: number, startedAt = Date.now()): Promise<boolean> => {
		if (!isCurrent(value)) return false;
		const block = { ...createReplayBlock(`${startedAt}-${crypto.randomUUID()}`, startedAt), hasError: pendingError };
		pendingError = false;
		const current = captureFactory(client, block, onError);
		capture = current;
		rotating = false;
		if (!await current.start() || !isCurrent(value)) {
			current.pause();
			return false;
		}
		timeout = setTimeout(() => {
			rotating = true;
			current.pause();
			void enqueue(async () => {
				if (!requested || generation !== value) return;
				await finish(!client.getOptOut());
				if (!await begin(value, startedAt + REPLAY_BLOCK_DURATION_MS) && generation === value) {
					requested = false;
					pendingError = false;
					rotating = false;
					await finish(false);
				}
			}).catch(cause => fail(cause, value));
		}, Math.max(0, startedAt + REPLAY_BLOCK_DURATION_MS - Date.now()));
		return true;
	};

	return {
		recordEvent: (event) => {
			if (!requested || client.getOptOut()) return;
			if (rotating || !capture) pendingError ||= shouldRetainReplayEvent(event);
			else capture.recordEvent(event);
		},
		start: () => {
			if (client.getOptOut()) return Promise.resolve(false);
			if (requested) return starting;
			requested = true;
			const value = ++generation;
			starting = enqueue(async () => {
				const started = await begin(value);
				if (!started && generation === value) {
					requested = false;
					pendingError = false;
					await finish(false);
				}
				return started;
			}).catch((cause: unknown) => {
				fail(cause, value);
				return false;
			});
			return starting;
		},
		stop: () => {
			requested = false;
			pendingError = false;
			rotating = false;
			generation++;
			clearTimeout(timeout);
			capture?.pause();
			void enqueue(() => finish(true)).catch(onError);
		},
	};
}
