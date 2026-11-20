'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { type AnalyticsContextProps, type AnalyticsContextState, type AnalyticsInitialization } from '../types/analytics.js';
import { type AnalyticsEventInput } from '../types/events/shared.js';
import { type AnalyticsUserProperties } from '../types/user-properties.js';
import { identifyAnalyticsUser, initializeAnalyticsClient, trackAnalyticsEvent } from '../utils/analytics-client.js';
import { useAnalyticsConfiguration } from './use-analytics-configuration.js';
import { useSessionReplay } from './use-session-replay.js';

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

	// Synchronize identity before the replay hook applies the user's authorization.
	useEffect(() => {
		if (ready && initialization && user !== undefined) identifyAnalyticsUser(initialization.client, user, handleError);
	}, [handleError, initialization, ready, user]);

	const { failedReplayActivationId, stopReplay } = useSessionReplay({
		authorization: replayAuthorization,
		initialization: ready ? initialization : undefined,
		onError: handleError,
		startUrl: replayStartUrl,
		userId: user?._id,
	});

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
			stopReplay();
		}

		return identifyAnalyticsUser(initialization.client, userProperties, handleError);
	}, [handleError, initialization, ready, stopReplay]);

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
			pendingInitialization = initializeAnalyticsClient(apiKey, options);
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
			stopReplay();
			client.setOptOut(true);
		};
	}, [apiKey, handleError, options, stopReplay]);

	//
	// Return state

	return useMemo(() => ({
		actions: { identify, track },
		flags: { error, failedReplayActivationId, ready },
	}), [error, failedReplayActivationId, identify, ready, track]);
}
