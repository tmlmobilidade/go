/* * */

import { type AggregationResultItem } from '@/types.js';
import { ProcessingStatus, type UpdateUniqueSamDto } from '@tmlmobilidade/types';

/* * */

export function parseUniqueSam(item: AggregationResultItem): UpdateUniqueSamDto {
	return {
		agency_id: item.agency_id,
		device_ids: null,
		is_complete: false,
		latest_apex_version: null,
		remarks: null,
		seen_first_at: null,
		seen_last_at: null,
		system_status: ProcessingStatus.Waiting,
		transactions_expected: null,
		transactions_found: null,
		transactions_missing: null,
	};
}
