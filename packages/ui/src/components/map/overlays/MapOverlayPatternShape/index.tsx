'use client';

/* * */

import type { DataDrivenPropertyValueSpecification } from 'maplibre-gl';

import { HoverCard } from '@mantine/core';
import { nearestPointOnLine } from '@turf/turf';
import { Layer, Marker, Popup, Source } from '@vis.gl/react-maplibre';
import { type Feature, type FeatureCollection, type LineString, type Point } from 'geojson';
import { MapMouseEvent } from 'maplibre-gl';
import { Fragment, type MouseEvent as ReactMouseEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
	anchorsData?: Array<{ _id: string, lat: number, lon: number }>
	enableAnchorPreview?: boolean
	id: string
	lineColor?: string
	lineData: Feature<LineString, MapOverlayPatternShapeLineDataProps> | FeatureCollection<LineString, MapOverlayPatternShapeLineDataProps> | null
	onAnchorDragPreview?: (event: MapOverlayPatternShapeAnchorDropEvent, draggingAnchorId: null | string) => void
	onAnchorDrop?: (event: MapOverlayPatternShapeAnchorDropEvent) => void
	onAnchorMove?: (anchorId: string, event: MapOverlayPatternShapeAnchorDropEvent) => void
	onAnchorRemove?: (anchorId: string) => void
	stopsData?: FeatureCollection<
		Point,
		MapOverlayPatternShapeStopsDataProps
	> | null
	thickness?: MapOverlayPatternShapeThickness
	visible?: boolean
}

type MapOverlayPatternShapeThickness = 'lg' | 'md' | 'sm';

const BUS_CANDIDATE_ROAD_LAYER_IDS = [
	'tunnel_motorway_link',
	'tunnel_link',
	'tunnel_minor',
	'tunnel_secondary_tertiary',
	'tunnel_trunk_primary',
	'tunnel_motorway',

	'road_motorway_link',
	'road_link',
	'road_minor',
	'road_secondary_tertiary',
	'road_trunk_primary',
	'road_motorway',

	'bridge_motorway_link',
	'bridge_link',
	'bridge_street',
	'bridge_secondary_tertiary',
	'bridge_trunk_primary',
	'bridge_motorway',
];

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

const ANCHOR_SNAP_TOLERANCE_PX = {
	max: 52,
	min: 24,
} as const;

const zoomInterpolate = (
	min: number,
	max: number,
): DataDrivenPropertyValueSpecification<number> => [
	'interpolate',
	['linear'],
	['zoom'],
	10,
	min,
	25,
	max,
];

/* * */

export function MapOverlayPatternShape({
	anchorsData,
	enableAnchorPreview = false,
	id,
	lineColor = '#000000',
	lineData,
	onAnchorDragPreview,
	onAnchorDrop,
	onAnchorMove,
	onAnchorRemove,
	stopsData,
	thickness = 'md',
	visible = true,
}: MapOverlayPatternShapeProps) {
	//

	//
	// A. Setup variables

	const thicknessConfig = THICKNESS_CONFIG[thickness];

	const mapViewContext = useMapViewContext();
	const primaryHexColor = useCssVariable('--color-primary');

	const anchorPreviewLayerId = useMemo(
		() => `${id}:pattern-shape:layer:line-anchor-preview-hitbox`,
		[id],
	);

	const interactiveLayerIds = useMemo(
		() => [
			`${id}:pattern-shape:layer:stops-circle`,
			`${id}:pattern-shape:layer:stops-labels`,
			anchorPreviewLayerId,
		],
		[id, anchorPreviewLayerId],
	);

	const [hoveredFeature, setHoveredFeature] = useState<Feature<
		Point,
		MapOverlayPatternShapeStopsDataProps
	> | null>(null);
	const [hoveredAnchorId, setHoveredAnchorId] = useState<null | string>(null);
	const [draggingAnchorId, setDraggingAnchorId] = useState<null | string>(null);
	const [mapZoom, setMapZoom] = useState(15);
	const [draftAnchor, setDraftAnchor] = useState<null | {
		lat: number
		lon: number
		mode: 'dragging' | 'hover'
		segment?: {
			from_index?: number
			to_index?: number
		}
	}>(null);

	// Ref to suppress hitbox-layer interactions when cursor is over an anchor DOM marker.
	// Track the last hovered stop feature id so we can clear its hover state.
	const prevHoveredStopIdRef = useRef<null | number>(null);

	// Debounce timer for live drag preview — fires onAnchorDragPreview after cursor
	// pauses for DRAG_PREVIEW_DEBOUNCE_MS during a drag, avoiding per-frame API calls.
	const DRAG_PREVIEW_DEBOUNCE_MS = 50;
	const dragPreviewTimerRef = useRef<null | ReturnType<typeof setTimeout>>(null);

	const stopsSourceId = useMemo(() => `${id}:pattern-shape:source:stops`, [id]);

	const anchorMarkerSizePx = useMemo(() => {
		const [minStop, maxStop] = thicknessConfig.stop;
		const t = Math.max(0, Math.min(1, (mapZoom - 10) / 15));
		return Math.round((minStop + t * (maxStop - minStop)) * 2);
	}, [mapZoom, thicknessConfig.stop]);

	const clearStopHoverState = useCallback(() => {
		const map = mapViewContext.ref.map.current;
		if (!map || prevHoveredStopIdRef.current === null) return;
		map.setFeatureState(
			{ id: prevHoveredStopIdRef.current, source: stopsSourceId },
			{ hover: false },
		);
		prevHoveredStopIdRef.current = null;
	}, [mapViewContext.ref.map, stopsSourceId]);

	const getSnappedAnchor = useCallback(
		(event: MapMouseEvent, feature: ReturnType<typeof event.target.queryRenderedFeatures>[number]) => {
			if (feature.geometry?.type !== 'LineString') {
				return null;
			}

			const snapped = nearestPointOnLine(
				feature as unknown as Feature<LineString>,
				[event.lngLat.lng, event.lngLat.lat],
				{ units: 'meters' },
			);

			const [lon, lat] = snapped.geometry.coordinates;

			return {
				lat,
				lon,
				segment: getFeatureSegment(feature),
			};
		},
		[],
	);

	const getFeatureSegment = (feature: {
		properties?: Record<string, unknown>
	}) => {
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

	const getExistingLayerIds = useCallback(
		(layerIds: string[]) => {
			const map = mapViewContext.ref.map.current;
			if (!map) return [];

			return layerIds.filter(layerId => map.getLayer(layerId));
		},
		[mapViewContext.ref.map],
	);

	type MapCursorMode = '' | 'anchor' | 'dragging-anchor' | 'invalid-anchor';

	const setMapCursor = useCallback((mode: MapCursorMode) => {
		const map = mapViewContext.ref.map.current;
		if (!map) return;

		const container = map.getCanvasContainer();

		container.classList.remove(
			'is-anchor-hovering-road',
			'is-anchor-dragging',
			'is-anchor-invalid',
		);

		if (mode === 'anchor') {
			container.classList.add('is-anchor-hovering-road');
			return;
		}

		if (mode === 'dragging-anchor') {
			container.classList.add('is-anchor-dragging');
			return;
		}

		if (mode === 'invalid-anchor') {
			container.classList.add('is-anchor-invalid');
		}
	}, [mapViewContext.ref.map]);

	const getAnchorSnapTolerancePx = useCallback(
		(zoom: number) => {
			const t = Math.max(0, Math.min(1, (zoom - 10) / 15));

			return (
				ANCHOR_SNAP_TOLERANCE_PX.min +
				t * (ANCHOR_SNAP_TOLERANCE_PX.max - ANCHOR_SNAP_TOLERANCE_PX.min)
			);
		},
		[],
	);

	const getQueryBoxAroundPoint = useCallback(
		(event: MapMouseEvent, radiusPx: number) => {
			return [
				[event.point.x - radiusPx, event.point.y - radiusPx],
				[event.point.x + radiusPx, event.point.y + radiusPx],
			] as [[number, number], [number, number]];
		},
		[],
	);

	const getExistingBaseRoadLayerIds = useCallback(() => {
		const map = mapViewContext.ref.map.current;
		if (!map) return [];

		return BUS_CANDIDATE_ROAD_LAYER_IDS.filter(layerId => map.getLayer(layerId));
	}, [mapViewContext.ref.map]);

	const getSnappedBaseRoadAnchor = useCallback(
		(event: MapMouseEvent) => {
			const roadLayerIds = getExistingBaseRoadLayerIds();

			if (roadLayerIds.length === 0) return null;

			const tolerancePx = getAnchorSnapTolerancePx(event.target.getZoom());
			const queryBox = getQueryBoxAroundPoint(event, tolerancePx);

			const roadFeatures = event.target
				.queryRenderedFeatures(queryBox, {
					layers: roadLayerIds,
				})
				.filter(feature =>
					feature.geometry?.type === 'LineString' ||
					feature.geometry?.type === 'MultiLineString',
				);

			if (roadFeatures.length === 0) return null;

			const candidates = roadFeatures
				.map((feature) => {
					const snapped = nearestPointOnLine(
						feature as unknown as Feature<LineString>,
						[event.lngLat.lng, event.lngLat.lat],
						{ units: 'meters' },
					);

					const [lon, lat] = snapped.geometry.coordinates;
					const projected = event.target.project([lon, lat]);

					const screenDistance = Math.hypot(
						projected.x - event.point.x,
						projected.y - event.point.y,
					);

					return {
						lat,
						lon,
						screenDistance,
					};
				})
				.filter(candidate => candidate.screenDistance <= tolerancePx)
				.sort((a, b) => a.screenDistance - b.screenDistance);

			return candidates.at(0) ?? null;
		},
		[
			getAnchorSnapTolerancePx,
			getExistingBaseRoadLayerIds,
			getQueryBoxAroundPoint,
		],
	);

	//
	// B. Handle actions

	useEffect(() => {
		const map = mapViewContext.ref.map.current;
		if (!map) return;

		setMapZoom(map.getZoom());

		const handleZoom = () => setMapZoom(map.getZoom());
		map.on('zoom', handleZoom);
		return () => {
			map.off('zoom', handleZoom);
		};
	}, [mapViewContext.ref.map]);

	useEffect(() => {
		// Register features for sources in this overlay component
		if (lineData)
			mapViewContext.actions.registerOverlaySource(
				`${id}:pattern-shape:source:line`,
				lineData,
			);
		if (stopsData)
			mapViewContext.actions.registerOverlaySource(
				`${id}:pattern-shape:source:stops`,
				stopsData,
			);
		return () => {
			mapViewContext.actions.unregisterOverlaySource(
				`${id}:pattern-shape:source:line`,
			);
			mapViewContext.actions.unregisterOverlaySource(
				`${id}:pattern-shape:source:stops`,
			);
		};
	}, [id, lineData, mapViewContext.actions, stopsData]);

	const handleMouseMoveEvent = useCallback(

		(event: MapMouseEvent) => {
			if (draftAnchor?.mode === 'dragging') {
				const snappedRoadAnchor = getSnappedBaseRoadAnchor(event);

				if (!snappedRoadAnchor) {
					if (dragPreviewTimerRef.current !== null) {
						clearTimeout(dragPreviewTimerRef.current);
						dragPreviewTimerRef.current = null;
					}
					setMapCursor('invalid-anchor');
					return;
				}

				const segmentForPreview = draftAnchor?.segment;
				const draggingIdForPreview = draggingAnchorId;

				setDraftAnchor({
					...snappedRoadAnchor,
					mode: 'dragging',
					segment: segmentForPreview,
				});

				if (onAnchorDragPreview) {
					if (dragPreviewTimerRef.current !== null) {
						clearTimeout(dragPreviewTimerRef.current);
					}
					dragPreviewTimerRef.current = setTimeout(() => {
						dragPreviewTimerRef.current = null;
						onAnchorDragPreview(
							{ ...snappedRoadAnchor, segment: segmentForPreview },
							draggingIdForPreview,
						);
					}, DRAG_PREVIEW_DEBOUNCE_MS);
				}

				setMapCursor('dragging-anchor');
				return;
			}

			const existingInteractiveLayerIds = getExistingLayerIds(interactiveLayerIds);

			const relevantFeature = existingInteractiveLayerIds.length > 0
				? event.target
					.queryRenderedFeatures(event.point, {
						layers: existingInteractiveLayerIds,
					})
					.at(0)
				: undefined;

			if (!relevantFeature) {
				clearStopHoverState();
				setHoveredFeature(null);
				setDraftAnchor(null);
				setHoveredAnchorId(null);
				setMapCursor('');
				event.target.dragPan?.enable?.();
				return;
			}

			if (
				enableAnchorPreview &&
				relevantFeature.layer.id === anchorPreviewLayerId
			) {
				clearStopHoverState();
				setHoveredFeature(null);

				const snappedAnchor = getSnappedAnchor(event, relevantFeature);

				if (!snappedAnchor) {
					setDraftAnchor(null);
					setHoveredAnchorId(null);
					setMapCursor('');
					event.target.dragPan?.enable?.();
					return;
				}

				setMapCursor('anchor');

				// existing anchor hover check
				if (anchorsData?.length) {
					const hitRadius = getAnchorSnapTolerancePx(event.target.getZoom());

					const anchorMatch = anchorsData.find((anchor) => {
						const projected = event.target.project([anchor.lon, anchor.lat]);
						const dx = projected.x - event.point.x;
						const dy = projected.y - event.point.y;
						return Math.hypot(dx, dy) < hitRadius;
					});

					if (anchorMatch) {
						setDraftAnchor(null);
						setHoveredAnchorId(anchorMatch._id);
						return;
					}
				}

				setHoveredAnchorId(null);

				setDraftAnchor({
					...snappedAnchor,
					mode: 'hover',
				});

				return;
			}

			// Must be a stop feature.
			setDraftAnchor(null);
			setMapCursor('anchor');
			setHoveredFeature(
				relevantFeature as unknown as Feature<
					Point,
					MapOverlayPatternShapeStopsDataProps
				>,
			);

			const featureId =
				typeof relevantFeature.id === 'number' ? relevantFeature.id : null;

			if (featureId !== null && featureId !== prevHoveredStopIdRef.current) {
				clearStopHoverState();
				event.target.setFeatureState(
					{ id: featureId, source: stopsSourceId },
					{ hover: true },
				);
				prevHoveredStopIdRef.current = featureId;
			}
		},
		[anchorPreviewLayerId, anchorsData, clearStopHoverState, draggingAnchorId, draftAnchor?.mode, draftAnchor?.segment, enableAnchorPreview, getAnchorSnapTolerancePx, getExistingLayerIds, getSnappedAnchor, getSnappedBaseRoadAnchor, interactiveLayerIds, onAnchorDragPreview, setMapCursor, stopsSourceId],
	);

	const handleMouseDownEvent = useCallback(
		(event: MapMouseEvent) => {
			if (
				!enableAnchorPreview ||
				draftAnchor?.mode !== 'hover' ||
				hoveredAnchorId !== null
			)
				return;

			const relevantFeature = event.target
				.queryRenderedFeatures(event.point)
				.find(feature => feature.layer.id === anchorPreviewLayerId);

			if (!relevantFeature) return;

			event.preventDefault();

			setMapCursor('dragging-anchor');

			setHoveredFeature(null);

			const snappedAnchor = getSnappedAnchor(event, relevantFeature);

			if (!snappedAnchor) return;

			setDraftAnchor({
				...snappedAnchor,
				mode: 'dragging',
			});
		},
		[anchorPreviewLayerId, draftAnchor?.mode, enableAnchorPreview, getSnappedAnchor, hoveredAnchorId, setMapCursor],
	);

	const handleMouseUpEvent = useCallback(
		(event: MapMouseEvent) => {
			if (draftAnchor?.mode !== 'dragging') return;

			// Cancel any pending preview — the final committed position will land via onAnchorDrop/onAnchorMove
			if (dragPreviewTimerRef.current !== null) {
				clearTimeout(dragPreviewTimerRef.current);
				dragPreviewTimerRef.current = null;
			}

			event.target.dragPan?.enable?.();

			const snappedRoadAnchor = getSnappedBaseRoadAnchor(event);

			if (!snappedRoadAnchor) {
				setDraftAnchor(null);
				setDraggingAnchorId(null);
				setMapCursor('');
				return;
			}

			const droppedAnchor = {
				...snappedRoadAnchor,
				segment: draftAnchor.segment,
			};

			setDraftAnchor({
				...droppedAnchor,
				mode: 'hover',
			});

			setMapCursor('anchor');

			if (draggingAnchorId) {
				onAnchorMove?.(draggingAnchorId, droppedAnchor);
				setDraggingAnchorId(null);
			} else {
				onAnchorDrop?.(droppedAnchor);
			}
		},
		[
			draftAnchor,
			draggingAnchorId,
			getSnappedBaseRoadAnchor,
			onAnchorDrop,
			onAnchorMove,
			setMapCursor,
		],
	);

	const handleAnchorMarkerMouseDown = useCallback(
		(anchor: { _id: string, lat: number, lon: number }, e: ReactMouseEvent) => {
			if (!enableAnchorPreview) return;

			e.stopPropagation();

			const map = mapViewContext.ref.map.current;
			if (!map) return;

			map.dragPan?.disable?.();
			setDraggingAnchorId(anchor._id);
			setHoveredAnchorId(null);
			setMapCursor('dragging-anchor');
			setDraftAnchor({
				lat: anchor.lat,
				lon: anchor.lon,
				mode: 'dragging',
			});
		},
		[enableAnchorPreview, mapViewContext.ref.map, setMapCursor],
	);

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
			map.getCanvasContainer().style.cursor = '';
			clearStopHoverState();
		};
	}, [
		clearStopHoverState,
		handleMouseDownEvent,
		handleMouseMoveEvent,
		handleMouseUpEvent,
		mapViewContext.ref.map,
	]);

	// Clear the drag-preview debounce timer only on unmount.
	useEffect(() => {
		return () => {
			if (dragPreviewTimerRef.current !== null) {
				clearTimeout(dragPreviewTimerRef.current);
				dragPreviewTimerRef.current = null;
			}
		};
	}, []);

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
						<span className={styles.name}>
							{hoveredFeature.properties.name}
						</span>
						<Divider />
						<span className={styles.value}>
							Sequência: {hoveredFeature.properties.sequence}/
							{stopsData.features.length}
						</span>
					</div>
				</Popup>
			)}

			{enableAnchorPreview && draftAnchor && (
				<Marker
					anchor="center"
					latitude={draftAnchor.lat}
					longitude={draftAnchor.lon}
				>
					<div className={styles.anchorPreview} data-mode={draftAnchor.mode} style={{ height: anchorMarkerSizePx, width: anchorMarkerSizePx }} />
				</Marker>
			)}

			{anchorsData?.map(anchor => (
				<Fragment key={anchor._id}>
					{draggingAnchorId !== anchor._id && (
						<Marker anchor="center" latitude={anchor.lat} longitude={anchor.lon}>
							<HoverCard closeDelay={150} openDelay={80} position="top" shadow="md" width={160} withArrow>
								<HoverCard.Target>
									<div
										className={styles.anchorMarker}
										data-hovered={hoveredAnchorId === anchor._id}
										onMouseDown={enableAnchorPreview ? e => handleAnchorMarkerMouseDown(anchor, e) : undefined}
										style={{ height: anchorMarkerSizePx, width: anchorMarkerSizePx }}
									/>
								</HoverCard.Target>
								<HoverCard.Dropdown p={4}>
									<button
										className={styles.anchorRemoveButton}
										onClick={() => onAnchorRemove?.(anchor._id)}
									>
										Remover desvio
									</button>
								</HoverCard.Dropdown>
							</HoverCard>
						</Marker>
					)}
				</Fragment>
			))}

			<Source
				data={lineData}
				id={`${id}:pattern-shape:source:line`}
				type="geojson"
			>
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
						'symbol-spacing': [
							'interpolate',
							['linear'],
							['zoom'],
							10,
							2,
							20,
							30,
						],
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
							'line-width': zoomInterpolate(
								ANCHOR_SNAP_TOLERANCE_PX.min,
								ANCHOR_SNAP_TOLERANCE_PX.max,
							),
						}}
					/>
				)}
			</Source>

			{stopsData && (
				<Source
					data={stopsData}
					id={`${id}:pattern-shape:source:stops`}
					type="geojson"
					generateId
				>
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
							'circle-opacity': [
								'case',
								['boolean', ['feature-state', 'hover'], false],
								0.5,
								0.3,
							] as DataDrivenPropertyValueSpecification<number>,
							'circle-pitch-alignment': 'map',
							'circle-radius': [
								'interpolate',
								['linear'],
								['zoom'],
								10,
								[
									'case',
									['boolean', ['feature-state', 'hover'], false],
									thicknessConfig.stopShadow[0] * 1.6,
									thicknessConfig.stopShadow[0],
								],
								25,
								[
									'case',
									['boolean', ['feature-state', 'hover'], false],
									thicknessConfig.stopShadow[1] * 1.6,
									thicknessConfig.stopShadow[1],
								],
							] as DataDrivenPropertyValueSpecification<number>,
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
								10,
								[
									'case',
									['boolean', ['feature-state', 'hover'], false],
									thicknessConfig.stop[0] * 1.4,
									thicknessConfig.stop[0],
								],
								25,
								[
									'case',
									['boolean', ['feature-state', 'hover'], false],
									thicknessConfig.stop[1] * 1.4,
									thicknessConfig.stop[1],
								],
							] as DataDrivenPropertyValueSpecification<number>,
							'circle-stroke-color': '#ffffff',
							'circle-stroke-width': [
								'interpolate',
								['linear'],
								['zoom'],
								10,
								[
									'case',
									['boolean', ['feature-state', 'hover'], false],
									thicknessConfig.stopStroke[0] * 3,
									thicknessConfig.stopStroke[0],
								],
								25,
								[
									'case',
									['boolean', ['feature-state', 'hover'], false],
									thicknessConfig.stopStroke[1] * 3,
									thicknessConfig.stopStroke[1],
								],
							] as DataDrivenPropertyValueSpecification<number>,
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
