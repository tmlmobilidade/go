/* * */

import { type AggregationResultItem } from '@/types.js';
import { type CreateSamDto } from '@tmlmobilidade/types';

/* * */

export function parseSam(item: AggregationResultItem): CreateSamDto {
	return {
		_id: item.mac_sam_serial_number,
		agency_id: item.agency_id,
		analysis: [],
		latest_apex_version: null,
		remarks: null,
		seen_first_at: null,
		seen_last_at: null,
		system_status: 'waiting',
		timeline_summary: { months: [] },
		transactions_expected: null,
		transactions_found: null,
		transactions_missing: null,
	} as CreateSamDto;
}
