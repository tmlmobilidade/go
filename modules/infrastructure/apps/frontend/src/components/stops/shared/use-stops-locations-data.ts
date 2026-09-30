'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type StopsLocationRequest, type StopsLocationResponse } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, type SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';

/* * */

type Slot = keyof StopsLocationResponse;

interface UseStopsLocationsDataReturnType {
	data: StopsLocationResponse | undefined
	error: null | string
	/** Per slot, the OSM ids (as strings) of every division the user can access. */
	ids: Record<Slot, string[]>
	isLoading: boolean
	/** Per slot, the divisions as select options, labelled `[osm_id] name`. */
	options: Record<Slot, SelectDataItem[]>
	timestamp: null | UnixMilliseconds
}

const SLOTS: Slot[] = ['neighbourhood', 'primary', 'secondary', 'tertiary'];

/**
 * Hook to fetch, per location slot, the divisions that have at least one stop
 * the user has access to for the given permissions. Useful for supplying data
 * to filters or select components.
 * @param request The permissions registry to filter the locations by.
 * @returns An object containing the locations data.
 */
export function useStopsLocationsData(request: StopsLocationRequest): UseStopsLocationsDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading } = useSWRImmutable<ApiResponse<StopsLocationResponse>>([API_ROUTES.infrastructure.STOPS_LIST_LOCATIONS, request], {
		fetcher: async ([url, request]: [string, StopsLocationRequest]) => await fetchApiData<StopsLocationResponse>({ body: request, method: 'POST', url }),
	});

	//
	// B. Transform data

	const ids = useMemo(() => Object.fromEntries(SLOTS.map(slot => [slot, data?.data?.[slot].map(item => String(item.osm_id)) ?? []])) as Record<Slot, string[]>, [data?.data]);

	const options = useMemo(() => Object.fromEntries(SLOTS.map(slot => [slot, data?.data?.[slot].map((item): SelectDataItem => ({
		checked: false,
		disabled: false,
		label: item.name,
		value: String(item.osm_id),
	})) ?? []])) as Record<Slot, SelectDataItem[]>, [data?.data]);

	//
	// C. Return data

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		ids,
		isLoading,
		options,
		timestamp: data?.timestamp ?? null,
	}), [data?.data, error?.error, ids, options, isLoading, data?.timestamp]);
};
