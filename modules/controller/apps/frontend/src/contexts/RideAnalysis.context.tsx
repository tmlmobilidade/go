'use client';

import { IconChecks, IconClipboardSearch, IconPresentationAnalytics } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { getBaseGeoJsonFeature, getBaseGeoJsonFeatureCollection, getGeofenceOnPosition } from '@tmlmobilidade/geo';
import { type SimplifiedApexLocation, type SimplifiedApexOnBoardRefund, type SimplifiedApexOnBoardSale, type SimplifiedApexValidation } from '@tmlmobilidade/go-types-apex';
import { normalizeRide } from '@tmlmobilidade/normalizers';
import { PermissionCatalog, type RideNormalized } from '@tmlmobilidade/types';
import { type HashedShape, type HashedTrip, type Ride, type SimplifiedVehicleEvent } from '@tmlmobilidade/types';
import { getCssVariableValue } from '@tmlmobilidade/ui';
import { type MapOverlayGeofencesPolygonDataProps, type MapOverlayObservedPathLineDataProps, type MapOverlayObservedPathPointsDataProps, type MapOverlayScheduledPathLineDataProps, type MapOverlayScheduledPathPointsDataProps } from '@tmlmobilidade/ui';
import { fetchData } from '@tmlmobilidade/utils';
import { type FeatureCollection, type LineString, type Point, type Polygon } from 'geojson';
import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import useSWR from 'swr';

/* * */

export const RideAnalysisViewOptions = {
	ANALYSIS: {
		icon: <IconPresentationAnalytics />,
		label: 'Análise',
		permission: PermissionCatalog.all.rides.actions.analysis_read,
		value: 'ANALYSIS',
	},
	// eslint-disable-next-line perfectionist/sort-objects
	ACCEPTANCE: {
		icon: <IconChecks />,
		label: 'Aceitação',
		permission: PermissionCatalog.all.rides.actions.acceptance_read,
		value: 'ACCEPTANCE',
	},
	AUDIT: {
		icon: <IconClipboardSearch />,
		label: 'Auditoria',
		permission: PermissionCatalog.all.rides.actions.audit_read,
		value: 'AUDIT',
	},
} as const;

interface RideAnalysisContextState {
	actions: {
		reprocessRide: () => Promise<void>
		setSelectedView: (value: keyof typeof RideAnalysisViewOptions) => void
	}
	data: {
		hashed_shape: HashedShape | null
		hashed_trip: HashedTrip | null
		ride: null | RideNormalized
		ride_id: Ride['_id']
		selected_view: keyof typeof RideAnalysisViewOptions
		simplified_apex_locations: SimplifiedApexLocation[]
		simplified_apex_on_board_refunds: SimplifiedApexOnBoardRefund[]
		simplified_apex_on_board_sales: SimplifiedApexOnBoardSale[]
		simplified_apex_validations: SimplifiedApexValidation[]
		vehicle_events: SimplifiedVehicleEvent[]
	}
	flags: {
		error: Error | null
		loading: boolean
	}
	geojson: {
		observed_events: FeatureCollection<Point, MapOverlayObservedPathPointsDataProps>
		observed_shape: FeatureCollection<LineString, MapOverlayObservedPathLineDataProps>
		scheduled_path: FeatureCollection<Point, MapOverlayScheduledPathPointsDataProps>
		scheduled_path_geofences: FeatureCollection<Polygon, MapOverlayGeofencesPolygonDataProps>
		scheduled_shape: FeatureCollection<LineString, MapOverlayScheduledPathLineDataProps>
	}
}

/* * */

const RideAnalysisContext = createContext<RideAnalysisContextState | undefined>(undefined);

export const useRideAnalysisContext = () => {
	const context = useContext(RideAnalysisContext);
	if (!context) {
		throw new Error('useRideAnalysisContext must be used within a RideAnalysisContextProvider');
	}
	return context;
};

/* * */

export function RideAnalysisContextProvider({ children, rideId }: PropsWithChildren<{ rideId: string }>) {
	//

	//
	// A. Fetch data

	const { data: rideData, error: rideError, isLoading: rideLoading, mutate: rideMutate } = useSWR<Ride>(API_ROUTES.controller.RIDES_DETAIL_RIDE(rideId), { refreshInterval: 5_000 });
	const { data: vehicleEventsData, error: vehicleEventsError, isLoading: vehicleEventsLoading } = useSWR<SimplifiedVehicleEvent[]>(API_ROUTES.controller.RIDES_DETAIL_VEHICLE_EVENTS(rideId), { refreshInterval: 5_000 });
	const { data: simplifiedApexLocationsData, error: simplifiedApexLocationsError, isLoading: simplifiedApexLocationsLoading } = useSWR<SimplifiedApexLocation[]>(API_ROUTES.controller.RIDES_DETAIL_SIMPLIFIED_APEX_LOCATIONS(rideId), { refreshInterval: 5_000 });
	const { data: simplifiedApexValidationsData, error: simplifiedApexValidationsError, isLoading: simplifiedApexValidationsLoading } = useSWR<SimplifiedApexValidation[]>(API_ROUTES.controller.RIDES_DETAIL_SIMPLIFIED_APEX_VALIDATIONS(rideId), { refreshInterval: 5_000 });
	const { data: simplifiedApexOnBoardSalesData, error: simplifiedApexOnBoardSalesError, isLoading: simplifiedApexOnBoardSalesLoading } = useSWR<SimplifiedApexOnBoardSale[]>(API_ROUTES.controller.RIDES_DETAIL_SIMPLIFIED_APEX_ON_BOARD_SALES(rideId), { refreshInterval: 5_000 });
	const { data: simplifiedApexOnBoardRefundsData, error: simplifiedApexOnBoardRefundsError, isLoading: simplifiedApexOnBoardRefundsLoading } = useSWR<SimplifiedApexOnBoardRefund[]>(API_ROUTES.controller.RIDES_DETAIL_SIMPLIFIED_APEX_ON_BOARD_REFUNDS(rideId), { refreshInterval: 5_000 });
	const { data: hashedTripData, error: hashedTripError, isLoading: hashedTripLoading } = useSWR<HashedTrip>(API_ROUTES.controller.RIDES_DETAIL_HASHED_TRIP(rideId));
	const { data: hashedShapeData, error: hashedShapeError, isLoading: hashedShapeLoading } = useSWR<HashedShape>(API_ROUTES.controller.RIDES_DETAIL_HASHED_SHAPE(rideId));

	const [selectedView, setSelectedView] = useState<keyof typeof RideAnalysisViewOptions>(Object.keys(RideAnalysisViewOptions)[0] as keyof typeof RideAnalysisViewOptions);

	//
	// B. Transform data

	const rideDataNormalized = useMemo(() => {
		if (!rideData) return null;
		return normalizeRide(rideData);
	}, [rideData]);

	const observedEventsFC: FeatureCollection<Point, MapOverlayObservedPathPointsDataProps> = useMemo(() => {
		// Setup an empty feature collection
		const featureCollection = getBaseGeoJsonFeatureCollection<Point, MapOverlayObservedPathPointsDataProps>();
		// If no vehicle events data, return the empty feature collection
		if (!vehicleEventsData) return featureCollection;
		// Prepare the feature collection with vehicle events data
		featureCollection.features = vehicleEventsData
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
					trigger_door: vehicleEvent.door,
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
		if (!vehicleEventsData) return featureCollection;
		// Prepare the feature collection with vehicle events data
		const lineString = getBaseGeoJsonFeature<LineString, MapOverlayObservedPathLineDataProps>('LineString');
		lineString.geometry.coordinates = vehicleEventsData
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
		if (!hashedTripData?.path) return featureCollection;
		// Group simplified apex validations by stop ID
		const validationsByStopId: Record<string, SimplifiedApexValidation[]> = {};
		simplifiedApexValidationsData?.forEach((validation) => {
			if (!validation.stop_id) return;
			if (!validation.is_passenger) return;
			if (!validationsByStopId[validation.stop_id]) validationsByStopId[validation.stop_id] = [];
			validationsByStopId[validation.stop_id].push(validation);
		});
		// Prepare the feature collection with hashed trip data
		featureCollection.features = hashedTripData.path
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
					passengers_observed: validationsByStopId[waypoint.stop_id]?.length || 0,
					sequence: waypoint.stop_sequence,
				},
				type: 'Feature',
			}));
		return featureCollection;
	}, [hashedTripData, simplifiedApexValidationsData]);

	const scheduledPathGeofencesFC: FeatureCollection<Polygon, MapOverlayGeofencesPolygonDataProps> = useMemo(() => {
		// Setup an empty feature collection
		const featureCollection = getBaseGeoJsonFeatureCollection<Polygon, MapOverlayGeofencesPolygonDataProps>();
		// If no hashed trip data or hashed shape data, return the empty feature collection
		if (!hashedTripData?.path) return featureCollection;
		if (!hashedShapeData?.points?.length) return featureCollection;
		// Prepare the feature collection with hashed trip data
		featureCollection.features = hashedTripData.path
			.sort((a, b) => a.stop_sequence - b.stop_sequence)
			.map((waypoint) => {
				const geofenceData = getGeofenceOnPosition([waypoint.stop_lon, waypoint.stop_lat], 50);
				return {
					...geofenceData,
					properties: {
						id: waypoint.stop_id,
					},
				};
			});
		return featureCollection;
	}, [hashedTripData, hashedShapeData]);

	const scheduledShapeFC: FeatureCollection<LineString, MapOverlayScheduledPathLineDataProps> = useMemo(() => {
		// Setup an empty feature collection
		const featureCollection = getBaseGeoJsonFeatureCollection<LineString, MapOverlayScheduledPathLineDataProps>();
		// If no hashed shape data, return the empty feature collection
		if (!hashedShapeData?.points) return featureCollection;
		// Prepare the feature collection with hashed shape data
		const lineString = getBaseGeoJsonFeature<LineString, MapOverlayScheduledPathLineDataProps>('LineString');
		lineString.geometry.coordinates = hashedShapeData.points
			.sort((a, b) => a.shape_pt_sequence - b.shape_pt_sequence)
			.map(shapePoint => [shapePoint.shape_pt_lon, shapePoint.shape_pt_lat]);
		lineString.properties.id = hashedShapeData._id;
		// lineString.properties['color'] = `#${hashedTripData?.data.route_color}`;
		featureCollection.features.push(lineString);
		return featureCollection;
	}, [hashedShapeData]);

	//
	// C. Handle actions

	const reprocessRide = async () => {
		const result = await fetchData<Ride>(API_ROUTES.controller.RIDES_DETAIL_REPROCESS(rideId));
		await rideMutate(result.data);
	};

	//
	// C. Define context value

	const contextValue: RideAnalysisContextState = {
		actions: {
			reprocessRide,
			setSelectedView,
		},
		data: {
			hashed_shape: hashedShapeData ?? null,
			hashed_trip: hashedTripData ?? null,
			ride: rideDataNormalized,
			ride_id: rideId,
			selected_view: selectedView,
			simplified_apex_locations: simplifiedApexLocationsData ?? [],
			simplified_apex_on_board_refunds: simplifiedApexOnBoardRefundsData ?? [],
			simplified_apex_on_board_sales: simplifiedApexOnBoardSalesData ?? [],
			simplified_apex_validations: simplifiedApexValidationsData ?? [],
			vehicle_events: vehicleEventsData ?? [],
		},
		flags: {
			error: rideError || vehicleEventsError || simplifiedApexLocationsError || simplifiedApexValidationsError || hashedTripError || hashedShapeError || simplifiedApexOnBoardSalesError || simplifiedApexOnBoardRefundsError,
			loading: rideLoading || vehicleEventsLoading || simplifiedApexLocationsLoading || simplifiedApexValidationsLoading || hashedTripLoading || hashedShapeLoading || simplifiedApexOnBoardSalesLoading || simplifiedApexOnBoardRefundsLoading,
		},
		geojson: {
			observed_events: observedEventsFC,
			observed_shape: observedShapeFC,
			scheduled_path: scheduledPathFC,
			scheduled_path_geofences: scheduledPathGeofencesFC,
			scheduled_shape: scheduledShapeFC,
		},
	};

	//
	// D. Render components

	return (
		<RideAnalysisContext.Provider value={contextValue}>
			{children}
		</RideAnalysisContext.Provider>
	);

	//
};
