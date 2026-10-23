'use client';

import { useEffect, useMemo, useState } from 'react';

import { type AnalyticsInitialization } from '../types/analytics';
import { createExperimentClient, fetchReplayActivation } from '../utils/experiment-client';

/* * */

const REPLAY_FLAG_REFRESH_INTERVAL_MS = 30_000;

/** Polls the remote activation ID for the authenticated user without starting replay capture. */
export function useReplayFlag(
	initialized: AnalyticsInitialization | undefined,
	deploymentKey: string | undefined,
	userId: string | undefined,
	ready: boolean,
	onError: (cause: unknown) => void,
) {
	// A new request identity immediately invalidates decisions from a previous user or client.
	const request = useMemo(() => {
		if (!ready || !initialized || !deploymentKey || !userId) return undefined;
		return { deploymentKey, initialized, userId };
	}, [deploymentKey, initialized, ready, userId]);
	const [decision, setDecision] = useState<{ activationId: string | undefined; request: typeof request }>();

	useEffect(() => {
		if (!request) return;
		const { client, options } = request.initialized;
		if (client.getOptOut()) return;
		const experiment = createExperimentClient(request.deploymentKey, options?.serverZone);
		let active = true;
		let timeout: ReturnType<typeof setTimeout> | undefined;
		const isCurrent = () => active && !client.getOptOut() && client.getUserId() === request.userId;

		const refresh = async () => {
			if (!isCurrent()) return;
			try {
				const activationId = await fetchReplayActivation(experiment, { device_id: client.getDeviceId(), user_id: request.userId });
				if (isCurrent()) setDecision({ activationId, request });
			} catch (cause: unknown) {
				if (isCurrent()) {
					setDecision(undefined);
					onError(cause);
				}
			} finally {
				// Schedule each evaluation after the previous SDK call completes.
				if (isCurrent()) timeout = setTimeout(refresh, REPLAY_FLAG_REFRESH_INTERVAL_MS);
			}
		};

		void refresh();
		return () => {
			active = false;
			clearTimeout(timeout);
			experiment.stop();
			experiment.clear();
		};
	}, [onError, request]);

	if (!request || decision?.request !== request) return undefined;
	const { client } = request.initialized;
	if (client.getOptOut() || client.getUserId() !== request.userId) return undefined;
	return decision.activationId;
}
