'use client';

import { useStopsListData } from '@/components/stops/list/use-stops-list-data';
import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { keepUrlParams, MapOverlayMultipleStops, type MapOverlayMultipleStopsDataProps, MapView, Pane } from '@tmlmobilidade/ui';
import { FeatureCollection, Point } from 'geojson';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

/* * */

export function StopsListMap() {
	//

	//
	// A. Setup variables

	const router = useRouter();
	const { data } = useStopsListData();

	//
	// B. Transform data

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
	// B. Handle actions

	const handleStopClick = (value: MapOverlayMultipleStopsDataProps) => {
		router.push(keepUrlParams(PAGE_ROUTES.infrastructure.STOPS_DETAIL(String(value.id))));
	};

	//
	// D. Render components

	return (
		<Pane>
			<MapView id="stops-list">
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
