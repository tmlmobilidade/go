'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PassengerDemandBaselineComparison } from '@tmlmobilidade/go-types-performance';
import useSWR from 'swr';

/* * */

interface UsePassengerDemandBaselineOptions {
	agencyId?: string
	agencyIds?: string[]
	enabled?: boolean
	excludeUnknown?: boolean
	lineId?: string
	operationalDate: string
	sampleSize?: number
}

/* * */

export function usePassengerDemandBaseline({ agencyId, agencyIds, enabled = true, excludeUnknown, lineId, operationalDate, sampleSize }: UsePassengerDemandBaselineOptions) {
	const query = new URLSearchParams({ operational_date: operationalDate });
	if (agencyId) query.set('agency_id', agencyId);
	agencyIds?.forEach(value => query.append('agency_ids', value));
	if (excludeUnknown !== undefined) query.set('exclude_unknown', String(excludeUnknown));
	if (lineId) query.set('line_id', lineId);
	if (sampleSize !== undefined) query.set('sample_size', String(sampleSize));
	return useSWR<PassengerDemandBaselineComparison, Error>(enabled ? `${API_ROUTES.performance.PASSENGER_DEMAND_BASELINE}?${query.toString()}` : null);
}

/* * */
