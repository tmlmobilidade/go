'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type SidebarLogoPlatformResponse } from '@tmlmobilidade/go-types-platform';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useLayoutContext } from '../../../contexts';
import { fetchApiData } from '../../../fetch';

/* * */

interface UseSidebarHeaderLogoReturnType {
	data: null | SidebarLogoPlatformResponse
	error: null | string
	isLoading: boolean
	isValidating: boolean
	timestamp: null | UnixTimestamp
}

/* * */

export function useSidebarHeaderLogo(): UseSidebarHeaderLogoReturnType {
	//

	//
	// A. Setup variables

	const layoutContext = useLayoutContext();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<SidebarLogoPlatformResponse>>([API_ROUTES.core.PLATFORM_SIDEBAR_LOGO, layoutContext.data.active_theme], {
		fetcher: async ([url, themeMode]) => await fetchApiData<SidebarLogoPlatformResponse>({ body: { theme_mode: themeMode }, method: 'POST', url }),
	});

	//
	// C. Return data

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		isLoading,
		isValidating,
		mutate,
		timestamp: data?.timestamp,
	}), [data, error, isLoading, isValidating, mutate]);
};
