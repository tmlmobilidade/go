/* * */

import { PASSENGER_DEMAND_BASELINE_HISTORY_DAYS, PASSENGER_DEMAND_TIMEZONE } from '@/handlers/passenger-demand/constants.js';
import { hasDemandFacts } from '@/handlers/passenger-demand/demand-facts.js';
import { type RefreshRange } from '@/handlers/passenger-demand/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { type OperationalDateInt, validateUnixTimestamp } from '@tmlmobilidade/go-types-shared';

/* * */

const REFRESH_CADENCE_STATE: {
	has_checked_bootstrap: boolean
	last_current_cutoff: null | number
	last_hourly_reconciliation_key: null | string
	last_nightly_reconciliation_key: null | string
} = {
	has_checked_bootstrap: false,
	last_current_cutoff: null,
	last_hourly_reconciliation_key: null,
	last_nightly_reconciliation_key: null,
};

/* * */

function getRefreshKey(referenceNow: Dates, unit: 'day' | 'hour') {
	if (!referenceNow.iso) throw new Error('Reference time has no ISO value');
	return unit === 'day'
		? referenceNow.iso.slice(0, 10)
		: referenceNow.iso.slice(0, 13);
}

function getClosedOperationalDateCutoff(referenceNow: Dates) {
	return validateUnixTimestamp(
		Dates
			.fromOperationalDate(referenceNow.operational_date, PASSENGER_DEMAND_TIMEZONE)
			.unix_timestamp - 1,
	);
}

/* * */

export function getCurrentRefreshRange(referenceNow: Dates): null | RefreshRange {
	// Compare only fully closed minutes. At 16:03:27 this produces
	// 16:02:59.999, so current and historical values share an exact
	// operational-minute cutoff.
	const cutoff = validateUnixTimestamp(
		Math.floor(referenceNow.unix_timestamp / 60_000) * 60_000 - 1,
	);
	if (REFRESH_CADENCE_STATE.last_current_cutoff === cutoff) return null;

	return {
		cutoff,
		end: referenceNow.operational_date_int,
		start: referenceNow.operational_date_int,
		type: 'incremental',
	};
}

export async function getBootstrapStart(referenceNow: Dates): Promise<null | OperationalDateInt> {
	if (REFRESH_CADENCE_STATE.has_checked_bootstrap) return null;

	const demandFactsAvailable = await hasDemandFacts();
	if (demandFactsAvailable) {
		REFRESH_CADENCE_STATE.has_checked_bootstrap = true;
		return null;
	}

	return referenceNow.minus({ days: PASSENGER_DEMAND_BASELINE_HISTORY_DAYS }).operational_date_int;
}

export function getHourlyReconciliationRange(referenceNow: Dates): null | RefreshRange {
	const hourlyKey = getRefreshKey(referenceNow, 'hour');
	if (REFRESH_CADENCE_STATE.last_hourly_reconciliation_key === hourlyKey) return null;

	return {
		cutoff: getClosedOperationalDateCutoff(referenceNow),
		end: referenceNow.minus({ days: 1 }).operational_date_int,
		start: referenceNow.minus({ days: 2 }).operational_date_int,
		type: 'reconciliation',
	};
}

export function getNightlyReconciliationRange(referenceNow: Dates): null | RefreshRange {
	const nightlyKey = getRefreshKey(referenceNow, 'day');
	if (REFRESH_CADENCE_STATE.last_nightly_reconciliation_key === nightlyKey) return null;

	return {
		cutoff: getClosedOperationalDateCutoff(referenceNow),
		end: referenceNow.minus({ days: 1 }).operational_date_int,
		start: referenceNow.minus({ days: 14 }).operational_date_int,
		type: 'reconciliation',
	};
}

export function markBootstrapCompleted(referenceNow: Dates) {
	REFRESH_CADENCE_STATE.has_checked_bootstrap = true;
	REFRESH_CADENCE_STATE.last_hourly_reconciliation_key = getRefreshKey(referenceNow, 'hour');
	REFRESH_CADENCE_STATE.last_nightly_reconciliation_key = getRefreshKey(referenceNow, 'day');
}

export function markCurrentRefreshCompleted(cutoff: number) {
	REFRESH_CADENCE_STATE.last_current_cutoff = cutoff;
}

export function markHourlyReconciliationCompleted(referenceNow: Dates) {
	REFRESH_CADENCE_STATE.last_hourly_reconciliation_key = getRefreshKey(referenceNow, 'hour');
}

export function markNightlyReconciliationCompleted(referenceNow: Dates) {
	REFRESH_CADENCE_STATE.last_nightly_reconciliation_key = getRefreshKey(referenceNow, 'day');
}
