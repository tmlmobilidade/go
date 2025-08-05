'use client';

/* * */

import { Layer, Source } from '@vis.gl/react-maplibre';
import { useMemo } from 'react';

import { MapView } from '../MapView';

/* * */

interface Props {
	stopLoc: [number, number]
}

/* * */

export function MapViewSingleStop({ stopLoc }: Props) {
	//

	//
	// A. Transform data

	const stopMarkerMapData: GeoJSON.FeatureCollection = useMemo(() => {
		if (!stopLoc) {
			return {
				features: [],
				type: 'FeatureCollection',
			};
		}
		return {
			features: [{
				geometry: {
					coordinates: [parseFloat(`${stopLoc[1]}`), parseFloat(`${stopLoc[0]}`)],
					type: 'Point',
				},
				properties: {},
				type: 'Feature',
			}],
			type: 'FeatureCollection',
		};
	}, [stopLoc]);

	//
	// B. Render components

	return (
		<div style={{ height: 400, width: '100%' }}>
			<MapView
				id="selectSchoolMap"
				interactiveLayerIds={['allStops']}
				scale
				scrollZoom
				toolbar
			>
				<Source data={stopMarkerMapData} generateId={true} id="stop-marker" type="geojson">
					<Layer
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
			</MapView>
		</div>
	);

	//
}
