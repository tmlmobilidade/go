/* * */

import { type UnixTimestamp } from '@tmlmobilidade/types';

/* * */

export interface AggregationResultItem {
	_id: string
	agency_id: string
	apex_version: string
	created_at: UnixTimestamp
	device_id: string
	mac_ase_counter_value: number
}
