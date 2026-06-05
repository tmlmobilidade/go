/* * */

import { apiCache, simplifiedVehicleEventsNew } from '@tmlmobilidade/databases';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type HubPlan } from '@tmlmobilidade/types';
import { getPublicTripId, getPublicVehicleId } from '@tmlmobilidade/utils';

/* * */

export async function publishVehiclesPositions() {
	//

	Logger.title('Publishing latest vehicles positions...');

	const globalTimer = new Timer();

	//
	// Retrieve active plans from the database

	const activePlans = await apiCache.get('hub:plans:active:json');

	if (!activePlans) {
		Logger.error('No active plans found in API Cache');
		return;
	}

	const activePlansParsed: HubPlan[] = JSON.parse(activePlans);

	const activePlansMap: Record<string, HubPlan> = Object.fromEntries(activePlansParsed.map(plan => [plan.agency_id, plan]));

	//
	// Retrieve active alerts from the database

	const latestVehiclePositions = await simplifiedVehicleEventsNew.getPositions();

	const latestVehiclePositionsStripped = latestVehiclePositions.map(position => ({
		...position,
		driver_id: undefined,
		trip_id: getPublicTripId(activePlansMap[position.agency_id]?._id, position.agency_id, position.trip_id),
		vehicle_id: getPublicVehicleId(position.agency_id, position.vehicle_id),
	}));

	Logger.info(`Retrieved ${latestVehiclePositionsStripped.length} latest vehicles positions...`);

	//
	// Save the result in API Cache

	await apiCache.set('hub:realtime:vehicles:positions:json', JSON.stringify(latestVehiclePositionsStripped));

	Logger.success(`Finished publishing latest vehicles positions (${globalTimer.get()})`);

	//
};
