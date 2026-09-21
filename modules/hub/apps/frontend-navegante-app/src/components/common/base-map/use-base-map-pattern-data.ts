'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type HubV1ApiPattern } from '@tmlmobilidade/go-types-hub';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseBaseMapPatternDataReturnType {
	data: HubV1ApiPattern[] | null | undefined
	error: string | undefined
	isLoading: boolean
}

/**
 * Fetches the pattern groups of the pattern focused on the base map, if any.
 * @param patternId The focused pattern ID, or null when nothing is focused.
 */
export function useBaseMapPatternData(patternId: null | string): UseBaseMapPatternDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading } = useSWR<ApiResponse<HubV1ApiPattern[]>>(patternId && API_ROUTES.hub.NETWORK_PATTERNS(patternId), {
		fetcher: (url: string) => fetchApiData<HubV1ApiPattern[]>({ credentials: 'omit', url }),
	});

	//
	// B. Return data

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		isLoading,
	}), [data?.data, error, isLoading]);
}
