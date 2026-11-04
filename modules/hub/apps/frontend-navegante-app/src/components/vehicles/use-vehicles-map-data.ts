'use client';

import { useVehiclesData } from '@/components/vehicles/use-vehicles-data';
import { isVehicleIncludedInMap } from '@/utils/map/vehicle-visibility';
import { getBaseGeoJsonFeatureCollection, transformVehicleDataIntoGeoJsonFeature } from '@tmlmobilidade/geo';
import { type HubV1ApiVehiclePosition } from '@tmlmobilidade/go-types-hub';
import { type UnixMilliseconds } from '@tmlmobilidade/go-types-shared';
import { useMemo } from 'react';

/* * */

interface UseVehiclesMapDataReturnType {
	data: GeoJSON.FeatureCollection<GeoJSON.Point, HubV1ApiVehiclePosition>
	entities: HubV1ApiVehiclePosition[]
	error: null | string
	isLoading: boolean
	isValidating: boolean
	mutate: () => void
	timestamp: null | UnixMilliseconds
}

/* * */

function buildVehiclesFeatureCollection(vehicles: HubV1ApiVehiclePosition[]): GeoJSON.FeatureCollection<GeoJSON.Point, HubV1ApiVehiclePosition> {
	const collection = getBaseGeoJsonFeatureCollection<GeoJSON.Point, HubV1ApiVehiclePosition>();

	for (const vehicle of vehicles) {
		if (!isVehicleIncludedInMap(vehicle)) continue;
		collection.features.push(transformVehicleDataIntoGeoJsonFeature(vehicle));
	}

	return collection;
}

/* * */

export function useVehiclesMapData(): UseVehiclesMapDataReturnType {
	//

	//
	// A. Setup variables

	const { data: vehicles, error, isLoading, isValidating, mutate, timestamp } = useVehiclesData();

	//
	// B. Transform data

	const data = useMemo(() => buildVehiclesFeatureCollection(vehicles), [vehicles]);

	//
	// C. Return data

	return useMemo(() => ({
		data,
		entities: vehicles,
		error,
		isLoading,
		isValidating,
		mutate,
		timestamp,
	}), [data, error, isLoading, isValidating, mutate, timestamp, vehicles]);

	//
}
