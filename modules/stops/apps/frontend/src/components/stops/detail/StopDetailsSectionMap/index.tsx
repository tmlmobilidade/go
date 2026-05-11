'use client';

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { MapOverlayMultipleStops, type MapOverlayMultipleStopsDataProps, MapView } from '@tmlmobilidade/ui';
import { type Point } from 'geojson';
import { useMemo } from 'react';

/* * */

export function StopDetailsSectionMap() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Transform data

	const stopAsGeojsonFC = useMemo(() => {
		// Prepare an empty feature collection
		const baseGeoJson = getBaseGeoJsonFeatureCollection<Point, MapOverlayMultipleStopsDataProps>();
		// Skip if no data is provided
		if (!stopDetailContext.data.stop) return baseGeoJson;
		// Add the features to the base GeoJSON
		baseGeoJson.features = [{
			geometry: {
				coordinates: [stopDetailContext.data.stop.longitude, stopDetailContext.data.stop.latitude],
				type: 'Point',
			},
			properties: {
				id: String(stopDetailContext.data.stop._id),
				name: stopDetailContext.data.stop.name,
			},
			type: 'Feature',
		}];
		// Return the collection
		return baseGeoJson;
	}, [stopDetailContext.data.stop]);

	//
	// C. Handle actions

	//
	// D. Render components

	return (
		<MapView height={400} id="single-stop">
			<MapOverlayMultipleStops
				data={stopAsGeojsonFC}
				id="single-stop"
				visible
			/>
		</MapView>
	);

	//
}
