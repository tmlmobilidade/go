'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type StopsLocationRequest, type StopsLocationResponse } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { District, Locality, Municipality, Parish } from '@tmlmobilidade/go-types-locations';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface StopsLocationsDataReturnType {
	data: StopsLocationResponse
	districtIds: string[]
	districtMap: Map<string, District>
	districtOptions: SelectDataItem[]
	error: null | string
	isLoading: boolean
	localityIds: string[]
	localityMap: Map<string, Locality>
	localityOptions: SelectDataItem[]
	municipalityIds: string[]
	municipalityMap: Map<string, Municipality>
	municipalityOptions: SelectDataItem[]
	parishIds: string[]
	parishMap: Map<string, Parish>
	parishOptions: SelectDataItem[]
	timestamp: null | UnixMilliseconds
}

/**
 * Hook to fetch municipalities data. Useful for supplying data
 * to filters or select components.
 * @returns An object containing the municipalities data.
 */
export function useStopsLocationsData(request: StopsLocationRequest): StopsLocationsDataReturnType {
	//

	//
	// A. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<StopsLocationResponse>>([API_ROUTES.infrastructure.STOPS_LIST_LOCATIONS, request], {
		fetcher: async ([url, request]) => await fetchApiData<StopsLocationResponse>({ body: request, method: 'POST', url: url }),
		refreshInterval: 600_000, // 10 minutes
	});

	//
	// C. Transform data

	const districtIdsData = useMemo(() => {
		// Skip if no data is available
		if (!data?.data?.districts?.length) return [];
		// Map data to array of IDs
		return data.data.districts.map(item => item._id);
	}, [data?.data?.districts]);

	const districtOptionsData = useMemo(() => {
		// Skip if no data is available
		if (!data?.data?.districts?.length) return [];
		// Map data to SelectDataItem format
		return data.data.districts.map((item): SelectDataItem => ({
			checked: false,
			disabled: false,
			label: `[${item._id}] ${item.name}`,
			value: item._id,
		}));
	}, [data?.data?.districts]);

	const districtMapData = useMemo(() => {
		return new Map(data?.data?.districts.map(item => [item._id, item]));
	}, [data?.data?.districts]);

	const municipalityIdsData = useMemo(() => {
		// Skip if no data is available
		if (!data?.data?.municipalities?.length) return [];
		// Map data to array of IDs
		return data.data.municipalities.map(item => item._id);
	}, [data?.data?.municipalities]);

	const municipalityOptionsData = useMemo(() => {
		// Skip if no data is available
		if (!data?.data?.municipalities?.length) return [];
		// Map data to SelectDataItem format
		return data.data.municipalities.map((item): SelectDataItem => ({
			checked: false,
			disabled: false,
			label: `[${item._id}] ${item.name}`,
			value: item._id,
		}));
	}, [data?.data?.municipalities]);

	const municipalityMapData = useMemo(() => {
		return new Map(data?.data?.municipalities.map(item => [item._id, item]));
	}, [data?.data?.municipalities]);

	const parishIdsData = useMemo(() => {
		// Skip if no data is available
		if (!data?.data?.parishes?.length) return [];
		// Map data to array of IDs
		return data.data.parishes.map(item => item._id);
	}, [data?.data?.parishes]);

	const parishOptionsData = useMemo(() => {
		// Skip if no data is available
		if (!data?.data?.parishes?.length) return [];
		// Map data to SelectDataItem format
		return data.data.parishes.map((item): SelectDataItem => ({
			checked: false,
			disabled: false,
			label: `[${item._id}] ${item.name}`,
			value: item._id,
		}));
	}, [data?.data?.parishes]);

	const parishMapData = useMemo(() => {
		return new Map(data?.data?.parishes.map(item => [item._id, item]));
	}, [data?.data?.parishes]);

	const localityIdsData = useMemo(() => {
		// Skip if no data is available
		if (!data?.data?.localities?.length) return [];
		// Map data to array of IDs
		return data.data.localities.map(item => item._id);
	}, [data?.data?.localities]);

	const localityOptionsData = useMemo(() => {
		// Skip if no data is available
		if (!data?.data?.localities?.length) return [];
		// Map data to SelectDataItem format
		return data.data.localities.map((item): SelectDataItem => ({
			checked: false,
			disabled: false,
			label: `[${item._id}] ${item.name}`,
			value: item._id,
		}));
	}, [data?.data?.localities]);

	const localityMapData = useMemo(() => {
		return new Map(data?.data?.localities.map(item => [item._id, item]));
	}, [data?.data?.localities]);

	//
	// D. Return value

	return useMemo(() => ({
		data: data?.data,
		districtIds: districtIdsData,
		districtMap: districtMapData,
		districtOptions: districtOptionsData,
		error: error?.error,
		isLoading,
		localityIds: localityIdsData,
		localityMap: localityMapData,
		localityOptions: localityOptionsData,
		municipalityIds: municipalityIdsData,
		municipalityMap: municipalityMapData,
		municipalityOptions: municipalityOptionsData,
		parishIds: parishIdsData,
		parishMap: parishMapData,
		parishOptions: parishOptionsData,
		timestamp: data?.timestamp ?? null,
	}), [data?.data, error?.error, districtIdsData, districtMapData, districtOptionsData, municipalityIdsData, municipalityMapData, municipalityOptionsData, parishIdsData, parishMapData, parishOptionsData, localityIdsData, localityMapData, localityOptionsData, isLoading, isValidating, data?.timestamp]);
};
