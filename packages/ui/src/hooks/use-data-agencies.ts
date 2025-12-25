'use client';

/* * */

import { type Agency } from '@tmlmobilidade/types';
import { useMemo } from 'react';
import useSWR from 'swr';

import { type SelectDataItem } from '../components/inputs/Select';
import { useMeContext } from '../contexts/Me.context';

/* * */

interface UseDataAgenciesProps {

	/**
	 * The action to filter agencies by permission.
	 */
	actions?: string[]

	/**
	 * The scope to filter agencies by permission.
	 */
	scope?: string

}

interface UseDataAgenciesReturnType {

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
 * Hook to determine if an item should be in read-only mode
 * based on user permissions and item state.
 * @param props The properties to determine read-only status.
 * @returns An object containing the isCanSave flag.
 */
export function useDataAgencies(apiUrl: string, props?: UseDataAgenciesProps): UseDataAgenciesReturnType {
	//

	//
	// A. Setup variables

	const meContext = useMeContext();

	//
	// B. Fetch data

	const { data: allAgenciesData, error: allAgenciesError, isLoading: allAgenciesLoading } = useSWR<Agency[], Error>(apiUrl && apiUrl);

	//
	// C. Transform data

	const filteredData = useMemo(() => {
		// Skip if no data is available
		if (!allAgenciesData?.length) return [];
		// Check if permissions are set
		if (!props?.actions?.length || !props?.scope) return allAgenciesData;
		// Filter agencies based on user permissions
		return allAgenciesData.filter((item) => {
			// This agency is included if at least one of the actions
			// for the given scope allows access to it
			return props.actions.some(action => meContext.actions.hasPermissionResource({
				action: action,
				resource_key: 'agency_ids',
				scope: props.scope,
				value: item._id,
			}));
		});
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
			label: `${item._id} - ${item.name}`,
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
