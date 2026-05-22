'use client';

import { useStopCreateContext } from '@/components/stops/create/StopCreate.context';
import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { getBaseGeoJsonFeatureCollection, isValidLatitude, isValidLongitude } from '@tmlmobilidade/geo';
import { MapOverlayMultipleStops, type MapOverlayMultipleStopsDataProps, MapOverlayPins, type MapOverlayPinsPointDataProps, MapView } from '@tmlmobilidade/ui';
import { type Point } from 'geojson';
import { useMemo } from 'react';

/* * */

export function StopCreateStep1Map() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();
	const stopsListContext = useStopsListContext();

	const latitude = stopCreateContext.data.form.values.latitude;
	const longitude = stopCreateContext.data.form.values.longitude;

	//
	// B. Transform data

	const stopsAsGeojsonFC = useMemo(() => {
		// Prepare an empty feature collection
		const baseGeoJson = getBaseGeoJsonFeatureCollection<Point, MapOverlayMultipleStopsDataProps>();
		// Skip if no data is provided
		if (!stopsListContext.data.filtered) return baseGeoJson;
		// Add the features to the base GeoJSON
		baseGeoJson.features = stopsListContext.data.filtered.map(item => ({
			geometry: {
				coordinates: [item.longitude, item.latitude],
				type: 'Point',
			},
			properties: {
				id: String(item._id),
				name: item.name,
			},
			type: 'Feature',
		}));
		// Return the collection
		return baseGeoJson;
	}, [stopsListContext.data.filtered]);

	const selectedCoordinatesMapData = useMemo(() => {
		// Prepare an empty feature collection
		const baseGeoJson = getBaseGeoJsonFeatureCollection<Point, MapOverlayPinsPointDataProps>();
		const validatedLatitude = isValidLatitude(latitude);
		const validatedLongitude = isValidLongitude(longitude);
		// Skip if no data is provided
		if (!validatedLatitude || !validatedLongitude) return baseGeoJson;
		// Add the features to the base GeoJSON
		baseGeoJson.features = [{
			geometry: {
				coordinates: [validatedLongitude, validatedLatitude],
				type: 'Point',
			},
			properties: {
				id: 'selected-coordinates',
			},
			type: 'Feature',
		}];
		// Return the collection
		return baseGeoJson;
	}, [latitude, longitude]);

	//
	// C. Handle actions

	const handleMapClick = (event) => {
		stopCreateContext.actions.setLatLng(event.lngLat.lat, event.lngLat.lng);
	};

	//
	// D. Render components

	return (
		<MapView cursor="crosshair" height={400} id="create-stop-map" onClick={handleMapClick}>
			<MapOverlayMultipleStops
				data={stopsAsGeojsonFC}
				id="stops-list"
				visible
			/>
			<MapOverlayPins
				id="selected-coordinates"
				pinsData={selectedCoordinatesMapData}
				focusOnChange
			/>
		</MapView>
	);

	//
}
