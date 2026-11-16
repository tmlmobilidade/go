'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { type AnalyticsContextProps, type AnalyticsContextState, type AnalyticsInitialization } from '../types/analytics';
import { type AnalyticsEventInput } from '../types/events/shared';
import { type AnalyticsUserProperties } from '../types/user-properties';
import { identifyAnalyticsUser, initializeAnalyticsClient, trackAnalyticsEvent } from '../utils/analytics-client';
import { useAnalyticsConfiguration } from './use-analytics-configuration';
import { useReplay } from './use-replay';
import { useReplayAuthorization } from './use-replay-authorization';

/* * */

export function useAnalytics({ replayAuthorization, replayStartUrl, user, ...configuration }: AnalyticsContextProps): AnalyticsContextState {
	//

	//
	// Setup variables

	const initializationRef = useRef<AnalyticsInitialization | undefined>(undefined);

	const [error, setError] = useState<Error | undefined>(undefined);
	const [initialization, setInitialization] = useState<AnalyticsInitialization | undefined>(undefined);

	const handleError = useCallback((cause: unknown) => {
		setError(cause instanceof Error ? cause : new Error(String(cause)));
	}, []);

	const clearError = useCallback(() => setError(undefined), []);

	const { apiKey, options } = useAnalyticsConfiguration(configuration, handleError, clearError);

	const ready = Boolean(apiKey) && initialization?.apiKey === apiKey && initialization?.options === options;

	//
	// Handle actions

	const identify = useCallback((userProperties: AnalyticsUserProperties | null) => {
		if (
			!ready
			|| !initialization
			|| initializationRef.current !== initialization
			|| initialization.client.getOptOut()
		) return false;

		// Stop capture before changing the SDK identity.
		if (userProperties === null || (userProperties._id !== undefined && userProperties._id !== initialization.client.getUserId())) {
			initialization.replay.stop();
		}

		return identifyAnalyticsUser(initialization.client, userProperties, handleError);
	}, [handleError, initialization, ready]);

	const track = useCallback(async (event: AnalyticsEventInput, properties?: Record<string, unknown>) => {
		if (!ready || !initialization || initializationRef.current !== initialization) return false;

		clearError();

		return trackAnalyticsEvent(initialization, event, properties, (cause) => {
			// Ignore errors from a previous or disabled client.
			if (initializationRef.current === initialization && !initialization.client.getOptOut()) handleError(cause);
		});
	}, [clearError, handleError, initialization, ready]);

	//
	// Setup effects

	// Reuse pending initialization when the effect runs again.
	useEffect(() => {
		setError(undefined);
		if (!apiKey) return;

		let pendingInitialization = initializationRef.current;
		if (pendingInitialization?.apiKey !== apiKey || pendingInitialization.options !== options) {
			pendingInitialization = initializeAnalyticsClient(apiKey, options, handleError);
			initializationRef.current = pendingInitialization;
		}

		const { client, promise: initializationPromise } = pendingInitialization;

		let isInitializationActive = true;

		initializationPromise.then(() => {
			if (!isInitializationActive) return;
			client.setOptOut(options?.optOut ?? false);
			// A new reference restarts identity synchronization and authorization checks.
			const activatedInitialization = { ...pendingInitialization };
			initializationRef.current = activatedInitialization;
			setInitialization(activatedInitialization);
		}).catch((cause: unknown) => {
			if (isInitializationActive) handleError(cause);
		});

		return () => {
			isInitializationActive = false;
			pendingInitialization.replay.stop();
			client.setOptOut(true);
		};
	}, [apiKey, handleError, options]);

	// Undefined preserves identity; null clears it.
	useEffect(() => {
		if (user !== undefined) identify(user);
	}, [identify, user]);

	//
	// Setup replay

	// Synchronize identity before checking authorization from /me.
	const replayActivation = useReplayAuthorization({
		authorization: replayAuthorization,
		initialization,
		onError: handleError,
		ready,
		startUrl: replayStartUrl,
		userId: user?._id,
	});

	const replayEnabled = Boolean(replayActivation);
	const { startReplay, stopReplay } = useReplay({
		activation: replayActivation,
		initialization,
		initializationRef,
		onError: handleError,
		ready,
	});

	//
	// Return state

	return useMemo(() => ({
		actions: { identify, startReplay, stopReplay, track },
		flags: { error, ready, replayEnabled },
	}), [error, identify, ready, replayEnabled, startReplay, stopReplay, track]);
}
