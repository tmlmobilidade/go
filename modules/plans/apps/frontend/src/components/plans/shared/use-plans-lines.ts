'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type PlanLineItem, type PlanLineRequest } from '@tmlmobilidade/go-plans-pckg-types';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, type SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UsePlansLinesReturnType {
	data: PlanLineItem[]
	error: null | string
	ids: string[]
	isLoading: boolean
	options: SelectDataItem[]
	timestamp: null | UnixTimestamp
}

/**
 * Fetch lines available to Plans poster exports for the selected agency.
 */
export function usePlansLines(query: null | PlanLineRequest): UsePlansLinesReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<PlanLineItem[]>>(
		query ? [API_ROUTES.plans.PLANS_POSTER_LINES, query] : null,
		{
			fetcher: async ([url, request]: [string, PlanLineRequest]) => await fetchApiData<PlanLineItem[]>({ body: request, method: 'POST', url }),
			refreshInterval: 10_000,
		},
	);

	//
	// B. Transform data

	const linesData = data?.data ?? [];

	const idsData = useMemo(() => linesData.map(item => item._id), [linesData]);

	const optionsData = useMemo(() => linesData.map((item): SelectDataItem => ({
		checked: false,
		disabled: false,
		label: `${item.code} - ${item.name}`,
		value: item._id,
	})), [linesData]);

	//
	// C. Return data

	return useMemo(() => ({
		data: linesData,
		error: data?.error ?? (error instanceof Error ? error.message : null),
		ids: idsData,
		isLoading,
		options: optionsData,
		timestamp: data?.timestamp ?? null,
	}), [data?.error, data?.timestamp, error, idsData, isLoading, isValidating, linesData, optionsData]);
}
