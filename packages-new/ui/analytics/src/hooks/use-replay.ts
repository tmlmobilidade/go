'use client';

import { type RefObject, useCallback } from 'react';

import { type AnalyticsInitialization } from '../types/shared/analytics';

/* * */

/** Binds capture actions to the current analytics initialization without starting capture automatically. */
export function useReplay(
	initialized: AnalyticsInitialization | undefined,
	initializationRef: RefObject<AnalyticsInitialization | undefined>,
	ready: boolean,
	onError: (cause: unknown) => void,
) {
	const startReplay = useCallback(async () => {
		if (!ready || !initialized || initializationRef.current !== initialized) return false;
		try {
			return await initialized.replay.start();
		} catch (cause: unknown) {
			if (initializationRef.current === initialized && !initialized.client.getOptOut()) onError(cause);
			return false;
		}
	}, [initializationRef, initialized, onError, ready]);

	const stopReplay = useCallback(() => {
		initializationRef.current?.replay.stop();
	}, [initializationRef]);

	return { startReplay, stopReplay };
}
