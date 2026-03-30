'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/types';
import { useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface UseVehicleLastEventGeoJsonState {
	data: {
		lastEvent: null | SimplifiedVehicleEvent | undefined
		lastEventGeoJson: GeoJSON.Feature<GeoJSON.Point> | undefined
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

export function useVehicleLastEventGeoJson(vehicleId: string): UseVehicleLastEventGeoJsonState {
	const shouldFetch = Boolean(vehicleId);

	const { data: fetchedLastEvent, error, isLoading } = useSWR<null | SimplifiedVehicleEvent, Error>(
		shouldFetch ? API_ROUTES.fleet.VEHICLES_DETAIL_LAST_EVENT(vehicleId) : null,
		{ refreshInterval: 5_000 },
	);

	const lastEventGeoJson = useMemo(() => {
		if (!fetchedLastEvent) return undefined;
		return transformVehicleLastEventIntoGeoJsonFeature(fetchedLastEvent);
	}, [fetchedLastEvent]);

	return useMemo(() => ({
		data: {
			lastEvent: fetchedLastEvent,
			lastEventGeoJson,
		},
		flags: {
			error,
			loading: isLoading,
		},
	}), [fetchedLastEvent, lastEventGeoJson, error, isLoading]);
}

/* * */

export function transformVehicleLastEventIntoGeoJsonFeature(vehiclePositionData: SimplifiedVehicleEvent): GeoJSON.Feature<GeoJSON.Point> {
	return {
		geometry: {
			coordinates: [vehiclePositionData.longitude, vehiclePositionData.latitude],
			type: 'Point',
		},
		id: vehiclePositionData.vehicle_id,
		properties: {
			agency_id: vehiclePositionData.agency_id,
			bearing: vehiclePositionData.bearing,
			id: vehiclePositionData.vehicle_id,
			lat: vehiclePositionData.latitude,
			lon: vehiclePositionData.longitude,
			trip_id: vehiclePositionData.trip_id,
		},
		type: 'Feature',
	};
}
