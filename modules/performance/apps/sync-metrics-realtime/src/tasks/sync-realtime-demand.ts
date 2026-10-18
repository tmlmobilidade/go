import { goDb } from '@tmlmobilidade/go-interfaces-godb';
/* * */

import { GO_CM_AGENCY_IDS, LEGACY_CM_AGENCY_IDS } from '@/constants.js';
import { Dates } from '@tmlmobilidade/dates';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { type RealtimeDemand } from '@tmlmobilidade/go-types-performance';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

/* * */

export const syncRealtimeDemand = async () => {
	//

	Logger.title(`Sync Demand Metrics in Realtime`);
	const globalTimer = new Timer();

	const metric = 'realtime_demand';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	Logger.info({ message: `Clearing existing '${metric}' metrics...` });
	await goDb.performance.metrics.deleteMany({ metric: metric });
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	//
	// Read migrated validations through labDb.

	//
	// Setup the timestamp boundary
	// This takes in consideration the current time, as we want to compare today so far with the previous day so far, also.
	// For example, today is monday 10h49. We want to compare the number of validations until 10h49 of today with the number of validations until 10h49 of last monday.

	const referenceNow = Dates.now('Europe/Lisbon');
	const currentOperationalDate = referenceNow.operational_date;

	const currentOperationalDateAsUnixMilliseconds = Dates
		.fromOperationalDate(currentOperationalDate, 'Europe/Lisbon')
		.startOf('day')
		.set({ hour: 4 })
		.unix_milliseconds;

	const previousOperationalDate = referenceNow
		.minus({ days: 7 })
		.operational_date;

	const previousOperationalDateAsUnixMilliseconds = Dates
		.fromOperationalDate(previousOperationalDate, 'Europe/Lisbon')
		.startOf('day')
		.set({ hour: 4 })
		.unix_milliseconds;

	const previousUntilNowAsUnixMilliseconds = referenceNow
		.minus({ days: 7 })
		.unix_milliseconds;

	//
	// Define agencies

	const results: RealtimeDemand['data'] = {
		agencies: {},
		total: {
			last_week: 0,
			now: 0,
		},
	};

	//
	// Count validations per agency

	for (const agencyId of LEGACY_CM_AGENCY_IDS) {
		results.agencies[agencyId] = { last_week: 0, now: 0 };
	}

	const counts = await labDb.queryFromString<{ agency_id: string, last_week: number, now: number }>(
		`SELECT agency_code AS agency_id,
		        toFloat64(countIf(created_at >= $1 AND created_at <= $2)) AS now,
		        toFloat64(countIf(created_at >= $4 AND created_at <= $5)) AS last_week
		 FROM simplified_apex.validations AS v FINAL
		 WHERE v.agency_id IN $3 AND is_passenger = 1
		   AND ((created_at >= $1 AND created_at <= $2) OR (created_at >= $4 AND created_at <= $5))
		 GROUP BY agency_code`,
		{
			1: currentOperationalDateAsUnixMilliseconds,
			2: referenceNow.unix_milliseconds,
			3: [...GO_CM_AGENCY_IDS],
			4: previousOperationalDateAsUnixMilliseconds,
			5: previousUntilNowAsUnixMilliseconds,
		},
	);

	for (const row of counts) {
		results.agencies[row.agency_id] = { last_week: row.last_week, now: row.now };
		results.total.last_week += row.last_week;
		results.total.now += row.now;
	}

	const metricToInsert: RealtimeDemand = {
		data: results,
		description: `Realtime Demand Metrics by agencies and for all CM
		compared with previous week in the same day period.`,
		generated_at: new Date(),
		metric: metric,
	};

	//
	// Insert metric

	await goDb.performance.metrics.insertOne(metricToInsert);

	logMetricToFile({
		approach: { description: 'Count validations by agency in ClickHouse', key: 'count_validations_by_agency' },
		metric: metric,
		queryCount: 1,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${metric} (${globalTimer.get()})`);
};

//
