'use client';

import { useStopsListData } from '@/components/stops/list/use-stops-list-data';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { keepUrlParams, MapOverlayMultipleStops, type MapOverlayMultipleStopsDataProps, MapOverlayPolygon, MapView, Pane } from '@tmlmobilidade/ui';
import { circle, featureCollection } from '@turf/turf';
import { type FeatureCollection, type Point } from 'geojson';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { STOPS_COORDINATES_RADIUS_METERS } from '../filters/StopsListFilterCoordinates/coordinates';
import { useStopsListFilterCoordinates } from '../filters/StopsListFilterCoordinates/use-stops-list-filter-coordinates';

/* * */

export function StopsListMap() {
	//

	//
	// A. Setup variables

	const router = useRouter();

	const { data } = useStopsListData();
	const { coordinates } = useStopsListFilterCoordinates();

	//
	// B. Transform data

	const boundaryData = useMemo(() => {
		if (!coordinates) return null;
		const boundary = circle(coordinates, STOPS_COORDINATES_RADIUS_METERS, { steps: 128, units: 'meters' });
		return featureCollection([{ ...boundary, properties: { id: 'coordinate-boundary' } }]);
	}, [coordinates]);

	const mapData = useMemo<FeatureCollection<Point, MapOverlayMultipleStopsDataProps>>(() => {
		const baseFeatureCollection: FeatureCollection<Point, MapOverlayMultipleStopsDataProps> = {
			features: [],
			type: 'FeatureCollection',
		};
		data?.forEach((stop) => {
			baseFeatureCollection.features.push({
				geometry: {
					coordinates: [stop.longitude, stop.latitude],
					type: 'Point',
				},
				properties: {
					id: String(stop._id),
					name: stop.name,
				},
				type: 'Feature',
			});
		});
		return baseFeatureCollection;
	}, [data]);

	//
	// C. Handle actions

	const handleStopClick = (value: MapOverlayMultipleStopsDataProps) => {
		router.push(keepUrlParams(PAGE_ROUTES.infrastructure.STOPS_DETAIL(String(value.id))));
	};

	//
	// D. Render components

	return (
		<Pane>
			<MapView id="stops-list">
				{boundaryData && <MapOverlayPolygon color="#1971c2" data={boundaryData} fillOpacity={0.05} id="stops-coordinate-boundary" />}
				<MapOverlayMultipleStops
					data={mapData}
					id="stops-list"
					onClick={handleStopClick}
					visible
				/>
			</MapView>
		</Pane>
	);
}
