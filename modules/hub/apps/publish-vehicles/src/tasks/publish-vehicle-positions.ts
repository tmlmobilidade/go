/* * */

import { apiCache, simplifiedVehicleEventsNew } from '@tmlmobilidade/databases';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export async function publishVehiclePositions() {
	//

	Logger.title('Publishing latest vehicle positions...');

	const globalTimer = new Timer();

	//
	// Retrieve active alerts from the database

	const latestVehiclePositions = await simplifiedVehicleEventsNew.getPositions();

	const latestVehiclePositionsStripped = latestVehiclePositions.map(position => ({
		...position,
		driver_id: undefined,
	}));

	Logger.info(`Retrieved ${latestVehiclePositionsStripped.length} latest vehicle positions...`);

	//
	// Save the result in API Cache

	await apiCache.set('hub:realtime:vehicles:positions:json', JSON.stringify(latestVehiclePositionsStripped));

	Logger.success(`Finished publishing latest vehicle positions JSON (${globalTimer.get()})`);

	//
};
