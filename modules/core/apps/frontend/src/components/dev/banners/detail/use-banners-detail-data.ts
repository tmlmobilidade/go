'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Banner } from '@tmlmobilidade/go-types-core';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useBannersDetailId } from './use-banners-detail-id';

/* * */

interface UseBannersDetailDataReturnType {
	data: Banner | null
	error: null | string
	isLoading: boolean
	mutate: (data?: ApiResponse<Banner>) => void
}

/* * */

export function useBannersDetailData(): UseBannersDetailDataReturnType {
	//

	//
	// A. Fetch data

	const { id } = useBannersDetailId();
	const { data, error, isLoading, mutate } = useSWR<ApiResponse<Banner>, Error>(
		id ? API_ROUTES.core.BANNERS_DETAIL(id) : null,
		{ fetcher: (url: string) => fetchApiData<Banner>({ url }), refreshInterval: 0 },
	);

	//
	// B. Return data

	return useMemo(
		() => ({ data: data?.data ?? null, error: data?.error ?? error?.message ?? null, isLoading, mutate }),
		[data, error, isLoading, mutate],
	);
}
