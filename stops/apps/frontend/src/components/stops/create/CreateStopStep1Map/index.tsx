'use client';

/* * */

import { useStopCreateContext } from '@/contexts/StopCreate.context';
import { useStopsListContext } from '@/contexts/StopsList.context';
import { MapOverlayMultipleStops, type MapOverlayMultipleStopsDataProps, MapOverlayPins, MapOverlayPinsPointDataProps, MapView } from '@tmlmobilidade/ui';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/utils';
import { type Point } from 'geojson';
import { useMemo } from 'react';

/* * */

export default function CreateStopStep1Map() {
	//

	//
	// A. Setup variables

	const stopCreateContext = useStopCreateContext();
	const stopsListContext = useStopsListContext();

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
				id: item._id,
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
		// Skip if no data is provided
		if (!stopCreateContext.data.form.values.latitude) return baseGeoJson;
		if (!stopCreateContext.data.form.values.longitude) return baseGeoJson;
		// Add the features to the base GeoJSON
		baseGeoJson.features = [{
			geometry: {
				coordinates: [stopCreateContext.data.form.values.longitude, stopCreateContext.data.form.values.latitude],
				type: 'Point',
			},
			properties: {
				id: 'selected-coordinates',
			},
			type: 'Feature',
		}];
		// Return the collection
		return baseGeoJson;
	}, [stopCreateContext.data.form.values]);

	//
	// C. Handle actions

	const handleMapClick = (event) => {
		stopCreateContext.actions.createStopCoordinates(event.lngLat.lat, event.lngLat.lng);
	};

	//
	// D. Render Components

	return (
		<div style={{ height: '400px' }}>
			<MapView id="create-stop-map" onClick={handleMapClick}>
				<MapOverlayMultipleStops
					data={stopsAsGeojsonFC}
					id="stops-list"
					visible
				/>
				<MapOverlayPins
					id="selected-coordinates"
					pinsData={selectedCoordinatesMapData}
				/>
			</MapView>
		</div>
	);

	//
}
