'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Attachment } from '@tmlmobilidade/go-types-core';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useAlertsDetailAlertId } from './use-alerts-detail-alert-id';

/* * */

interface UseAlertsDetailFileDataReturnType {
	data: Attachment
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: (newData?: ApiResponse<Attachment>) => void
	timestamp: null | UnixMilliseconds
}

/* * */

export function useAlertsDetailFileData(): UseAlertsDetailFileDataReturnType {
	//

	//
	// A. Setup variables

	const { alertId } = useAlertsDetailAlertId();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating, mutate } = useSWR(alertId && API_ROUTES.operation.ALERTS_DETAIL_IMAGE(alertId), {
		fetcher: async (url: string) => await fetchApiData<Attachment>({ url }),
		refreshInterval: 30_000, // 30 seconds
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
