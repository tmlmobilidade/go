'use client';

import { type Agency } from '@tmlmobilidade/go-types-core';
import { ActionsOf, Permission } from '@tmlmobilidade/go-types-permissions';
import { useMemo } from 'react';
import useSWR from 'swr';

import { type SelectDataItem } from '../../components/inputs/Select';
import { useMeContext } from '../../contexts/Me.context';

/* * */

interface UseAgenciesDataProps<S extends Permission['scope']> {
	actions?: ActionsOf<S>[]
	scope?: S
}

/* * */

interface UseAgenciesDataReturnType {

	/**
	 * The error encountered while fetching data, if any.
	 */
	error: Error | undefined

	/**
	 * The raw agencies data.
	 */
	filtered: Agency[]

	/**
	 * The IDs of the filtered agencies.
	 */
	filteredIds: string[]

	/**
	 * Indicates if the data is still loading.
	 */
	isLoading: boolean

	/**
	 * The agencies data formatted for select inputs.
	 */
	options: SelectDataItem[]

	/**
	 * The raw agencies data.
	 */
	raw: Agency[]

}

/**
 * Hook to fetch agencies data. Useful for supplying data
 * to filters or select components.
 * @param apiUrl The API URL to fetch the agencies data.
 * @param props The properties to filter the agencies data.
 * @returns An object containing the agencies data.
 */
export function useAgenciesData<S extends Permission['scope']>(apiUrl: string, props?: UseAgenciesDataProps<S>): UseAgenciesDataReturnType {
	//

	//
	// A. Transform data

	const query = useMemo<AgenciesListFilters>(() => ({
		active_period_end: filterActivePeriod.value_end,
		active_period_start: filterActivePeriod.value_start,
		agency_ids: filterAgency.value,
		causes: filterCause.value,
		effects: filterEffect.value,
		publish_date_end: filterPublishDate.value_end,
		publish_date_start: filterPublishDate.value_start,
		publish_status: filterPublishStatus.value,
		reference_type: filterReferenceType.value,
		search: filterSearch.value,
	}), [filterAgency.value, filterPublishStatus.value, filterReferenceType.value, filterCause.value, filterEffect.value, filterSearch.value, filterActivePeriod.value_end, filterActivePeriod.value_start, filterPublishDate.value_end, filterPublishDate.value_start]);

	//
	// B. Fetch data

	const { data: allAgenciesData, error: allAgenciesError, isLoading: allAgenciesLoading } = useSWR<Agency[], Error>(apiUrl && apiUrl);

	//
	// C. Transform data

	const filteredData = useMemo(() => {
		// Skip if no data is available
		if (!allAgenciesData?.length) return [];
		// Check if permissions are set
		if (!props?.actions || !props?.scope) return allAgenciesData;
		// Map data to SelectDataItem format
		return allAgenciesData
			.filter(item => props.actions.some(action => meContext.actions.hasPermissionResource({
				action,
				resource_key: 'agency_ids',
				scope: props.scope,
				value: item._id,
			})))
			.sort((a, b) => Number(a._id) - Number(b._id));
	}, [allAgenciesData, props?.actions, props?.scope]);

	const filteredIds = useMemo(() => {
		// Skip if no data is available
		if (!filteredData?.length) return [];
		// Keep only the IDs of the filtered data
		return filteredData.map(item => item._id);
	}, [filteredData]);

	const optionsData = useMemo(() => {
		// Skip if no data is available
		if (!filteredData?.length) return [];
		// Map data to SelectDataItem format
		return filteredData.map((item): SelectDataItem => ({
			checked: false,
			disabled: false,
			label: `[${item._id}] ${item.code} - ${item.name}`,
			value: item._id,
		}));
	}, [filteredData]);

	//
	// D. Return value

	return {
		error: allAgenciesError,
		filtered: filteredData,
		filteredIds: filteredIds,
		isLoading: allAgenciesLoading,
		options: optionsData,
		raw: allAgenciesData ?? [],
	};

	//
};
