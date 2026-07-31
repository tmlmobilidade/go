/* * */

import { Dates } from '@tmlmobilidade/dates';
import { cacheDb, hubV2PassengerDemandMetricsCacheKey } from '@tmlmobilidade/go-interfaces-cachedb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type PassengerDemandByAgencyByMinute, type PassengerDemandRealtime } from '@tmlmobilidade/go-types-performance';
import { type PassengerDemandMetricsSnapshot, PassengerDemandMetricsSnapshotSchema, type PassengerDemandSeriesPoint, type PassengerDemandSnapshotAgency } from '@tmlmobilidade/go-types-public-info';
import { type OperationalDateInt, validateOperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

const BASELINE_SAMPLE_SIZE = 8;
const DEFINITION_VERSION = 'passenger-demand-v2' as const;
const PUBLISHED_INTERVAL_MINUTES = 15;
const TIMEZONE = 'Europe/Lisbon';

const intervalTimeFormatter = new Intl.DateTimeFormat('en-GB', {
	hour: '2-digit',
	hour12: false,
	hourCycle: 'h23',
	minute: '2-digit',
	timeZone: TIMEZONE,
});

/* * */

function getOperationalMinuteIndex(intervalStart: number) {
	const parts = intervalTimeFormatter.formatToParts(new Date(intervalStart));
	const hour = Number(parts.find(part => part.type === 'hour')?.value);
	const minute = Number(parts.find(part => part.type === 'minute')?.value);
	const operationalHour = hour < 4 ? hour + 24 : hour;

	return (operationalHour - 4) * 60 + minute;
}

export function getComparableOperationalDates(
	currentOperationalDate: OperationalDateInt,
	sampleSize = BASELINE_SAMPLE_SIZE,
): OperationalDateInt[] {
	const value = String(currentOperationalDate);
	const currentDate = new Date(Date.UTC(
		Number(value.slice(0, 4)),
		Number(value.slice(4, 6)) - 1,
		Number(value.slice(6, 8)),
	));

	return Array.from({ length: sampleSize }, (_, index) => {
		const comparableDate = new Date(currentDate);
		comparableDate.setUTCDate(currentDate.getUTCDate() - (index + 1) * 7);

		return validateOperationalDateInt(
			comparableDate.getUTCFullYear() * 10_000
			+ (comparableDate.getUTCMonth() + 1) * 100
			+ comparableDate.getUTCDate(),
		);
	});
}

function toSeriesPoints(
	rows: PassengerDemandByAgencyByMinute[],
	latestMinuteIndex: number,
): PassengerDemandSeriesPoint[] {
	// Public history is compacted to 15-minute buckets. The final bucket may
	// contain fewer than 15 minutes; historical dates are clipped to the same
	// operational-minute index before they reach the API.
	const pointsByIndex = new Map<number, PassengerDemandSeriesPoint>();

	for (const row of rows) {
		const minuteIndex = getOperationalMinuteIndex(row.interval_start);
		if (minuteIndex > latestMinuteIndex) continue;

		const intervalIndex = Math.floor(minuteIndex / PUBLISHED_INTERVAL_MINUTES);
		const existing = pointsByIndex.get(intervalIndex);
		const passengerValidationsQty = (existing?.passenger_validations_qty ?? 0) + row.accepted_validations_qty;

		pointsByIndex.set(intervalIndex, {
			interval_index: intervalIndex,
			interval_start: existing?.interval_start ?? row.interval_start,
			passenger_validations_qty: passengerValidationsQty,
		});
	}

	return [...pointsByIndex.values()]
		.sort((left, right) => left.interval_index - right.interval_index);
}

/* * */

export function buildPassengerDemandSnapshot(
	realtimeRows: PassengerDemandRealtime[],
	factRows: PassengerDemandByAgencyByMinute[],
	generatedAt = Dates.now('utc').unix_timestamp,
): PassengerDemandMetricsSnapshot {
	if (realtimeRows.length === 0) {
		throw new Error('Passenger demand realtime projection is empty');
	}

	const reference = realtimeRows.reduce((latest, row) =>
		row.calculated_at > latest.calculated_at ? row : latest,
	);
	const latestMinuteIndex = getOperationalMinuteIndex(reference.current_cutoff);
	const agencies: Record<string, PassengerDemandSnapshotAgency> = {};

	for (const realtime of realtimeRows) {
		const comparableDates = getComparableOperationalDates(
			realtime.current_operational_date,
		);
		const agencyFacts = factRows.filter(row => row.agency_id === realtime.agency_id);
		const lastWeekQty = realtime.passenger_validations_qty_last_week;
		const comparableDays = comparableDates
			.map((operationalDate) => {
				return {
					operational_date: operationalDate,
					points: toSeriesPoints(agencyFacts.filter(row =>
						row.operational_date === operationalDate,
					), latestMinuteIndex),
				};
			})
			.filter(day => day.points.length > 0);

		agencies[realtime.agency_id] = {
			comparable_days: comparableDays,
			current_points: toSeriesPoints(agencyFacts.filter(row =>
				row.operational_date === realtime.current_operational_date,
			), latestMinuteIndex),
			realtime: {
				comparison_index_pct: lastWeekQty === 0
					? null
					: realtime.passenger_validations_qty_now / lastWeekQty * 100,
				passenger_validations_qty_last_week: lastWeekQty,
				passenger_validations_qty_now: realtime.passenger_validations_qty_now,
			},
		};
	}

	return PassengerDemandMetricsSnapshotSchema.parse({
		agencies,
		definition_version: DEFINITION_VERSION,
		meta: {
			baseline_sample_size_target: BASELINE_SAMPLE_SIZE,
			current_cutoff: reference.current_cutoff,
			current_operational_date: reference.current_operational_date,
			generated_at: generatedAt,
			interval_minutes: PUBLISHED_INTERVAL_MINUTES,
			last_week_cutoff: reference.last_week_cutoff,
			last_week_operational_date: reference.last_week_operational_date,
			source_watermark: realtimeRows.reduce<null | number>((latest, row) => {
				if (row.source_watermark === null) return latest;
				return Math.max(latest ?? 0, row.source_watermark);
			}, null),
		},
	});
}

/* * */

export async function publishPassengerDemandMetrics() {
	//

	Logger.title('Publishing Passenger Demand Metrics...');
	const timer = new Timer();
	const currentOperationalDate = Dates.now(TIMEZONE).operational_date_int;

	const realtimeRows = await labDb.performance.passengerDemandRealtime.queryFromString<PassengerDemandRealtime>(
		`
					SELECT *
					FROM performance.passenger_demand_realtime FINAL
					WHERE
						definition_version = $1
						AND current_operational_date = $2
			`,
		{
			1: DEFINITION_VERSION,
			2: currentOperationalDate,
		},
	);

	if (realtimeRows.length === 0) {
		throw new Error('Passenger demand realtime projection is unavailable');
	}

	const agencyIds = [...new Set(realtimeRows.map(row => row.agency_id))];
	const requiredOperationalDates = [
		currentOperationalDate,
		...getComparableOperationalDates(currentOperationalDate),
	];

	const factRows = await labDb.performance.passengerDemandByAgencyByMinute.queryFromString<PassengerDemandByAgencyByMinute>(
		`
				SELECT *
				FROM performance.passenger_demand_by_agency_by_1_minute FINAL
				WHERE
					definition_version = $1
					AND agency_id IN $2
					AND operational_date IN $3
			`,
		{
			1: DEFINITION_VERSION,
			2: agencyIds,
			3: requiredOperationalDates,
		},
	);
	const snapshot = buildPassengerDemandSnapshot(realtimeRows, factRows);

	await cacheDb.set(
		hubV2PassengerDemandMetricsCacheKey,
		JSON.stringify(snapshot),
	);

	Logger.success(`Finished publishing Passenger Demand Metrics (${timer.get()})`);

	//
}
