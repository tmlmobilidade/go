'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type AlertsLinesFilters, type AlertsLinesItem } from '@tmlmobilidade/go-alerts-pckg-types';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchDataNew } from '@tmlmobilidade/utils';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useReferencesEditorContext } from '../shared/ReferencesEditor.context';

/* * */

interface UseAlertsLinesDataReturnType {
	data: AlertsLinesItem[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	timestamp: null | UnixTimestamp
}

/* * */

export function useAlertsLinesData(): UseAlertsLinesDataReturnType {
	//

	//
	// A. Setup variables

	const referencesEditorContext = useReferencesEditorContext();

	//
	// B. Transform data

	const query = useMemo<AlertsLinesFilters>(() => ({
		agency_id: referencesEditorContext.data.selected_agency_id,
		start_time_scheduled_end: referencesEditorContext.data.active_period_end_date,
		start_time_scheduled_start: referencesEditorContext.data.active_period_start_date,
	}), [referencesEditorContext.data.active_period_end_date, referencesEditorContext.data.active_period_start_date, referencesEditorContext.data.selected_agency_id]);

	//
	// C. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<AlertsLinesItem[]>>([API_ROUTES.alerts.ALERTS_LIST, query], {
		fetcher: async ([url, query]) => await fetchDataNew<AlertsLinesItem[]>(url, 'POST', query),
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
