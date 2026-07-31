/* * */

import { PASSENGER_DEMAND_DEFINITION_VERSION, PASSENGER_DEMAND_TIMEZONE } from '@/handlers/passenger-demand/constants.js';
import { type PassengerDemandRealtimeSourceRow } from '@/handlers/passenger-demand/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type PassengerDemandRealtime } from '@tmlmobilidade/go-types-performance';
import { type UnixTimestamp, validateUnixTimestamp } from '@tmlmobilidade/go-types-shared';

/* * */

async function fetchRealtimeDemandRows(
	referenceNow: Dates,
	currentCutoff: UnixTimestamp,
) {
	const lastWeekReference = referenceNow.minus({ days: 7 });
	// Shift by a Lisbon calendar week after converting the current cutoff.
	// This preserves the equivalent wall-clock minute across DST changes.
	const lastWeekCutoff = Dates
		.fromUnixTimestamp(currentCutoff)
		.setZone(PASSENGER_DEMAND_TIMEZONE, 'offset_only')
		.minus({ days: 7 })
		.unix_timestamp;

	const rows = await labDb.performance.passengerDemandByAgencyByMinute.queryFromString<PassengerDemandRealtimeSourceRow>(
		`
			SELECT
				agency_id,
				sumIf(accepted_validations_qty, operational_date = $1) AS passenger_validations_qty_now,
				sumIf(accepted_validations_qty, operational_date = $2) AS passenger_validations_qty_last_week,
				max(source_watermark) AS source_watermark
			FROM performance.passenger_demand_by_agency_by_1_minute FINAL
			WHERE
				definition_version = $3
				AND (
					(
						operational_date = $1
						AND interval_start <= $4
					)
					OR (
						operational_date = $2
						AND interval_start <= $5
					)
				)
			GROUP BY agency_id
			ORDER BY agency_id
		`,
		{
			1: referenceNow.operational_date_int,
			2: lastWeekReference.operational_date_int,
			3: PASSENGER_DEMAND_DEFINITION_VERSION,
			4: currentCutoff,
			5: lastWeekCutoff,
		},
	);

	return { lastWeekCutoff, lastWeekReference, rows };
}

/* * */

export async function refreshRealtimeProjection(
	referenceNow: Dates,
	currentCutoff: UnixTimestamp,
) {
	// This projection is derived after the minute fact refresh succeeds. The
	// headline can therefore use one current value without mixing a partial
	// realtime minute with completed historical buckets.
	const { lastWeekCutoff, lastWeekReference, rows: sourceRows } = await fetchRealtimeDemandRows(referenceNow, currentCutoff);
	const calculatedAt = Dates.now('utc').unix_timestamp;
	const rows: PassengerDemandRealtime[] = sourceRows.map(row => ({
		agency_id: row.agency_id,
		calculated_at: calculatedAt,
		current_cutoff: currentCutoff,
		current_operational_date: referenceNow.operational_date_int,
		definition_version: PASSENGER_DEMAND_DEFINITION_VERSION,
		last_week_cutoff: lastWeekCutoff,
		last_week_operational_date: lastWeekReference.operational_date_int,
		passenger_validations_qty_last_week: Number(row.passenger_validations_qty_last_week),
		passenger_validations_qty_now: Number(row.passenger_validations_qty_now),
		source_watermark: row.source_watermark === null ? null : validateUnixTimestamp(row.source_watermark),
	}));

	if (rows.length > 0) {
		await labDb.performance.passengerDemandRealtime.insert('JSONEachRow', rows);
	}
}
