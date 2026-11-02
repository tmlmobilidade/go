'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { getBaseGeoJsonFeatureCollection, transformVehicleDataIntoGeoJsonFeature } from '@tmlmobilidade/geo';
import { type HubV1ApiVehiclePosition } from '@tmlmobilidade/go-types-hub';
import { type ApiResponse, type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { fetchApiData, useMeData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseVehiclesPositionsDataReturnType {
	data: HubV1ApiVehiclePosition[]
	error: null | string
	geoJson: GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties> | undefined
	isLoading: boolean
	isValidating: boolean
	timestamp: null | UnixMilliseconds
}

/**
 * Hook to fetch live vehicle positions for the fleet map.
 */
export function useVehiclesPositionsData(): UseVehiclesPositionsDataReturnType {
	//

	//
	// A. Setup variables

	const { data: meData } = useMeData();

	//
	// B. Fetch data

	const { data, error, isLoading, isValidating } = useSWR<ApiResponse<HubV1ApiVehiclePosition[]>>(meData?.organization_id ? API_ROUTES.hub.VEHICLES_POSITIONS(meData.organization_id) : null, {
		fetcher: async (url: string) => await fetchApiData<HubV1ApiVehiclePosition[]>({ credentials: 'omit', url }),
		refreshInterval: 5_000,
	});

	//
	// C. Transform data

	const geoJson = useMemo(() => {
		const collection = getBaseGeoJsonFeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>();
		data?.data?.forEach(position => collection.features.push(transformVehicleDataIntoGeoJsonFeature(position)));
		return collection;
	}, [data?.data]);

	//
	// D. Return value

	return useMemo(() => ({
		data: data?.data,
		error: error?.error,
		geoJson,
		isLoading,
		isValidating,
		timestamp: data?.timestamp ?? null,
	}), [data?.data, data?.timestamp, error?.error, geoJson, isLoading, isValidating]);
};
