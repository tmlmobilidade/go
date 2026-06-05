/* * */

import { apiCache, simplifiedVehicleEventsNew } from '@tmlmobilidade/databases';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type HubPlan, type HubVehiclePosition, HubVehiclePositionSchema } from '@tmlmobilidade/types';
import { getPublicTripId, getPublicVehicleId } from '@tmlmobilidade/utils';

/* * */

export async function publishVehiclesPositions() {
	//

	Logger.title('Publishing latest vehicles positions...');

	const globalTimer = new Timer();

	//
	// Retrieve active plans from the database

	const approvedPlans = await apiCache.get('hub:plans:approved:json');
	if (!approvedPlans) throw new Error('No approved plans found in API Cache');

	const approvedPlansData: HubPlan[] = JSON.parse(approvedPlans);
	const activePlansData = approvedPlansData.filter(plan => plan.is_active);
	if (!activePlansData.length) throw new Error('No active plans found in API Cache');

	const activePlansIdsMap: Record<string, string> = Object.fromEntries(activePlansData.map(plan => [plan.agency_id, plan._id]));

	//
	// Retrieve active alerts from the database

	const latestVehicleEventsData = await simplifiedVehicleEventsNew.getPositions();

	const vehiclePositions: HubVehiclePosition[] = [];

	for (const vehicleEventData of latestVehicleEventsData) {
		try {
			// Check if there is an active plan for the agency
			const activePlanIdForAgency = activePlansIdsMap[vehicleEventData.agency_id];
			if (!activePlanIdForAgency) throw new Error(`No active plan found for agency ID: ${vehicleEventData.agency_id}`);
			// Parse the vehicle position data
			const parsedVehiclePosition = HubVehiclePositionSchema.safeParse({
				...vehicleEventData,
				trip_id: getPublicTripId(activePlanIdForAgency, vehicleEventData.agency_id, vehicleEventData.trip_id),
				vehicle_id: getPublicVehicleId(vehicleEventData.agency_id, vehicleEventData.vehicle_id),
			});
			if (!parsedVehiclePosition.success) throw new Error(`Error parsing vehicle position ID: ${vehicleEventData._id}: ${parsedVehiclePosition.error.message}`);
			// Add the vehicle position to the list
			vehiclePositions.push(parsedVehiclePosition.data);
		} catch (error) {
			Logger.error(`Error parsing vehicle position ID: ${vehicleEventData._id}: ${error.message}`);
		}
	}

	Logger.info(`Retrieved ${vehiclePositions.length} latest vehicles positions...`);

	//
	// Save the result in API Cache

	await apiCache.set('hub:realtime:vehicles:positions:json', JSON.stringify(vehiclePositions));

	Logger.success(`Finished publishing latest vehicles positions (${globalTimer.get()})`);

	//
};
