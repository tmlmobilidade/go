'use client';

/* * */

import { FullscreenControl, GeolocateControl, Map, type MapLayerMouseEvent, type MapWheelEvent, NavigationControl, ScaleControl, type ViewStateChangeEvent } from '@vis.gl/react-maplibre';
import { type CSSProperties, type PropsWithChildren, useCallback, useMemo } from 'react';

import styles from './styles.module.css';

import { MAP_STYLES, MAP_VIEWPORT } from '../../configs';
import { MapViewAttribution } from '../MapViewAttribution';
import { useMapViewContext } from '../MapViewContext';

/* * */

export interface MapViewBasemapProps {
	cursor?: CSSProperties['cursor'] | null
	id: string
	interactiveLayerIds?: string[]
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
}

/* * */

export function MapViewBasemap({ children, cursor, id, interactiveLayerIds = [], onClick, onContextMenu, onDragEnd, onDragStart, onMouseEnter, onMouseLeave, onMouseOut, onMouseOver, onWheel }: PropsWithChildren<MapViewBasemapProps>) {
	//

	//
	// A. Setup variables

	const mapViewContext = useMapViewContext();

	//
	// B. Transform data

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
			mapStyle={MAP_STYLES.map.value}
			maxZoom={MAP_STYLES.map.max_zoom}
			minZoom={MAP_STYLES.map.min_zoom}
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
			style={{ height: '100%', width: '100%' }}
		>
			<NavigationControl />
			<FullscreenControl />
			<GeolocateControl />
			{/* <ScaleControl /> */}
			<div className={styles.children}>
				<MapViewAttribution />
				{children}
			</div>
		</Map>
	);

	//
}
