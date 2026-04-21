'use client';

/* * */

import { getBaseGeoJsonFeatureCollection, transformVehicleDataIntoGeoJsonFeature } from '@tmlmobilidade/geo';
import { SimplifiedVehicleEvent, Vehicle } from '@tmlmobilidade/types';
import { standardSwrFetcher } from '@tmlmobilidade/utils';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

interface VehiclePositionContextState {
	data: {
		vehiclePositionGeoJson: GeoJSON.FeatureCollection<GeoJSON.Point> | undefined
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const VehiclePositionContext = createContext<undefined | VehiclePositionContextState>(undefined);

function getArrayPayload<T>(value: unknown): T[] {
	if (Array.isArray(value)) return value as T[];
	if (value && typeof value === 'object' && 'data' in value) {
		const nestedData = value.data;
		if (Array.isArray(nestedData)) return nestedData as T[];
		if (nestedData && typeof nestedData === 'object' && 'data' in nestedData && Array.isArray(nestedData.data)) {
			return nestedData.data as T[];
		}
	}
	return [];
}

export function useVehiclePositionContext() {
	const context = useContext(VehiclePositionContext);
	if (!context) {
		throw new Error('useVehiclePositionContext must be used within a VehiclePositionContextProvider');
	}
	return context;
}

/* * */

export const VehiclePositionContextProvider = ({ children }: PropsWithChildren) => {
	const { data: vehicleDataResponse } = useSWR<unknown, Error>(
		'https://go.tmlmobilidade.pt/fleet/api/vehicles',
		standardSwrFetcher,
		{ refreshInterval: 5000 },
	);
	const { data: vehiclePositionsResponse, error, isLoading } = useSWR<unknown, Error>(
		'https://go.tmlmobilidade.pt/fleet/api/vehicles/positions',
		standardSwrFetcher,
		{ refreshInterval: 5000 },
	);

	const vehicleData = useMemo(() => getArrayPayload<Vehicle>(vehicleDataResponse), [vehicleDataResponse]);
	const fetchedVehiclePositionData = useMemo(() => getArrayPayload<SimplifiedVehicleEvent>(vehiclePositionsResponse), [vehiclePositionsResponse]);

	const vehiclesGeoJsonFeatureCollection: GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties> | undefined = useMemo(() => {
		//
		// Initialize the GeoJSON feature collection
		const collection = getBaseGeoJsonFeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>();

		//
		// Transform vehicle position data into GeoJSON feature collection
		fetchedVehiclePositionData.forEach(vehicle =>
			collection.features.push(
				transformVehicleDataIntoGeoJsonFeature(
					vehicle,
					vehicleData?.find(v => v._id === vehicle.vehicle_id && v.agency_id === vehicle.agency_id),
				),
			),
		);

		// Return the GeoJSON feature collection
		return collection;
	}, [fetchedVehiclePositionData, vehicleData]);

	const contextValue: VehiclePositionContextState = useMemo(() => {
		return {
			data: {
				vehiclePositionGeoJson: vehiclesGeoJsonFeatureCollection,
			},
			flags: {
				error,
				loading: isLoading,
			},
		};
	}, [vehiclesGeoJsonFeatureCollection, error, isLoading]);

	return (
		<VehiclePositionContext.Provider value={contextValue}>
			{children}
		</VehiclePositionContext.Provider>
	);
};
