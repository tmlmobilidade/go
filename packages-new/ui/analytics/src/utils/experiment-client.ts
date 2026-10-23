import { ExperimentClient, type ExperimentUser } from '@amplitude/experiment-js-client';

import { AnalyticsReplayActivation } from '../types/replay/activation';

/* * */

const REPLAY_FLAG_KEY = 'support-session-replay';

/** Keeps each reader isolated and reports failed requests instead of using cached authorization. */
export function createExperimentClient(deploymentKey: string, serverZone = 'EU') {
	return new ExperimentClient(deploymentKey, {
		automaticExposureTracking: false,
		instanceName: 'go-ui-analytics',
		retryFetchOnFailure: false,
		serverZone,
		throwOnError: true,
	});
}

/** An enabled flag must identify the support activation; cached decisions never authorize capture. */
export async function fetchReplayActivation(client: ExperimentClient, user: ExperimentUser): Promise<string | undefined> {
	await client.fetch(user, { flagKeys: [REPLAY_FLAG_KEY] });
	const variant = client.variant(REPLAY_FLAG_KEY, { value: 'off' });
	if (variant.value !== 'on') return undefined;
	const activation = AnalyticsReplayActivation.safeParse(variant.payload);
	if (!activation.success) throw new Error('Session replay requires a non-empty activationId in the flag payload.');
	return activation.data.activationId;
}
