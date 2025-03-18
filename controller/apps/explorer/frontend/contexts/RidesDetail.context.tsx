'use client';

/* * */

import { useRidesContext } from '@/contexts/Rides.context';
import { getCssVariableValue } from '@/utils/get-css-variable-value';
import { getBaseGeoJsonFeatureCollection, getBaseGeoJsonFeatureLineString } from '@/utils/map.utils';
import { ApexT11, HashedShape, HashedTrip, Ride, VehicleEvent } from '@tmlmobilidade/core/types';
import { DateTime } from 'luxon';
import { createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface RidesDetailContextState {
	data: {
		apex_t11: ApexT11[]
		hashed_shape: HashedShape
		hashed_trip: HashedTrip
		ride: Ride
		ride_id: Ride['_id']
		vehicle_events: VehicleEvent[]
	}
	geojson: {
		observed_events: GeoJSON.FeatureCollection
		observed_shape: GeoJSON.FeatureCollection
		scheduled_path: GeoJSON.FeatureCollection
		scheduled_shape: GeoJSON.FeatureCollection
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
	// A. Setup variables

	const ridesContext = useRidesContext();

	//
	// B. Fetch data

	const { data: vehicleEventsData } = useSWR<VehicleEvent[]>(`https://controller.sae.carrismetropolitana.pt/api/rides/${rideId}/vehicle-events`, { refreshInterval: 1000 });
	const { data: apexT11Data } = useSWR<ApexT11[]>(`https://controller.sae.carrismetropolitana.pt/api/rides/${rideId}/apex-t11`, { refreshInterval: 1000 });
	const { data: hashedTripData } = useSWR<HashedTrip>(`https://controller.sae.carrismetropolitana.pt/api/rides/${rideId}/hashed-trip`);
	const { data: hashedShapeData } = useSWR<HashedShape>(`https://controller.sae.carrismetropolitana.pt/api/rides/${rideId}/hashed-shape`);

	// console.log('vehicleEventsData', vehicleEventsData);
	// console.log('apexT11Data', apexT11Data);
	// console.log('hashedTripData', hashedTripData);
	// console.log('hashedShapeData', hashedShapeData);

	const currentRideData: Ride = useMemo(() => {
		return ridesContext.actions.getRideById(rideId);
	}, [rideId, ridesContext.data.rides]);

	//
	// C. Transform data

	const observedEventsFC: GeoJSON.FeatureCollection = useMemo(() => {
		const fc = getBaseGeoJsonFeatureCollection();
		if (!vehicleEventsData) return fc;
		const colorThemePrimary = getCssVariableValue('--color-theme-primary');
		const colorThemeContrast = getCssVariableValue('--color-theme-contrast');
		fc.features = vehicleEventsData
			.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
			.map((vehicleEvent) => {
				return {
					geometry: {
						coordinates: [vehicleEvent.longitude, vehicleEvent.latitude],
						type: 'Point',
					},
					properties: {
						color: colorThemePrimary,
						text_color: colorThemeContrast,
						timestamp: DateTime.fromMillis(vehicleEvent.created_at).toISO(),
					},
					type: 'Feature',
				};
			});
		return fc;
	}, [vehicleEventsData]);

	const observedShapeFC: GeoJSON.FeatureCollection = useMemo(() => {
		const fc = getBaseGeoJsonFeatureCollection();
		if (!vehicleEventsData) return fc;
		const lineString = getBaseGeoJsonFeatureLineString();
		lineString.geometry.coordinates = vehicleEventsData
			.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
			.map(vehicleEvent => [vehicleEvent.longitude, vehicleEvent.latitude]);
		lineString.properties['color'] = getCssVariableValue('--color-theme-primary');
		fc.features = [lineString];
		return fc;
	}, [vehicleEventsData]);

	const scheduledPathFC: GeoJSON.FeatureCollection | undefined = useMemo(() => {
		if (!hashedTripData?.path) return;
		const fc = getBaseGeoJsonFeatureCollection();
		fc.features = hashedTripData.path
			.sort((a, b) => a.stop_sequence - b.stop_sequence)
			.map((waypoint) => {
				return {
					geometry: {
						coordinates: [Number(waypoint.stop_lon), Number(waypoint.stop_lat)],
						type: 'Point',
					},
					properties: {
						color: `#${hashedTripData.route_color}`,
						sequence: waypoint.stop_sequence,
						text_color: `#${hashedTripData.route_text_color}`,
					},
					type: 'Feature',
				};
			});
		return fc;
	}, [hashedTripData]);

	const scheduledShapeFC: GeoJSON.FeatureCollection | undefined = useMemo(() => {
		if (!hashedShapeData?.points) return;
		const fc = getBaseGeoJsonFeatureCollection();
		const lineString = getBaseGeoJsonFeatureLineString();
		lineString.geometry.coordinates = hashedShapeData.points
			.sort((a, b) => a.shape_pt_sequence - b.shape_pt_sequence)
			.map(shapePoint => [Number(shapePoint.shape_pt_lon), Number(shapePoint.shape_pt_lat)]);
		lineString.properties['color'] = `#${hashedTripData?.route_color}`;
		fc.features = [lineString];
		return fc;
	}, [hashedShapeData, hashedTripData]);

	//
	// C. Define context value

	const contextValue: RidesDetailContextState = useMemo(() => ({
		data: {
			apex_t11: apexT11Data || [],
			hashed_shape: hashedShapeData,
			hashed_trip: hashedTripData,
			ride: currentRideData,
			ride_id: rideId,
			vehicle_events: vehicleEventsData || [],
		},
		geojson: {
			observed_events: observedEventsFC,
			observed_shape: observedShapeFC,
			scheduled_path: scheduledPathFC,
			scheduled_shape: scheduledShapeFC,
		},
	}), [rideId, vehicleEventsData, currentRideData, apexT11Data, hashedTripData, hashedShapeData, observedEventsFC, observedShapeFC, scheduledPathFC, scheduledShapeFC]);

	//
	// D. Render components

	return (
		<RidesDetailContext.Provider value={contextValue}>
			{children}
		</RidesDetailContext.Provider>
	);

	//
};
