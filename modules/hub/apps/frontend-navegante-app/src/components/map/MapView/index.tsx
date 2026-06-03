'use client';

import { useMapContext } from '@/components/map/Map.context';
import { mapDefaultConfig } from '@/components/map/Map.settings';
import { loadMapAssets } from '@/components/map/mapLoadAssets';
import Map, { FullscreenControl, GeolocateControl, MapRef, NavigationControl, ScaleControl, useMap } from '@vis.gl/react-maplibre';
import { type ControlPosition, type MapLibreEvent } from 'maplibre-gl';
import { useCallback, useEffect, useState } from 'react';

import styles from './styles.module.css';

/* * */

export type MapStyle = 'map' | 'satellite';

interface MapViewProps {
	autoZoom?: boolean
	children: React.ReactNode
	controlsPosition?: ControlPosition
	fullscreen?: boolean
	geolocate?: boolean
	id?: string
	interactiveLayerIds?: string[]
	mapObject?: MapRef
	mapStyle?: MapStyle
	navigation?: boolean
	onCenterMap?: () => void
	onClick?: (arg0) => void
	onDrag?: (arg0) => void
	onMouseEnter?: (arg0) => void // When the mouse enters the interactive layer
	onMouseLeave?: (arg0) => void // When the mouse leaves the interactive layer
	onMouseOut?: (arg0) => void // When the mouse enters the map
	onMouseOver?: (arg0) => void // When the mouse leaves the map
	onMove?: (arg0) => void
	onMoveEnd?: (arg0) => void
	onMoveStart?: (arg0) => void
	onZoom?: (arg0) => void
	primarySourceId?: string
	scale?: boolean
	scrollZoom?: boolean
	showCenterButton?: boolean
	toolbarExtras?: React.ReactNode
}

/* * */

export function MapView({ children, controlsPosition, fullscreen = true, geolocate = true, id, interactiveLayerIds = [], mapStyle, navigation = true, onClick, onDrag, onMouseEnter, onMouseLeave, onMouseOut, onMouseOver, onMoveEnd, onMoveStart, onZoom, scale = false, scrollZoom = true }: MapViewProps) {
	//

	//
	// A. Setup variables

	const allMaps = useMap();

	const mapContext = useMapContext();

	const [cursor, setCursor] = useState<string>('auto');

	//
	// B. Transform data

	useEffect(() => {
		if (!id || !allMaps?.[id]) return;
		mapContext.actions.setMap(allMaps[id]);
	}, [allMaps, id, mapContext.actions]);

	const handleOnLoad = useCallback((event: MapLibreEvent) => {
		loadMapAssets(event.target);
	}, []);

	const mapStyleValue = mapStyle ?? mapContext.data.style;

	//
	// C. Handle actions

	const handleOnMouseEnter = useCallback((event) => {
		setCursor('pointer');
		if (onMouseEnter) onMouseEnter(event);
	}, [onMouseEnter]);

	const handleOnMouseLeave = useCallback((event) => {
		setCursor('auto');
		if (onMouseLeave) onMouseLeave(event);
	}, [onMouseLeave]);

	const handleOnMoveStart = useCallback((event) => {
		setCursor('grab');
		if (onMoveStart) onMoveStart(event);
	}, [onMoveStart]);

	const handleOnMoveEnd = useCallback((event) => {
		setCursor('auto');
		if (onMoveEnd) onMoveEnd(event);
	}, [onMoveEnd]);

	//
	// D. Render components

	return (
		<div className={styles.container}>

			<Map
				attributionControl={false}
				cursor={cursor}
				id={id || 'map'}
				initialViewState={mapDefaultConfig.initialViewState}
				interactive={interactiveLayerIds ? true : false}
				interactiveLayerIds={interactiveLayerIds}
				mapStyle={mapDefaultConfig.styles[mapStyleValue as string]}
				maxZoom={mapDefaultConfig.maxZoom}
				minZoom={mapDefaultConfig.minZoom}
				onClick={onClick}
				onDrag={onDrag}
				onLoad={handleOnLoad}
				onMouseEnter={handleOnMouseEnter}
				onMouseLeave={handleOnMouseLeave}
				onMouseOut={onMouseOut}
				onMouseOver={onMouseOver}
				onMove={handleOnMoveStart}
				onMoveEnd={handleOnMoveEnd}
				onMoveStart={handleOnMoveStart}
				onZoom={onZoom}
				scrollZoom={scrollZoom}
				style={{ height: '100%', width: '100%' }}
			>

				{navigation && <NavigationControl position={controlsPosition} />}
				{fullscreen && <FullscreenControl position={controlsPosition} />}
				{geolocate && <GeolocateControl position={controlsPosition} />}
				{scale && <ScaleControl position={controlsPosition} />}

				<div className={styles.childrenWrapper}>
					{children}
				</div>

			</Map>

			<div className={styles.attributionWrapper}>
				<a href="https://maplibre.org/" target="_blank">MapLibre</a>
				<a href="https://www.openmaptiles.org/" target="_blank">© OpenMapTiles</a>
				<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>
			</div>

		</div>
	);
}
