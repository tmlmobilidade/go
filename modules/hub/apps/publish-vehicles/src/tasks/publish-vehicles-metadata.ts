/* * */

import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { getVehiclesMetadataMap } from '../utils/get-vehicles-metadata-map.js';

/* * */

export async function publishVehiclesMetadata(agencyId: string) {
	//

	Logger.title('Publishing vehicles metadata...');

	//
	// Retrieve the vehicles metadata map

	const vehiclesMetadataMap = await getVehiclesMetadataMap();

	const vehiclesMetadata = Array.from(vehiclesMetadataMap.values());

	await cacheDb.set('hub:v1:realtime:vehicles:metadata:json', JSON.stringify(vehiclesMetadata));

	const agencyMetadata = vehiclesMetadata.filter(vehicle => vehicle.agency_id === agencyId);

	await cacheDb.set(`hub:v1:${agencyId}:realtime:vehicles:metadata:json`, JSON.stringify(agencyMetadata));
};

