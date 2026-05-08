'use client';

import { Layer, Popup, Source } from '@vis.gl/react-maplibre';
import { type Feature, type FeatureCollection, type LineString, type Point } from 'geojson';
import { MapMouseEvent } from 'maplibre-gl';
import { useEffect, useState } from 'react';

import styles from './styles.module.css';

import { useCssVariable } from '../../../../hooks';
import { Divider } from '../../../layout/Divider';
import { useMapViewContext } from '../../view/MapViewContext';

/* * */

export interface MapOverlayPatternShapeLineDataProps {
	color?: string
	id: string
}

export interface MapOverlayPatternShapeStopsDataProps {
	id: string
	name: string
	sequence: number
}

/* * */

interface MapOverlayPatternShapeProps {
	id: string
	lineColor?: string
	lineData: Feature<LineString, MapOverlayPatternShapeLineDataProps> | FeatureCollection<LineString, MapOverlayPatternShapeLineDataProps> | null
	stopsData?: FeatureCollection<Point, MapOverlayPatternShapeStopsDataProps> | null
	visible?: boolean
}

/* * */

export function MapOverlayPatternShape({ id, lineColor = '#000000', lineData, stopsData, visible = true }: MapOverlayPatternShapeProps) {
	//

	//
	// A. Setup variables

	const mapViewContext = useMapViewContext();
	const primaryHexColor = useCssVariable('--color-primary');

	const interactiveLayerIds = [`${id}:pattern-shape:layer:stops-circle`, `${id}:pattern-shape:layer:stops-labels`];

	const [hoveredFeature, setHoveredFeature] = useState<Feature<Point, MapOverlayPatternShapeStopsDataProps> | null>(null);

	//
	// B. Handle actions

	useEffect(() => {
		// Register features for sources in this overlay component
		if (lineData) mapViewContext.actions.registerOverlaySource(`${id}:pattern-shape:source:line`, lineData);
		if (stopsData) mapViewContext.actions.registerOverlaySource(`${id}:pattern-shape:source:stops`, stopsData);
		return () => {
			mapViewContext.actions.unregisterOverlaySource(`${id}:pattern-shape:source:line`);
			mapViewContext.actions.unregisterOverlaySource(`${id}:pattern-shape:source:stops`);
		};
	}, [lineData, stopsData]);

	const handleMouseOverEvent = (event: MapMouseEvent) => {
		const relevantFeature = event.target
			.queryRenderedFeatures(event.point)
			.find(feature => interactiveLayerIds.includes(feature.layer.id));
		if (!relevantFeature) return setHoveredFeature(null);
		setHoveredFeature(relevantFeature as unknown as Feature<Point, MapOverlayPatternShapeStopsDataProps>);
	};

	useEffect(() => {
		// Skip if no map is available
		if (!mapViewContext.ref.map.current) return;
		// Attach a click event listener to the map
		// so that when a feature is interacted with, we can handle it here.
		mapViewContext.ref.map.current.on('mousemove', handleMouseOverEvent);
	}, [mapViewContext.ref.map.current]);

	//
	// C. Render components

	if (!lineData) {
		return null;
	}

	return (
		<>

			{hoveredFeature && stopsData && (
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
						<span className={styles.value}>Sequência: {hoveredFeature.properties.sequence}/{stopsData.features.length}</span>
					</div>
				</Popup>
			)}

			<Source data={lineData} id={`${id}:pattern-shape:source:line`} type="geojson" generateId>
				<Layer
					id={`${id}:pattern-shape:layer:line-shadow`}
					source={`${id}:pattern-shape:source:line`}
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
					id={`${id}:pattern-shape:layer:line-padding`}
					source={`${id}:pattern-shape:source:line`}
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
					id={`${id}:pattern-shape:layer:line`}
					source={`${id}:pattern-shape:source:line`}
					type="line"
					layout={{
						'line-cap': 'round',
						'line-join': 'round',
						'visibility': visible ? 'visible' : 'none',
					}}
					paint={{
						'line-color': lineColor,
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
					id={`${id}:pattern-shape:layer:line-direction`}
					source={`${id}:pattern-shape:source:line`}
					type="symbol"
					layout={{
						'icon-allow-overlap': true,
						'icon-anchor': 'center',
						'icon-ignore-placement': true,
						'icon-image': 'map-line-direction',
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
						'icon-opacity': 0.8,
					}}
				/>
			</Source>

			{stopsData && (
				<Source data={stopsData} id={`${id}:pattern-shape:source:stops`} type="geojson" generateId>
					<Layer
						id={`${id}:pattern-shape:layer:stops-shadow`}
						source={`${id}:pattern-shape:source:stops`}
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
								10, // min radius
								25, // max zoom level
								50, // max radius
							],
						}}
					/>
					<Layer
						id={`${id}:pattern-shape:layer:stops-circle`}
						source={`${id}:pattern-shape:source:stops`}
						type="circle"
						layout={{
							visibility: visible ? 'visible' : 'none',
						}}
						paint={{
							'circle-color': primaryHexColor,
							'circle-pitch-alignment': 'map',
							'circle-radius': [
								'interpolate',
								['linear'],
								['zoom'],
								10, // min zoom level
								8, // min radius
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
								3, // max radius
							],
						}}
					/>
					<Layer
						id={`${id}:pattern-shape:layer:stops-labels`}
						source={`${id}:pattern-shape:source:stops`}
						type="symbol"
						layout={{
							'text-anchor': 'center',
							'text-field': ['get', 'sequence'],
							'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
							'text-offset': [0, 0],
							'text-size': [
								'interpolate',
								['linear'],
								['zoom'],
								10, // min zoom level
								10, // min size
								25, // max zoom level
								16, // max size
							],
							'visibility': visible ? 'visible' : 'none',
						}}
						paint={{
							'text-color': '#ffffff',
						}}
					/>
				</Source>
			)}
		</>
	);

	//
}
