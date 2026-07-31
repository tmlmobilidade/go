/* * */

import { PASSENGER_DEMAND_DEFINITION_VERSION,	PASSENGER_DEMAND_TIMEZONE } from '@/handlers/passenger-demand/constants.js';
import { type DemandSourceRow, type ExistingDemandKeyRow, type RefreshRange } from '@/handlers/passenger-demand/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { ValidApexValidationStatusValues } from '@tmlmobilidade/go-types-apex';
import { type PassengerDemandByAgencyByMinute } from '@tmlmobilidade/go-types-performance';
import { type UnixTimestamp, validateOperationalDate, validateOperationalDateInt, validateUnixTimestamp } from '@tmlmobilidade/go-types-shared';

/* * */

function getOperationalDateRangeBoundaries(range: Pick<RefreshRange, 'cutoff' | 'end' | 'start'>) {
	const startTimestamp = Dates
		.fromOperationalDate(validateOperationalDate(String(range.start)), PASSENGER_DEMAND_TIMEZONE)
		.unix_timestamp;
	const endTimestamp = Math.min(
		range.cutoff,
		Dates
			.fromOperationalDate(validateOperationalDate(String(range.end)), PASSENGER_DEMAND_TIMEZONE)
			.plus({ days: 1 })
			.unix_timestamp - 1,
	);

	return { endTimestamp, startTimestamp };
}

/* * */

export function mergeDemandRowsWithExistingKeys(
	sourceRows: DemandSourceRow[],
	existingRows: ExistingDemandKeyRow[],
	calculatedAt: UnixTimestamp,
): PassengerDemandByAgencyByMinute[] {
	const rowsByKey = new Map<string, PassengerDemandByAgencyByMinute>();

	for (const row of sourceRows) {
		const parsedRow: PassengerDemandByAgencyByMinute = {
			accepted_validations_qty: Number(row.accepted_validations_qty),
			agency_id: row.agency_id,
			calculated_at: calculatedAt,
			definition_version: PASSENGER_DEMAND_DEFINITION_VERSION,
			interval_start: validateUnixTimestamp(row.interval_start),
			operational_date: validateOperationalDateInt(row.operational_date),
			source_watermark: row.source_watermark === null ? null : validateUnixTimestamp(row.source_watermark),
		};

		rowsByKey.set(
			`${parsedRow.operational_date}:${parsedRow.agency_id}:${parsedRow.interval_start}`,
			parsedRow,
		);
	}

	for (const row of existingRows) {
		const key = `${row.operational_date}:${row.agency_id}:${row.interval_start}`;
		if (rowsByKey.has(key)) continue;

		rowsByKey.set(key, {
			accepted_validations_qty: 0,
			agency_id: row.agency_id,
			calculated_at: calculatedAt,
			definition_version: PASSENGER_DEMAND_DEFINITION_VERSION,
			interval_start: validateUnixTimestamp(row.interval_start),
			operational_date: validateOperationalDateInt(row.operational_date),
			source_watermark: null,
		});
	}

	return [...rowsByKey.values()];
}

/* * */

async function fetchDemandSourceRows(range: RefreshRange) {
	const { endTimestamp, startTimestamp } = getOperationalDateRangeBoundaries(range);

	return labDb.simplifiedApex.validations.queryFromString<DemandSourceRow>(
		`
			SELECT
				agency_id,
				operational_date,
				intDiv(created_at, 60000) * 60000 AS interval_start,
				count() AS accepted_validations_qty,
				max(updated_at) AS source_watermark
			FROM simplified_apex.validations FINAL
			WHERE
				validation_status IN $1
				AND operational_date BETWEEN $2 AND $3
				AND created_at >= $4
				AND created_at <= $5
			GROUP BY
				agency_id,
				operational_date,
				interval_start
			ORDER BY
				operational_date,
				agency_id,
				interval_start
		`,
		{
			1: [...ValidApexValidationStatusValues],
			2: range.start,
			3: range.end,
			4: startTimestamp,
			5: endTimestamp,
		},
	);
}

async function fetchExistingDemandKeys(range: RefreshRange) {
	return labDb.performance.passengerDemandByAgencyByMinute.queryFromString<ExistingDemandKeyRow>(
		`
			SELECT
				agency_id,
				operational_date,
				interval_start
			FROM performance.passenger_demand_by_agency_by_1_minute FINAL
			WHERE
				definition_version = $1
				AND operational_date BETWEEN $2 AND $3
		`,
		{
			1: PASSENGER_DEMAND_DEFINITION_VERSION,
			2: range.start,
			3: range.end,
		},
	);
}

/* * */

export async function hasDemandFacts() {
	const rows = await labDb.performance.passengerDemandByAgencyByMinute.queryFromString<{ qty: number | string }>(
		`
			SELECT count() AS qty
			FROM performance.passenger_demand_by_agency_by_1_minute FINAL
			WHERE definition_version = $1
			LIMIT 1
		`,
		{ 1: PASSENGER_DEMAND_DEFINITION_VERSION },
	);

	return Number(rows[0]?.qty ?? 0) > 0;
}

/* * */

export async function refreshDemandFacts(range: RefreshRange) {
	const calculatedAt = Dates.now('utc').unix_timestamp;
	const [sourceRows, existingRows] = await Promise.all([
		fetchDemandSourceRows(range),
		fetchExistingDemandKeys(range),
	]);
	const replacementRows = mergeDemandRowsWithExistingKeys(sourceRows, existingRows, calculatedAt);

	if (replacementRows.length > 0) {
		await labDb.performance.passengerDemandByAgencyByMinute.insert('JSONEachRow', replacementRows);
	}

	return {
		resultRowsQty: replacementRows.length,
		sourceRowsQty: sourceRows.reduce((total, row) => total + Number(row.accepted_validations_qty), 0),
		sourceWatermark: sourceRows.reduce<null | UnixTimestamp>((latest, row) => {
			if (row.source_watermark === null) return latest;
			return validateUnixTimestamp(Math.max(latest ?? 0, Number(row.source_watermark)));
		}, null),
	};
}
