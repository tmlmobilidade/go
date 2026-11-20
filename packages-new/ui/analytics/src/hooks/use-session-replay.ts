'use client';

import { type UserSessionReplayAuthorization } from '@tmlmobilidade/go-types-core';
import { useCallback, useEffect, useEffectEvent, useRef, useState } from 'react';

import { type AnalyticsInitialization } from '../types/analytics.js';
import { getReplayTimeRemaining, startSessionReplay } from '../utils/session-replay.js';

/* * */

interface UseSessionReplayProps {
	authorization: null | undefined | UserSessionReplayAuthorization
	initialization: AnalyticsInitialization | undefined
	onError: (cause: unknown) => void
	startUrl: string | undefined
	userId: string | undefined
}

/* * */

export function useSessionReplay({ authorization, initialization, onError, startUrl, userId }: UseSessionReplayProps) {
	const activationId = authorization?.cancelled_at === null ? authorization.activation_id : undefined;
	const [failedActivationId, setFailedActivationId] = useState<string>();
	const expiredActivation = useRef<string>(undefined);
	const stopCapture = useRef<() => void>(undefined);
	const sdkOperations = useRef(Promise.resolve());

	const stopReplay = useCallback(() => stopCapture.current?.(), []);

	const startReplay = useEffectEvent(async () => {
		if (!activationId || !initialization || !startUrl || !userId || stopCapture.current || expiredActivation.current === activationId) return;
		const { apiKey, client, options } = initialization;
		const deviceId = client.getDeviceId();
		if (!deviceId || client.getOptOut() || client.getUserId() !== userId) return;

		const controller = new AbortController();
		let requestTimeout: ReturnType<typeof setTimeout> | undefined;
		let expiryTimeout: ReturnType<typeof setTimeout> | undefined;
		let shutdown: (() => void) | undefined;

		const isCurrent = () => stopCapture.current === stop && !client.getOptOut() && client.getUserId() === userId;
		const stop = () => {
			if (stopCapture.current !== stop) return;
			stopCapture.current = undefined;
			controller.abort();
			clearTimeout(requestTimeout);
			clearTimeout(expiryTimeout);

			shutdown?.();
		};
		stopCapture.current = stop;

		const setup = sdkOperations.current.then(async () => {
			if (!isCurrent()) return stop();
			const replay = await import('@amplitude/session-replay-browser');
			if (!isCurrent()) return stop();

			// Let the queued Identify reach Amplitude before replay data whenever possible.
			await Promise.race([
				client.flush().promise.catch((cause: unknown) => {
					if (isCurrent()) onError(cause);
				}),
				new Promise<void>(resolve => setTimeout(resolve, 1_000)),
			]);
			if (!isCurrent()) return stop();

			requestTimeout = setTimeout(() => controller.abort(), 10_000);
			const deadline = await startSessionReplay(startUrl, userId, activationId, controller.signal);
			clearTimeout(requestTimeout);
			if (!isCurrent()) return stop();

			const expire = () => {
				expiredActivation.current = activationId;
				stop();
			};
			const canRecord = () => {
				if (!isCurrent()) return false;
				if (getReplayTimeRemaining(deadline) > 0) return true;
				expire();
				return false;
			};

			expiryTimeout = setTimeout(expire, getReplayTimeRemaining(deadline));
			document.addEventListener('visibilitychange', canRecord, { signal: controller.signal });

			if (!canRecord()) return stop();
			shutdown = replay.shutdown;
			await replay.init(apiKey, {
				deviceId,
				privacyConfig: { defaultMaskLevel: 'light' },
				sampleRate: 1,
				serverZone: options?.serverZone ?? 'EU',
				// A new GO authorization must create a distinct replay.
				sessionId: activationId,
			}).promise;
			if (!canRecord()) {
				replay.shutdown();
				return stop();
			}

			// Init can resolve even when remote configuration disables capture.
			if (!replay.getSessionReplayProperties()['[Amplitude] Session Replay ID']) {
				throw new Error('Amplitude Session Replay capture is unavailable');
			}
			setFailedActivationId(undefined);
		});
		sdkOperations.current = setup.catch(() => {});
		try {
			await setup;
		} catch (cause: unknown) {
			if (isCurrent()) {
				setFailedActivationId(activationId);
				onError(cause);
			}
			stop();
		}
	});

	useEffect(() => {
		if (!activationId || !initialization || !startUrl || !userId) return;
		const restore = (event: PageTransitionEvent) => {
			if (event.persisted) void startReplay();
		};
		window.addEventListener('pagehide', stopReplay);
		window.addEventListener('pageshow', restore);
		return () => {
			stopReplay();
			window.removeEventListener('pagehide', stopReplay);
			window.removeEventListener('pageshow', restore);
		};
	}, [activationId, initialization, onError, startUrl, stopReplay, userId]);

	// A fresh /me response can retry a failed start without restarting an active capture.
	useEffect(() => {
		void startReplay();
	}, [activationId, authorization, initialization, onError, startUrl, userId]);

	return { failedReplayActivationId: failedActivationId === activationId ? failedActivationId : undefined, stopReplay };
}
