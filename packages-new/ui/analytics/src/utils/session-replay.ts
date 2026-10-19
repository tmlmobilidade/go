import { type Types } from '@amplitude/analytics-browser';

import { type AnalyticsReplayController } from '../types/replay/controller';
import { createReplayCapture } from './replay-capture';

/* * */

export const REPLAY_DURATION_MS = 300_000;

/** Runs one explicitly requested capture, stopping after five minutes without restarting. */
export function createSessionReplayController(client: Types.BrowserClient, onError: (cause: unknown) => void): AnalyticsReplayController {
	let capture: ReturnType<typeof createReplayCapture> | undefined;
	let timeout: ReturnType<typeof setTimeout> | undefined;
	let transition = Promise.resolve();
	let starting = Promise.resolve(false);

	// A pending SDK setup must finish before its teardown or a new capture starts.
	const enqueue = <T>(operation: () => Promise<T>): Promise<T> => {
		const result = transition.then(operation);
		transition = result.then(() => undefined, () => undefined);
		return result;
	};

	const stop = () => {
		const previous = capture;
		capture = undefined;
		clearTimeout(timeout);
		if (previous) {
			previous.pause();
			void enqueue(() => previous.finish()).catch(onError);
		}
	};

	return {
		start: () => {
			if (client.getOptOut()) return Promise.resolve(false);
			if (capture) return starting;
			const current = createReplayCapture(client);
			capture = current;
			starting = enqueue(async () => {
				if (capture !== current) return false;
				const startedAt = Date.now();
				if (!await current.start() || capture !== current || client.getOptOut()) {
					if (capture === current) stop();
					return false;
				}
				timeout = setTimeout(stop, Math.max(0, startedAt + REPLAY_DURATION_MS - Date.now()));
				return true;
			}).catch((cause: unknown) => {
				if (capture === current) stop();
				onError(cause);
				return false;
			});
			return starting;
		},
		stop,
	};
}
