'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Line } from '@tmlmobilidade/go-types-offer';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UsePosterLinesDataReturnType {
	data: Line[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixTimestamp
}

/* * */

export function usePosterLinesData(): UsePosterLinesDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<Line[]>>(API_ROUTES.plans.PLANS_POSTER_LINES, {
		fetcher: async (url: string) => await fetchApiData<Line[]>({ url }),
	});

	//
	// B. Return data

	return useMemo(() => ({
		data: data?.data ?? [],
		error: data?.error ?? (error instanceof Error ? error.message : null),
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp ?? null,
	}), [data, error, isLoading, isValidating, mutate]);
}
