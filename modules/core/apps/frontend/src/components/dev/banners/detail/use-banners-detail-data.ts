'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type OperationalBanner } from '@tmlmobilidade/go-types-core';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useBannersDetailId } from './use-banners-detail-id';

/* * */

interface UseBannersDetailDataReturnType {
	data: null | OperationalBanner
	error: null | string
	isLoading: boolean
	mutate: (data?: ApiResponse<OperationalBanner>) => void
}

/* * */

export function useBannersDetailData(): UseBannersDetailDataReturnType {
	//

	//
	// A. Fetch data

	const { id } = useBannersDetailId();
	const { data, error, isLoading, mutate } = useSWR<ApiResponse<OperationalBanner>, Error>(
		id ? API_ROUTES.core.OPERATIONAL_BANNERS_DETAIL(id) : null,
		{ fetcher: (url: string) => fetchApiData<OperationalBanner>({ url }), refreshInterval: 0 },
	);

	//
	// B. Return data

	return useMemo(
		() => ({ data: data?.data ?? null, error: data?.error ?? error?.message ?? null, isLoading, mutate }),
		[data, error, isLoading, mutate],
	);
}
