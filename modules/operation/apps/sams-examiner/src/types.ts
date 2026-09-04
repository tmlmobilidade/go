/* * */

import { type SimplifiedApexType } from '@tmlmobilidade/go-types-apex';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';

/* * */

export interface AggregationResultItem {
	_id: string
	agency_id: string
	apex_version: string
	created_at: UnixMilliseconds
	device_id: string
	mac_ase_counter_value: number
	transaction_type: SimplifiedApexType
	vehicle_id: null | number
}
