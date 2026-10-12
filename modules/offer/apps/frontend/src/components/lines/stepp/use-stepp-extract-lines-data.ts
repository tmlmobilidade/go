'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type LinesExtractItem } from '@tmlmobilidade/go-offer-pckg-types';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, type SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseSteppExtractLinesDataReturnType {
	data: LinesExtractItem[] | undefined
	error: null | string
	isLoading: boolean
	options: SelectDataItem[]
}

/* * */

export function useSteppExtractLinesData(agencyId: string): UseSteppExtractLinesDataReturnType {
	//
	// A. Fetch data

	const { data, error, isLoading } = useSWR<ApiResponse<LinesExtractItem[]>>(agencyId ? API_ROUTES.offer.LINES_LIST_EXTRACT(agencyId) : null, {
		fetcher: async (url: string) => await fetchApiData<LinesExtractItem[]>({ url }),
	});

	//
	// B. Transform data

	const options = useMemo(() => {
		if (error || data?.error) return [];
		return (data?.data ?? [])
			.slice()
			.sort((a, b) => a.code.localeCompare(b.code, 'pt', { numeric: true }))
			.map(line => ({ label: `${line.code} - ${line.name}`, value: line._id }));
	}, [data, error]);

	//
	// C. Return data

	return useMemo(() => ({
		data: data?.data,
		error: error?.message ?? data?.error ?? null,
		isLoading,
		options,
	}), [data?.data, data?.error, error?.message, isLoading, options]);
}
