'use client';

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { MapOverlayMultipleStops, type MapOverlayMultipleStopsDataProps, MapView } from '@tmlmobilidade/ui';
import { type Point } from 'geojson';
import { useMemo } from 'react';

/* * */

function toFiniteCoord(value: unknown): null | number {
	const n = typeof value === 'number' ? value : Number(value);
	return Number.isFinite(n) ? n : null;
}

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
		const stop = stopDetailContext.data.stop;
		const { form } = stopDetailContext.data;

		// Skip if no data is provided
		if (!stop?._id) return baseGeoJson;

		// Get the coordinates
		const lat = toFiniteCoord(form.values.latitude) ?? toFiniteCoord(stop.latitude);
		const lng = toFiniteCoord(form.values.longitude) ?? toFiniteCoord(stop.longitude);
		if (lat == null || lng == null) return baseGeoJson;

		// Add the feature to the collection
		baseGeoJson.features = [{
			geometry: {
				coordinates: [lng, lat],
				type: 'Point',
			},
			properties: {
				id: String(stop._id),
				name: typeof form.values.name === 'string' ? form.values.name : stop.name,
			},
			type: 'Feature',
		}];
		return baseGeoJson;
	}, [stopDetailContext.data]);

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
