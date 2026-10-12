'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type LineNormalized } from '@tmlmobilidade/go-types-offer';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, type SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseSteppExtractLinesDataReturnType {
	error: null | string
	isLoading: boolean
	options: SelectDataItem[]
}

/* * */

export function useSteppExtractLinesData(agencyId: string): UseSteppExtractLinesDataReturnType {
	//
	// A. Fetch data

	const { data, error, isLoading } = useSWR<ApiResponse<LineNormalized[]>>(agencyId ? API_ROUTES.offer.LINES_LIST : null, {
		fetcher: async (url: string) => await fetchApiData<LineNormalized[]>({ url }),
	});

	//
	// B. Transform data

	const options = useMemo(() => {
		if (error || data?.error) return [];
		return (data?.data ?? [])
			.filter(line => line.agency_id === agencyId)
			.sort((a, b) => a.code.localeCompare(b.code, 'pt', { numeric: true }))
			.map(line => ({ label: `${line.code} - ${line.name}`, value: line._id }));
	}, [agencyId, data, error]);

	//
	// C. Return data

	return useMemo(() => ({
		error: error?.message ?? data?.error ?? null,
		isLoading,
		options,
	}), [data?.error, error?.message, isLoading, options]);
}
