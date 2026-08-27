'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type ValidationAgencyItem, ValidationAgencyRequest } from '@tmlmobilidade/go-plans-pckg-types';
import { type ApiResponse, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseValidationsAgenciesReturnType {
	data: ValidationAgencyItem[]
	error: null | string
	ids: string[]
	isLoading: boolean
	options: SelectDataItem[]
	timestamp: null | UnixTimestamp
}

/**
 * Hook to fetch validation agencies data. Useful for supplying data
 * to filters or select components.
 * @returns An object containing the agencies data.
 */
export function useValidationsAgencies(query: ValidationAgencyRequest): UseValidationsAgenciesReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<ValidationAgencyItem[]>>([API_ROUTES.plans.VALIDATIONS_AGENCIES, query], {
		fetcher: async ([url, query]) => await fetchApiData<ValidationAgencyItem[]>({ body: query, method: 'POST', url }),
		refreshInterval: 10_000, // 10 seconds
	});

	//
	// C. Transform data

	const idsData = useMemo(() => {
		// Skip if no data is available
		if (!data?.data?.length) return [];
		// Map data to array of IDs
		return data.data.map(item => item._id);
	}, [data?.data]);

	const optionsData = useMemo(() => {
		// Skip if no data is available
		if (!data?.data?.length) return [];
		// Map data to SelectDataItem format
		return data.data.map((item): SelectDataItem => ({
			checked: false,
			disabled: false,
			label: `[${item._id}] ${item.code} - ${item.name}`,
			value: item._id,
		}));
	}, [data?.data]);

	//
	// D. Return value

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		ids: idsData,
		isLoading,
		options: optionsData,
		timestamp: data?.timestamp ?? null,
	}), [data?.data, error?.error, idsData, isLoading, isValidating, optionsData, data?.timestamp]);
};
