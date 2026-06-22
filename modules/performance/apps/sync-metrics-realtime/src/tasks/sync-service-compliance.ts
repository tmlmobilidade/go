import { Dates } from '@tmlmobilidade/dates';
import { metrics, rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type RealtimeServiceCompliance, type Ride } from '@tmlmobilidade/types';

/* * */

// Helper function to process a rides stream
async function processRidesStream(stream, results, agencies, mode: 'last_week' | 'now') {
	for await (const currentRide of stream) {
		//

		const rideData: Ride = currentRide as Ride;
		const agency = rideData.agency_id;
		if (!agencies.includes(agency)) continue;

		//
		// Skip rides that should not have started yet (relative to reference time)

		const referenceNow = Dates.now('Europe/Lisbon');

		const nowInUnixTimestamp = mode === 'now'
			? referenceNow.unix_timestamp - 300_000 // 5 minutes ago
			: referenceNow.minus({ days: 7 }).unix_timestamp - 300_000;

		if (nowInUnixTimestamp - rideData.start_time_scheduled < 0) continue;

		//
		// Scheduled rides

		results.agencies[agency].scheduled_rides[mode]++;
		results.total.scheduled_rides[mode]++;

		//
		// Rides with sales

		if (rideData.passengers_observed > 0) {
			results.agencies[agency].rides_with_sales[mode]++;
			results.total.rides_with_sales[mode]++;
		}

		//

		const simpleThreeVehicleEvents = rideData.analysis?.SIMPLE_THREE_VEHICLE_EVENTS;
		const isRideValid = simpleThreeVehicleEvents?.grade === 'pass';

		//
		// Accomplished rides - rides with sales or valid rides

		if (rideData.passengers_observed > 0 || isRideValid) {
			results.agencies[agency].accomplished_rides[mode]++;
			results.total.accomplished_rides[mode]++;
		}

		// Skip trips not valid (3 moments check)

		if (rideData.analysis === null || !isRideValid) continue;

		//
		// Valid rides

		results.agencies[agency].valid_rides[mode]++;
		results.total.valid_rides[mode]++;

		//
		// No passenger rides

		if (rideData.passengers_observed === 0) {
			results.agencies[agency].no_passengers_rides[mode]++;
			results.total.no_passengers_rides[mode]++;
		}

		//
		// Advanced rides

		if (rideData.analysis.EXPECTED_START_TIME.value <= -1) {
			results.agencies[agency].advanced_rides[mode]++;
			results.total.advanced_rides[mode]++;
		}

		//
		// Delays

		if (!rideData.start_time_observed) continue;

		// 5-minute delays
		if (rideData.analysis.EXPECTED_START_TIME.value > 5) {
			results.agencies[agency].five_min_delays[mode]++;
			results.total.five_min_delays[mode]++;
		}

		// Mean delay
		if (rideData.analysis.EXPECTED_START_TIME.value >= 0) {
			results.agencies[agency].mean_delay_minutes[mode] += rideData.analysis.EXPECTED_START_TIME.value;
			results.total.mean_delay_minutes[mode] += rideData.analysis.EXPECTED_START_TIME.value;
		}
	}
}

/* * */

export const syncRealtimeServiceCompliance = async () => {
	//

	Logger.title(`Sync Service Compliance Metrics in Realtime`);
	const globalTimer = new Timer();

	const METRIC = 'realtime_service_compliance';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	Logger.info({ message: `Clearing existing '${METRIC}' metrics...` });
	await metrics.deleteMany({ metric: METRIC });
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	//
	// Setup timestamp boundaries

	const now = Dates.now('Europe/Lisbon');
	const currentOperationalDate = now.operational_date;
	const previousOperationalDate = now.minus({ days: 7 }).operational_date;
	const previousUntilNowAsUnix = now.minus({ days: 7 }).unix_timestamp;

	//
	// Initialize results object

	const agencies = ['41', '42', '43', '44'];

	const results: RealtimeServiceCompliance['data'] = {
		agencies: {},
		total: {
			accomplished_rides: { last_week: 0, now: 0 },
			advanced_rides: { last_week: 0, now: 0 },
			five_min_delays: { last_week: 0, now: 0 },
			mean_delay_minutes: { last_week: 0, now: 0 },
			no_passengers_rides: { last_week: 0, now: 0 },
			rides_with_sales: { last_week: 0, now: 0 },
			scheduled_rides: { last_week: 0, now: 0 },
			valid_rides: { last_week: 0, now: 0 },
		},
	};

	agencies.forEach((op) => {
		results.agencies[op] = {
			accomplished_rides: { last_week: 0, now: 0 },
			advanced_rides: { last_week: 0, now: 0 },
			five_min_delays: { last_week: 0, now: 0 },
			mean_delay_minutes: { last_week: 0, now: 0 },
			no_passengers_rides: { last_week: 0, now: 0 },
			rides_with_sales: { last_week: 0, now: 0 },
			scheduled_rides: { last_week: 0, now: 0 },
			valid_rides: { last_week: 0, now: 0 },
		};
	});

	//
	// Fetch rides collection

	const ridesCollection = await rides.getCollection();

	//
	// Today's stream

	Logger.info({ message: `Processing rides for current operational date: ${currentOperationalDate}` });
	const todayTimer = new Timer();

	const todayStream = ridesCollection
		.find({ operational_date: currentOperationalDate, system_status: 'complete' })
		.stream();

	await processRidesStream(todayStream, results, agencies, 'now');
	Logger.info({ message: `Processed today's rides in ${todayTimer.get()}` });

	//
	// Last week's stream

	Logger.info({ message: `Processing rides for last week's operational date: ${previousOperationalDate}` });
	const lastWeekTimer = new Timer();

	const lastWeekStream = ridesCollection.find({
		operational_date: previousOperationalDate,
		start_time_observed: { $lte: previousUntilNowAsUnix },
		system_status: 'complete',
	}).stream();

	await processRidesStream(lastWeekStream, results, agencies, 'last_week');
	Logger.info({ message: `Processed last week's rides in ${lastWeekTimer.get()}` });

	//
	// Compute mean delays

	agencies.forEach((op) => {
		const opData = results.agencies[op];
		opData.mean_delay_minutes.now = opData.scheduled_rides.now ? Number((opData.mean_delay_minutes.now / opData.scheduled_rides.now).toFixed(2)) : 0;
		opData.mean_delay_minutes.last_week = opData.scheduled_rides.last_week ? Number((opData.mean_delay_minutes.last_week / opData.scheduled_rides.last_week).toFixed(2)) : 0;
	});

	results.total.mean_delay_minutes.now = results.total.scheduled_rides.now ? Number((results.total.mean_delay_minutes.now / results.total.scheduled_rides.now).toFixed(2)) : 0;
	results.total.mean_delay_minutes.last_week = results.total.scheduled_rides.last_week ? Number((results.total.mean_delay_minutes.last_week / results.total.scheduled_rides.last_week).toFixed(2)) : 0;

	//
	// Store metric

	const metricToInsert: RealtimeServiceCompliance = {
		data: results,
		description: `Realtime service compliance metrics by agency and total, compared with previous week same time.`,
		generated_at: new Date(),
		metric: METRIC,
	};

	await metrics.insertOne(metricToInsert);
	Logger.terminate(`Processed ${METRIC} (${globalTimer.get()})`);
};

//
