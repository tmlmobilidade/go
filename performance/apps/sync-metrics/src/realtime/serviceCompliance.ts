import TIMETRACKER from '@helperkits/timer';
import { metrics, rides } from '@tmlmobilidade/interfaces';
import { type RealtimeServiceCompliance, type Ride } from '@tmlmobilidade/types';
import { Dates, Logs } from '@tmlmobilidade/utils';

/* * */

export const syncRealtimeServiceCompliance = async () => {
	//

	Logs.title(`Sync Service Compliance Metrics in Realtime`);
	const globalTimer = new TIMETRACKER();

	const METRIC = 'realtime_service_compliance';

	//
	// Delete existing metrics

	const deleteTimer = new TIMETRACKER();
	Logs.info(`Clearing existing '${METRIC}' metrics...`);
	await metrics.deleteMany({ metric: METRIC });
	Logs.info(`Cleared existing metrics in ${deleteTimer.get()}`);

	//
	// Setup timestamp boundaries

	const operationalDate = Dates
		.now('Europe/Lisbon')
		.operational_date;

	const nowInUnixTimestamp = Dates
		.now('Europe/Lisbon')
		.unix_timestamp - 300_000; // 5 minutes ago

	const operators = ['41', '42', '43', '44'];
	const results: RealtimeServiceCompliance['data'] = {
		operators: {},
		total: {
			rides_with_sales: 0,
			scheduled_rides: 0,
			valid_rides: 0,
		},
	};

	//
	// Initialize per-operator stats

	operators.forEach((op) => {
		results.operators[op] = {
			rides_with_sales: 0,
			scheduled_rides: 0,
			valid_rides: 0,
		};
	});

	//
	// Fetch rides collection

	const ridesCollection = await rides.getCollection();

	//
	// Stream today's rides

	const allRidesForTodayStream = ridesCollection.find({ operational_date: operationalDate }).stream();

	for await (const currentRide of allRidesForTodayStream) {
		//

		const rideData: Ride = currentRide as Ride;

		//
		// Skip rides that are not yet processed

		if (rideData.system_status !== 'complete' || rideData.analysis === null) continue;

		//
		// Skip rides that should not have started yet (scheduled for the future)

		if (nowInUnixTimestamp - rideData.start_time_scheduled < 0) continue;

		//
		// Process ride

		const op = rideData.agency_id;
		if (!operators.includes(op)) continue;

		results.operators[op].scheduled_rides++;
		results.total.scheduled_rides++;

		if (rideData.passengers_observed > 0) {
			results.operators[op].rides_with_sales++;
			results.total.rides_with_sales++;
		}

		const simpleThreeVehicleEvents = rideData.analysis.SIMPLE_THREE_VEHICLE_EVENTS;

		if (simpleThreeVehicleEvents.grade === 'pass') {
			results.operators[op].valid_rides++;
			results.total.valid_rides++;
		}
	}

	//
	// Store metric

	const metricToInsert: RealtimeServiceCompliance = {
		data: results,
		description: `Realtime service compliance metrics (rides with sales, scheduled rides, valid rides) by operator and total.`,
		generated_at: new Date(),
		metric: METRIC,
	};

	await metrics.insertOne(metricToInsert);
	Logs.terminate(`Processed ${METRIC} (${globalTimer.get()})`);
};
