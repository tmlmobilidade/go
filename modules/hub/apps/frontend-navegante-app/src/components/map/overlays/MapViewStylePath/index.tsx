'use client';

import { getBaseGeoJsonFeatureCollection } from '@tmlmobilidade/geo';
import { Layer, Source } from '@vis.gl/react-maplibre';

/* * */

export const MapViewStylePathPrimaryLayerId = 'default-layer-path-shape-line';
export const MapViewStylePathInteractiveLayerId = 'default-layer-path-waypoints';

/* * */

interface Props {
	idPrefix?: string
	presentBeforeId?: string
	shapeData?: GeoJSON.Feature | GeoJSON.FeatureCollection
	variant?: 'context' | 'default'
	waypointsData?: GeoJSON.FeatureCollection
}

/* * */

const baseGeoJsonFeatureCollection = getBaseGeoJsonFeatureCollection();

/* * */

export function MapViewStylePath({ idPrefix = 'default', presentBeforeId, shapeData = baseGeoJsonFeatureCollection, variant = 'default', waypointsData = baseGeoJsonFeatureCollection }: Props) {
	const shapeSourceId = `${idPrefix}-source-path-shape`;
	const waypointsSourceId = `${idPrefix}-source-path-waypoints`;
	const waypointsLayerId = `${idPrefix}-layer-path-waypoints`;
	const shapeContextLineLayerId = `${idPrefix}-layer-path-shape-context`;
	const shapeDirectionLayerId = `${idPrefix}-layer-path-shape-direction`;
	const shapeLineLayerId = `${idPrefix}-layer-path-shape-line`;
	const shapePaddingLayerId = `${idPrefix}-layer-path-shape-padding`;
	const shapePaddingShadowLayerId = `${idPrefix}-layer-path-shape-padding-shadow`;

	if (variant === 'context') {
		return (
			<Source data={shapeData} generateId={true} id={shapeSourceId} type="geojson">
				<Layer
					beforeId={presentBeforeId}
					id={shapeContextLineLayerId}
					source={shapeSourceId}
					type="line"
					layout={{
						'line-cap': 'round',
						'line-join': 'round',
					}}
					paint={{
						'line-color': ['get', 'color'],
						'line-opacity': 0.28,
						'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2, 20, 7],
					}}
				/>
			</Source>
		);
	}

	return (
		<>

			<Source data={waypointsData} generateId={true} id={waypointsSourceId} type="geojson">
				<Layer
					beforeId={presentBeforeId}
					id={waypointsLayerId}
					source={waypointsSourceId}
					type="circle"
					paint={{
						'circle-color': ['get', 'text_color'],
						'circle-pitch-alignment': 'map',
						'circle-radius': [
							'interpolate',
							['linear'],
							['zoom'],
							9,
							1,
							26,
							15,
						],
						'circle-stroke-color': ['get', 'color'],
						'circle-stroke-width': ['interpolate',
							['linear'],
							['zoom'],
							9,
							1,
							26,
							7,
						],
					}}
				/>
			</Source>

			<Source data={shapeData} generateId={true} id={shapeSourceId} type="geojson">
				<Layer
					beforeId={waypointsLayerId}
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

		</>
	);
}
