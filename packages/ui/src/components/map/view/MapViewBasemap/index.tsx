'use client';

import { FullscreenControl, GeolocateControl, Map, type MapLayerMouseEvent, type MapWheelEvent, NavigationControl, ScaleControl, type ViewStateChangeEvent } from '@vis.gl/react-maplibre';
import { type CSSProperties, type PropsWithChildren, useCallback, useMemo } from 'react';

import styles from './styles.module.css';

import { useMapContext } from '../../../../contexts';
import { MAP_STYLES, MAP_VIEWPORT } from '../../configs';
import { MapOverlayPins } from '../../overlays';
import { MapViewAttribution } from '../MapViewAttribution';
import { useMapViewContext } from '../MapViewContext';

/* * */

export interface MapViewBasemapLayers {
	fullscreen?: boolean
	geolocate?: boolean
	navigation?: boolean
	scale?: boolean
}

export const DEFAULT_LAYERS: MapViewBasemapLayers = {
	fullscreen: true,
	geolocate: true,
	navigation: true,
	scale: true,
};

export interface MapViewBasemapProps {
	cursor?: CSSProperties['cursor'] | null
	id: string
	interactiveLayerIds?: string[]
	layers: MapViewBasemapLayers
	onClick?: (e: MapLayerMouseEvent) => void
	onContextMenu?: (e: MapLayerMouseEvent) => void
	onDrag?: (e: ViewStateChangeEvent) => void
	onDragEnd?: (e: ViewStateChangeEvent) => void
	onDragStart?: (e: ViewStateChangeEvent) => void
	onMouseDrag?: (e: ViewStateChangeEvent) => void
	onMouseEnter?: (e: MapLayerMouseEvent) => void
	onMouseLeave?: (e: MapLayerMouseEvent) => void
	onMouseOut?: (e: MapLayerMouseEvent) => void
	onMouseOver?: (e: MapLayerMouseEvent) => void
	onWheel?: (e: MapWheelEvent) => void
	/** When false, hides the coordinate search pin from global map context (e.g. focused single-stop maps). */
	showSearchPin?: boolean
}

/* * */

export function MapViewBasemap({ children, cursor, id, interactiveLayerIds = [], layers = DEFAULT_LAYERS, onClick, onContextMenu, onDragEnd, onDragStart, onMouseEnter, onMouseLeave, onMouseOut, onMouseOver, onWheel, showSearchPin = true }: PropsWithChildren<MapViewBasemapProps>) {
	//

	//
	// A. Setup variables

	const mapContext = useMapContext();
	const mapViewContext = useMapViewContext();

	//
	// B. Transform data

	const currentMapStyleConfig = useMemo(() => {
		const currentMapStyle = MAP_STYLES[mapContext.flags.style];
		if (currentMapStyle) return currentMapStyle;
		return MAP_STYLES.map;
	}, [mapContext.flags.style]);

	//
	// C. Handle actions

	const handleOnMouseEnter = useCallback((event: MapLayerMouseEvent) => {
		mapViewContext.actions.toggleCursor('pointer');
		if (onMouseEnter) onMouseEnter(event);
	}, []);

	const handleOnContextMenu = useCallback((event: MapLayerMouseEvent) => {
		console.log('Map Right Click', event.lngLat);
		if (onContextMenu) onContextMenu(event);
	}, []);

	const handleOnMouseLeave = useCallback((event: MapLayerMouseEvent) => {
		mapViewContext.actions.toggleCursor(cursor ?? 'auto');
		if (onMouseLeave) onMouseLeave(event);
	}, []);

	const handleOnDragStart = useCallback((event: ViewStateChangeEvent) => {
		mapViewContext.actions.toggleCursor('grabbing');
		mapViewContext.actions.toggleAutoZoom(false);
		if (onDragStart) onDragStart(event);
	}, []);

	const handleOnDragEnd = useCallback((event: ViewStateChangeEvent) => {
		mapViewContext.actions.toggleCursor(cursor ?? 'auto');
		if (onDragEnd) onDragEnd(event);
	}, []);

	const handleOnWheel = useCallback((event: MapWheelEvent) => {
		mapViewContext.actions.toggleAutoZoom(false);
		if (onWheel) onWheel(event);
	}, []);

	//
	// D. Render components

	return (
		<Map
			ref={mapViewContext.ref.map}
			attributionControl={false}
			cursor={mapViewContext.flags.cursor}
			id={id}
			initialViewState={MAP_VIEWPORT}
			interactive={true}
			interactiveLayerIds={interactiveLayerIds}
			mapStyle={currentMapStyleConfig.value}
			maxZoom={currentMapStyleConfig.max_zoom}
			minZoom={currentMapStyleConfig.min_zoom}
			onClick={onClick}
			onContextMenu={handleOnContextMenu}
			onDragEnd={handleOnDragEnd}
			onDragStart={handleOnDragStart}
			onLoad={mapViewContext.actions.initMap}
			onMouseEnter={handleOnMouseEnter}
			onMouseLeave={handleOnMouseLeave}
			onMouseOut={onMouseOut}
			onMouseOver={onMouseOver}
			onWheel={handleOnWheel}
			scrollZoom={mapContext.flags.scroll_zoom}
			style={{ height: '100%', width: '100%' }}
		>
			{layers.navigation && <NavigationControl />}
			{layers.fullscreen && <FullscreenControl />}
			{layers.geolocate && <GeolocateControl />}
			{layers.scale && <ScaleControl />}
			{showSearchPin && (
				<MapOverlayPins
					id="pins"
					pinsData={mapContext.data.search_pin}
					focusOnChange
				/>
			)}
			<div className={styles.children}>
				<MapViewAttribution />
				{children}
			</div>
		</Map>
	);

	//
}
