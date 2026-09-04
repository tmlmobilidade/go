/* * */

import { TTL_REALTIME } from '@/config.js';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type HubPlan } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { getVehiclePositions } from './get-vehicle-positions.js';
import { parseVehiclePositions } from './parse-vehicle-positions.js';
import { toGtfsRtVehiclePositions } from './to-gtfs-rt-vehicle-positions.js';

/* * */

export async function publishVehiclesPositions() {
	//

	Logger.title('Publishing latest vehicles positions...');

	const globalTimer = new Timer();

	//
	// Retrieve active plans from the database

	const approvedPlans = await cacheDb.get('hub:v1:plans:approved:json');
	if (!approvedPlans) throw new Error('No approved plans found in API Cache');

	const approvedPlansData: HubPlan[] = JSON.parse(approvedPlans);
	const activePlansData = approvedPlansData.filter(plan => plan.is_active);
	if (!activePlansData.length) throw new Error('No active plans found in API Cache');

	//
	// Retrieve and parse latest vehicle positions

	const vehiclePositionsJson = parseVehiclePositions(await getVehiclePositions());
	Logger.info({ message: `Retrieved ${vehiclePositionsJson.length} latest vehicles positions...` });

	await cacheDb.set('hub:v1:realtime:vehicles:positions:json', JSON.stringify(vehiclePositionsJson), TTL_REALTIME);
	Logger.success(`Finished publishing latest vehicles positions (${globalTimer.get()})`);

	//
	// Convert the vehicle positions to GTFS-RT feed entities

	const vehiclePositionsGtfs = toGtfsRtVehiclePositions(vehiclePositionsJson);

	await cacheDb.set('hub:v1:realtime:vehicles:positions:gtfs', JSON.stringify(vehiclePositionsGtfs), TTL_REALTIME);
	Logger.success(`Finished publishing latest vehicles positions GTFS-RT (${globalTimer.get()})`);

	//
};
