/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { getCurrentEnvironment } from '@tmlmobilidade/go-types-shared';

/**
 * Retrieve the user's extractions in the current environment.
 * Legacy extractions without an environment belong to production.
 * @param userId The current user's ID
 * @returns The user's extractions in this environment
 */
export async function getUserExtractions(userId: string) {
	//
	// Legacy extractions belong to production. Local development remains unfiltered.

	const currentEnvironment = getCurrentEnvironment();
	const environmentFilter = currentEnvironment === 'prd'
		? { $or: [{ source_environment: 'prd' }, { source_environment: { $exists: false } }] }
		: { source_environment: currentEnvironment };

	//
	// Retrieve the user's extractions in the current environment

	return goDb.core.extractions.findMany({
		...environmentFilter,
		created_by: userId,
	});
}
