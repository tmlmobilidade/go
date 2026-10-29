'use client';

import { type RefObject, useCallback } from 'react';

import { type AnalyticsInitialization } from '../types/analytics';
import { type AnalyticsReplayActivation } from '../types/replay/activation';

/* * */

/** Binds capture actions to the current analytics initialization without starting capture automatically. */
export function useReplay(
	initialization: AnalyticsInitialization | undefined,
	initializationRef: RefObject<AnalyticsInitialization | undefined>,
	ready: boolean,
	activation: AnalyticsReplayActivation | undefined,
	onError: (cause: unknown) => void,
) {
	const userId = initialization?.client.getUserId();

	const startReplay = useCallback(async () => {
		if (!ready || !initialization || initializationRef.current !== initialization || !activation) return false;
		// A callback retained by the previous user must not authorize the new identity.
		if (!userId || initialization.client.getUserId() !== userId) return false;
		try {
			return await initialization.replay.start(activation);
		} catch (cause: unknown) {
			if (initializationRef.current === initialization && !initialization.client.getOptOut()) onError(cause);
			return false;
		}
	}, [activation, initialization, initializationRef, onError, ready, userId]);

	const stopReplay = useCallback(() => {
		initializationRef.current?.replay.stop();
	}, [initializationRef]);

	return { startReplay, stopReplay };
}
