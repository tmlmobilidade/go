/* * */

import { type SimplifiedApexType, type UnixTimestamp } from '@tmlmobilidade/go-types';

/* * */

export interface AggregationResultItem {
	_id: string
	agency_id: string
	apex_version: string
	created_at: UnixTimestamp
	device_id: string
	mac_ase_counter_value: number
	transaction_type: SimplifiedApexType
	vehicle_id: null | number
}
