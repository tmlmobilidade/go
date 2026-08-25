'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { usePlansDetailPlanId } from './use-plans-detail-plan-id';

/* * */

interface UsePlansDetailDataReturnType {
	data: null | Plan
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixTimestamp
}

/* * */

export function usePlansDetailData(): UsePlansDetailDataReturnType {
	//

	//
	// A. Setup variables

	const { planId } = usePlansDetailPlanId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<Plan>>(API_ROUTES.plans.PLANS_DETAIL(planId), {
		fetcher: async (url: string) => await fetchApiData<Plan>({ url }),
		refreshInterval: 5_000,
	});

	//
	// C. Return data

	return useMemo(() => ({
		data: data?.data ?? null,
		error: data?.error ?? (error instanceof Error ? error.message : null),
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp ?? null,
	}), [data, error, isLoading, isValidating, mutate]);
}
