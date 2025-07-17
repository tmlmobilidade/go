'use client';

/* * */

import { Stop } from '@tmlmobilidade/types';
import { useMemo } from 'react';
import { Layer, Source } from 'react-map-gl/maplibre';

/* * */

interface Props {
	stopData: Stop
}

/* * */

export function MapViewSingleStop({ stopData }: Props) {
	//

	//
	// A. Transform data

	const stopMarkerMapData: GeoJSON.FeatureCollection = useMemo(() => {
		if (!stopData || !stopData.latitude || !stopData.longitude) {
			return {
				features: [],
				type: 'FeatureCollection',
			};
		}
		return {
			features: [{
				geometry: {
					coordinates: [parseFloat(`${stopData.longitude}`), parseFloat(`${stopData.latitude}`)],
					type: 'Point',
				},
				properties: {},
				type: 'Feature',
			}],
			type: 'FeatureCollection',
		};
	}, [stopData]);

	//
	// B. Render components

	return (
		<Source data={stopMarkerMapData} generateId={true} id="stop-marker" type="geojson">
			<Layer
				id="stop-marker-img"
				source="stop-markers"
				type="symbol"
				layout={{
					'icon-allow-overlap': true,
					'icon-anchor': 'bottom',
					'icon-ignore-placement': true,
					'icon-image': 'stop-marker',
					'icon-offset': [0, 5],
					'icon-size': ['interpolate', ['linear'], ['zoom'], 10, 0.25, 20, 0.35],
					'symbol-placement': 'point',
				}}
				paint={{
					'icon-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 10, 1],
				}}
			/>
		</Source>
	);

	//
}
