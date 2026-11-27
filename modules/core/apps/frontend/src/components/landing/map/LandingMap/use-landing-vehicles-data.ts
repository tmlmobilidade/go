'use client';

import { getBaseGeoJsonFeatureCollection, transformVehicleDataIntoGeoJsonFeature } from '@tmlmobilidade/geo';
import { type HubV1ApiVehiclePosition } from '@tmlmobilidade/go-types-hub';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

const LANDING_VEHICLES_URL = 'https://go.tmlmobilidade.pt/hub/api/v1/WORLD/vehicles/positions';

/* * */

export function useLandingVehiclesData() {
	//

	//
	// A. Fetch data

	const { data, isLoading } = useSWR<ApiResponse<HubV1ApiVehiclePosition[]>>(LANDING_VEHICLES_URL, {
		fetcher: async (url: string) => await fetchApiData<HubV1ApiVehiclePosition[]>({ credentials: 'omit', url }),
		refreshInterval: 5_000,
	});

	//
	// B. Transform data

	const geoJson = useMemo(() => {
		const collection = getBaseGeoJsonFeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>();
		data?.data?.forEach(position => collection.features.push(transformVehicleDataIntoGeoJsonFeature(position)));
		return collection;
	}, [data?.data]);

	//
	// C. Return value

	return useMemo(() => ({ data: data?.data ?? [], geoJson, isLoading }), [data?.data, geoJson, isLoading]);

	//
}
