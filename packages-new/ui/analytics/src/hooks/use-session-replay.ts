'use client';

import { type Types } from '@amplitude/analytics-browser';
import { type SessionReplayPlugin } from '@amplitude/plugin-session-replay-browser';
import { type UserSessionReplayAuthorization } from '@tmlmobilidade/go-types-core';
import { useCallback, useEffect, useRef } from 'react';

import { getReplayTimeRemaining, startSessionReplay } from '../utils/session-replay';

/* * */

interface UseSessionReplayProps {
	authorization: null | undefined | UserSessionReplayAuthorization
	client: Types.BrowserClient | undefined
	onError: (cause: unknown) => void
	startUrl: string | undefined
	userId: string | undefined
}

/* * */

/** Applies the authorization from /me and lets the SDK upload the capture. */
export function useSessionReplay({ authorization, client, onError, startUrl, userId }: UseSessionReplayProps): () => void {
	const authorizationRef = useRef(authorization);
	const synchronizeRef = useRef<(value: UseSessionReplayProps['authorization']) => void>(() => {});
	const stopRef = useRef<() => void>(() => {});
	const sdkOperationsRef = useRef(Promise.resolve());

	const stopReplay = useCallback(() => stopRef.current(), []);

	useEffect(() => {
		if (!client || !startUrl || !userId) return;

		let capture: undefined | { activationId: string, stop: () => void };
		let expiredActivationId: string | undefined;

		const synchronize = (value: UseSessionReplayProps['authorization']) => {
			if (value?.cancelled_at === null && capture?.activationId === value.activation_id) return;
			capture?.stop();
			if (value?.cancelled_at !== null) return;
			if (value.activation_id === expiredActivationId) return;

			let stopped = false;
			let attached = false;
			let plugin: SessionReplayPlugin | undefined;
			let deadline: Awaited<ReturnType<typeof startSessionReplay>> | undefined;
			let expiryTimeout: ReturnType<typeof setTimeout> | undefined;
			const controller = new AbortController();
			const requestTimeout = setTimeout(() => controller.abort(), 10_000);

			const isCurrent = () => !stopped && !client.getOptOut() && client.getUserId() === userId;
			const expire = () => {
				expiredActivationId = value.activation_id;
				stop();
			};
			const checkDeadline = () => {
				if (deadline && getReplayTimeRemaining(deadline) <= 0) expire();
			};

			const stop = () => {
				if (stopped) return;
				stopped = true;
				controller.abort();
				clearTimeout(requestTimeout);
				clearTimeout(expiryTimeout);
				document.removeEventListener('visibilitychange', checkDeadline);
				plugin?.stop();
				if (capture?.stop === stop) capture = undefined;

				// Finish SDK setup before removing the plugin or attaching another one.
				sdkOperationsRef.current = sdkOperationsRef.current.then(async () => {
					if (attached && plugin) await client.remove(plugin.name).promise;
				}).catch(onError);
			};

			capture = { activationId: value.activation_id, stop };

			const start = async () => {
				try {
					// The idempotent start also checks active authorizations on reload or restore.
					const currentDeadline = await startSessionReplay(startUrl, userId, value.activation_id, controller.signal);
					deadline = currentDeadline;
					clearTimeout(requestTimeout);
					checkDeadline();
					if (!isCurrent()) return stop();

					expiryTimeout = setTimeout(expire, getReplayTimeRemaining(currentDeadline));
					document.addEventListener('visibilitychange', checkDeadline);

					const { sessionReplayPlugin } = await import('@amplitude/plugin-session-replay-browser');
					if (!isCurrent()) return stop();

					const currentPlugin = sessionReplayPlugin({ sampleRate: 1 });
					plugin = currentPlugin;
					const setup = sdkOperationsRef.current.then(async () => {
						checkDeadline();
						if (!isCurrent()) return;
						attached = true;
						await client.add(currentPlugin).promise;
						checkDeadline();
						if (!isCurrent()) {
							currentPlugin.stop();
							stop();
						}
					});
					sdkOperationsRef.current = setup.catch(() => {});
					await setup;
				} catch (cause: unknown) {
					const reportError = isCurrent();
					stop();
					if (reportError) onError(cause);
				}
			};

			void start();
		};

		const stopCapture = () => capture?.stop();
		const handlePageShow = (event: PageTransitionEvent) => {
			if (event.persisted) synchronize(authorizationRef.current);
		};

		synchronizeRef.current = synchronize;
		stopRef.current = stopCapture;
		window.addEventListener('pagehide', stopCapture);
		window.addEventListener('pageshow', handlePageShow);

		return () => {
			stopCapture();
			synchronizeRef.current = () => {};
			stopRef.current = () => {};
			window.removeEventListener('pagehide', stopCapture);
			window.removeEventListener('pageshow', handlePageShow);
		};
	}, [client, onError, startUrl, userId]);

	useEffect(() => {
		authorizationRef.current = authorization;
		synchronizeRef.current(authorization);
	}, [authorization, client, onError, startUrl, userId]);

	return stopReplay;
}
