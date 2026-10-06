/* * */

import { getOrganizationCacheKey } from '@tmlmobilidade/go-hub-pckg-utils';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { getVehiclesMetadataMap } from '../utils/get-vehicles-metadata-map.js';

/* * */

export async function publishVehiclesMetadata() {
	//

	const timer = new Timer();

	Logger.title('Publishing vehicles metadata...');

	//
	// Retrieve the vehicles metadata map

	const vehiclesMetadataMap = await getVehiclesMetadataMap();

	for (const organization of await goDb.core.organizations.findMany()) {
		try {
			const metadata = Array.from(vehiclesMetadataMap.values()).filter(vehicle => organization.agency_ids.includes(vehicle.agency_id));
			await cacheDb.set(getOrganizationCacheKey(organization._id, 'vehicles:metadata:json'), JSON.stringify(metadata));
		} catch (error) {
			Logger.error({ error, message: `Error publishing vehicle metadata for organization ${organization._id}.` });
		}
	}

	Logger.success(`Finished publishing vehicles metadata (${timer.get()})`);
};

