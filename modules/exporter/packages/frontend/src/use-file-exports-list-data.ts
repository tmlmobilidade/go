'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type FileExport } from '@tmlmobilidade/go-types-downloads';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { useMemo } from 'react';
import useSWR from 'swr';

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

async function fetchFileExports(url: string): Promise<ApiResponse<FileExport[]>> {
	const response = await fetch(url, {
		credentials: 'include',
		method: 'POST',
	});

	if (!response.ok) throw new Error(`HTTP ${response.status} - ${response.statusText}`);

	const responseData = await response.json() as ApiResponse<FileExport[]>;
	if (responseData.error) throw new Error(responseData.error);

	return responseData;
}

/* * */

export function useFileExportsListData(): UseFileExportsListDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<FileExport[]>, Error>(API_ROUTES.exporter.EXPORTER_LIST, {
		fetcher: fetchFileExports,
		refreshInterval: 5_000,
	});

	//
	// B. Transform data

	const fileExports = useMemo(() => {
		return [...(data?.data ?? [])].sort((a, b) => Number(b.created_at) - Number(a.created_at));
	}, [data?.data]);

	//
	// C. Return data

	return useMemo(() => ({
		data: fileExports,
		error: data?.error ?? (error instanceof Error ? error.message : null),
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp ?? null,
	}), [data?.error, data?.timestamp, error, fileExports, isLoading, isValidating, mutate]);
}
