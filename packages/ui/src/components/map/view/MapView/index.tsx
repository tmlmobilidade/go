'use client';

import { type MapLayerMouseEvent, type ViewStateChangeEvent } from '@vis.gl/react-maplibre';
import { type CSSProperties, type PropsWithChildren } from 'react';

import styles from './styles.module.css';

import { MAP_VIEWPORT } from '../../configs';
import { MapViewBasemap, type MapViewBasemapLayers } from '../MapViewBasemap';
import { MapViewContextProvider } from '../MapViewContext';
import { MapViewToolbar } from '../MapViewToolbar';

/* * */

interface MapViewProps {
	cursor?: CSSProperties['cursor'] | null
	height?: number
	id: string
	initialViewState?: typeof MAP_VIEWPORT
	interactive?: boolean
	interactiveLayerIds?: string[]
	layers?: MapViewBasemapLayers
	onClick?: (e: MapLayerMouseEvent) => void
	onDrag?: (e: ViewStateChangeEvent) => void
	onDragEnd?: (e: ViewStateChangeEvent) => void
	onDragStart?: (e: ViewStateChangeEvent) => void
	onMouseDrag?: (e: ViewStateChangeEvent) => void
	onMouseEnter?: (e: MapLayerMouseEvent) => void
	onMouseLeave?: (e: MapLayerMouseEvent) => void
	onMouseOut?: (e: MapLayerMouseEvent) => void
	onMouseOver?: (e: MapLayerMouseEvent) => void
	scrollZoom?: boolean
	/** Scroll zoom only while this modifier key is held (e.g. Option/Alt on Mac). */
	scrollZoomModifierKey?: 'alt' | 'ctrl' | 'meta'
	/** When false, hides the search coordinate pin layer. */
	showAttribution?: boolean
	showCompass?: boolean
	showSearchPin?: boolean
	toolbar?: boolean
}

/* * */

export function MapView({ children, cursor, height, id, initialViewState, interactive, interactiveLayerIds = [], layers, onClick, onDrag, onDragEnd, onDragStart, onMouseDrag, onMouseEnter, onMouseLeave, onMouseOut, onMouseOver, scrollZoom, scrollZoomModifierKey, showAttribution, showCompass = true, showSearchPin = true, toolbar = true }: PropsWithChildren<MapViewProps>) {
	return (
		<MapViewContextProvider>
			<div
				className={styles.container}
				style={{ gridTemplateRows: height ? `${height}px auto` : '1fr auto' }}
			>
				<MapViewBasemap
					cursor={cursor}
					id={id}
					initialViewState={initialViewState ?? MAP_VIEWPORT}
					interactive={interactive}
					interactiveLayerIds={interactiveLayerIds}
					layers={layers}
					onClick={onClick}
					onDrag={onDrag}
					onDragEnd={onDragEnd}
					onDragStart={onDragStart}
					onMouseDrag={onMouseDrag}
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
					onMouseOut={onMouseOut}
					onMouseOver={onMouseOver}
					scrollZoom={scrollZoom}
					scrollZoomModifierKey={scrollZoomModifierKey}
					showAttribution={showAttribution}
					showCompass={showCompass}
					showSearchPin={showSearchPin}
				>
					{children}
				</MapViewBasemap>
				{toolbar && <MapViewToolbar />}
			</div>
		</MapViewContextProvider>
	);
}
