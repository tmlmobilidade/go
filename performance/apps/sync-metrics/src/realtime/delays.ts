import TIMETRACKER from '@helperkits/timer';
import { metrics, rides } from '@tmlmobilidade/interfaces';
import { type RealtimeDelays, type Ride } from '@tmlmobilidade/types';
import { Dates, Logs } from '@tmlmobilidade/utils';

/* * */

export const syncRealtimeDelays = async () => {
	//

	Logs.title(`Sync Delay Metrics in Realtime`);
	const globalTimer = new TIMETRACKER();

	const METRIC = 'realtime_delays';

	//
	// Delete existing metrics

	const deleteTimer = new TIMETRACKER();
	Logs.info(`Clearing existing '${METRIC}' metrics...`);
	await metrics.deleteMany({ metric: METRIC });
	Logs.info(`Cleared existing metrics in ${deleteTimer.get()}`);

	//
	// Setup timestamp boundaries

	const now = Dates.now('Europe/Lisbon');
	const currentOperationalDate = now.operational_date;
	const previousOperationalDate = now.minus({ days: 7 }).operational_date;
	const previousUntilNowAsUnix = now.minus({ days: 7 }).unix_timestamp;

	//
	// Initialize results object

	const operators = ['41', '42', '43', '44'];
	const results: RealtimeDelays['data'] = {
		operators: {},
		total: {
			five_min_delays: { last_week: 0, now: 0 },
			mean_delay_minutes: { last_week: 0, now: 0 },
			total_rides: { last_week: 0, now: 0 },
		},
	};

	operators.forEach((op) => {
		results.operators[op] = {
			five_min_delays: { last_week: 0, now: 0 },
			mean_delay_minutes: { last_week: 0, now: 0 },
			total_rides: { last_week: 0, now: 0 },
		};
	});

	//
	// Fetch rides collection

	const ridesCollection = await rides.getCollection();

	//
	// --- TODAY STREAM ---

	Logs.info(`Processing rides for current operational date: ${currentOperationalDate}`);
	const todayTimer = new TIMETRACKER();

	const todayStream = ridesCollection.find({
		operational_date: currentOperationalDate,
		system_status: 'complete',
	}).stream();

	for await (const ride of todayStream) {
		const r = ride as Ride;
		if (!r.start_time_observed) continue;
		const op = r.agency_id;
		if (!operators.includes(op)) continue;

		if (r.analysis.EXPECTED_START_TIME.reason === 'LATE_START') {
			results.operators[op].five_min_delays.now++;
			results.total.five_min_delays.now++;
		}

		if (r.analysis.EXPECTED_START_TIME.value >= 0) {
			results.operators[op].total_rides.now++;
			results.operators[op].mean_delay_minutes.now += r.analysis.EXPECTED_START_TIME.value;

			results.total.total_rides.now++;
			results.total.mean_delay_minutes.now += r.analysis.EXPECTED_START_TIME.value;
		}
	}

	Logs.info(`Processed today's rides in ${todayTimer.get()}`);

	//
	// --- LAST WEEK STREAM (same time window) ---

	Logs.info(`Processing rides for previous operational date: ${previousOperationalDate}`);
	const lastWeekTimer = new TIMETRACKER();
	const lastWeekStream = ridesCollection.find({
		operational_date: previousOperationalDate,
		start_time_observed: { $lte: previousUntilNowAsUnix },
		system_status: 'complete',
	}).stream();

	for await (const ride of lastWeekStream) {
		const r = ride as Ride;
		if (!r.analysis.EXPECTED_START_TIME) continue;
		const op = r.agency_id;
		if (!operators.includes(op)) continue;

		if (r.analysis.EXPECTED_START_TIME.reason === 'LATE_START') {
			results.operators[op].five_min_delays.last_week++;
			results.total.five_min_delays.last_week++;
		}

		if (r.analysis.EXPECTED_START_TIME.value >= 0) {
			results.operators[op].total_rides.last_week++;
			results.operators[op].mean_delay_minutes.last_week += r.analysis.EXPECTED_START_TIME.value;

			results.total.total_rides.last_week++;
			results.total.mean_delay_minutes.last_week += r.analysis.EXPECTED_START_TIME.value;
		}
	}
	Logs.info(`Processed last week's rides in ${lastWeekTimer.get()}`);

	//
	// Compute mean delays

	operators.forEach((op) => {
		const opData = results.operators[op];
		opData.mean_delay_minutes.now = opData.total_rides.now
			? Number((opData.mean_delay_minutes.now / opData.total_rides.now).toFixed(2))
			: 0;
		opData.mean_delay_minutes.last_week = opData.total_rides.last_week
			? Number((opData.mean_delay_minutes.last_week / opData.total_rides.last_week).toFixed(2))
			: 0;
	});

	results.total.mean_delay_minutes.now = results.total.total_rides.now
		? Number((results.total.mean_delay_minutes.now / results.total.total_rides.now).toFixed(2))
		: 0;
	results.total.mean_delay_minutes.last_week = results.total.total_rides.last_week
		? Number((results.total.mean_delay_minutes.last_week / results.total.total_rides.last_week).toFixed(2))
		: 0;

	//
	// Store metric

	const metricToInsert: RealtimeDelays = {
		data: results,
		description: `Realtime delay metrics (rides delayed >5min, mean delay, total rides) by operator and total, compared with previous week same time.`,
		generated_at: new Date(),
		metric: METRIC,
	};

	await metrics.insertOne(metricToInsert);
	Logs.terminate(`Processed ${METRIC} (${globalTimer.get()})`);
};

//
