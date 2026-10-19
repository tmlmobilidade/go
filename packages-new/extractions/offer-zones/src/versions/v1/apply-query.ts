/* * */

import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { authProvider } from '@tmlmobilidade/go-providers-auth';
import { type OfferZonesV1Extraction, OfferZonesV1ExtractionPropertiesSchema } from '@tmlmobilidade/go-types-extractions';
import { type Zone } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { offerZonesV1ExtractionQuery } from './query.js';

/* * */

/** Builds a zone query restricted to the requested IDs and the existing zone read policy. */
export async function buildZonesExtractionQuery(extraction: OfferZonesV1Extraction) {
	const properties = OfferZonesV1ExtractionPropertiesSchema.parse(extraction.properties);
	const permissions = await authProvider.getPermissionsFromUserId(extraction.created_by);

	const agencyAccess = PermissionCatalog.getPermissionResourceAccess({
		checks: [
			{ action: PermissionCatalog.all.lines.actions.read, scope: PermissionCatalog.all.lines.scope },
			{ action: PermissionCatalog.all.lines.actions.update, scope: PermissionCatalog.all.lines.scope },
			{ action: PermissionCatalog.all.zones.actions.nav, scope: PermissionCatalog.all.zones.scope },
		],
		permissions,
		resource_key: 'agency_ids',
	});

	if (!agencyAccess.allowAll && !agencyAccess.values.length) {
		throw new Error('You are not authorized to read zones');
	}

	const filter: Filter<Zone> = {
		_id: { $in: properties.zone_ids },
		...(agencyAccess.allowAll ? {} : { agency_ids: { $in: agencyAccess.values } }),
	};

	return { filter, ...offerZonesV1ExtractionQuery };
}
