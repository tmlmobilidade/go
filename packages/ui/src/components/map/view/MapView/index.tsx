'use client';

/* * */

import { type MapLayerMouseEvent, type ViewStateChangeEvent } from '@vis.gl/react-maplibre';
import { type CSSProperties, type PropsWithChildren } from 'react';

import styles from './styles.module.css';

import { MapViewBasemap } from '../MapViewBasemap';
import { MapViewContextProvider } from '../MapViewContext';
import { MapViewToolbar } from '../MapViewToolbar';

/* * */

interface MapViewProps {
	cursor?: CSSProperties['cursor'] | null
	height?: number
	id: string
	interactiveLayerIds?: string[]
	onClick?: (e: MapLayerMouseEvent) => void
	onDrag?: (e: ViewStateChangeEvent) => void
	onDragEnd?: (e: ViewStateChangeEvent) => void
	onDragStart?: (e: ViewStateChangeEvent) => void
	onMouseDrag?: (e: ViewStateChangeEvent) => void
	onMouseEnter?: (e: MapLayerMouseEvent) => void
	onMouseLeave?: (e: MapLayerMouseEvent) => void
	onMouseOut?: (e: MapLayerMouseEvent) => void
	onMouseOver?: (e: MapLayerMouseEvent) => void
}

/* * */

export function MapView({ children, cursor, height, id, interactiveLayerIds = [], onClick, onDrag, onDragEnd, onDragStart, onMouseDrag, onMouseEnter, onMouseLeave, onMouseOut, onMouseOver }: PropsWithChildren<MapViewProps>) {
	return (
		<MapViewContextProvider>
			<div
				className={styles.container}
				style={{ gridTemplateRows: height ? `${height}px auto` : '1fr auto' }}
			>
				<MapViewBasemap
					cursor={cursor}
					id={id}
					interactiveLayerIds={interactiveLayerIds}
					onClick={onClick}
					onDrag={onDrag}
					onDragEnd={onDragEnd}
					onDragStart={onDragStart}
					onMouseDrag={onMouseDrag}
					onMouseEnter={onMouseEnter}
					onMouseLeave={onMouseLeave}
					onMouseOut={onMouseOut}
					onMouseOver={onMouseOver}
				>
					{children}
				</MapViewBasemap>
				<MapViewToolbar />
			</div>
		</MapViewContextProvider>
	);
}
