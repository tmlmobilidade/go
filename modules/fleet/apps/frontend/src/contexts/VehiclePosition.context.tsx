'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { getBaseGeoJsonFeatureCollection, transformVehicleDataIntoGeoJsonFeature } from '@tmlmobilidade/geo';
import { type HubVehiclePosition } from '@tmlmobilidade/go-types-public-info';
import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface VehiclePositionContextState {
	data: {
		vehiclePosition: HubVehiclePosition[]
		vehiclePositionGeoJson: GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties> | undefined
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
	const { data: fetchedVehiclePositionData, error, isLoading } = useSWR<HubVehiclePosition[], Error>({ credentials: 'omit', url: API_ROUTES.hub.REALTIME_VEHICLES_POSITIONS }, { refreshInterval: 5_000 });

	const vehiclesGeoJsonFeatureCollection: GeoJSON.FeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties> | undefined = useMemo(() => {
		const collection = getBaseGeoJsonFeatureCollection<GeoJSON.Point, GeoJSON.GeoJsonProperties>();
		fetchedVehiclePositionData?.forEach(position => collection.features.push(transformVehicleDataIntoGeoJsonFeature(position)));
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
	}, [error, fetchedVehiclePositionData, isLoading, vehiclesGeoJsonFeatureCollection]);

	return (
		<VehiclePositionContext.Provider value={contextValue}>
			{children}
		</VehiclePositionContext.Provider>
	);
};
