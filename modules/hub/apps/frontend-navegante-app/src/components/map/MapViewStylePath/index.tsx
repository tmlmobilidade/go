'use client';

import { MapViewStylePathShape } from '@/components/map/MapViewStylePathShape';
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
	//

	//
	// A. Setup variables

	const shapeSourceId = `${idPrefix}-source-path-shape`;
	const waypointsSourceId = `${idPrefix}-source-path-waypoints`;
	const waypointsLayerId = `${idPrefix}-layer-path-waypoints`;
	const shapeFeatures = shapeData.type === 'FeatureCollection' ? shapeData.features : [shapeData];
	const shapeContextLineLayerId = `${idPrefix}-layer-path-shape-context`;

	//
	// B. Transform data

	// Mount upper shapes first so each lower stack can be inserted beneath it.
	const shapeLayers = shapeFeatures.map((feature, index) => ({
		idPrefix: shapeFeatures.length === 1 ? idPrefix : `${idPrefix}-${index}`,
		presentBeforeId: index === shapeFeatures.length - 1 ? waypointsLayerId : `${idPrefix}-${index + 1}-layer-path-shape-padding-shadow`,
		shapeData: feature,
	})).reverse();

	//
	// C. Render components

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

			{shapeLayers.map(shapeLayer => (
				<MapViewStylePathShape
					key={shapeLayer.idPrefix}
					idPrefix={shapeLayer.idPrefix}
					presentBeforeId={shapeLayer.presentBeforeId}
					shapeData={shapeLayer.shapeData}
				/>
			))}

		</>
	);
}
