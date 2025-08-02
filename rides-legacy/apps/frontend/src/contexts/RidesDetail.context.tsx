'use client';

/* * */

import { RideNormalized } from '@/types/normalized';
import { getCssVariableValue } from '@/utils/get-css-variable-value';
import { getRideNormalized } from '@/utils/get-ride-normalized';
import { getBaseGeoJsonFeatureCollection, getBaseGeoJsonFeatureLineString } from '@/utils/map.utils';
import { HashedShape, HashedTrip, Ride, SimplifiedApexValidation, VehicleEvent } from '@tmlmobilidade/types';
import { Dates, getGeofenceOnPosition, type HttpResponse } from '@tmlmobilidade/utils';
import { type Feature, type FeatureCollection, type Polygon } from 'geojson';
import { createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface RidesDetailContextState {
	data: {
		hashed_shape: HashedShape | null
		hashed_trip: HashedTrip | null
		ride: null | RideNormalized
		ride_id: Ride['_id']
		simplified_apex_validations: SimplifiedApexValidation[]
		vehicle_events: VehicleEvent[]
	}
	geojson: {
		observed_events: FeatureCollection
		observed_shape: FeatureCollection
		scheduled_path: FeatureCollection
		scheduled_path_geofences: FeatureCollection
		scheduled_shape: FeatureCollection
	}
}

/* * */

const RidesDetailContext = createContext<RidesDetailContextState | undefined>(undefined);

export function useRidesDetailContext() {
	const context = useContext(RidesDetailContext);
	if (!context) {
		throw new Error('useRidesDetailContext must be used within a RidesDetailContextProvider');
	}
	return context;
}

/* * */

export const RidesDetailContextProvider = ({ children, rideId }) => {
	//

	//
	// A. Fetch data

	const { data: rideData } = useSWR<HttpResponse<Ride>>(`/api/rides/${rideId}/ride`, { refreshInterval: 1000 });
	const { data: vehicleEventsData } = useSWR<HttpResponse<VehicleEvent[]>>(`/api/rides/${rideId}/vehicle-events`, { refreshInterval: 1000 });
	const { data: simplifiedApexValidationsData } = useSWR<HttpResponse<SimplifiedApexValidation[]>>(`/api/rides/${rideId}/simplified-apex-validations`, { refreshInterval: 1000 });
	const { data: hashedTripData } = useSWR<HttpResponse<HashedTrip>>(`/api/rides/${rideId}/hashed-trip`);
	const { data: hashedShapeData } = useSWR<HttpResponse<HashedShape>>(`/api/rides/${rideId}/hashed-shape`);

	//
	// B. Transform data

	const rideDataNormalized = useMemo(() => {
		if (!rideData?.data) return null;
		return getRideNormalized(rideData.data);
	}, [rideData]);

	const observedEventsFC: FeatureCollection = useMemo(() => {
		// Setup an empty feature collection
		const featureCollection = getBaseGeoJsonFeatureCollection();
		// If no vehicle events data, return the empty feature collection
		if (!vehicleEventsData?.data) return featureCollection;
		// Prepare the feature collection with vehicle events data
		featureCollection.features = vehicleEventsData.data
			.sort((a, b) => a.created_at - b.created_at)
			.filter(vehicleEvent => vehicleEvent.latitude && vehicleEvent.longitude)
			.map(vehicleEvent => ({
				geometry: {
					coordinates: [vehicleEvent.longitude, vehicleEvent.latitude],
					type: 'Point',
				},
				properties: {
					color: getCssVariableValue('--color-primary'),
					text_color: getCssVariableValue('--color-contrast'),
					timestamp: Dates.fromUnixTimestamp(vehicleEvent.created_at).iso,
				},
				type: 'Feature',
			}));
		return featureCollection;
	}, [vehicleEventsData]);

	const observedShapeFC: FeatureCollection = useMemo(() => {
		// If no vehicle events data, return an empty feature collection
		const featureCollection = getBaseGeoJsonFeatureCollection();
		// If no vehicle events data, return the empty feature collection
		if (!vehicleEventsData?.data) return featureCollection;
		// Prepare the feature collection with vehicle events data
		const lineString = getBaseGeoJsonFeatureLineString();
		lineString.geometry.coordinates = vehicleEventsData.data
			.sort((a, b) => a.created_at - b.created_at)
			.filter(vehicleEvent => vehicleEvent.latitude && vehicleEvent.longitude)
			.map(vehicleEvent => [vehicleEvent.longitude, vehicleEvent.latitude]);
		lineString.properties['color'] = getCssVariableValue('--color-primary');
		featureCollection.features = [lineString];
		return featureCollection;
	}, [vehicleEventsData]);

	const scheduledPathFC: FeatureCollection = useMemo(() => {
		// Setup an empty feature collection
		const featureCollection = getBaseGeoJsonFeatureCollection();
		// If no hashed trip data, return the empty feature collection
		if (!hashedTripData?.data?.path) return featureCollection;
		// Prepare the feature collection with hashed trip data
		featureCollection.features = hashedTripData.data.path
			.sort((a, b) => a.stop_sequence - b.stop_sequence)
			.map(waypoint => ({
				geometry: {
					coordinates: [waypoint.stop_lon, waypoint.stop_lat],
					type: 'Point',
				},
				properties: {
					color: `#${hashedTripData.data.route_color}`,
					sequence: waypoint.stop_sequence,
					text_color: `#${hashedTripData.data.route_text_color}`,
				},
				type: 'Feature',
			}));
		return featureCollection;
	}, [hashedTripData]);

	const scheduledPathGeofencesFC: FeatureCollection = useMemo(() => {
		// Setup an empty feature collection
		const featureCollection = getBaseGeoJsonFeatureCollection();
		// If no hashed trip data or hashed shape data, return the empty feature collection
		if (!hashedTripData?.data?.path) return featureCollection;
		if (!hashedShapeData?.data?.points?.length) return featureCollection;
		// Prepare the feature collection with hashed trip data
		featureCollection.features = hashedTripData.data.path
			.sort((a, b) => a.stop_sequence - b.stop_sequence)
			.map((waypoint) => {
				const geofenceData = getGeofenceOnPosition([waypoint.stop_lon, waypoint.stop_lat], 50);
				geofenceData.properties = {
					color: `#${hashedTripData.data.route_color}`,
					sequence: waypoint.stop_sequence,
					text_color: `#${hashedTripData.data.route_text_color}`,
				};
				return geofenceData as Feature<Polygon>;
			});
		return featureCollection;
	}, [hashedTripData, hashedShapeData]);

	const scheduledShapeFC: FeatureCollection = useMemo(() => {
		// Setup an empty feature collection
		const featureCollection = getBaseGeoJsonFeatureCollection();
		// If no hashed shape data, return the empty feature collection
		if (!hashedShapeData?.data?.points) return featureCollection;
		// Prepare the feature collection with hashed shape data
		const lineString = getBaseGeoJsonFeatureLineString();
		lineString.geometry.coordinates = hashedShapeData.data.points
			.sort((a, b) => a.shape_pt_sequence - b.shape_pt_sequence)
			.map(shapePoint => [shapePoint.shape_pt_lon, shapePoint.shape_pt_lat]);
		lineString.properties['color'] = `#${hashedTripData?.data.route_color}`;
		featureCollection.features = [lineString];
		return featureCollection;
	}, [hashedShapeData, hashedTripData]);

	//
	// C. Define context value

	const contextValue: RidesDetailContextState = useMemo(() => ({
		data: {
			hashed_shape: hashedShapeData?.data ?? null,
			hashed_trip: hashedTripData?.data ?? null,
			ride: rideDataNormalized,
			ride_id: rideId,
			simplified_apex_validations: simplifiedApexValidationsData?.data ?? [],
			vehicle_events: vehicleEventsData?.data ?? [],
		},
		geojson: {
			observed_events: observedEventsFC,
			observed_shape: observedShapeFC,
			scheduled_path: scheduledPathFC,
			scheduled_path_geofences: scheduledPathGeofencesFC,
			scheduled_shape: scheduledShapeFC,
		},
	}), [rideId, vehicleEventsData, simplifiedApexValidationsData, scheduledPathGeofencesFC, hashedTripData, hashedShapeData, observedEventsFC, observedShapeFC, scheduledPathFC, scheduledShapeFC]);

	//
	// D. Render components

	return (
		<RidesDetailContext.Provider value={contextValue}>
			{children}
		</RidesDetailContext.Provider>
	);

	//
};
