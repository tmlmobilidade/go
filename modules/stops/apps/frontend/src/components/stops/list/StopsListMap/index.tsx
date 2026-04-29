'use client';

/* * */

import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { keepUrlParams, MapOverlayMultipleStops, type MapOverlayMultipleStopsDataProps, MapView, Pane } from '@tmlmobilidade/ui';
import { type Point } from 'geojson';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

/* * */

export function StopsListMap() {
	//

	//
	// A. Setup variables

	const router = useRouter();
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
				id: String(item._id),
				name: item.name,
			},
			type: 'Feature',
		}));
		// Return the collection
		return baseGeoJson;
	}, [stopsListContext.data.filtered]);

	//
	// C. Handle actions

	const handleStopClick = (value: MapOverlayMultipleStopsDataProps) => {
		router.push(keepUrlParams(PAGE_ROUTES.stops.STOPS_DETAIL(String(value.id))));
	};

	//
	// D. Render components

	return (
		<Pane>
			<MapView id="stops-list">
				<MapOverlayMultipleStops
					data={stopsAsGeojsonFC}
					id="stops-list"
					onClick={handleStopClick}
					visible
				/>
			</MapView>
		</Pane>
	);

	//
}
