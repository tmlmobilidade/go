'use client';

/* * */

import { getBaseGeoJsonFeatureCollection } from '@//utils/map.utils';
import { Layer, Source } from '@vis.gl/react-maplibre';

/* * */

export const MapViewStylePathPrimaryLayerId = 'default-layer-path-shape-line';
export const MapViewStylePathInteractiveLayerId = 'default-layer-path-waypoints';

/* * */

interface Props {
	presentBeforeId?: string
	shapeData?: GeoJSON.Feature | GeoJSON.FeatureCollection
	viewId: string
	waypointsData?: GeoJSON.FeatureCollection
}

/* * */

export function MapViewStylePath({ presentBeforeId, shapeData = getBaseGeoJsonFeatureCollection(), viewId, waypointsData = getBaseGeoJsonFeatureCollection() }: Props) {
	return (
		<>

			<Source data={waypointsData} generateId={true} id={`${viewId}-default-source-path-waypoints`} type="geojson">
				<Layer
					beforeId={presentBeforeId}
					id={`${viewId}-default-layer-path-waypoints`}
					source={`${viewId}-default-source-path-waypoints`}
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

			<Source data={shapeData} generateId={true} id={`${viewId}-default-source-path-shape`} type="geojson">
				<Layer
					beforeId={`${viewId}-default-layer-path-waypoints`}
					id={`${viewId}-default-layer-path-shape-direction`}
					source={`${viewId}-default-source-path-shape`}
					type="symbol"
					layout={{
						'icon-allow-overlap': true,
						'icon-anchor': 'center',
						'icon-ignore-placement': true,
						'icon-image': 'cmet-shape-direction',
						'icon-offset': [0, 0],
						'icon-rotate': 90,
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
					beforeId={`${viewId}-default-layer-path-shape-direction`}
					id={`${viewId}-default-layer-path-shape-line`}
					source={`${viewId}-default-source-path-shape`}
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
					beforeId={`${viewId}-default-layer-path-shape-line`}
					id={`${viewId}-default-layer-path-shape-padding`}
					source={`${viewId}-default-source-path-shape`}
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
					beforeId={`${viewId}-default-layer-path-shape-padding`}
					id={`${viewId}-default-layer-path-shape-padding-shadow`}
					source={`${viewId}-default-source-path-shape`}
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
