'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Organization } from '@tmlmobilidade/go-types-core';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useMeContext } from '../../../contexts';
import { fetchApiData } from '../../../fetch';

/* * */

interface UseSidebarHeaderLogoReturnType {
	data: null | Pick<Organization, 'logo_dark' | 'logo_light'>
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

	const meContext = useMeContext();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<Pick<Organization, 'logo_dark' | 'logo_light'>>>(meContext.data.user?.organization_id && API_ROUTES.auth.ORGANIZATIONS_DETAIL_IMAGE(meContext.data.user.organization_id), {
		fetcher: async (url: string) => await fetchApiData<Pick<Organization, 'logo_dark' | 'logo_light'>>({ url }),
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
