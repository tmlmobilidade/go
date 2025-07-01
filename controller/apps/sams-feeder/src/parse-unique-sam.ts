/* * */

import { type AggregationResultItem } from '@/types.js';
import { type CreateUniqueSamDto, ProcessingStatus } from '@tmlmobilidade/types';

/* * */

export function parseUniqueSam(item: AggregationResultItem): CreateUniqueSamDto {
	return {
		_id: item.mac_sam_serial_number,
		agency_id: item.agency_id,
		device_ids: null,
		latest_apex_version: null,
		remarks: null,
		seen_first_at: null,
		seen_last_at: null,
		system_status: ProcessingStatus.Waiting,
		transactions_expected: null,
		transactions_found: null,
		transactions_missing: null,
		vehicle_ids: null,
	};
}
