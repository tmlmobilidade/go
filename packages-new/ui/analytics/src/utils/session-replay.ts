import { type Types } from '@amplitude/analytics-browser';

import { type AnalyticsReplayActivation } from '../types/replay/activation';
import { type AnalyticsReplayController } from '../types/replay/controller';
import { getReplayTimeRemaining } from './replay-authorization';
import { createReplayCapture } from './replay-capture';

/* * */

/** Captures only within the window already granted by GO, without creating a local allowance. */
export function createSessionReplayController(client: Types.BrowserClient, onError: (cause: unknown) => void): AnalyticsReplayController {
	let capture: ReturnType<typeof createReplayCapture> | undefined;
	let activeActivation: AnalyticsReplayActivation | undefined;
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
		activeActivation = undefined;
		clearTimeout(timeout);
		document.removeEventListener('visibilitychange', checkDeadline);
		if (previous) {
			previous.pause();
			void enqueue(() => previous.finish()).catch(onError);
		}
	};

	const checkDeadline = () => {
		if (activeActivation && getReplayTimeRemaining(activeActivation) <= 0) stop();
	};

	return {
		start: (activation) => {
			const userId = client.getUserId();
			if (client.getOptOut() || !userId) return Promise.resolve(false);
			if (getReplayTimeRemaining(activation) <= 0) {
				stop();
				return Promise.resolve(false);
			}
			if (capture && activeActivation?.activationId === activation.activationId) return starting;
			stop();
			const current = createReplayCapture(client);
			capture = current;
			activeActivation = activation;
			starting = enqueue(async () => {
				if (capture !== current || client.getUserId() !== userId || client.getOptOut()) {
					if (capture === current) stop();
					return false;
				}
				const remaining = getReplayTimeRemaining(activation);
				if (remaining <= 0) {
					stop();
					return false;
				}
				// The deadline also applies while the SDK is still loading.
				timeout = setTimeout(() => {
					if (capture === current) stop();
				}, remaining);
				document.addEventListener('visibilitychange', checkDeadline);
				if (!await current.start() || capture !== current || client.getOptOut() || client.getUserId() !== userId || getReplayTimeRemaining(activation) <= 0) {
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
