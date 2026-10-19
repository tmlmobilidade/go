'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { type AnalyticsContextProps, type AnalyticsContextState, type AnalyticsInitialization } from '../types/analytics';
import { type AnalyticsEventInput } from '../types/events/shared';
import { type AnalyticsUserProperties } from '../types/user-properties';
import { identifyAnalyticsUser, initializeAnalyticsClient, trackAnalyticsEvent } from '../utils/analytics-client';
import { useAnalyticsConfiguration } from './use-analytics-configuration';
import { useReplay } from './use-replay';

/* * */

/** Coordinates the SDK lifecycle, user identity and explicit analytics actions. */
export function useAnalytics({ user, ...configuration }: AnalyticsContextProps): AnalyticsContextState {
	// Keep the current initialization available to callbacks, including pending async operations.
	const initializationRef = useRef<AnalyticsInitialization | undefined>(undefined);
	const [error, setError] = useState<Error | undefined>(undefined);
	const [initialized, setInitialized] = useState<AnalyticsInitialization | undefined>(undefined);
	const handleError = useCallback((cause: unknown) => {
		setError(cause instanceof Error ? cause : new Error(String(cause)));
	}, []);
	const clearError = useCallback(() => setError(undefined), []);
	const { apiKey, options } = useAnalyticsConfiguration(configuration, handleError, clearError);
	const ready = Boolean(apiKey) && initialized?.apiKey === apiKey && initialized?.options === options;
	const { startReplay, stopReplay } = useReplay(initialized, initializationRef, ready, handleError);

	// Actions must use the initialized client that still matches the current configuration.
	const identify = useCallback((value: AnalyticsUserProperties | null) => {
		if (!ready || !initialized || initializationRef.current !== initialized || initialized.client.getOptOut()) return false;
		return identifyAnalyticsUser(initialized.client, value, handleError);
	}, [handleError, initialized, ready]);

	const track = useCallback(async (event: AnalyticsEventInput, properties?: Record<string, unknown>) => {
		if (!ready || !initialized || initializationRef.current !== initialized) return false;
		clearError();

		return trackAnalyticsEvent(initialized, event, properties, (cause) => {
			// A failure from a replaced or opted-out client must not overwrite the current error state.
			if (initializationRef.current === initialized && !initialized.client.getOptOut()) handleError(cause);
		});
	}, [clearError, handleError, initialized, ready]);

	// Initialize after render, reusing the pending initialization when the effect runs again.
	useEffect(() => {
		setError(undefined);
		if (!apiKey) return;

		let initialization = initializationRef.current;
		if (initialization?.apiKey !== apiKey || initialization.options !== options) {
			initialization = initializeAnalyticsClient(apiKey, options, handleError);
			initializationRef.current = initialization;
		}

		const { client, promise } = initialization;
		// Ignore initialization results that arrive after this effect has been cleaned up.
		let active = true;

		promise.then(() => {
			if (!active) return;
			client.setOptOut(options?.optOut ?? false);
			setInitialized(initialization);
		}).catch((cause: unknown) => {
			if (active) handleError(cause);
		});

		return () => {
			// Stop capture and disable this client on reconfiguration or provider unmount.
			active = false;
			initialization.replay.stop();
			client.setOptOut(true);
		};
	}, [apiKey, handleError, options]);

	// Synchronize user changes once ready; undefined preserves identity and null clears it.
	useEffect(() => {
		if (user !== undefined) identify(user);
	}, [identify, user]);

	return useMemo(() => ({
		actions: { identify, startReplay, stopReplay, track },
		flags: { error, ready },
	}), [error, identify, ready, startReplay, stopReplay, track]);
}
