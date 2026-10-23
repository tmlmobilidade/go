import { type Types } from '@amplitude/analytics-browser';

import { type AnalyticsReplayController } from '../types/replay/controller';
import { createReplayCapture } from './replay-capture';
import { getReplayDeadline } from './replay-deadline';

/* * */

export const REPLAY_DURATION_MS = 300_000;

/** Resumes an activation only until its original five-minute deadline, including after reloads. */
export function createSessionReplayController(apiKey: string, client: Types.BrowserClient, onError: (cause: unknown) => void): AnalyticsReplayController {
	let capture: ReturnType<typeof createReplayCapture> | undefined;
	let activeActivationId: string | undefined;
	let deadline: number | undefined;
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
		activeActivationId = undefined;
		deadline = undefined;
		clearTimeout(timeout);
		if (previous) {
			previous.pause();
			void enqueue(() => previous.finish()).catch(onError);
		}
	};

	return {
		start: (activationId) => {
			const userId = client.getUserId();
			if (client.getOptOut() || !userId || !activationId) return Promise.resolve(false);
			if (capture && activeActivationId === activationId && (deadline === undefined || Date.now() < deadline)) return starting;
			stop();
			const current = createReplayCapture(client);
			capture = current;
			activeActivationId = activationId;
			starting = enqueue(async () => {
				if (capture !== current || client.getUserId() !== userId || client.getOptOut()) {
					if (capture === current) stop();
					return false;
				}
				const expiresAt = getReplayDeadline(apiKey, userId, activationId, REPLAY_DURATION_MS);
				if (Date.now() >= expiresAt) {
					stop();
					return false;
				}
				deadline = expiresAt;
				// The deadline also applies while the SDK is still loading.
				timeout = setTimeout(() => {
					if (capture === current) stop();
				}, expiresAt - Date.now());
				if (!await current.start() || capture !== current || client.getOptOut() || client.getUserId() !== userId || Date.now() >= expiresAt) {
					if (capture === current) stop();
					return false;
				}
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
