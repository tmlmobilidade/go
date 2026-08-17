'use client';

import { useAlertsListFilterAcceptanceStatus } from '@/components/rides/list/filters/AlertsListFilterAcceptanceStatus/use-rides-list-filter-acceptance-status';
import { useAlertsListFilterAgency } from '@/components/rides/list/filters/AlertsListFilterAgency/use-rides-list-filter-agency';
import { useAlertsListFilterAnalysisAtLeastOneVehicleEventOnLastStop } from '@/components/rides/list/filters/AlertsListFilterAnalysisAtLeastOneVehicleEventOnLastStop/use-rides-list-filter-analysis-at-least-one-vehicle-event-on-last-stop';
import { useAlertsListFilterAnalysisExpectedApexValidationInterval } from '@/components/rides/list/filters/AlertsListFilterAnalysisExpectedApexValidationInterval/use-rides-list-filter-analysis-expected-apex-validation-interval';
import { useAlertsListFilterAnalysisSimpleThreeEvents } from '@/components/rides/list/filters/AlertsListFilterAnalysisSimpleThreeEvents/use-rides-list-filter-analysis-simple-three-events';
import { useAlertsListFilterAnalysisTransactionSequentiality } from '@/components/rides/list/filters/AlertsListFilterAnalysisTransactionSequentiality/use-rides-list-filter-analysis-transaction-sequentiality';
import { useAlertsListFilterDateRange } from '@/components/rides/list/filters/AlertsListFilterDateRange/use-rides-list-filter-date-range';
import { useAlertsListFilterDriver } from '@/components/rides/list/filters/AlertsListFilterDriver/use-rides-list-filter-driver';
import { useAlertsListFilterEndDelayStatus } from '@/components/rides/list/filters/AlertsListFilterEndDelayStatus/use-rides-list-filter-end-delay-status';
import { useAlertsListFilterOperationalStatus } from '@/components/rides/list/filters/AlertsListFilterOperationalStatus/use-rides-list-filter-operational-status';
import { useAlertsListFilterStartDelayStatus } from '@/components/rides/list/filters/AlertsListFilterStartDelayStatus/use-rides-list-filter-start-delay-status';
import { useAlertsListFilterTicketingStatus } from '@/components/rides/list/filters/AlertsListFilterTicketingStatus/use-rides-list-filter-ticketing-status';
import { useAlertsListFilterVehicle } from '@/components/rides/list/filters/AlertsListFilterVehicle/use-rides-list-filter-vehicle';
import { useAlertsListFilterSearch } from '@/components/rides/list/shared/AlertsListHeader/use-rides-list-filter-search';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { AlertsListFilters, AlertsListItem } from '@tmlmobilidade/go-alerts-pckg-types';
import { type ControllerAlertsListFilters, type ControllerAlertsListItem } from '@tmlmobilidade/go-controller-pckg-types';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchDataNew } from '@tmlmobilidade/utils';
import { useMemo } from 'react';
import useSWR from 'swr';

import { useAlertsListFilterCause } from '../filters/AlertsListFilterCause/use-alerts-list-filter-cause';
import { useAlertsListFilterEffect } from '../filters/AlertsListFilterEffect/use-alerts-list-filter-effect';
import { useAlertsListFilterPublishStatus } from '../filters/AlertsListFilterPublishStatus/use-alerts-list-filter-publish-status';
import { useAlertsListFilterReferenceType } from '../filters/AlertsListFilterReferenceType/use-alerts-list-filter-reference-type';

/* * */

interface UseAlertsListDataReturnType {
	data: AlertsListItem[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	timestamp: null | UnixTimestamp
}

/* * */

export function useAlertsListData(): UseAlertsListDataReturnType {
	//

	//
	// A. Setup variables

	const filterReferenceType = useAlertsListFilterReferenceType();
	const filterPublishStatus = useAlertsListFilterPublishStatus();
	const filterCause = useAlertsListFilterCause();
	const filterEffect = useAlertsListFilterEffect();
	const filterAgency = useAlertsListFilterAgency();
	const filterSearch = useAlertsListFilterSearch();

	//
	// B. Transform data

	const query = useMemo<AlertsListFilters>(() => ({
		agency_ids: filterAgency.value,
		cause: filterCause.value,
		effect: filterEffect.value,
		publish_status: filterPublishStatus.value,
		reference_type: filterReferenceType.value,
		search: filterSearch.value,
	}), [filterAgency.value, filterPublishStatus.value, filterReferenceType.value, filterCause.value, filterEffect.value, filterSearch.value]);

	//
	// C. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<ControllerAlertsListItem[]>>([API_ROUTES.controller.RIDES_LIST, query], {
		fetcher: async ([url, query]) => await fetchDataNew<ControllerAlertsListItem[]>(url, 'POST', query),
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
