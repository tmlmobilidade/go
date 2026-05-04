'use client';

/* * */

import type { DataDrivenPropertyValueSpecification } from 'maplibre-gl';

import { Layer, Marker, Popup, Source } from '@vis.gl/react-maplibre';
import { type Feature, type FeatureCollection, type LineString, type Point } from 'geojson';
import { MapMouseEvent } from 'maplibre-gl';
import { useCallback, useEffect, useMemo, useState } from 'react';

import styles from './styles.module.css';

import { useCssVariable } from '../../../../hooks';
import { Divider } from '../../../layout/Divider';
import { useMapViewContext } from '../../view/MapViewContext';

/* * */

export interface MapOverlayPatternShapeLineDataProps {
	color?: string
	from_index?: number
	id: string
	to_index?: number
}

export interface MapOverlayPatternShapeStopsDataProps {
	id: string
	name: string
	sequence: number
}

/* * */

interface MapOverlayPatternShapeAnchorDropEvent {
	lat: number
	lon: number
	segment?: {
		from_index?: number
		to_index?: number
	}
}

interface MapOverlayPatternShapeProps {
	enableAnchorPreview?: boolean
	id: string
	lineColor?: string
	lineData: Feature<LineString, MapOverlayPatternShapeLineDataProps> | FeatureCollection<LineString, MapOverlayPatternShapeLineDataProps> | null
	onAnchorDrop?: (event: MapOverlayPatternShapeAnchorDropEvent) => void
	stopsData?: FeatureCollection<Point, MapOverlayPatternShapeStopsDataProps> | null
	thickness?: MapOverlayPatternShapeThickness
	visible?: boolean
}

type MapOverlayPatternShapeThickness = 'lg' | 'md' | 'sm';

const THICKNESS_CONFIG = {
	lg: {
		directionIcon: [0.14, 0.7],
		label: [12, 20],
		line: [6, 32],
		padding: [10, 46],
		shadow: [14, 58],
		shadowBlur: 18,
		stop: [11, 34],
		stopShadow: [15, 44],
		stopStroke: [2, 4],
	},
	md: {
		directionIcon: [0.1, 0.5],
		label: [10, 16],
		line: [4, 20],
		padding: [6, 30],
		shadow: [8, 36],
		shadowBlur: 12,
		stop: [8, 25],
		stopShadow: [10, 32],
		stopStroke: [1, 3],
	},
	sm: {
		directionIcon: [0.08, 0.35],
		label: [8, 12],
		line: [2, 12],
		padding: [3, 18],
		shadow: [4, 24],
		shadowBlur: 8,
		stop: [5, 16],
		stopShadow: [7, 22],
		stopStroke: [1, 2],
	},
} as const;

const zoomInterpolate = (min: number, max: number): DataDrivenPropertyValueSpecification<number> => [
	'interpolate',
	['linear'],
	['zoom'],
	10,
	min,
	25,
	max,
];

/* * */

export function MapOverlayPatternShape({ enableAnchorPreview = false, id, lineColor = '#000000', lineData, onAnchorDrop, stopsData, thickness = 'md', visible = true }: MapOverlayPatternShapeProps) {
	//

	//
	// A. Setup variables

	const thicknessConfig = THICKNESS_CONFIG[thickness];

	const mapViewContext = useMapViewContext();
	const primaryHexColor = useCssVariable('--color-primary');

	const anchorPreviewLayerId = useMemo(() => `${id}:pattern-shape:layer:line-anchor-preview-hitbox`, [id]);

	const interactiveLayerIds = useMemo(() => [
		`${id}:pattern-shape:layer:stops-circle`,
		`${id}:pattern-shape:layer:stops-labels`,
		anchorPreviewLayerId,
	], [id, anchorPreviewLayerId]);

	const [hoveredFeature, setHoveredFeature] = useState<Feature<Point, MapOverlayPatternShapeStopsDataProps> | null>(null);
	const [draftAnchor, setDraftAnchor] = useState<null | {
		lat: number
		lon: number
		mode: 'dragging' | 'hover'
		segment?: {
			from_index?: number
			to_index?: number
		}
	}>(null);

	const getFeatureSegment = (feature: { properties?: Record<string, unknown> }) => {
		const fromIndex = Number(feature.properties?.from_index);
		const toIndex = Number(feature.properties?.to_index);

		if (Number.isNaN(fromIndex) || Number.isNaN(toIndex)) {
			return undefined;
		}

		return {
			from_index: fromIndex,
			to_index: toIndex,
		};
	};

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
	}, [id, lineData, mapViewContext.actions, stopsData]);

	const handleMouseMoveEvent = useCallback((event: MapMouseEvent) => {
		if (draftAnchor?.mode === 'dragging') {
			setDraftAnchor({
				lat: event.lngLat.lat,
				lon: event.lngLat.lng,
				mode: 'dragging',
				segment: draftAnchor.segment,
			});

			event.target.getCanvas().style.cursor = 'none';
			return;
		}

		const relevantFeature = event.target
			.queryRenderedFeatures(event.point)
			.find(feature => interactiveLayerIds.includes(feature.layer.id));

		if (!relevantFeature) {
			setHoveredFeature(null);
			setDraftAnchor(null);
			event.target.getCanvas().style.cursor = '';
			return;
		}

		if (relevantFeature.layer.id === anchorPreviewLayerId) {
			setHoveredFeature(null);

			setDraftAnchor({
				lat: event.lngLat.lat,
				lon: event.lngLat.lng,
				mode: 'hover',
				segment: getFeatureSegment(relevantFeature),
			});

			event.target.getCanvas().style.cursor = 'none';
			return;
		}

		setDraftAnchor(null);
		event.target.getCanvas().style.cursor = '';

		setHoveredFeature(relevantFeature as unknown as Feature<Point, MapOverlayPatternShapeStopsDataProps>);
	}, [anchorPreviewLayerId, draftAnchor, interactiveLayerIds]);

	const handleMouseDownEvent = useCallback((event: MapMouseEvent) => {
		if (!enableAnchorPreview || draftAnchor?.mode !== 'hover') return;

		const relevantFeature = event.target
			.queryRenderedFeatures(event.point)
			.find(feature => feature.layer.id === anchorPreviewLayerId);

		if (!relevantFeature) return;

		event.preventDefault();

		event.target.dragPan?.disable?.();
		event.target.getCanvas().style.cursor = 'none';

		setHoveredFeature(null);

		setDraftAnchor({
			lat: event.lngLat.lat,
			lon: event.lngLat.lng,
			mode: 'dragging',
			segment: draftAnchor.segment,
		});
	}, [anchorPreviewLayerId, draftAnchor, enableAnchorPreview]);

	const handleMouseUpEvent = useCallback((event: MapMouseEvent) => {
		if (draftAnchor?.mode !== 'dragging') return;

		event.target.dragPan?.enable?.();
		event.target.getCanvas().style.cursor = '';

		const droppedAnchor = {
			lat: event.lngLat.lat,
			lon: event.lngLat.lng,
			segment: draftAnchor.segment,
		};

		setDraftAnchor({
			...droppedAnchor,
			mode: 'hover',
		});

		onAnchorDrop?.(droppedAnchor);
	}, [draftAnchor, onAnchorDrop]);

	useEffect(() => {
		const map = mapViewContext.ref.map.current;
		if (!map) return;

		map.on('mousemove', handleMouseMoveEvent);
		map.on('mousedown', handleMouseDownEvent);
		map.on('mouseup', handleMouseUpEvent);

		return () => {
			map.off('mousemove', handleMouseMoveEvent);
			map.off('mousedown', handleMouseDownEvent);
			map.off('mouseup', handleMouseUpEvent);

			map.dragPan?.enable?.();
			map.getCanvas().style.cursor = '';
		};
	}, [
		handleMouseDownEvent,
		handleMouseMoveEvent,
		handleMouseUpEvent,
		mapViewContext.ref.map,
	]);

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

			{enableAnchorPreview && draftAnchor && (
				<Marker
					anchor="center"
					latitude={draftAnchor.lat}
					longitude={draftAnchor.lon}
				>
					<div
						className={styles.anchorPreview}
						data-mode={draftAnchor.mode}
					/>
				</Marker>
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
						'line-blur': thicknessConfig.shadowBlur,
						'line-color': '#000000',
						'line-opacity': 0.3,
						'line-width': zoomInterpolate(
							thicknessConfig.shadow[0],
							thicknessConfig.shadow[1],
						),
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
						'line-width': zoomInterpolate(
							thicknessConfig.padding[0],
							thicknessConfig.padding[1],
						),
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
						'line-width': zoomInterpolate(
							thicknessConfig.line[0],
							thicknessConfig.line[1],
						),
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
						'icon-size': zoomInterpolate(
							thicknessConfig.directionIcon[0],
							thicknessConfig.directionIcon[1],
						),
						'symbol-placement': 'line',
						'symbol-spacing': ['interpolate', ['linear'], ['zoom'], 10, 2, 20, 30],
						'visibility': visible ? 'visible' : 'none',
					}}
					paint={{
						'icon-color': '#ffffff',
						'icon-opacity': 0.8,
					}}
				/>

				{enableAnchorPreview && (
					<Layer
						id={anchorPreviewLayerId}
						source={`${id}:pattern-shape:source:line`}
						type="line"
						layout={{
							'line-cap': 'round',
							'line-join': 'round',
							'visibility': visible ? 'visible' : 'none',
						}}
						paint={{
							'line-color': '#000000',
							'line-opacity': 0,
							'line-width': zoomInterpolate(20, 60),
						}}
					/>
				)}
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
							'circle-radius': zoomInterpolate(
								thicknessConfig.stopShadow[0],
								thicknessConfig.stopShadow[1],
							),
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
							'circle-radius': zoomInterpolate(
								thicknessConfig.stop[0],
								thicknessConfig.stop[1],
							),
							'circle-stroke-color': '#ffffff',
							'circle-stroke-width': zoomInterpolate(
								thicknessConfig.stopStroke[0],
								thicknessConfig.stopStroke[1],
							),

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
							'text-size': zoomInterpolate(
								thicknessConfig.label[0],
								thicknessConfig.label[1],
							),
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
