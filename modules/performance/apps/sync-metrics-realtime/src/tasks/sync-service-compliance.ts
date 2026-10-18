import { GO_CM_AGENCY_IDS } from '@/constants.js';
import { Dates } from '@tmlmobilidade/dates';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type RealtimeServiceCompliance } from '@tmlmobilidade/go-types-performance';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

/* * */

type ComplianceValues = Record<keyof RealtimeServiceCompliance['data']['total'], number>;

// Aggregate the migrated analysis tables before calculating the existing means.
async function fetchCompliance(operationalDate: number, scheduledUntil: number, observedUntil: number, historical: boolean) {
	return labDb.queryFromString<ComplianceValues & { agency_id: string }>(
		`WITH rides AS (
		   SELECT r.*, ifNull(v.grade_status = 'pass', false) AS is_valid,
		          s.observed_start_time_delta AS delay
		   FROM operation.rides AS r FINAL
		   LEFT JOIN (SELECT ride_id, grade_status FROM operation.ride_analysis_simple_three_vehicle_events FINAL
		              WHERE agency_id IN $3 AND operational_date = $1) AS v ON r._id = v.ride_id
		   LEFT JOIN (SELECT ride_id, observed_start_time_delta FROM operation.ride_analysis_expected_start_time FINAL
		              WHERE agency_id IN $3 AND operational_date = $1) AS s ON r._id = s.ride_id
		   WHERE r.agency_id IN $3 AND r.operational_date = $1 AND r.processing_status = 'complete'
		     AND r.start_time_scheduled <= $2 AND ($5 = 0 OR r.start_time_observed <= $4)
		 )
		 SELECT agency_id,
		        toFloat64(count()) AS scheduled_rides,
		        toFloat64(countIf(passengers_observed > 0)) AS rides_with_sales,
		        toFloat64(countIf(passengers_observed > 0 OR is_valid)) AS accomplished_rides,
		        toFloat64(countIf(is_valid)) AS valid_rides,
		        toFloat64(countIf(is_valid AND passengers_observed = 0)) AS no_passengers_rides,
		        toFloat64(countIf(is_valid AND delay <= -1)) AS advanced_rides,
		        toFloat64(countIf(is_valid AND start_time_observed != 0 AND delay > 5)) AS five_min_delays,
		        toFloat64(sumIf(ifNull(delay, 0), is_valid AND start_time_observed != 0 AND delay >= 0)) AS mean_delay_minutes
		 FROM rides GROUP BY agency_id`,
		{ 1: operationalDate, 2: scheduledUntil, 3: [...GO_CM_AGENCY_IDS], 4: observedUntil, 5: Number(historical) },
	);
}

/* * */

export const syncRealtimeServiceCompliance = async () => {
	//

	Logger.title(`Sync Service Compliance Metrics in Realtime`);
	const globalTimer = new Timer();

	const metricKey = 'realtime_service_compliance';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	Logger.info({ message: `Clearing existing '${metricKey}' metrics...` });
	await goDb.performance.metrics.deleteMany({ metric: metricKey });
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	//
	// Setup timestamp boundaries

	const now = Dates.now('Europe/Lisbon');
	const currentOperationalDate = now.operational_date;
	const previousOperationalDate = now.minus({ days: 7 }).operational_date;
	const previousUntilNowAsUnix = now.minus({ days: 7 }).unix_milliseconds;

	//
	// Initialize results object

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

	GO_CM_AGENCY_IDS.forEach((op) => {
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
	// Query each comparison period using one frozen reference time.
	for (const mode of ['now', 'last_week'] as const) {
		const reference = mode === 'now' ? now.unix_milliseconds : previousUntilNowAsUnix;
		const rows = await fetchCompliance(
			Number(mode === 'now' ? currentOperationalDate : previousOperationalDate),
			reference - 300_000,
			reference,
			mode === 'last_week',
		);
		for (const row of rows) {
			for (const key of Object.keys(results.total) as (keyof ComplianceValues)[]) {
				results.agencies[row.agency_id][key][mode] = row[key];
				results.total[key][mode] += row[key];
			}
		}
	}

	//
	// Compute mean delays

	GO_CM_AGENCY_IDS.forEach((op) => {
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
		metric: metricKey,
	};

	await goDb.performance.metrics.insertOne(metricToInsert);
	Logger.terminate(`Processed ${metricKey} (${globalTimer.get()})`);
};

//
