/* * */

import { getCurrentEnvironment } from '@tmlmobilidade/go-types-shared';

/* * */

/**
 * Get the pt-tml-cm-core-migrate-coordinator URL for the given endpoint.
 * @param endpoint The endpoint to get the coordinator URL for.
 * @returns The coordinator URL for the given endpoint.
 */
export function getCoreMigrateCoordinatorUrl(endpoint: 'core-vehicle-events'): string {
	//

	const currentEnvironment = getCurrentEnvironment();

	if (currentEnvironment === 'dev') return `http://localhost:5050/${endpoint}`;

	return `http://${currentEnvironment}-tracker-pt-tml-cm-core-migrate-coordinator.${currentEnvironment}-tracker.svc.cluster.local/${endpoint}`;
}
