/* * */

import { type MetricRefreshType } from '@tmlmobilidade/go-types-performance';
import { type OperationalDateInt, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';

/* * */

export interface DemandSourceRow {
	accepted_validations_qty: number | string
	agency_id: string
	interval_start: number | string
	operational_date: number | string
	source_watermark: null | number | string
}

export interface ExistingDemandKeyRow {
	agency_id: string
	interval_start: number | string
	operational_date: number | string
}

export interface PassengerDemandRealtimeSourceRow {
	agency_id: string
	passenger_validations_qty_last_week: number | string
	passenger_validations_qty_now: number | string
	source_watermark: null | number | string
}

export interface RefreshRange {
	cutoff: UnixTimestamp
	end: OperationalDateInt
	start: OperationalDateInt
	type: MetricRefreshType
}

export interface RefreshResult {
	resultRowsQty: number
	sourceRowsQty: number
	sourceWatermark: null | UnixTimestamp
}
