'use client';

/* * */

import { Layer, type MapMouseEvent, Popup, Source } from '@vis.gl/react-maplibre';
import { type Feature, type FeatureCollection, type LineString, type Point } from 'geojson';
import { useEffect, useState } from 'react';

import styles from './styles.module.css';

import { useCssVariable } from '../../../../hooks/use-css-variable';
import { Divider } from '../../../layout/Divider';
import { useMapViewContext } from '../../view/MapViewContext';

/* * */

export interface MapOverlayObservedPathPointsDataProps {
	id: string
	sequence: number
	stop_id: string
	timestamp: string
	trigger_door: string
}

export interface MapOverlayObservedPathLineDataProps {
	id: string
}

/* * */

/** MapLibre draws layers in array order; later = on top. Re-stack these after other overlays (e.g. scheduled path) mount. */
const OBSERVED_PATH_LAYER_SUFFIXES = [
	'line-shadow',
	'line-padding',
	'line',
	'line-direction-padding',
	'line-direction',
	'points',
] as const;

/* * */

interface MapOverlayObservedPathProps {
	id: string
	lineData?: FeatureCollection<LineString, MapOverlayObservedPathLineDataProps> | null
	pointsData?: FeatureCollection<Point, MapOverlayObservedPathPointsDataProps> | null
	visible?: boolean
}

/* * */

export function MapOverlayObservedPath({ id, lineData, pointsData, visible = true }: MapOverlayObservedPathProps) {
	//

	//
	// A. Setup variables

	const mapViewContext = useMapViewContext();

	const interactiveLayerIds = [`${id}:observed-path:layer:points`];

	const primaryColorHexValue = useCssVariable('--color-primary', '#000000');

	const [hoveredFeature, setHoveredFeature] = useState<Feature<Point, MapOverlayObservedPathPointsDataProps> | null>(null);

	//
	// B. Handle actions

	useEffect(() => {
		// Register features for sources in this overlay component
		if (lineData) mapViewContext.actions.registerOverlaySource(`${id}:observed-path:source:line`, lineData);
		if (pointsData) mapViewContext.actions.registerOverlaySource(`${id}:observed-path:source:points`, pointsData);
		return () => {
			mapViewContext.actions.unregisterOverlaySource(`${id}:observed-path:source:line`);
			mapViewContext.actions.unregisterOverlaySource(`${id}:observed-path:source:points`);
		};
	}, [lineData, pointsData]);

	useEffect(() => {
		if (!lineData || !pointsData) return;
		if (mapViewContext.flags.loading) return;

		const mapRef = mapViewContext.ref.map.current;
		if (!mapRef) return;

		const map = mapRef.getMap();
		const layerIds = OBSERVED_PATH_LAYER_SUFFIXES.map(suffix => `${id}:observed-path:layer:${suffix}`);

		const bringObservedPathToFront = () => {
			if (!map.isStyleLoaded()) return;
			const layers = map.getStyle()?.layers;
			if (!layers?.length) return;
			if (layers[layers.length - 1]?.id === layerIds[layerIds.length - 1]) return;

			for (const layerId of layerIds) {
				if (map.getLayer(layerId)) {
					map.moveLayer(layerId);
				}
			}
		};

		const onStyleData = () => {
			requestAnimationFrame(bringObservedPathToFront);
		};

		bringObservedPathToFront();
		map.on('styledata', onStyleData);

		return () => {
			map.off('styledata', onStyleData);
		};
	}, [id, lineData, pointsData, mapViewContext.flags.loading]);

	const handleMouseOverEvent = (event: MapMouseEvent) => {
		const relevantFeature = event.target
			.queryRenderedFeatures(event.point)
			.find(feature => interactiveLayerIds.includes(feature.layer.id));
		if (!relevantFeature) return setHoveredFeature(null);
		setHoveredFeature(relevantFeature as unknown as Feature<Point, MapOverlayObservedPathPointsDataProps>);
	};

	useEffect(() => {
		// Skip if no map collection is available
		if (!mapViewContext.ref.map.current) return;
		// Attach a click event listener to the map
		// so that when a feature is interacted with, we can handle it here.
		mapViewContext.ref.map.current.on('mousemove', handleMouseOverEvent);
	}, [mapViewContext.ref.map.current]);

	//
	// C. Render components

	if (!lineData || !pointsData) {
		return null;
	}

	return (
		<>

			{hoveredFeature && (
				<Popup
					anchor="bottom"
					closeButton={false}
					latitude={hoveredFeature.geometry.coordinates[1] ?? 0}
					longitude={hoveredFeature.geometry.coordinates[0] ?? 0}
					maxWidth="300px"
					offset={12}
				>
					<div className={styles.popup}>
						<span className={styles.id}>{hoveredFeature.properties.sequence}/{pointsData.features.length}</span>
						<span className={styles.id}>#{hoveredFeature.properties.id}</span>
						<Divider />
						<span className={styles.value}>Portas: {hoveredFeature.properties.trigger_door}</span>
						<span className={styles.value}>Stop ID: #{hoveredFeature.properties.stop_id}</span>
						<span className={styles.value}>Hora: {hoveredFeature.properties.timestamp}</span>
					</div>
				</Popup>
			)}

			<Source data={lineData} id={`${id}:observed-path:source:line`} type="geojson" generateId>
				<Layer
					id={`${id}:observed-path:layer:line-shadow`}
					source={`${id}:observed-path:source:line`}
					type="line"
					layout={{
						'line-cap': 'round',
						'line-join': 'round',
						'visibility': visible ? 'visible' : 'none',
					}}
					paint={{
						'line-blur': 15,
						'line-color': '#000000',
						'line-opacity': 0.3,
						'line-width': [
							'interpolate',
							['linear'],
							['zoom'],
							10, // min zoom level
							4, // min radius
							25, // max zoom level
							80, // max radius
						],
					}}
				/>
				<Layer
					id={`${id}:observed-path:layer:line-padding`}
					source={`${id}:observed-path:source:line`}
					type="line"
					layout={{
						'line-cap': 'round',
						'line-join': 'round',
						'visibility': visible ? 'visible' : 'none',
					}}
					paint={{
						'line-color': '#ffffff',
						'line-width': [
							'interpolate',
							['linear'],
							['zoom'],
							10, // min zoom level
							0.5, // min radius
							25, // max zoom level
							30, // max radius
						],
					}}
				/>
				<Layer
					id={`${id}:observed-path:layer:line`}
					source={`${id}:observed-path:source:line`}
					type="line"
					layout={{
						'line-cap': 'round',
						'line-join': 'round',
						'visibility': visible ? 'visible' : 'none',
					}}
					paint={{
						'line-color': primaryColorHexValue,
						'line-width': [
							'interpolate',
							['linear'],
							['zoom'],
							10, // min zoom level
							4, // min radius
							25, // max zoom level
							10, // max radius
						],
					}}
				/>
				<Layer
					id={`${id}:observed-path:layer:line-direction-padding`}
					source={`${id}:observed-path:source:line`}
					type="symbol"
					layout={{
						'icon-allow-overlap': true,
						'icon-anchor': 'center',
						'icon-ignore-placement': true,
						'icon-image': 'map-line-direction-offset-padding',
						'icon-offset': [0, 80],
						'icon-rotate': 0,
						'icon-size': [
							'interpolate',
							['linear'],
							['zoom'],
							10, // min zoom level
							0.1, // min radius
							25, // max zoom level
							1, // max radius
						],
						'symbol-placement': 'line',
						'symbol-spacing': [
							'interpolate',
							['linear'],
							['zoom'],
							10, // min zoom level
							20, // min radius
							25, // max zoom level
							300, // max radius
						],
						'visibility': visible ? 'visible' : 'none',
					}}
					paint={{
						'icon-color': '#ffffff',
						'icon-opacity': 1,
					}}
				/>
				<Layer
					id={`${id}:observed-path:layer:line-direction`}
					source={`${id}:observed-path:source:line`}
					type="symbol"
					layout={{
						'icon-allow-overlap': true,
						'icon-anchor': 'center',
						'icon-ignore-placement': true,
						'icon-image': 'map-line-direction-offset',
						'icon-offset': [0, 80],
						'icon-rotate': 0,
						'icon-size': [
							'interpolate',
							['linear'],
							['zoom'],
							10, // min zoom level
							0.1, // min radius
							25, // max zoom level
							1, // max radius
						],
						'symbol-placement': 'line',
						'symbol-spacing': [
							'interpolate',
							['linear'],
							['zoom'],
							10, // min zoom level
							20, // min radius
							25, // max zoom level
							300, // max radius
						],
						'visibility': visible ? 'visible' : 'none',
					}}
					paint={{
						'icon-color': primaryColorHexValue,
						'icon-opacity': 1,
					}}
				/>
			</Source>

			<Source data={pointsData} id={`${id}:observed-path:source:points`} type="geojson" generateId>
				<Layer
					id={`${id}:observed-path:layer:points`}
					source={`${id}:observed-path:source:points`}
					type="circle"
					layout={{
						visibility: visible ? 'visible' : 'none',
					}}
					paint={{
						'circle-color': primaryColorHexValue,
						'circle-pitch-alignment': 'map',
						'circle-radius': [
							'interpolate',
							['linear'],
							['zoom'],
							10, // min zoom level
							0.05, // min radius
							25, // max zoom level
							15, // max radius
						],
						'circle-stroke-color': '#ffffff',
						'circle-stroke-width': ['interpolate',
							['linear'],
							['zoom'],
							10, // min zoom level
							1, // min radius
							25, // max zoom level
							5, // max radius
						],
					}}
				/>
			</Source>

		</>
	);

	//
}
