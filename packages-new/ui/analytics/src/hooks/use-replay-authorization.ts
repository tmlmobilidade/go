'use client';

import { useEffect, useMemo, useState } from 'react';

import { type AnalyticsInitialization } from '../types/analytics';
import { type AnalyticsReplayActivation } from '../types/replay/activation';
import { type AnalyticsReplayAuthorization } from '../types/replay/authorization';
import { fetchReplayActivation } from '../utils/replay-authorization';

/* * */

interface UseReplayAuthorizationProps {
	authorization: AnalyticsReplayAuthorization | undefined
	initialization: AnalyticsInitialization | undefined
	onError: (cause: unknown) => void
	ready: boolean
	startUrl: string | undefined
	userId: string | undefined
}

/* * */

const REPLAY_AUTHORIZATION_REQUEST_TIMEOUT_MS = 10_000;

export function useReplayAuthorization({ authorization, initialization, onError, ready, startUrl, userId }: UseReplayAuthorizationProps): AnalyticsReplayActivation | undefined {
	//

	//
	// Setup variables

	const authorizationContext = useMemo(() => {
		if (!ready || !initialization || !startUrl || !userId) return undefined;
		return { initialization, startUrl, userId };
	}, [initialization, ready, startUrl, userId]);

	const [authorizationState, setAuthorizationState] = useState<{
		activation: AnalyticsReplayActivation | undefined
		context: typeof authorizationContext
	}>();

	//
	// Setup effects

	useEffect(() => {
		if (!authorizationContext) return;
		if (authorization?.userId !== authorizationContext.userId) return;

		const { client } = authorizationContext.initialization;

		let isEffectActive = true;
		const requestController = new AbortController();
		const requestTimeout = setTimeout(() => requestController.abort(), REPLAY_AUTHORIZATION_REQUEST_TIMEOUT_MS);

		const isAuthorizationContextCurrent = () => {
			if (!isEffectActive || client.getOptOut()) return false;
			return client.getUserId() === authorizationContext.userId;
		};

		const resolveAuthorization = async () => {
			if (!isAuthorizationContextCurrent()) return;

			try {
				const activation = await fetchReplayActivation(authorization, authorizationContext.startUrl, requestController.signal);
				if (!isAuthorizationContextCurrent()) return;

				setAuthorizationState((previousAuthorizationState) => {
					// Refreshing /me must not restart capture or extend its deadline.
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
			}
		};

		// A restored page waits for a fresh /me response before capture resumes.
		const handlePageHide = () => {
			isEffectActive = false;
			setAuthorizationState(undefined);
			clearTimeout(requestTimeout);
			requestController.abort();
		};

		window.addEventListener('pagehide', handlePageHide);
		void resolveAuthorization();

		return () => {
			isEffectActive = false;
			clearTimeout(requestTimeout);
			requestController.abort();
			window.removeEventListener('pagehide', handlePageHide);
		};
	}, [authorization, authorizationContext, onError]);

	//
	// Return activation

	if (!authorizationContext || authorizationState?.context !== authorizationContext) return undefined;
	if (authorization?.userId !== authorizationContext.userId || authorization.authorization?.cancelled_at !== null) return undefined;

	const { client } = authorizationContext.initialization;
	if (client.getOptOut() || client.getUserId() !== authorizationContext.userId) return undefined;

	return authorizationState.activation;
}
