'use client';

import { MapOverlayPins, MapOverlayPinsPointDataProps, MapOverlayPolygon, MapView } from '@tmlmobilidade/ui';
import * as turf from '@turf/turf';
import { FeatureCollection, Point } from 'geojson';
import { useMemo } from 'react';

import { useStopsDetailData } from '../../use-stops-detail-data';

/* * */

export function StopsDetailUpdateCoordinatesModalMap() {
	//

	//
	// A. Setup variables

	const { data } = useStopsDetailData();

	//
	// B. Transform data

	const mapViewportMask = useMemo(() => {
		// Create a circle around the point
		const circle = turf.circle([data?.longitude, data?.latitude], 1000, {
			steps: 64,
			units: 'meters',
		});
		// World-sized polygon
		const world = turf.polygon([[
			[-180, -90],
			[180, -90],
			[180, 90],
			[-180, 90],
			[-180, -90],
		]]);
		// Subtract circle from viewport
		const difference = turf.difference(turf.featureCollection([world, circle]));
		return turf.featureCollection([{
			geometry: difference.geometry,
			id: 'mask',
			properties: { id: 'mask' },
			type: 'Feature',
		}]);
	}, [data?.latitude, data?.longitude]);

	const pinsData = useMemo<FeatureCollection<Point, MapOverlayPinsPointDataProps>>(() => {
		return turf.featureCollection([{
			geometry: {
				coordinates: [data?.longitude, data?.latitude],
				type: 'Point',
			},
			id: 'stop',
			properties: { id: 'stop' },
			type: 'Feature',
		}]);
	}, [data?.longitude, data?.latitude]);

	//
	// B. Render components

	return (
		<MapView height={200} id="editStopCoordinatesMap">
			<MapOverlayPins id="pins" pinsData={pinsData} focusOnChange visible />
			<MapOverlayPolygon data={mapViewportMask} id="mask" />
		</MapView>
	);
}
