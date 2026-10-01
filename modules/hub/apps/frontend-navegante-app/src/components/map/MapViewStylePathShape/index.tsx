'use client';

import { Layer, Source } from '@vis.gl/react-maplibre';

/* * */

interface Props {
	idPrefix: string
	presentBeforeId: string
	shapeData: GeoJSON.Feature
}

/* * */

export function MapViewStylePathShape({ idPrefix, presentBeforeId, shapeData }: Props) {
	//

	//
	// A. Setup variables

	const shapeSourceId = `${idPrefix}-source-path-shape`;
	const shapeDirectionLayerId = `${idPrefix}-layer-path-shape-direction`;
	const shapeLineLayerId = `${idPrefix}-layer-path-shape-line`;
	const shapePaddingLayerId = `${idPrefix}-layer-path-shape-padding`;
	const shapePaddingShadowLayerId = `${idPrefix}-layer-path-shape-padding-shadow`;

	//
	// B. Render components

	return (
		<Source data={shapeData} generateId={true} id={shapeSourceId} type="geojson">
			<Layer
				beforeId={presentBeforeId}
				id={shapeDirectionLayerId}
				source={shapeSourceId}
				type="symbol"
				layout={{
					'icon-allow-overlap': true,
					'icon-anchor': 'center',
					'icon-ignore-placement': true,
					'icon-image': 'map-shape-arrow-inline',
					'icon-offset': [0, 0],
					'icon-rotate': 0,
					'icon-size': ['interpolate', ['linear'], ['zoom'], 10, 0.1, 20, 0.2],
					'symbol-placement': 'line',
					'symbol-spacing': ['interpolate', ['linear'], ['zoom'], 10, 2, 20, 30],
				}}
				paint={{
					'icon-color': '#ffffff',
					'icon-opacity': 0.8,
				}}
			/>
			<Layer
				beforeId={shapeDirectionLayerId}
				id={shapeLineLayerId}
				source={shapeSourceId}
				type="line"
				layout={{
					'line-cap': 'round',
					'line-join': 'round',
				}}
				paint={{
					'line-color': ['get', 'color'],
					'line-width': ['interpolate', ['linear'], ['zoom'], 10, 4, 20, 12],
				}}
			/>
			<Layer
				beforeId={shapeLineLayerId}
				id={shapePaddingLayerId}
				source={shapeSourceId}
				type="line"
				layout={{
					'line-cap': 'round',
					'line-join': 'round',
				}}
				paint={{
					'line-color': '#ffffff',
					'line-width': ['interpolate', ['linear'], ['zoom'], 10, 4, 20, 26],
				}}
			/>
			<Layer
				beforeId={shapePaddingLayerId}
				id={shapePaddingShadowLayerId}
				source={shapeSourceId}
				type="line"
				layout={{
					'line-cap': 'round',
					'line-join': 'round',
				}}
				paint={{
					'line-blur': 15,
					'line-color': '#000000',
					'line-opacity': 0.3,
					'line-width': ['interpolate', ['linear'], ['zoom'], 10, 4, 20, 40],
				}}
			/>
		</Source>
	);
}
