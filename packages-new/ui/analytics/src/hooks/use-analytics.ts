'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { type AnalyticsContextProps, type AnalyticsContextState, type AnalyticsInitialization } from '../types/shared/analytics.js';
import { identifyAnalyticsUser, initializeAnalyticsClient, trackAnalyticsEvent } from '../utils/analytics-client.js';
import { useAnalyticsConfiguration } from './use-analytics-configuration.js';

/* * */

export function useAnalytics({ user, ...configuration }: AnalyticsContextProps): AnalyticsContextState {
	const initializationRef = useRef<AnalyticsInitialization | undefined>(undefined);
	const [error, setError] = useState<Error | undefined>(undefined);
	const [initialized, setInitialized] = useState<AnalyticsInitialization | undefined>(undefined);
	const handleError = useCallback((cause: unknown) => {
		setError(cause instanceof Error ? cause : new Error(String(cause)));
	}, []);
	const clearError = useCallback(() => setError(undefined), []);
	const { apiKey, options } = useAnalyticsConfiguration(configuration, handleError, clearError);
	const ready = Boolean(apiKey) && initialized?.apiKey === apiKey && initialized?.options === options;

	const track = useCallback(async (eventName: string, properties?: Record<string, unknown>) => {
		if (!ready || !initialized || initializationRef.current !== initialized) return false;
		setError(undefined);

		try {
			await trackAnalyticsEvent(initialized.client, eventName, properties);
			return true;
		} catch (cause: unknown) {
			if (initializationRef.current === initialized && !initialized.client.getOptOut()) handleError(cause);
			return false;
		}
	}, [handleError, initialized, ready]);

	useEffect(() => {
		setError(undefined);
		if (!apiKey) return;

		let initialization = initializationRef.current;
		if (initialization?.apiKey !== apiKey || initialization.options !== options) {
			initialization = initializeAnalyticsClient(apiKey, options);
			initializationRef.current = initialization;
		}

		const { client, promise } = initialization;
		let active = true;

		promise.then(() => {
			if (!active) return;
			client.setOptOut(options?.optOut ?? false);
			setInitialized(initialization);
		}).catch((cause: unknown) => {
			if (active) handleError(cause);
		});

		return () => {
			active = false;
			client.setOptOut(true);
		};
	}, [apiKey, handleError, options]);

	useEffect(() => {
		if (!ready || !initialized || user === undefined || initialized.client.getOptOut()) return;
		try {
			identifyAnalyticsUser(initialized.client, user);
		} catch (cause: unknown) {
			handleError(cause);
		}
	}, [handleError, initialized, ready, user]);

	return useMemo(() => ({
		actions: { track },
		flags: { error, ready },
	}), [error, ready, track]);
}
