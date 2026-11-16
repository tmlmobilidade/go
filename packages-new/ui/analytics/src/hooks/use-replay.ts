'use client';

import { type RefObject, useCallback } from 'react';

import { type AnalyticsInitialization } from '../types/analytics';
import { type AnalyticsReplayActivation } from '../types/replay/activation';

/* * */

interface UseReplayProps {
	activation: AnalyticsReplayActivation | undefined
	initialization: AnalyticsInitialization | undefined
	initializationRef: RefObject<AnalyticsInitialization | undefined>
	onError: (cause: unknown) => void
	ready: boolean
}

export interface UseReplayReturnType {
	startReplay: () => Promise<boolean>
	stopReplay: () => void
}

/* * */

export function useReplay({ activation, initialization, initializationRef, onError, ready }: UseReplayProps): UseReplayReturnType {
	//

	//
	// Setup variables

	const userId = initialization?.client.getUserId();

	//
	// Handle actions

	const startReplay = useCallback(async () => {
		if (
			!ready
			|| !initialization
			|| initializationRef.current !== initialization
			|| !activation
		) return false;

		// Ignore callbacks retained by a previous user.
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

	//
	// Return actions

	return { startReplay, stopReplay };
}
