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
	const [latitude, longitude] = stopCreateContext.data.coordinates;

	//
	// B. Transform data

	const stopsAsGeojsonFC = useMemo(() => {
		const baseGeoJson = getBaseGeoJsonFeatureCollection<Point, MapOverlayMultipleStopsDataProps>();
		if (!stopsListContext.data.filtered) return baseGeoJson;

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

		return baseGeoJson;
	}, [stopsListContext.data.filtered]);

	const selectedCoordinatesMapData = useMemo(() => {
		const baseGeoJson = getBaseGeoJsonFeatureCollection<Point, MapOverlayPinsPointDataProps>();
		const validatedLatitude = isValidLatitude(latitude ?? NaN);
		const validatedLongitude = isValidLongitude(longitude ?? NaN);
		if (!validatedLatitude || !validatedLongitude) return baseGeoJson;

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
