'use client';

import { Section } from '@tmlmobilidade/ui';
import Map, { FullscreenControl, GeolocateControl, MapLayerMouseEvent, MapRef, NavigationControl, ScaleControl, useMap, ViewStateChangeEvent } from '@vis.gl/react-maplibre';

import 'maplibre-gl/dist/maplibre-gl.css';
import { useCallback, useEffect, useState } from 'react';

import styles from './styles.module.css';

import { mapDefaultConfig, mapDefaultValues } from '../map.settings';
import { useMapOptionsContext } from '../MapOptions.context';

const DEFAULT_MAP_ID = 'map';

/* * */

interface Props {
	children?: React.ReactNode
	debug?: boolean
	fullscreen?: boolean
	geolocate?: boolean
	id?: string
	interactiveLayerIds?: string[]
	mapDefaultValues?: typeof mapDefaultValues
	mapObject?: MapRef
	mapStyle?: string
	navigation?: boolean
	onCenterMap?: () => void
	onClick?: (e: MapLayerMouseEvent) => void
	onDrag?: (e: ViewStateChangeEvent) => void
	onDragEnd?: (e: ViewStateChangeEvent) => void
	onDragStart?: (e: ViewStateChangeEvent) => void
	onMouseDrag?: (e: ViewStateChangeEvent) => void
	onMouseEnter?: (e: MapLayerMouseEvent) => void // When the mouse enters the interactive layer
	onMouseLeave?: (e: MapLayerMouseEvent) => void // When the mouse leaves the interactive layer
	onMouseOut?: (e: MapLayerMouseEvent) => void // When the mouse enters the map
	onMouseOver?: (e: MapLayerMouseEvent) => void // When the mouse leaves the map
	primarySourceId?: string
	scale?: boolean
	scrollZoom?: boolean
	toolbar?: boolean
}

/* * */

export function MapView({
	children,
	debug = false,
	fullscreen = true,
	geolocate = true,
	id = DEFAULT_MAP_ID,
	interactiveLayerIds = [],
	mapStyle,
	navigation = true,
	// onCenterMap,
	onClick,
	onDragEnd,
	onDragStart,
	onMouseEnter,
	onMouseLeave,
	onMouseOut,
	onMouseOver,
	scale = false,
	scrollZoom = true,
	// toolbar = true,
}: Props) {
	//
	// A. Setup variables
	const [cursor, setCursor] = useState<string>('auto');
	const allMaps = useMap();
	const mapOptionsContext = useMapOptionsContext();

	//
	// B. Transform data

	useEffect(() => {
		if (!allMaps || !allMaps[id]) return;
		const mapObject = allMaps[id];
		mapOptionsContext.actions.setMap(mapObject);

		console.log(mapObject);
	}, [allMaps, id]);

	const mapStyleValue = mapStyle ?? mapOptionsContext.data.style;

	//
	// C. Handle actions
	const handleOnMouseEnter = useCallback((event: MapLayerMouseEvent) => {
		setCursor('pointer');

		if (onMouseEnter) {
			onMouseEnter(event);
		}
	}, []);

	const handleOnMouseLeave = useCallback((event: MapLayerMouseEvent) => {
		setCursor('auto');

		if (onMouseLeave) {
			onMouseLeave(event);
		}
	}, []);

	const handleOnDragStart = useCallback((event: ViewStateChangeEvent) => {
		setCursor('grab');

		if (onDragStart) {
			onDragStart(event);
		}
	}, []);

	const handleOnDragEnd = useCallback((event: ViewStateChangeEvent) => {
		setCursor('auto');

		if (onDragEnd) {
			onDragEnd(event);
		}
	}, []);

	//
	// C. Render components

	return (
		<div className={styles.container}>
			<Map
				attributionControl={false}
				cursor={cursor}
				id={id}
				initialViewState={mapDefaultConfig.initialViewState || mapDefaultValues}
				interactive={!!interactiveLayerIds}
				interactiveLayerIds={interactiveLayerIds}
				mapStyle={mapDefaultConfig.styles[mapStyleValue as keyof typeof mapDefaultConfig.styles] as string}
				maxZoom={mapDefaultConfig.maxZoom}
				minZoom={mapDefaultConfig.minZoom}
				onClick={onClick}
				onDragEnd={handleOnDragEnd}
				onDragStart={handleOnDragStart}
				onMouseEnter={handleOnMouseEnter}
				onMouseLeave={handleOnMouseLeave}
				onMouseOut={onMouseOut}
				onMouseOver={onMouseOver}
				scrollZoom={scrollZoom}
				style={{ height: '100%', width: '100%' }}
			>
				{navigation && <NavigationControl />}
				{fullscreen && <FullscreenControl />}
				{geolocate && <GeolocateControl />}
				{scale && <ScaleControl />}
				<div className={styles.childrenWrapper}>
					{children}
				</div>
			</Map>
			{debug && <DebugControl />}
			<div className={styles.attributionWrapper}>
				<a href="https://maplibre.org/" target="_blank">MapLibre</a>
				<a href="https://www.openmaptiles.org/" target="_blank">© OpenMapTiles</a>
				<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>
			</div>
		</div>
	);
}

function DebugControl() {
	const mapOptionsContext = useMapOptionsContext();

	if (!mapOptionsContext.data.map) return null;

	return (
		<div className={styles.debugControl}>
			<Section>
				<div>
					<div className={styles.debugControlItemLabel}>Zoom</div>
					<div className={styles.debugControlItemValue}>{mapOptionsContext.data.map.getZoom().toFixed(2)}</div>
				</div>

				<div>
					<div className={styles.debugControlItemLabel}>Coordinates</div>
					<div className={styles.debugControlItemValue}>{mapOptionsContext.data.map.getCenter().lat}, {mapOptionsContext.data.map.getCenter().lng}</div>
				</div>
			</Section>
		</div>
	);
}
