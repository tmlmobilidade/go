'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Alert } from '@tmlmobilidade/go-types-operation';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useAlertsDetailAlertId } from './use-alerts-detail-alert-id';

/* * */

interface UseAlertsDetailDataReturnType {
	data: Alert
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: (newData?: ApiResponse<Alert>) => void
	timestamp: null | UnixTimestamp
}

/* * */

export function useAlertsDetailData(): UseAlertsDetailDataReturnType {
	//

	//
	// A. Setup variables

	const { alertId } = useAlertsDetailAlertId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR<ApiResponse<Alert>>(alertId && API_ROUTES.alerts.ALERTS_DETAIL(alertId), {
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
		mutate,
		timestamp: data?.timestamp,
	}), [data, error, isLoading, isValidating]);
};
