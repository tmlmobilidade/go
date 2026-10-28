'use client';

import { useEffect, useMemo, useState } from 'react';

import { type AnalyticsInitialization } from '../types/analytics';
import { type AnalyticsReplayActivation } from '../types/replay/activation';
import { fetchReplayActivation } from '../utils/replay-authorization';

/* * */

const REPLAY_AUTHORIZATION_REFRESH_MS = 30_000;
const REPLAY_AUTHORIZATION_TIMEOUT_MS = 10_000;

/** Polls GO for the current user's activation, ignoring responses from replaced identities. */
export function useReplayAuthorization(initialized: AnalyticsInitialization | undefined, replayUrl: string | undefined, userId: string | undefined, ready: boolean, onError: (cause: unknown) => void) {
	const request = useMemo(() => {
		if (!ready || !initialized || !replayUrl || !userId) return undefined;
		return { initialized, replayUrl, userId };
	}, [initialized, ready, replayUrl, userId]);
	const [decision, setDecision] = useState<{ activation: AnalyticsReplayActivation | undefined, request: typeof request }>();

	useEffect(() => {
		if (!request) return;
		const { client } = request.initialized;
		let active = true;
		let timeout: ReturnType<typeof setTimeout> | undefined;
		let inFlight: AbortController | undefined;
		const isCurrent = () => active && !client.getOptOut() && client.getUserId() === request.userId;

		const refresh = async () => {
			if (!isCurrent() || inFlight) return;
			const controller = new AbortController();
			inFlight = controller;
			const requestTimeout = setTimeout(() => controller.abort(), REPLAY_AUTHORIZATION_TIMEOUT_MS);
			try {
				const activation = await fetchReplayActivation(request.replayUrl, request.userId, controller.signal);
				if (isCurrent()) setDecision((previous) => {
					// A repeated response must not restart the recorder or extend its local deadlines.
					if (activation && previous?.request === request && previous.activation?.activationId === activation.activationId && previous.activation.expiresAt === activation.expiresAt) return previous;
					return { activation, request };
				});
			} catch (cause: unknown) {
				if (isCurrent()) {
					setDecision(undefined);
					onError(cause);
				}
			} finally {
				clearTimeout(requestTimeout);
				inFlight = undefined;
				if (isCurrent()) timeout = setTimeout(refresh, REPLAY_AUTHORIZATION_REFRESH_MS);
			}
		};

		// A restored page must revalidate before using authorization cached in the back-forward cache.
		const handlePageShow = () => {
			if (!isCurrent()) return;
			setDecision(undefined);
			clearTimeout(timeout);
			void refresh();
		};
		const handlePageHide = () => {
			setDecision(undefined);
			clearTimeout(timeout);
			inFlight?.abort();
		};
		window.addEventListener('pagehide', handlePageHide);
		window.addEventListener('pageshow', handlePageShow);
		void refresh();
		return () => {
			active = false;
			clearTimeout(timeout);
			inFlight?.abort();
			window.removeEventListener('pagehide', handlePageHide);
			window.removeEventListener('pageshow', handlePageShow);
		};
	}, [onError, request]);

	if (!request || decision?.request !== request) return undefined;
	const { client } = request.initialized;
	if (client.getOptOut() || client.getUserId() !== request.userId) return undefined;
	return decision.activation;
}
