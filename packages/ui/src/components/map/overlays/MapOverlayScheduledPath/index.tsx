'use client';

import { Layer, type MapMouseEvent, Popup, Source } from '@vis.gl/react-maplibre';
import { type Feature, type FeatureCollection, type LineString, type Point } from 'geojson';
import { useEffect, useState } from 'react';

import styles from './styles.module.css';

import { Divider } from '../../../layout/Divider';
import { useMapViewContext } from '../../view/MapViewContext';

/* * */

export interface MapOverlayScheduledPathPointsDataProps {
	arrival_time: string
	id: string
	name: string
	passengers_observed?: number
	sequence: number
}

export interface MapOverlayScheduledPathLineDataProps {
	id: string
}

/* * */

interface MapOverlayScheduledPathProps {
	id: string
	lineData?: FeatureCollection<LineString, MapOverlayScheduledPathLineDataProps> | null
	pointsData?: FeatureCollection<Point, MapOverlayScheduledPathPointsDataProps> | null
	visible?: boolean
}

/* * */

export function MapOverlayScheduledPath({ id, lineData, pointsData, visible = true }: MapOverlayScheduledPathProps) {
	//

	//
	// A. Setup variables

	const mapViewContext = useMapViewContext();

	const interactiveLayerIds = [`${id}:scheduled-path:layer:points`];

	const [hoveredFeature, setHoveredFeature] = useState<Feature<Point, MapOverlayScheduledPathPointsDataProps> | null>(null);

	//
	// B. Handle actions

	useEffect(() => {
		// Register features for sources in this overlay component
		if (lineData) mapViewContext.actions.registerOverlaySource(`${id}:scheduled-path:source:line`, lineData);
		if (pointsData) mapViewContext.actions.registerOverlaySource(`${id}:scheduled-path:source:points`, pointsData);
		return () => {
			mapViewContext.actions.unregisterOverlaySource(`${id}:scheduled-path:source:line`);
			mapViewContext.actions.unregisterOverlaySource(`${id}:scheduled-path:source:points`);
		};
	}, [lineData, pointsData]);

	const handleMouseOverEvent = (event: MapMouseEvent) => {
		const relevantFeature = event.target
			.queryRenderedFeatures(event.point)
			.find(feature => interactiveLayerIds.includes(feature.layer.id));
		if (!relevantFeature) return setHoveredFeature(null);
		setHoveredFeature(relevantFeature as unknown as Feature<Point, MapOverlayScheduledPathPointsDataProps>);
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
						<span className={styles.id}>#{hoveredFeature.properties.id}</span>
						<span className={styles.name}>{hoveredFeature.properties.name}</span>
						<Divider />
						<span className={styles.value}>Sequência: {hoveredFeature.properties.sequence}/{pointsData.features.length}</span>
						<span className={styles.value}>Hora planeada: {hoveredFeature.properties.arrival_time}</span>
						<Divider />
						<span className={styles.value}>Entradas: {hoveredFeature.properties.passengers_observed}</span>
					</div>
				</Popup>
			)}

			<Source data={lineData} id={`${id}:scheduled-path:source:line`} type="geojson" generateId>
				<Layer
					id={`${id}:scheduled-path:layer:line-shadow`}
					source={`${id}:scheduled-path:source:line`}
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
					id={`${id}:scheduled-path:layer:line-padding`}
					source={`${id}:scheduled-path:source:line`}
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
							70, // max radius
						],
					}}
				/>
				<Layer
					id={`${id}:scheduled-path:layer:line`}
					source={`${id}:scheduled-path:source:line`}
					type="line"
					layout={{
						'line-cap': 'round',
						'line-join': 'round',
						'visibility': visible ? 'visible' : 'none',
					}}
					paint={{
						'line-color': '#000000', // primaryColorHexValue,
						'line-width': [
							'interpolate',
							['linear'],
							['zoom'],
							10, // min zoom level
							4, // min radius
							25, // max zoom level
							40, // max radius
						],
					}}
				/>
				<Layer
					id={`${id}:scheduled-path:layer:line-direction`}
					source={`${id}:scheduled-path:source:line`}
					type="symbol"
					layout={{
						'icon-allow-overlap': true,
						'icon-anchor': 'center',
						'icon-ignore-placement': true,
						'icon-image': 'map-shape-arrow-inline',
						'icon-offset': [0, 0],
						'icon-rotate': 0,
						'icon-size': [
							'interpolate',
							['linear'],
							['zoom'],
							10, // min zoom level
							0.1, // min radius
							25, // max zoom level
							0.5, // max radius
						],
						'symbol-placement': 'line',
						'symbol-spacing': ['interpolate', ['linear'], ['zoom'], 10, 2, 20, 30],
						'visibility': visible ? 'visible' : 'none',
					}}
					paint={{
						'icon-color': '#ffffff',
						'icon-opacity': 1,
					}}
				/>
			</Source>

			<Source data={pointsData} id={`${id}:scheduled-path:source:points`} type="geojson" generateId>
				<Layer
					id={`${id}:scheduled-path:layer:points-shadow`}
					source={`${id}:scheduled-path:source:points`}
					type="circle"
					layout={{
						visibility: visible ? 'visible' : 'none',
					}}
					paint={{
						'circle-blur': 1,
						'circle-color': '#000000',
						'circle-opacity': 0.3,
						'circle-pitch-alignment': 'map',
						'circle-radius': [
							'interpolate',
							['linear'],
							['zoom'],
							10, // min zoom level
							2, // min radius
							25, // max zoom level
							70, // max radius
						],
					}}
				/>
				<Layer
					id={`${id}:scheduled-path:layer:points`}
					source={`${id}:scheduled-path:source:points`}
					type="circle"
					layout={{
						visibility: visible ? 'visible' : 'none',
					}}
					paint={{
						'circle-color': '#000000',
						'circle-pitch-alignment': 'map',
						'circle-radius': [
							'interpolate',
							['linear'],
							['zoom'],
							10, // min zoom level
							0.05, // min radius
							25, // max zoom level
							25, // max radius
						],
						'circle-stroke-color': '#ffffff',
						'circle-stroke-width': ['interpolate',
							['linear'],
							['zoom'],
							10, // min zoom level
							1, // min radius
							25, // max zoom level
							10, // max radius
						],
					}}
				/>
			</Source>

		</>
	);

	//
}
