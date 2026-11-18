'use client';

import { type Types } from '@amplitude/analytics-browser';
import { type SessionReplayPlugin } from '@amplitude/plugin-session-replay-browser';
import { type UserSessionReplayAuthorization } from '@tmlmobilidade/go-types-core';
import { useCallback, useEffect, useEffectEvent, useRef } from 'react';

import { getReplayTimeRemaining, startSessionReplay } from '../utils/session-replay.js';

/* * */

interface UseSessionReplayProps {
	authorization: null | undefined | UserSessionReplayAuthorization
	client: Types.BrowserClient | undefined
	onError: (cause: unknown) => void
	startUrl: string | undefined
	userId: string | undefined
}

/* * */

export function useSessionReplay({ authorization, client, onError, startUrl, userId }: UseSessionReplayProps): () => void {
	const activationId = authorization?.cancelled_at === null ? authorization.activation_id : undefined;
	const expiredActivation = useRef<string>(undefined);
	const stopCapture = useRef<() => void>(undefined);
	const sdkOperations = useRef(Promise.resolve());

	const stopReplay = useCallback(() => stopCapture.current?.(), []);

	const startReplay = useEffectEvent(async () => {
		if (!activationId || !client || !startUrl || !userId || stopCapture.current || expiredActivation.current === activationId) return;
		if (client.getOptOut() || client.getUserId() !== userId) return;

		const controller = new AbortController();
		const requestTimeout = setTimeout(() => controller.abort(), 10_000);
		let expiryTimeout: ReturnType<typeof setTimeout> | undefined;
		let plugin: SessionReplayPlugin | undefined;

		const isCurrent = () => stopCapture.current === stop && !client.getOptOut() && client.getUserId() === userId;
		const stop = () => {
			if (stopCapture.current !== stop) return;
			stopCapture.current = undefined;
			controller.abort();
			clearTimeout(requestTimeout);
			clearTimeout(expiryTimeout);

			if (!plugin) return;
			plugin.stop();
			const pluginName = plugin.name;
			// Wait for setup to finish before removing the plugin.
			sdkOperations.current = sdkOperations.current.then(async () => {
				await client.remove(pluginName).promise;
			}).catch(onError);
		};
		stopCapture.current = stop;

		try {
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

			const setup = sdkOperations.current.then(async () => {
				const { sessionReplayPlugin } = await import('@amplitude/plugin-session-replay-browser');
				if (!canRecord()) return stop();
				plugin = sessionReplayPlugin({
					privacyConfig: { defaultMaskLevel: 'light' },
					sampleRate: 1,
				});
				await client.add(plugin).promise;
				if (!canRecord()) {
					plugin.stop();
					stop();
				}
			});
			sdkOperations.current = setup.catch(() => {});
			await setup;
		} catch (cause: unknown) {
			if (isCurrent()) onError(cause);
			stop();
		}
	});

	useEffect(() => {
		if (!activationId || !client || !startUrl || !userId) return;
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
	}, [activationId, client, onError, startUrl, stopReplay, userId]);

	// A fresh /me response can retry a failed start without restarting an active capture.
	useEffect(() => {
		void startReplay();
	}, [activationId, authorization, client, onError, startUrl, userId]);

	return stopReplay;
}
