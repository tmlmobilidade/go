/* * */

import { getCurrentEnvironment } from '@tmlmobilidade/go-types-shared';

/**
 * Get the coordinator URL for the given endpoint.
 * @param endpoint The endpoint to get the coordinator URL for.
 * @returns The coordinator URL for the given endpoint.
 */
export function getCoordinatorUrl(endpoint: 'plans' | 'rides'): string {
	//

	const currentEnvironment = getCurrentEnvironment();

	if (currentEnvironment === 'dev') return `http://localhost:5050/${endpoint}`;

	return `http://${currentEnvironment}-operation-rides-coordinator.${currentEnvironment}-operation.svc.cluster.local/${endpoint}`;
}
