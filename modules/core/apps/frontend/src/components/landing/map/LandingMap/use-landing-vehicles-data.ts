'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { getBaseGeoJsonFeatureCollection, transformVehicleDataIntoGeoJsonFeature } from '@tmlmobilidade/geo';
import { type HubV1ApiVehiclePosition } from '@tmlmobilidade/go-types-hub';
import { type ApiResponse } from '@tmlmobilidade/go-types-shared';
import { fetchApiData } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

const LANDING_ORGANIZATION_ID = 'Y4FLB';

/* * */

export function useLandingVehiclesData() {
	//

	//
	// A. Fetch data

	const { data } = useSWR<ApiResponse<HubV1ApiVehiclePosition[]>>(API_ROUTES.hub.VEHICLES_POSITIONS(LANDING_ORGANIZATION_ID), {
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

	return useMemo(() => ({ data: data?.data ?? [], geoJson }), [data?.data, geoJson]);

	//
}
