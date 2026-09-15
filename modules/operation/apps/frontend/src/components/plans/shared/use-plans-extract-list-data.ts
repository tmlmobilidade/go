'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PlansListFilters, type PlansListItem } from '@tmlmobilidade/go-operation-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UsePlansExtractListDataReturnType {
	data: PlansListItem[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	timestamp: null | UnixMilliseconds
}

/**
 * Fetch plans available to an extract flow for the selected agency.
 */
export function usePlansExtractListData(agencyId: null | string): UsePlansExtractListDataReturnType {
	//

	//
	// A. Setup query

	const query = useMemo<null | PlansListFilters>(() => agencyId ? ({
		agency_ids: [agencyId],
		temporal_statuses: ['active', 'expired', 'upcoming'],
	}) : null, [agencyId]);

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<PlansListItem[]>>(
		query ? [API_ROUTES.operation.PLANS_LIST, query] : null,
		{
			fetcher: async ([url, request]: [string, PlansListFilters]) => await fetchApiData<PlansListItem[]>({ body: request, method: 'POST', url }),
			refreshInterval: 10_000,
		},
	);

	//
	// C. Return data

	return useMemo(() => ({
		data: data?.data ?? [],
		error: data?.error ?? (error instanceof Error ? error.message : null),
		isLoading,
		isValidating,
		timestamp: data?.timestamp ?? null,
	}), [data, error, isLoading, isValidating]);
}
