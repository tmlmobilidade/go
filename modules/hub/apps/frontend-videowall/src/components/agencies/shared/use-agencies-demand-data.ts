'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type DemandByAgencyByOperationalDate } from '@tmlmobilidade/go-types-performance';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR, { type KeyedMutator } from 'swr';

/* * */

export interface UseAgenciesDemandDataReturnType {
	data: DemandByAgencyByOperationalDate[] | null | undefined
	error: string | undefined
	isLoading: boolean
	isValidating: boolean
	mutate: KeyedMutator<ApiResponse<DemandByAgencyByOperationalDate[]>>
	timestamp: number | undefined
}

/**
 * Fetches the demand by agency by operational date published by the Hub API.
 */
export function useAgenciesDemandData(): UseAgenciesDemandDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<DemandByAgencyByOperationalDate[]>>(API_ROUTES.hub.METRICS_DEMAND_BY_AGENCY_BY_OPERATIONAL_DATE, {
		fetcher: async (url: string) => await fetchApiData<DemandByAgencyByOperationalDate[]>({ credentials: 'omit', url }),
	});

	//
	// B. Return data

	return useMemo(() => ({
		data: data?.data,
		error: data?.error ?? error?.message,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp,
	}), [data?.data, data?.error, data?.timestamp, error, isLoading, isValidating, mutate]);
};
