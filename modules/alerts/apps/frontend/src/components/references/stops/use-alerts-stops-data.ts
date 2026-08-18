'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type AlertsStopsFilters, type AlertsStopsItem } from '@tmlmobilidade/go-alerts-pckg-types';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchDataNew } from '@tmlmobilidade/utils';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useReferencesEditorContext } from '../shared/ReferencesEditor.context';

/* * */

interface UseAlertsStopsDataReturnType {
	data: AlertsStopsItem[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	timestamp: null | UnixTimestamp
}

/* * */

export function useAlertsStopsData(): UseAlertsStopsDataReturnType {
	//

	//
	// A. Setup variables

	const referencesEditorContext = useReferencesEditorContext();

	//
	// B. Transform data

	const query = useMemo<AlertsStopsFilters>(() => ({
		agency_id: referencesEditorContext.data.selected_agency_id,
		start_time_scheduled_end: referencesEditorContext.data.active_period_end_date,
		start_time_scheduled_start: referencesEditorContext.data.active_period_start_date,
	}), [referencesEditorContext.data.active_period_end_date, referencesEditorContext.data.active_period_start_date, referencesEditorContext.data.selected_agency_id]);

	//
	// C. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<AlertsStopsItem[]>>([API_ROUTES.alerts.OPERATION_STOPS, query], {
		fetcher: async ([url, query]) => await fetchDataNew<AlertsStopsItem[]>(url, 'POST', query),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// D. Return data

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		isLoading,
		isValidating,
		timestamp: data?.timestamp,
	}), [data, error, isLoading, isValidating]);
};
