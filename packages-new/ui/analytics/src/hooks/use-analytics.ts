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

/** Coordinates the SDK lifecycle, user identity and explicit analytics actions. */
export function useAnalytics({ replayUrl, user, ...configuration }: AnalyticsContextProps): AnalyticsContextState {
	//

	//
	// A. Setup variables

	// Keep the current initialization available to callbacks, including pending async operations.
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
	// B. Handle actions

	const identify = useCallback((userProperties: AnalyticsUserProperties | null) => {
		if (
			!ready
			|| !initialization
			|| initializationRef.current !== initialization
			|| initialization.client.getOptOut()
		) return false;

		// End capture before logout or an identity change reaches the replay SDK.
		if (userProperties === null || (userProperties._id !== undefined && userProperties._id !== initialization.client.getUserId())) {
			initialization.replay.stop();
		}

		return identifyAnalyticsUser(initialization.client, userProperties, handleError);
	}, [handleError, initialization, ready]);

	const track = useCallback(async (event: AnalyticsEventInput, properties?: Record<string, unknown>) => {
		if (!ready || !initialization || initializationRef.current !== initialization) return false;

		clearError();

		return trackAnalyticsEvent(initialization, event, properties, (cause) => {
			// A failure from a replaced or opted-out client must not overwrite the current error state.
			if (initializationRef.current === initialization && !initialization.client.getOptOut()) handleError(cause);
		});
	}, [clearError, handleError, initialization, ready]);

	//
	// C. Setup effects

	// Initialize after render, reusing the pending initialization when the effect runs again.
	useEffect(() => {
		setError(undefined);
		if (!apiKey) return;

		let pendingInitialization = initializationRef.current;
		if (pendingInitialization?.apiKey !== apiKey || pendingInitialization.options !== options) {
			pendingInitialization = initializeAnalyticsClient(apiKey, options, handleError);
			initializationRef.current = pendingInitialization;
		}

		const { client, promise: initializationPromise } = pendingInitialization;
		// Ignore initialization results that arrive after this effect has been cleaned up.
		let isInitializationActive = true;

		initializationPromise.then(() => {
			if (!isInitializationActive) return;
			client.setOptOut(options?.optOut ?? false);
			// Publish a new lifecycle identity so reusing the SDK also restarts identity synchronization and polling.
			const activatedInitialization = { ...pendingInitialization };
			initializationRef.current = activatedInitialization;
			setInitialization(activatedInitialization);
		}).catch((cause: unknown) => {
			if (isInitializationActive) handleError(cause);
		});

		return () => {
			// Stop capture and disable this client on reconfiguration or provider unmount.
			isInitializationActive = false;
			pendingInitialization.replay.stop();
			client.setOptOut(true);
		};
	}, [apiKey, handleError, options]);

	// Synchronize user changes once ready; undefined preserves identity and null clears it.
	useEffect(() => {
		if (user !== undefined) identify(user);
	}, [identify, user]);

	//
	// D. Setup replay

	// Register authorization polling after synchronizing Analytics identity for this user.
	const replayActivation = useReplayAuthorization({
		initialization,
		onError: handleError,
		ready,
		replayUrl,
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
	// E. Return state

	return useMemo(() => ({
		actions: { identify, startReplay, stopReplay, track },
		flags: { error, ready, replayEnabled },
	}), [error, identify, ready, replayEnabled, startReplay, stopReplay, track]);
}
