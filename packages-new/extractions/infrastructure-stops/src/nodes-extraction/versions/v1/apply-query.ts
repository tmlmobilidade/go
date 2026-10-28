/* * */

import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { locationsDb } from '@tmlmobilidade/go-interfaces-locationsdb';
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
	// Validate extraction properties

	const validatedProperties = InfrastructureNodesV1ExtractionPropertiesSchema.parse(extraction.properties);

	//
	// Verify user permissions

	const userPermissions = await authProvider.getPermissionsFromUserId(extraction.created_by);

	const allowedAgencyIds = PermissionCatalog.getPermissionResourceAccess({
		checks: [{ action: 'read', scope: 'stops' }],
		permissions: userPermissions,
		resource_key: 'agency_ids',
	});

	const allowedLocationIds = PermissionCatalog.getPermissionResourceAccess({
		checks: [{ action: 'read', scope: 'stops' }],
		permissions: userPermissions,
		resource_key: 'location_ids',
	});

	//
	// Select agencies matching the selection and permissions

	const selectedAgencyIds = validatedProperties.agency_ids?.filter(agencyId => allowedAgencyIds.allowAll || allowedAgencyIds.values.includes(agencyId)) ?? [];

	//
	// Build location filters based on extraction properties

	const additionalFilters: Filter<Stop>[] = [];

	const locationSlots = [...LOCATION_PERMISSION_SLOTS, 'neighbourhood'] as const;

	for (const locationSlot of locationSlots) {
		// Get location IDs from extraction properties
		const locationIds = validatedProperties[`location_${locationSlot}_ids`];
		// Skip if no location IDs are provided
		if (!locationIds?.length) continue;
		// Get location OSM IDs matching permissions
		const allowedLocationOsmIds = locationIds
			.filter(locationId => allowedLocationIds.allowAll || allowedLocationIds.values.includes(locationId))
			.map(Number);
		// Add location filter to additional filters if there are any allowed location OSM IDs
		additionalFilters.push({ [`location.${locationSlot}.osm_id`]: { $in: allowedLocationOsmIds } });
	}

	//
	// Limit nodes extraction to Portugal

	const foundLevelTwoLocations = await locationsDb.findLocationsByCountryAndAdminLevel('PT', '2');
	if (!foundLevelTwoLocations.length) throw new Error('No location level 2 found for Portugal');

	//
	// Build the stop filter

	const filter: Filter<Stop> = {
		'is_deleted': false,
		'location.country.osm_id': Number(foundLevelTwoLocations[0].id),
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

	return {
		filter,
		selectedAgencyIds,
		...infrastructureNodesV1ExtractionQuery,
	};
}
