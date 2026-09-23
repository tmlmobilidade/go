/* eslint-disable perfectionist/sort-objects */

import { type RideAcceptance } from '@tmlmobilidade/go-types-operation';
import { type TimezoneIdentified } from '@tmlmobilidade/go-types-shared';

import { type OperationRidesV3OutputRow, type OperationRidesV3QueryRow } from './types.js';

/* * */

/*
 * One formatter per timezone, reused for every row. Going through
 * @tmlmobilidade/go-utils-dates instead costs about 60 microseconds per value,
 * which is minutes of formatting alone on a large extraction.
 */
const timeFormatters = new Map<string, Intl.DateTimeFormat>();

/**
 * Renders a millisecond timestamp as the local time of the ride, as the previous export did.
 * @param milliseconds The timestamp, as returned by ClickHouse for an Int64 column.
 * @param timezone The timezone of the ride.
 * @returns The local time, or null when there is no timestamp.
 */
function toLocalTime(milliseconds: null | string, timezone: TimezoneIdentified): null | string {
	if (!milliseconds) return null;

	let formatter = timeFormatters.get(timezone);

	if (!formatter) {
		formatter = new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit', timeZone: timezone });
		timeFormatters.set(timezone, formatter);
	}

	return formatter.format(Number(milliseconds));
}

/**
 * Collapses whitespace so that free text written by operators stays on a single CSV line.
 * @param text The text to collapse.
 * @returns The single line text, or null when there is no text.
 */
function toSingleLine(text: null | string | undefined): null | string {
	if (!text) return null;
	return text.replaceAll(/\s+/g, ' ').trim();
}

/* * */

/**
 * Flattens a ride, its analyses and its acceptance into a single output row.
 * @param row The row returned by the extraction query.
 * @param acceptance The acceptance of the ride, when it has one.
 * @returns The output row, ready to be written to the CSV file.
 */
export function toOutputRow(row: OperationRidesV3QueryRow, acceptance: null | RideAcceptance): OperationRidesV3OutputRow {
	return {

		_id: row._id,
		agency_id: row.agency_id,
		driver_ids: row.driver_ids.join('|'),
		headsign: row.headsign,
		line_id: row.route_short_name,
		pattern_id: row.shape_id,
		plan_id: row.plan_id,
		route_id: row.route_id,
		trip_id: row.trip_id,
		vehicle_ids: row.vehicle_ids.join('|'),

		operational_date: String(row.operational_date),
		operational_status: row.operational_status,

		start_delay_status: row.start_delay_status,
		start_time_observed: toLocalTime(row.start_time_observed, row.timezone),
		start_time_scheduled: toLocalTime(row.start_time_scheduled, row.timezone),

		end_delay_status: row.end_delay_status,
		end_time_observed: toLocalTime(row.end_time_observed, row.timezone),
		end_time_scheduled: toLocalTime(row.end_time_scheduled, row.timezone),
		extension_observed: row.extension_observed,
		extension_scheduled: row.extension_scheduled,

		seen_first_at: toLocalTime(row.seen_first_at, row.timezone),
		seen_last_at: toLocalTime(row.seen_last_at, row.timezone),
		seen_status: row.seen_status,

		passengers_estimated: row.passengers_estimated,
		passengers_observed: row.passengers_observed,
		passengers_observed_on_board_sales_amount: row.passengers_observed_sales_amount,
		passengers_observed_on_board_sales_qty: row.passengers_observed_sales_qty,
		passengers_observed_prepaid_amount: row.passengers_observed_prepaid_amount,
		passengers_observed_prepaid_qty: row.passengers_observed_prepaid_qty,
		passengers_observed_subscription_qty: row.passengers_observed_subscription_qty,

		apex_locations_qty: row.apex_locations_qty,
		apex_on_board_refunds_amount: row.apex_refunds_amount,
		apex_on_board_refunds_qty: row.apex_refunds_qty,
		apex_on_board_sales_amount: row.apex_sales_amount,
		apex_on_board_sales_qty: row.apex_sales_qty,
		apex_validations_qty: row.apex_validations_qty,

		analysis_AT_LEAST_ONE_VEHICLE_EVENT_ON_FIRST_STOP: row.analysis_at_least_one_vehicle_event_on_first_stop_grade,
		analysis_ENDED_AT_LAST_STOP: row.analysis_at_least_one_vehicle_event_on_last_stop_grade,
		analysis_EXPECTED_APEX_VALIDATION_INTERVAL: row.analysis_expected_apex_validation_interval_grade,
		analysis_EXPECTED_DRIVER_ID_QTY: row.analysis_expected_driver_id_qty_grade,
		analysis_EXPECTED_START_TIME: row.analysis_expected_start_time_grade,
		analysis_EXPECTED_START_TIME_value: row.analysis_expected_start_time_observed_start_time_delta,
		analysis_EXPECTED_VEHICLE_EVENT_DELAY: row.analysis_expected_vehicle_event_delay_grade,
		analysis_EXPECTED_VEHICLE_EVENT_INTERVAL: row.analysis_expected_vehicle_event_interval_grade,
		analysis_EXPECTED_VEHICLE_EVENT_QTY: row.analysis_expected_vehicle_event_qty_grade,
		analysis_EXPECTED_VEHICLE_EVENT_QTY_expected_qty: row.analysis_expected_vehicle_event_qty_expected_vehicle_events_qty,
		analysis_EXPECTED_VEHICLE_EVENT_QTY_found_qty: row.analysis_expected_vehicle_event_qty_observed_vehicle_events_qty,
		analysis_EXPECTED_VEHICLE_ID_QTY: row.analysis_expected_vehicle_id_qty_grade,
		analysis_MATCHING_APEX_LOCATIONS: row.analysis_matching_apex_locations_grade,
		analysis_MATCHING_VEHICLE_IDS: row.analysis_matching_vehicle_ids_grade,
		analysis_SIMPLE_ONE_APEX_VALIDATION: row.analysis_simple_one_apex_validation_grade,
		analysis_SIMPLE_ONE_VEHICLE_EVENT_OR_APEX_VALIDATION: row.analysis_simple_one_vehicle_event_or_apex_validation_grade,
		analysis_SIMPLE_THREE_VEHICLE_EVENTS: row.analysis_simple_three_vehicle_events_grade,
		analysis_SIMPLE_THREE_VEHICLE_EVENTS_reason: row.analysis_simple_three_vehicle_events_reason,
		analysis_SIMPLE_THREE_VEHICLE_EVENTS_stop_ids_first: row.analysis_simple_three_vehicle_events_stop_ids_first.join('|'),
		analysis_SIMPLE_THREE_VEHICLE_EVENTS_stop_ids_last: row.analysis_simple_three_vehicle_events_stop_ids_last.join('|'),
		analysis_SIMPLE_THREE_VEHICLE_EVENTS_stop_ids_middle: row.analysis_simple_three_vehicle_events_stop_ids_middle.join('|'),
		analysis_TRANSACTION_SEQUENTIALITY: row.analysis_transaction_sequentiality_grade,
		analysis_TRANSACTION_SEQUENTIALITY_expected_qty: row.analysis_transaction_sequentiality_expected_transactions_qty,
		analysis_TRANSACTION_SEQUENTIALITY_found_qty: row.analysis_transaction_sequentiality_found_transactions_qty,
		analysis_TRANSACTION_SEQUENTIALITY_missing_qty: row.analysis_transaction_sequentiality_missing_transactions_qty,

		acceptance_status: acceptance?.acceptance_status ?? null,
		justification_cause: acceptance?.justification?.justification_cause ?? null,
		justification_source: acceptance?.justification?.justification_source ?? null,
		manual_trip_id: toSingleLine(acceptance?.justification?.manual_trip_id),
		pto_message: toSingleLine(acceptance?.justification?.pto_message),

	};
}
