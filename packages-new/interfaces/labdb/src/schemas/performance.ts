/* * */

import { type ClickHouseTableSchema } from '@tmlmobilidade/go-clients-clickhouse';
import { type DemandByAgencyByOperationalDate, type MetricRefresh, type PassengerDemandByAgencyByMinute, type PassengerDemandRealtime } from '@tmlmobilidade/go-types-performance';

/* * */

export const demandByAgencyByOperationalDateTableSchema: ClickHouseTableSchema<DemandByAgencyByOperationalDate> = {
	agency_id: { type: 'LowCardinality(String)' },
	operational_date: { type: 'UInt32' },
	qty: { type: 'UInt64' },
	updated_at: { type: 'Int64' },
};

export const metricRefreshTableSchema: ClickHouseTableSchema<MetricRefresh> = {
	completed_at: { type: 'Nullable(Int64)' },
	definition_version: { type: 'LowCardinality(String)' },
	error_message: { type: 'Nullable(String)' },
	metric_name: { type: 'LowCardinality(String)' },
	range_end: { type: 'UInt32' },
	range_start: { type: 'UInt32' },
	refresh_id: { type: 'UUID' },
	refresh_type: { type: `Enum8('incremental' = 1, 'reconciliation' = 2, 'backfill' = 3)` },
	result_rows_qty: { type: 'UInt64' },
	source_rows_qty: { type: 'UInt64' },
	source_watermark: { type: 'Nullable(Int64)' },
	started_at: { type: 'Int64' },
	status: { type: `Enum8('running' = 1, 'succeeded' = 2, 'failed' = 3)` },
	updated_at: { type: 'Int64' },
};

export const passengerDemandByAgencyByMinuteTableSchema: ClickHouseTableSchema<PassengerDemandByAgencyByMinute> = {
	accepted_validations_qty: { type: 'UInt64' },
	agency_id: { type: 'LowCardinality(String)' },
	calculated_at: { type: 'Int64' },
	definition_version: { type: 'LowCardinality(String)' },
	interval_start: { type: 'Int64' },
	operational_date: { type: 'UInt32' },
	source_watermark: { type: 'Nullable(Int64)' },
};

export const passengerDemandRealtimeTableSchema: ClickHouseTableSchema<PassengerDemandRealtime> = {
	agency_id: { type: 'LowCardinality(String)' },
	calculated_at: { type: 'Int64' },
	current_cutoff: { type: 'Int64' },
	current_operational_date: { type: 'UInt32' },
	definition_version: { type: 'LowCardinality(String)' },
	last_week_cutoff: { type: 'Int64' },
	last_week_operational_date: { type: 'UInt32' },
	passenger_validations_qty_last_week: { type: 'UInt64' },
	passenger_validations_qty_now: { type: 'UInt64' },
	source_watermark: { type: 'Nullable(Int64)' },
};
