'use client';

import { useEffect, useMemo, useState } from 'react';

import { type AnalyticsInitialization } from '../types/analytics';
import { type AnalyticsReplayActivation } from '../types/replay/activation';
import { fetchReplayActivation } from '../utils/replay-authorization';

/* * */

interface UseReplayAuthorizationProps {
	initialization: AnalyticsInitialization | undefined
	onError: (cause: unknown) => void
	ready: boolean
	replayUrl: string | undefined
	userId: string | undefined
}

/* * */

const REPLAY_AUTHORIZATION_REFRESH_INTERVAL_MS = 30_000;
const REPLAY_AUTHORIZATION_REQUEST_TIMEOUT_MS = 10_000;

/** Polls GO for the current user's activation, ignoring responses from replaced identities. */
export function useReplayAuthorization({ initialization, onError, ready, replayUrl, userId }: UseReplayAuthorizationProps) {
	const authorizationContext = useMemo(() => {
		if (!ready || !initialization || !replayUrl || !userId) return undefined;
		return { initialization, replayUrl, userId };
	}, [initialization, ready, replayUrl, userId]);
	const [authorizationState, setAuthorizationState] = useState<{
		activation: AnalyticsReplayActivation | undefined
		context: typeof authorizationContext
	}>();

	useEffect(() => {
		if (!authorizationContext) return;

		const { client } = authorizationContext.initialization;
		let isEffectActive = true;
		let refreshTimeout: ReturnType<typeof setTimeout> | undefined;
		let pendingRequestController: AbortController | undefined;

		const isAuthorizationContextCurrent = () => {
			if (!isEffectActive || client.getOptOut()) return false;
			return client.getUserId() === authorizationContext.userId;
		};

		const refreshAuthorization = async () => {
			if (!isAuthorizationContextCurrent() || pendingRequestController) return;

			const requestController = new AbortController();
			pendingRequestController = requestController;
			const requestTimeout = setTimeout(() => requestController.abort(), REPLAY_AUTHORIZATION_REQUEST_TIMEOUT_MS);

			try {
				const activation = await fetchReplayActivation(authorizationContext.replayUrl, authorizationContext.userId, requestController.signal);
				if (!isAuthorizationContextCurrent()) return;

				setAuthorizationState((previousAuthorizationState) => {
					// A repeated response must not restart the recorder or extend its local deadlines.
					if (
						activation
						&& previousAuthorizationState?.context === authorizationContext
						&& previousAuthorizationState.activation?.activationId === activation.activationId
						&& previousAuthorizationState.activation.expiresAt === activation.expiresAt
					) {
						return previousAuthorizationState;
					}

					return { activation, context: authorizationContext };
				});
			} catch (cause: unknown) {
				if (!isAuthorizationContextCurrent()) return;

				setAuthorizationState(undefined);
				onError(cause);
			} finally {
				clearTimeout(requestTimeout);
				pendingRequestController = undefined;

				if (isAuthorizationContextCurrent()) {
					refreshTimeout = setTimeout(refreshAuthorization, REPLAY_AUTHORIZATION_REFRESH_INTERVAL_MS);
				}
			}
		};

		// A restored page must revalidate before using authorization cached in the back-forward cache.
		const handlePageShow = () => {
			if (!isAuthorizationContextCurrent()) return;

			setAuthorizationState(undefined);
			clearTimeout(refreshTimeout);
			void refreshAuthorization();
		};
		const handlePageHide = () => {
			setAuthorizationState(undefined);
			clearTimeout(refreshTimeout);
			pendingRequestController?.abort();
		};

		window.addEventListener('pagehide', handlePageHide);
		window.addEventListener('pageshow', handlePageShow);
		void refreshAuthorization();

		return () => {
			isEffectActive = false;
			clearTimeout(refreshTimeout);
			pendingRequestController?.abort();
			window.removeEventListener('pagehide', handlePageHide);
			window.removeEventListener('pageshow', handlePageShow);
		};
	}, [authorizationContext, onError]);

	if (!authorizationContext || authorizationState?.context !== authorizationContext) return undefined;

	const { client } = authorizationContext.initialization;
	if (client.getOptOut() || client.getUserId() !== authorizationContext.userId) return undefined;

	return authorizationState.activation;
}
