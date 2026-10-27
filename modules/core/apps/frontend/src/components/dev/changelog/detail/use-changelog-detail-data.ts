'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type ChangelogRelease } from '@tmlmobilidade/go-types-core';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useChangelogDetailId } from './use-changelog-detail-id';

/* * */

interface UseChangelogDetailDataReturnType {
	data: ChangelogRelease | null
	error: null | string
	isLoading: boolean
	mutate: (data?: ApiResponse<ChangelogRelease>) => void
}

/* * */

export function useChangelogDetailData(): UseChangelogDetailDataReturnType {
	//

	//
	// A. Fetch data

	const { id } = useChangelogDetailId();
	const { data, error, isLoading, mutate } = useSWR<ApiResponse<ChangelogRelease>, Error>(id ? API_ROUTES.core.CHANGELOG_RELEASES_DETAIL(id) : null, {
		fetcher: (url: string) => fetchApiData<ChangelogRelease>({ url }),
		refreshInterval: 0,
	});

	//
	// B. Return data

	return useMemo(
		() => ({ data: data?.data ?? null, error: data?.error ?? error?.message ?? null, isLoading, mutate }),
		[data, error, isLoading, mutate],
	);
}
