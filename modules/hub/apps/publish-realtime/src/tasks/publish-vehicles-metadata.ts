/* * */

import { apiCache } from '@tmlmobilidade/databases';
import { vehicles } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export async function publishVehiclesMetadata() {
	//

	Logger.title('Publishing vehicles metadata...');

	const globalTimer = new Timer();

	//
	// Retrieve active alerts from the database

	const vehicleMetadata = await vehicles.all();

	Logger.info({ message: `Retrieved ${vehicleMetadata.length} vehicles metadata...` });

	//
	// Save the result in API Cache

	await apiCache.set('hub:v1:realtime:vehicles:metadata:json', JSON.stringify(vehicleMetadata));

	Logger.success(`Finished publishing vehicles metadata (${globalTimer.get()})`);

	//
};
