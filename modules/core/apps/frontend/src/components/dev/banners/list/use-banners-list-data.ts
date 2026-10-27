'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type OperationalBannerListItem } from '@tmlmobilidade/go-core-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useListFilters } from '../../shared/use-list-filters';

/* * */

interface UseBannersListDataReturnType {
	data: OperationalBannerListItem[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: (data?: ApiResponse<OperationalBannerListItem[]>) => void
	timestamp?: UnixMilliseconds
}

/* * */

export function useBannersListData(): UseBannersListDataReturnType {
	//

	//
	// A. Fetch data

	const { search, status } = useListFilters();
	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<OperationalBannerListItem[]>, Error>(API_ROUTES.core.OPERATIONAL_BANNERS_LIST, {
		fetcher: (url: string) => fetchApiData<OperationalBannerListItem[]>({ url }),
		refreshInterval: 30000,
	});

	//
	// B. Return data

	return useMemo(
		() => ({
			data: (data?.data ?? []).filter(
				item =>
					status.value.includes(item.status) &&
					`${item._id} ${item.title} ${item.message}`.toLocaleLowerCase().includes(search.value.toLocaleLowerCase()),
			),
			error: data?.error ?? error?.message ?? null,
			isLoading,
			isValidating,
			mutate,
			timestamp: data?.timestamp,
		}),
		[data, error, isLoading, isValidating, mutate, search.value, status.value],
	);
}
