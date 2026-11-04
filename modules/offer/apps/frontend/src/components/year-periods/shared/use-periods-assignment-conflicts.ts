'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type YearPeriodsConflictsRequest, type YearPeriodsConflictsResponse, YearPeriodsConflictsResponseSchema } from '@tmlmobilidade/go-offer-pckg-types';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UsePeriodsAssignmentConflictsReturnType {
	data: null | YearPeriodsConflictsResponse
	error: null | string
	isLoading: boolean
	queryKey: null | string
}

/* * */

export function usePeriodsAssignmentConflicts(request: null | YearPeriodsConflictsRequest): UsePeriodsAssignmentConflictsReturnType {
	//

	//
	// A. Fetch conflicts for this exact assignment

	const queryKey = request ? JSON.stringify(request) : null;
	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<YearPeriodsConflictsResponse>>(request ? [API_ROUTES.offer.YEAR_PERIODS_CHECK_CONFLICTS, request] : null, {
		fetcher: async ([url, body]: [string, YearPeriodsConflictsRequest]) => await fetchApiData<YearPeriodsConflictsResponse>({ body, method: 'POST', url }),
		keepPreviousData: false,
		revalidateOnFocus: false,
	});
	const validated = data?.data ? YearPeriodsConflictsResponseSchema.safeParse(data.data) : null;

	//
	// B. Return only a validated result for the current key

	return useMemo(() => ({
		data: validated?.success ? validated.data : null,
		error: data?.error ?? error?.message ?? (data && !validated?.success ? 'Invalid conflict response' : null),
		isLoading: isLoading || isValidating,
		queryKey,
	}), [data, error, isLoading, isValidating, queryKey, validated]);
}
