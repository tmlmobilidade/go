'use client';

import { type RefObject, useCallback } from 'react';

import { type AnalyticsInitialization } from '../types/analytics';
import { type AnalyticsReplayActivation } from '../types/replay/activation';

/* * */

/** Binds capture actions to the current analytics initialization without starting capture automatically. */
export function useReplay(
	initialized: AnalyticsInitialization | undefined,
	initializationRef: RefObject<AnalyticsInitialization | undefined>,
	ready: boolean,
	activation: AnalyticsReplayActivation | undefined,
	onError: (cause: unknown) => void,
) {
	const userId = initialized?.client.getUserId();

	const startReplay = useCallback(async () => {
		if (!ready || !initialized || initializationRef.current !== initialized || !activation) return false;
		// A callback retained by the previous user must not authorize the new identity.
		if (!userId || initialized.client.getUserId() !== userId) return false;
		try {
			return await initialized.replay.start(activation);
		} catch (cause: unknown) {
			if (initializationRef.current === initialized && !initialized.client.getOptOut()) onError(cause);
			return false;
		}
	}, [activation, initializationRef, initialized, onError, ready, userId]);

	const stopReplay = useCallback(() => {
		initializationRef.current?.replay.stop();
	}, [initializationRef]);

	return { startReplay, stopReplay };
}
