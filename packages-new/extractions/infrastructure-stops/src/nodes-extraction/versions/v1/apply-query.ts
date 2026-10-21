/* * */

import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { locationPermissionMatch, locationsDb } from '@tmlmobilidade/go-interfaces-locationsdb';
import { authProvider } from '@tmlmobilidade/go-providers-auth';
import { type InfrastructureNodesV1Extraction, InfrastructureNodesV1ExtractionPropertiesSchema } from '@tmlmobilidade/go-types-extractions';
import { type Stop } from '@tmlmobilidade/go-types-infrastructure';
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

	const validatedProperties = InfrastructureNodesV1ExtractionPropertiesSchema.parse(extraction.properties);
	const userPermissions = await authProvider.getPermissionsFromUserId(extraction.created_by);
	const permissionChecks = [{ action: PermissionCatalog.all.stops.actions.export, scope: PermissionCatalog.all.stops.scope }];

	const agencyAccess = PermissionCatalog.getPermissionResourceAccess({
		checks: permissionChecks,
		permissions: userPermissions,
		resource_key: 'agency_ids',
	});

	const locationAccess = PermissionCatalog.getPermissionResourceAccess({
		checks: permissionChecks,
		permissions: userPermissions,
		resource_key: 'location_ids',
	});

	const hasAgencyAccess = agencyAccess.allowAll || agencyAccess.values.length > 0;
	const hasLocationAccess = locationAccess.allowAll || locationAccess.values.length > 0;

	if (!hasAgencyAccess || !hasLocationAccess) {
		throw new Error('User does not have permission to export stops');
	}

	//
	// Select agencies matching the selection and permissions

	let selectedAgencyIds: string[] | undefined;

	if (!agencyAccess.allowAll) {
		selectedAgencyIds = agencyAccess.values;
	}

	if (validatedProperties.agency_ids?.length) {
		selectedAgencyIds = validatedProperties.agency_ids.filter(agencyId => agencyAccess.allowAll || agencyAccess.values.includes(agencyId));
	}

	//
	// Build location filters

	const additionalFilters: Filter<Stop>[] = [];
	const locationSlots = [...LOCATION_PERMISSION_SLOTS, 'neighbourhood'] as const;

	for (const locationSlot of locationSlots) {
		let locationIds = validatedProperties[`location_${locationSlot}_ids`];

		if (locationSlot === 'secondary') {
			locationIds = locationIds ?? validatedProperties.municipality_ids;
		}

		if (!locationIds?.length) continue;

		const locationOsmIds = locationIds.map(Number);
		additionalFilters.push({ [`location.${locationSlot}.osm_id`]: { $in: locationOsmIds } });
	}

	//
	// Apply location permissions

	if (!locationAccess.allowAll) {
		additionalFilters.push(locationPermissionMatch(locationAccess.values));
	}

	//
	// Build the search filter

	const escapedSearch = validatedProperties.search?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

	if (escapedSearch) {
		additionalFilters.push({
			$or: [
				{ _id: { $options: 'i', $regex: escapedSearch } },
				{ name: { $options: 'i', $regex: escapedSearch } },
			],
		});
	}

	//
	// Build the stop filter

	const [country] = await locationsDb.findLocationsByCountryAndAdminLevel('PT', '2');
	if (!country) throw new Error('Portugal not found in locations database');

	const filter: Filter<Stop> = {
		'is_deleted': false,
		'location.country.osm_id': Number(country.id),
	};

	if (selectedAgencyIds) {
		filter['flags.agency_ids'] = { $in: selectedAgencyIds };
	}

	if (additionalFilters.length) {
		filter.$and = additionalFilters;
	}

	if (validatedProperties.lifecycle_statuses?.length) {
		filter.lifecycle_status = { $in: validatedProperties.lifecycle_statuses };
	}

	if (validatedProperties.facilities?.length) {
		filter.facilities = { $in: validatedProperties.facilities };
	}

	if (validatedProperties.connections?.length) {
		filter.connections = { $in: validatedProperties.connections };
	}

	return {
		filter,
		selectedAgencyIds,
		...infrastructureNodesV1ExtractionQuery,
	};
}
