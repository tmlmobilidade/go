'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type FileExport } from '@tmlmobilidade/go-types-downloads';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { useMemo } from 'react';
import useSWR from 'swr';

import { fetchApiData } from '../fetch/fetch-api-data';

/* * */

interface UseFileExportsListDataReturnType {
	data: FileExport[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixTimestamp
}

/* * */

export function useFileExportsListData(): UseFileExportsListDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<FileExport[]>, Error>(API_ROUTES.exporter.EXPORTER_LIST, {
		fetcher: async (url: string) => await fetchApiData<FileExport[]>({ url }),
		refreshInterval: 5_000,
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
