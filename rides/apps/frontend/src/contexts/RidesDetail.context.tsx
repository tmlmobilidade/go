'use client';

/* * */

import { getCssVariableValue } from '@/utils/get-css-variable-value';
import { getBaseGeoJsonFeatureCollection, getBaseGeoJsonFeatureLineString } from '@/utils/map.utils';
import { cutLineStringAtLength, getGeofenceOnPoint, getGeoJsonPointFromAny } from '@tmlmobilidade/sae-rides-pckg-utils';
import { toLineStringFromHashedShape } from '@tmlmobilidade/sae-rides-pckg-utils/src/geojson/conversions';
import { HashedShape, HashedTrip, Ride, SimplifiedApexValidation, VehicleEvent } from '@tmlmobilidade/types';
import * as turf from '@turf/turf';
import { type Feature, type FeatureCollection, type Polygon } from 'geojson';
import { DateTime } from 'luxon';
import { createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';

/* * */

interface RidesDetailContextState {
	data: {
		hashed_shape: HashedShape
		hashed_trip: HashedTrip
		ride: Ride
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
	// A. Setup variables

	//
	// B. Fetch data

	const { data: rideData } = useSWR<Ride>(`/api/rides/${rideId}/ride`, { refreshInterval: 1000 });
	const { data: vehicleEventsData } = useSWR<VehicleEvent[]>(`/api/rides/${rideId}/vehicle-events`, { refreshInterval: 1000 });
	const { data: apexT11Data } = useSWR<ApexT11[]>(`/api/rides/${rideId}/apex-t11`, { refreshInterval: 1000 });
	const { data: hashedTripData } = useSWR<HashedTrip>(`/api/rides/${rideId}/hashed-trip`);
	const { data: hashedShapeData } = useSWR<HashedShape>(`/api/rides/${rideId}/hashed-shape`);

	//
	// C. Transform data

	const observedEventsFC: FeatureCollection = useMemo(() => {
		const fc = getBaseGeoJsonFeatureCollection();
		if (!vehicleEventsData) return fc;
		const colorThemePrimary = getCssVariableValue('--color-primary');
		const colorThemeContrast = getCssVariableValue('--color-contrast');
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

	const observedShapeFC: FeatureCollection = useMemo(() => {
		const fc = getBaseGeoJsonFeatureCollection();
		if (!vehicleEventsData) return fc;
		const lineString = getBaseGeoJsonFeatureLineString();
		lineString.geometry.coordinates = vehicleEventsData
			.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
			.map(vehicleEvent => [vehicleEvent.longitude, vehicleEvent.latitude]);
		lineString.properties['color'] = getCssVariableValue('--color-primary');
		fc.features = [lineString];
		return fc;
	}, [vehicleEventsData]);

	const scheduledPathFC: FeatureCollection | undefined = useMemo(() => {
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

	const scheduledPathGeofencesFC: FeatureCollection | undefined = useMemo(() => {
		if (!hashedTripData?.path) return;
		if (!hashedShapeData?.points?.length) return;
		const fc = getBaseGeoJsonFeatureCollection();
		fc.features = hashedTripData.path
			.sort((a, b) => a.stop_sequence - b.stop_sequence)
			.map((waypoint) => {
				const geofenceData = getGeofenceOnPoint(getGeoJsonPointFromAny([Number(waypoint.stop_lon), Number(waypoint.stop_lat)]), 50);
				const lineStringFromShape = toLineStringFromHashedShape(hashedShapeData);
				// const geofenceData = getPolygon([generateBufferPolygon(lineStringFromShape.geometry.coordinates, 1)]);
				// const geofenceData = turf.buffer(lineStringFromShape, 50, { units: 'meters' });
				// const geofenceData = getGeofenceOnLine(lineStringFromShape, 50, 0);
				geofenceData.properties = {
					color: `#${hashedTripData.route_color}`,
					sequence: waypoint.stop_sequence,
					text_color: `#${hashedTripData.route_text_color}`,
				};
				return geofenceData as Feature<Polygon>;
				const geofenceDataSimple = turf.unkinkPolygon(geofenceData);
				console.log(geofenceData);
				return geofenceDataSimple.features[0] as Feature<Polygon>;
			});
		return fc;
	}, [hashedTripData, hashedShapeData]);

	const scheduledShapeFC: FeatureCollection | undefined = useMemo(() => {
		if (!hashedShapeData?.points) return;
		const fc = getBaseGeoJsonFeatureCollection();
		const lineString = getBaseGeoJsonFeatureLineString();
		lineString.geometry.coordinates = hashedShapeData.points
			.sort((a, b) => a.shape_pt_sequence - b.shape_pt_sequence)
			.map(shapePoint => [Number(shapePoint.shape_pt_lon), Number(shapePoint.shape_pt_lat)]);
		lineString.properties['color'] = `#${hashedTripData?.route_color}`;
		const lineStringChunk = cutLineStringAtLength(lineString.geometry, 250);
		const lineStringChunkLength = turf.length(turf.feature(lineStringChunk), { units: 'meters' });
		console.log('lineStringChunkLength', lineStringChunkLength);
		fc.features = [turf.feature(lineStringChunk)];
		console.log('shape changed');
		return fc;
	}, [hashedShapeData, hashedTripData]);

	//
	// C. Define context value

	const contextValue: RidesDetailContextState = useMemo(() => ({
		data: {
			apex_t11: apexT11Data || [],
			hashed_shape: hashedShapeData,
			hashed_trip: hashedTripData,
			ride: rideData,
			ride_id: rideId,
			vehicle_events: vehicleEventsData || [],
		},
		geojson: {
			observed_events: observedEventsFC,
			observed_shape: observedShapeFC,
			scheduled_path: scheduledPathFC,
			scheduled_path_geofences: scheduledPathGeofencesFC,
			scheduled_shape: scheduledShapeFC,
		},
	}), [rideId, vehicleEventsData, rideData, apexT11Data, scheduledPathGeofencesFC, hashedTripData, hashedShapeData, observedEventsFC, observedShapeFC, scheduledPathFC, scheduledShapeFC]);

	//
	// D. Render components

	return (
		<RidesDetailContext.Provider value={contextValue}>
			{children}
		</RidesDetailContext.Provider>
	);

	//
};
