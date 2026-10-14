'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type HubV1ApiPattern } from '@tmlmobilidade/go-types-hub';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseVehiclePatternDataReturnType {
	data: HubV1ApiPattern[] | undefined
	error: null | string
	isLoading: boolean
}

/* * */

export function useVehiclePatternData(patternId: null | string | undefined): UseVehiclePatternDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading } = useSWR<ApiResponse<HubV1ApiPattern[]>>(patternId ? API_ROUTES.hub.NETWORK_PATTERNS(patternId) : null, {
		fetcher: async url => await fetchApiData<HubV1ApiPattern[]>({ options: { credentials: 'omit' }, url }),
	});

	//
	// B. Return data

	return useMemo(() => ({
		data: data?.data,
		error: error?.error ?? null,
		isLoading,
	}), [data?.data, error?.error, isLoading]);

	//
}
