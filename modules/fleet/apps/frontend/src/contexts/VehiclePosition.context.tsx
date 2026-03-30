'use client';

/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface VehiclePositionData {
	agency_id: string
	bearing: number
	created_at: number
	latitude: number
	longitude: number
	trip_id: string
	vehicle_id: string
}

interface VehiclePositionContextState {
	data: {
		vehiclePosition: VehiclePositionData[]
		vehiclePositionGeoJson: GeoJSON.FeatureCollection<GeoJSON.Point> | undefined
	}
	flags: {
		error: Error | undefined
		loading: boolean
	}
}

/* * */

const VehiclePositionContext = createContext<undefined | VehiclePositionContextState>(undefined);

export function useVehiclePositionContext() {
	const context = useContext(VehiclePositionContext);
	if (!context) {
		throw new Error('useVehiclePositionContext must be used within a VehiclePositionContextProvider');
	}
	return context;
}

/* * */

export const VehiclePositionContextProvider = ({ children }: PropsWithChildren) => {
	const { data: fetchedVehiclePositionData, error, isLoading } = useSWR<VehiclePositionData[], Error>(API_ROUTES.fleet.VEHICLES_POSITIONS, { refreshInterval: 5_000 });

	const vehiclesGeoJsonFeatureCollection: GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties> | undefined = useMemo(() => {
		const collection = getBaseGeoJsonFeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>();
		fetchedVehiclePositionData?.forEach(vehicle => collection.features.push(TransformVehicleDataIntoGeoJsonFeature(vehicle)));
		return collection;
	}, [fetchedVehiclePositionData]);

	const contextValue: VehiclePositionContextState = useMemo(() => {
		return {
			data: {
				vehiclePosition: fetchedVehiclePositionData,
				vehiclePositionGeoJson: vehiclesGeoJsonFeatureCollection,
			},
			flags: {
				error,
				loading: isLoading,
			},
		};
	}, [fetchedVehiclePositionData, vehiclesGeoJsonFeatureCollection, error, isLoading]);

	return (
		<VehiclePositionContext.Provider value={contextValue}>
			{children}
		</VehiclePositionContext.Provider>
	);
};

/* * */

export function TransformVehicleDataIntoGeoJsonFeature(vehiclePositionData: VehiclePositionData): GeoJSON.Feature<GeoJSON.Point> {
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
