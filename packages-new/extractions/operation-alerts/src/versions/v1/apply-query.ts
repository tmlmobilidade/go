/* * */

import { authProvider } from '@tmlmobilidade/go-providers-auth';
import { type OperationAlertsV1Extraction, OperationAlertsV1ExtractionPropertiesSchema } from '@tmlmobilidade/go-types-extractions';
import { type AlertReferenceType } from '@tmlmobilidade/go-types-operation';
import { filterPermissionResourceValues, hasPermission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { normalizeString } from '@tmlmobilidade/strings';

import { buildAlertsExtractionPipeline } from './query.js';

/**
 * Builds the permitted query and normalized search for a v1 alerts extraction.
 * @param extraction The extraction to build the query for.
 * @returns The aggregation pipeline and normalized search query.
 */
export async function buildAlertsExtractionQuery(extraction: OperationAlertsV1Extraction) {
	//

	//
	// Validate properties and permissions

	const validatedProperties = OperationAlertsV1ExtractionPropertiesSchema.parse(extraction.properties);

	const userPermissions = await authProvider.getPermissionsFromUserId(extraction.created_by);

	const hasReadPermission = hasPermission(userPermissions, {
		action: PermissionCatalog.all.alerts.actions.read,
		scope: PermissionCatalog.all.alerts.scope,
	});

	if (!hasReadPermission) throw new Error('User does not have permission to read alerts');

	//
	// Restrict the selected operators and reference types to the permitted values
	//
	// Empty permission intersections must remain empty: the pipeline uses $in: []
	// to match no alerts instead of widening the extraction.

	validatedProperties.agency_ids = filterPermissionResourceValues<string>({
		action: PermissionCatalog.all.alerts.actions.read,
		permissions: userPermissions,
		resourceKey: 'agency_ids',
		scope: PermissionCatalog.all.alerts.scope,
		values: validatedProperties.agency_ids,
	});

	validatedProperties.reference_type = filterPermissionResourceValues<AlertReferenceType>({
		action: PermissionCatalog.all.alerts.actions.read,
		permissions: userPermissions,
		resourceKey: 'reference_types',
		scope: PermissionCatalog.all.alerts.scope,
		values: validatedProperties.reference_type,
	});

	//
	// Prepare the aggregation pipeline and search query

	const pipeline = buildAlertsExtractionPipeline(validatedProperties);
	const normalizedSearch = normalizeString(validatedProperties.search ?? '');

	return { normalizedSearch, pipeline };
}
