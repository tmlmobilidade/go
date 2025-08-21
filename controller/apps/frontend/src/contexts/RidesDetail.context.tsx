'use client';

/* * */

import { type RideNormalized } from '@/types/normalized';
import { getCssVariableValue } from '@/utils/get-css-variable-value';
import { getRideNormalized } from '@/utils/get-ride-normalized';
import { type HashedShape, type HashedTrip, type Ride, type SimplifiedApexOnBoardRefund, type SimplifiedApexOnBoardSale, type SimplifiedApexValidation, type VehicleEvent } from '@tmlmobilidade/types';
import { type MapOverlayObservedPathLineDataProps, type MapOverlayObservedPathPointsDataProps, type MapOverlayScheduledPathLineDataProps, type MapOverlayScheduledPathPointsDataProps } from '@tmlmobilidade/ui';
import { Dates, getBaseGeoJsonFeature, getBaseGeoJsonFeatureCollection, getGeofenceOnPosition, type HttpResponse } from '@tmlmobilidade/utils';
import { type Feature, type FeatureCollection, type LineString, type Point, type Polygon } from 'geojson';
import { createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface RidesDetailContextState {
	data: {
		hashed_shape: HashedShape | null
		hashed_trip: HashedTrip | null
		ride: null | RideNormalized
		ride_id: Ride['_id']
		simplified_apex_on_board_refunds: SimplifiedApexOnBoardRefund[]
		simplified_apex_on_board_sales: SimplifiedApexOnBoardSale[]
		simplified_apex_validations: SimplifiedApexValidation[]
		vehicle_events: VehicleEvent[]
	}
	flags: {
		error: Error | null
		loading: boolean
	}
	geojson: {
		observed_events: FeatureCollection<Point, MapOverlayObservedPathPointsDataProps>
		observed_shape: FeatureCollection<LineString, MapOverlayObservedPathLineDataProps>
		scheduled_path: FeatureCollection<Point, MapOverlayScheduledPathPointsDataProps>
		scheduled_path_geofences: FeatureCollection
		scheduled_shape: FeatureCollection<LineString, MapOverlayScheduledPathLineDataProps>
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

	const { data: rideData, error: rideError, isLoading: rideLoading } = useSWR<HttpResponse<Ride>>(`/api/rides/${rideId}/ride`, { refreshInterval: 1000 });
	const { data: vehicleEventsData, error: vehicleEventsError, isLoading: vehicleEventsLoading } = useSWR<HttpResponse<VehicleEvent[]>>(`/api/rides/${rideId}/vehicle-events`, { refreshInterval: 1000 });
	const { data: simplifiedApexValidationsData, error: simplifiedApexValidationsError, isLoading: simplifiedApexValidationsLoading } = useSWR<HttpResponse<SimplifiedApexValidation[]>>(`/api/rides/${rideId}/simplified-apex-validations`, { refreshInterval: 1000 });
	const { data: simplifiedApexOnBoardSalesData, error: simplifiedApexOnBoardSalesError, isLoading: simplifiedApexOnBoardSalesLoading } = useSWR<HttpResponse<SimplifiedApexOnBoardSale[]>>(`/api/rides/${rideId}/simplified-apex-on-board-sales`, { refreshInterval: 1000 });
	const { data: simplifiedApexOnBoardRefundsData, error: simplifiedApexOnBoardRefundsError, isLoading: simplifiedApexOnBoardRefundsLoading } = useSWR<HttpResponse<SimplifiedApexOnBoardRefund[]>>(`/api/rides/${rideId}/simplified-apex-on-board-refunds`, { refreshInterval: 1000 });
	const { data: hashedTripData, error: hashedTripError, isLoading: hashedTripLoading } = useSWR<HttpResponse<HashedTrip>>(`/api/rides/${rideId}/hashed-trip`);
	const { data: hashedShapeData, error: hashedShapeError, isLoading: hashedShapeLoading } = useSWR<HttpResponse<HashedShape>>(`/api/rides/${rideId}/hashed-shape`);

	//
	// B. Transform data

	const rideDataNormalized = useMemo(() => {
		if (!rideData?.data) return null;
		return getRideNormalized(rideData.data);
	}, [rideData]);

	const observedEventsFC: FeatureCollection<Point, MapOverlayObservedPathPointsDataProps> = useMemo(() => {
		// Setup an empty feature collection
		const featureCollection = getBaseGeoJsonFeatureCollection<Point, MapOverlayObservedPathPointsDataProps>();
		// If no vehicle events data, return the empty feature collection
		if (!vehicleEventsData?.data) return featureCollection;
		// Prepare the feature collection with vehicle events data
		featureCollection.features = vehicleEventsData.data
			.sort((a, b) => a.created_at - b.created_at)
			.filter(vehicleEvent => vehicleEvent.latitude && vehicleEvent.longitude)
			.map((vehicleEvent, index) => ({
				geometry: {
					coordinates: [vehicleEvent.longitude, vehicleEvent.latitude],
					type: 'Point',
				},
				properties: {
					id: vehicleEvent._id,
					stop_id: vehicleEvent.stop_id,
					trigger_door: vehicleEvent.trigger_door,
					// color: getCssVariableValue('--color-primary'),
					// text_color: getCssVariableValue('--color-contrast'),
					sequence: index,
					timestamp: Dates
						.fromUnixTimestamp(vehicleEvent.created_at)
						.setZone('Europe/Lisbon', 'offset_only')
						.toFormat('dd/MM/yyyy HH:mm:ss'),
				},
				type: 'Feature',
			}));
		return featureCollection;
	}, [vehicleEventsData]);

	const observedShapeFC: FeatureCollection<LineString, MapOverlayObservedPathLineDataProps> = useMemo(() => {
		// If no vehicle events data, return an empty feature collection
		const featureCollection = getBaseGeoJsonFeatureCollection<LineString, MapOverlayObservedPathLineDataProps>();
		// If no vehicle events data, return the empty feature collection
		if (!vehicleEventsData?.data) return featureCollection;
		// Prepare the feature collection with vehicle events data
		const lineString = getBaseGeoJsonFeature<LineString, MapOverlayObservedPathLineDataProps>('LineString');
		lineString.geometry.coordinates = vehicleEventsData.data
			.sort((a, b) => a.created_at - b.created_at)
			.filter(vehicleEvent => vehicleEvent.latitude && vehicleEvent.longitude)
			.map(vehicleEvent => [vehicleEvent.longitude, vehicleEvent.latitude]);
		lineString.properties['color'] = getCssVariableValue('--color-primary');
		featureCollection.features = [lineString];
		return featureCollection;
	}, [vehicleEventsData]);

	const scheduledPathFC: FeatureCollection<Point, MapOverlayScheduledPathPointsDataProps> = useMemo(() => {
		// Setup an empty feature collection
		const featureCollection = getBaseGeoJsonFeatureCollection<Point, MapOverlayScheduledPathPointsDataProps>();
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
					arrival_time: waypoint.arrival_time,
					id: waypoint.stop_id,
					name: waypoint.stop_name,
					// color: `#${hashedTripData.data.route_color}`,
					sequence: waypoint.stop_sequence,
					// text_color: `#${hashedTripData.data.route_text_color}`,
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

	const scheduledShapeFC: FeatureCollection<LineString, MapOverlayScheduledPathLineDataProps> = useMemo(() => {
		// Setup an empty feature collection
		const featureCollection = getBaseGeoJsonFeatureCollection<LineString, MapOverlayScheduledPathLineDataProps>();
		// If no hashed shape data, return the empty feature collection
		if (!hashedShapeData?.data?.points) return featureCollection;
		// Prepare the feature collection with hashed shape data
		const lineString = getBaseGeoJsonFeature<LineString, MapOverlayScheduledPathLineDataProps>('LineString');
		lineString.geometry.coordinates = hashedShapeData.data.points
			.sort((a, b) => a.shape_pt_sequence - b.shape_pt_sequence)
			.map(shapePoint => [shapePoint.shape_pt_lon, shapePoint.shape_pt_lat]);
		lineString.properties.id = hashedShapeData.data._id;
		// lineString.properties['color'] = `#${hashedTripData?.data.route_color}`;
		featureCollection.features.push(lineString);
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
			simplified_apex_on_board_refunds: simplifiedApexOnBoardRefundsData?.data ?? [],
			simplified_apex_on_board_sales: simplifiedApexOnBoardSalesData?.data ?? [],
			simplified_apex_validations: simplifiedApexValidationsData?.data ?? [],
			vehicle_events: vehicleEventsData?.data ?? [],
		},
		flags: {
			error: rideError || vehicleEventsError || simplifiedApexValidationsError || hashedTripError || hashedShapeError || simplifiedApexOnBoardSalesError || simplifiedApexOnBoardRefundsError,
			loading: rideLoading || vehicleEventsLoading || simplifiedApexValidationsLoading || hashedTripLoading || hashedShapeLoading || simplifiedApexOnBoardSalesLoading || simplifiedApexOnBoardRefundsLoading,
		},
		geojson: {
			observed_events: observedEventsFC,
			observed_shape: observedShapeFC,
			scheduled_path: scheduledPathFC,
			scheduled_path_geofences: scheduledPathGeofencesFC,
			scheduled_shape: scheduledShapeFC,
		},
	}), [
		rideId,
		vehicleEventsData,
		simplifiedApexValidationsData,
		scheduledPathGeofencesFC,
		hashedTripData,
		hashedShapeData,
		observedEventsFC,
		observedShapeFC,
		scheduledPathFC,
		scheduledShapeFC,
		rideDataNormalized,
		rideLoading,
		rideError,
		vehicleEventsLoading,
		vehicleEventsError,
		simplifiedApexValidationsLoading,
		simplifiedApexValidationsError,
		hashedTripLoading,
		hashedTripError,
		hashedShapeLoading,
		hashedShapeError,
		simplifiedApexOnBoardSalesLoading,
		simplifiedApexOnBoardSalesError,
		simplifiedApexOnBoardRefundsLoading,
		simplifiedApexOnBoardRefundsError,
	]);

	//
	// D. Render components

	return (
		<RidesDetailContext.Provider value={contextValue}>
			{children}
		</RidesDetailContext.Provider>
	);

	//
};
