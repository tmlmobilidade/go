import { ExperimentClient, type ExperimentUser } from '@amplitude/experiment-js-client';

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

/** Only a freshly fetched `on` variant enables support capture for this user. */
export async function fetchReplayFlag(client: ExperimentClient, user: ExperimentUser): Promise<boolean> {
	await client.fetch(user, { flagKeys: [REPLAY_FLAG_KEY] });
	return client.variant(REPLAY_FLAG_KEY, { value: 'off' }).value === 'on';
}
