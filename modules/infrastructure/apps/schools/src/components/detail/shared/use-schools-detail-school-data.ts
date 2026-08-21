'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Alert } from '@tmlmobilidade/go-types-operation';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useSchoolsDetailSchoolId } from './use-schools-detail-school-id';

/* * */

interface UseSchoolsDetailSchoolDataReturnType {
	data: Alert
	error: null | string
	isLoading: boolean
	isValidating: boolean
	timestamp: null | UnixTimestamp
}

/* * */

export function useSchoolsDetailSchoolData(): UseSchoolsDetailSchoolDataReturnType {
	//

	//
	// A. Setup variables

	const { schoolId } = useSchoolsDetailSchoolId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<Alert>>(schoolId && API_ROUTES.operation.SCHOOLS_DETAIL(schoolId), {
		fetcher: async (url: string) => await fetchApiData<Alert>({ url }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// C. Return data

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		isLoading,
		isValidating,
		timestamp: data?.timestamp,
	}), [data, error, isLoading, isValidating]);
};
