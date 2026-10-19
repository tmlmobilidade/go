/* * */

import { locationsDb } from '@tmlmobilidade/go-interfaces-locationsdb';
import { authProvider } from '@tmlmobilidade/go-providers-auth';
import { type InfrastructureNodesV1Extraction, InfrastructureStopsExtractionFiltersSchema } from '@tmlmobilidade/go-types-extractions';
import { LOCATION_PERMISSION_SLOTS } from '@tmlmobilidade/go-types-locations';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

import { infrastructureNodesV1ExtractionQuery } from './query.js';

/**
 * Builds the permitted stop filter and field projection for a v1 nodes extraction.
 * @param extraction The extraction to build the query for.
 * @returns The permitted stop filter and field projection.
 */
export async function buildNodesExtractionQuery(extraction: InfrastructureNodesV1Extraction) {
	//

	//
	// Validate properties and permissions

	const properties = InfrastructureStopsExtractionFiltersSchema.parse(extraction.properties);
	const permissions = await authProvider.getPermissionsFromUserId(extraction.created_by);
	const checks = [{ action: PermissionCatalog.all.stops.actions.export, scope: PermissionCatalog.all.stops.scope }];
	const agencyAccess = PermissionCatalog.getPermissionResourceAccess({ checks, permissions, resource_key: 'agency_ids' });
	const locationAccess = PermissionCatalog.getPermissionResourceAccess({ checks, permissions, resource_key: 'location_ids' });

	if ((!agencyAccess.allowAll && !agencyAccess.values.length) || (!locationAccess.allowAll && !locationAccess.values.length)) {
		throw new Error('User does not have permission to export stops');
	}

	//
	// Build filters matching the selection and permissions

	let selectedAgencyIds = agencyAccess.allowAll ? undefined : agencyAccess.values;

	if (properties.agency_ids?.length) {
		selectedAgencyIds = properties.agency_ids.filter(id => agencyAccess.allowAll || agencyAccess.values.includes(id));
	}

	const search = properties.search?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

	const filters = [
		...[...LOCATION_PERMISSION_SLOTS, 'neighbourhood' as const].flatMap((slot) => {
			const ids = slot === 'secondary'
				? properties.location_secondary_ids ?? properties.municipality_ids
				: properties[`location_${slot}_ids`];
			return ids?.length ? [{ [`location.${slot}.osm_id`]: { $in: ids.map(Number) } }] : [];
		}),
		...(locationAccess.allowAll ? [] : [{
			$or: LOCATION_PERMISSION_SLOTS.map(slot => ({ [`location.${slot}.osm_id`]: { $in: locationAccess.values.map(Number) } })),
		}]),
		...(search ? [{ $or: [{ _id: { $options: 'i', $regex: search } }, { name: { $options: 'i', $regex: search } }] }] : []),
	];

	const [country] = await locationsDb.findLocationsByCountryAndAdminLevel('PT', '2');
	if (!country) throw new Error('Portugal not found in locations database');

	return {
		filter: {
			'location.country.osm_id': Number(country.id),
			...(selectedAgencyIds ? { 'flags.agency_ids': { $in: selectedAgencyIds } } : {}),
			...(filters.length ? { $and: filters } : {}),
			...(properties.lifecycle_statuses?.length ? { lifecycle_status: { $in: properties.lifecycle_statuses } } : {}),
			...(properties.facilities?.length ? { facilities: { $in: properties.facilities } } : {}),
			...(properties.connections?.length ? { connections: { $in: properties.connections } } : {}),
			'is_deleted': false,
		},
		selectedAgencyIds,
		...infrastructureNodesV1ExtractionQuery,
	};
}
