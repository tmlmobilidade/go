/* * */

import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type Organization } from '@tmlmobilidade/go-types-core';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { getVehiclesMetadataMap } from '../utils/get-vehicles-metadata-map.js';

/* * */

export async function publishVehiclesMetadata(organizations: Organization[] = []) {
	//

	const timer = new Timer();

	Logger.title('Publishing vehicles metadata...');

	//
	// Retrieve the vehicles metadata map

	const vehiclesMetadataMap = await getVehiclesMetadataMap();

	const vehiclesMetadata = Array.from(vehiclesMetadataMap.values());

	await cacheDb.set('hub:v1:realtime:vehicles:metadata:json', JSON.stringify(vehiclesMetadata));

	for (const organization of organizations) {
		const agencyIds = new Set(organization.agency_ids);
		const organizationMetadata = vehiclesMetadata.filter(vehicle => agencyIds.has(vehicle.agency_id));

		await cacheDb.set(`hub:v1:${organization._id}:realtime:vehicles:metadata:json`, JSON.stringify(organizationMetadata));
	}

	Logger.success(`Finished publishing vehicles metadata (${timer.get()})`);
};

