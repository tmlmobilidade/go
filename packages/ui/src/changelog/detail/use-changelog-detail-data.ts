'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type ChangelogReader } from '@tmlmobilidade/go-types-core';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { useMemo } from 'react';
import useSWR from 'swr';

import { fetchApiData } from '../../fetch/fetch-api-data';

/* * */

interface UseChangelogDetailDataReturnType {
	data: ChangelogReader | undefined
	error: Error | undefined
	isLoading: boolean
	retry: () => void
}

/* * */

export function useChangelogDetailData(releaseId: null | string): UseChangelogDetailDataReturnType {
	//
	// A. Fetch data

	const { data, error, isLoading, mutate } = useSWR<ApiResponse<ChangelogReader>, Error>(
		releaseId ? API_ROUTES.core.CHANGELOG_DETAIL(releaseId) : null,
		async (url: string) => {
			const response = await fetchApiData<ChangelogReader>({ url });
			// Reject API errors so SWR can expose them and retry the request.
			if (response.error || !response.data) throw new Error(response.error || 'Empty changelog response');
			return response;
		},
		{ revalidateOnFocus: false },
	);

	//
	// B. Return data

	return useMemo(() => ({
		data: data?.data ?? undefined,
		error,
		isLoading,
		retry: () => { void mutate(); },
	}), [data, error, isLoading, mutate]);
}
