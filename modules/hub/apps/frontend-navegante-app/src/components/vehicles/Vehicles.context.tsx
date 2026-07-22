'use client';

import { API_ROUTES } from '@tmlmobilidade/consts';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { type HubVehiclePosition } from '@tmlmobilidade/go-types-public-info';
import { createContext, type PropsWithChildren, useCallback, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface VehiclesContextState {
	actions: {
		getVehicleById: (vehicleId: string) => HubVehiclePosition | undefined
		getVehicleByIdGeoJsonFC: (vehicleId: string) => GeoJSON.FeatureCollection | undefined
		getVehiclesByLineId: (lineId: string) => HubVehiclePosition[]
		getVehiclesByLineIdGeoJsonFC: (lineId: string) => GeoJSON.FeatureCollection | undefined
		getVehiclesByPatternId: (patternId: string) => HubVehiclePosition[]
		getVehiclesByPatternIdGeoJsonFC: (patternId: string) => GeoJSON.FeatureCollection | undefined
		getVehiclesByTripId: (tripId: string) => HubVehiclePosition[]
		getVehiclesByTripIdGeoJsonFC: (tripId: string) => GeoJSON.FeatureCollection | undefined
	}
	data: {
		fc: GeoJSON.FeatureCollection<GeoJSON.Point, HubVehiclePosition>
		vehicles: HubVehiclePosition[]
	}
	flags: {
		is_loading: boolean
	}
}

/* * */

const VehiclesContext = createContext<undefined | VehiclesContextState>(undefined);

export function useVehiclesContext() {
	const context = useContext(VehiclesContext);
	if (!context) {
		throw new Error('useVehiclesContext must be used within a VehiclesContextProvider');
	}
	return context;
}

/* * */

export function VehiclesContextProvider({ children }: PropsWithChildren) {
	//

	//
	// A. Fetch data

	const { data: allVehiclesPositionsData, isLoading: allVehiclesPositionsLoading } = useSWR<HubVehiclePosition[], Error>({ credentials: 'omit', url: API_ROUTES.hub.REALTIME_VEHICLES_POSITIONS }, { refreshInterval: 5_000 }); // 5 seconds

	//
	// B. Transform data

	const vehiclesGeoJsonFeatureCollection = useMemo(() => {
		const collection = getBaseGeoJsonFeatureCollection<GeoJSON.Point, HubVehiclePosition>();
		allVehiclesPositionsData?.forEach((vehicle) => {
			// Skip if vehicle position is not from an allowed agency
			if (!['1', '2', '3', '4', '8', '15', '16', '21', '41', '42', '43', '44'].includes(vehicle.agency_id)) return;
			// Add the vehicle position to the collection
			collection.features.push(transformVehicleDataIntoGeoJsonFeature(vehicle));
		});
		return collection;
	}, [allVehiclesPositionsData]);

	const normalizedVehiclesData = useMemo(() => {
		return allVehiclesPositionsData ?? [];
	}, [allVehiclesPositionsData]);

	//
	// B. Handle actions

	const getVehicleById = useCallback((vehicleId: string): HubVehiclePosition | undefined => {
		return normalizedVehiclesData.find(vehicle => vehicle._id === vehicleId);
	}, [normalizedVehiclesData]);

	const getVehicleByIdGeoJsonFC = useCallback((vehicleId: string): GeoJSON.FeatureCollection | undefined => {
		const vehicle = getVehicleById(vehicleId);
		if (!vehicle) return;
		const collection = getBaseGeoJsonFeatureCollection();
		collection.features.push(transformVehicleDataIntoGeoJsonFeature(vehicle));
		return collection;
	}, [getVehicleById]);

	const getVehiclesByLineId = useCallback((lineId: string): HubVehiclePosition[] => {
		return normalizedVehiclesData.filter(vehicle => vehicle.trip_id === lineId);
	}, [normalizedVehiclesData]);

	const getVehiclesByLineIdGeoJsonFC = useCallback((lineId: string): GeoJSON.FeatureCollection | undefined => {
		const vehicles = getVehiclesByLineId(lineId);
		if (!vehicles) return;
		const collection = getBaseGeoJsonFeatureCollection();
		vehicles.forEach(vehicle => collection.features.push(transformVehicleDataIntoGeoJsonFeature(vehicle)));
		return collection;
	}, [getVehiclesByLineId]);

	const getVehiclesByPatternId = useCallback((patternId: string): HubVehiclePosition[] => {
		return normalizedVehiclesData.filter(vehicle => vehicle.trip_id === patternId);
	}, [normalizedVehiclesData]);

	const getVehiclesByPatternIdGeoJsonFC = useCallback((patternId: string) => {
		const vehicles = getVehiclesByPatternId(patternId);
		if (!vehicles) return;
		const collection = getBaseGeoJsonFeatureCollection();
		vehicles.forEach(vehicle => collection.features.push(transformVehicleDataIntoGeoJsonFeature(vehicle)));
		return collection;
	}, [getVehiclesByPatternId]);

	const getVehiclesByTripId = useCallback((tripId: string): HubVehiclePosition[] => {
		return normalizedVehiclesData.filter(vehicle => vehicle.trip_id === tripId);
	}, [normalizedVehiclesData]);

	const getVehiclesByTripIdGeoJsonFC = useCallback((tripId: string) => {
		const vehicles = getVehiclesByTripId(tripId);
		if (!vehicles) return;
		const collection = getBaseGeoJsonFeatureCollection();
		vehicles.forEach(vehicle => collection.features.push(transformVehicleDataIntoGeoJsonFeature(vehicle)));
		return collection;
	}, [getVehiclesByTripId]);

	//
	// C. Define context value

	const contextValue = useMemo<VehiclesContextState>(() => ({
		actions: {
			getVehicleById,
			getVehicleByIdGeoJsonFC,
			getVehiclesByLineId,
			getVehiclesByLineIdGeoJsonFC,
			getVehiclesByPatternId,
			getVehiclesByPatternIdGeoJsonFC,
			getVehiclesByTripId,
			getVehiclesByTripIdGeoJsonFC,
		},
		data: {
			fc: vehiclesGeoJsonFeatureCollection,
			vehicles: normalizedVehiclesData,
		},
		flags: {
			is_loading: allVehiclesPositionsLoading,
		},
	}), [allVehiclesPositionsLoading, getVehicleById, getVehicleByIdGeoJsonFC, getVehiclesByLineId, getVehiclesByLineIdGeoJsonFC, getVehiclesByPatternId, getVehiclesByPatternIdGeoJsonFC, getVehiclesByTripId, getVehiclesByTripIdGeoJsonFC, normalizedVehiclesData, vehiclesGeoJsonFeatureCollection]);

	//
	// D. Render components

	return (
		<VehiclesContext.Provider value={contextValue}>
			{children}
		</VehiclesContext.Provider>
	);

	//
};

/* * */

export function transformVehicleDataIntoGeoJsonFeature(vehicleData: HubVehiclePosition): GeoJSON.Feature<GeoJSON.Point, HubVehiclePosition> {
	return {
		geometry: {
			coordinates: [vehicleData.longitude || 0, vehicleData.latitude || 0],
			type: 'Point',
		},
		id: String(vehicleData.vehicle_id),
		properties: vehicleData,
		type: 'Feature',
	};
}
