/* * */

import { authProvider } from '@tmlmobilidade/go-providers-auth';
import { type OfferZonesV1Extraction, OfferZonesV1ExtractionPropertiesSchema } from '@tmlmobilidade/go-types-extractions';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { normalizeString } from '@tmlmobilidade/strings';

import { buildZonesExtractionPipeline } from './query.js';

/**
 * Builds the zones query using the creator's current permissions.
 * @param extraction The extraction to build the query for.
 * @returns The permitted pipeline and normalized list search.
 */
export async function buildZonesExtractionQuery(extraction: OfferZonesV1Extraction) {
	//

	//
	// Validate properties and resolve the same agency access as the Zones API

	const validatedProperties = OfferZonesV1ExtractionPropertiesSchema.parse(extraction.properties);
	const userPermissions = await authProvider.getPermissionsFromUserId(extraction.created_by);

	const agencyAccess = PermissionCatalog.getPermissionResourceAccess({
		// Mirrors the Zones API's ZONES_READ_PERMISSION_CHECKS without importing an app.
		checks: [
			{ action: PermissionCatalog.all.lines.actions.read, scope: PermissionCatalog.all.lines.scope },
			{ action: PermissionCatalog.all.lines.actions.update, scope: PermissionCatalog.all.lines.scope },
			{ action: PermissionCatalog.all.zones.actions.nav, scope: PermissionCatalog.all.zones.scope },
		],
		permissions: userPermissions,
		resource_key: 'agency_ids',
	});

	if (!agencyAccess.allowAll && !agencyAccess.values.length) {
		throw new Error('User does not have permission to read zones');
	}

	//
	// Intersect the selected agencies with access; an empty result stays $in: []

	if (!agencyAccess.allowAll) {
		validatedProperties.agency_ids = validatedProperties.agency_ids.filter(id => agencyAccess.values.includes(id));
	}

	const pipeline = buildZonesExtractionPipeline(validatedProperties);
	const normalizedSearch = normalizeString(validatedProperties.search ?? '');

	return { normalizedSearch, pipeline };
}
