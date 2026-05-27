/* * */

import { apiCache, simplifiedVehicleEventsNew } from '@tmlmobilidade/databases';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export async function publishVehiclesPositions() {
	//

	Logger.title('Publishing latest vehicles positions...');

	const globalTimer = new Timer();

	//
	// Retrieve active alerts from the database

	const latestVehiclePositions = await simplifiedVehicleEventsNew.getPositions();

	const latestVehiclePositionsStripped = latestVehiclePositions.map(position => ({
		...position,
		driver_id: undefined,
	}));

	Logger.info(`Retrieved ${latestVehiclePositionsStripped.length} latest vehicles positions...`);

	//
	// Save the result in API Cache

	await apiCache.set('hub:realtime:vehicles:positions:json', JSON.stringify(latestVehiclePositionsStripped));

	Logger.success(`Finished publishing latest vehicles positions (${globalTimer.get()})`);

	//
};
