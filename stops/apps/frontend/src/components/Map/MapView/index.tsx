/* eslint-disable @typescript-eslint/no-empty-function */
'use client';

/* * */

import mapDefaults from '@/components/Map/MapConfig';
import { MapViewToolbar } from '@/components/Map/MapViewToolbar';
import { useMapOptionsContext } from '@/contexts/MapOptions.context';
import Map, { FullscreenControl, GeolocateControl, MapRef, NavigationControl, ScaleControl, useMap } from '@vis.gl/react-maplibre';
import { useCallback, useEffect, useState } from 'react';

import styles from './styles.module.css';

/* * */

import NeedlePinImage from '@/assets/map/needle-pin.png';
import SchoolMarkerImage from '@/assets/map/school-marker.png';

/* * */

const MAP_LOAD_ASSETS = [
	{ name: 'school-marker', sdf: false, url: SchoolMarkerImage.src },
	{ name: 'needle-pin', sdf: false, url: NeedlePinImage.src },
];

/* * */

export type MapStyle = 'map' | 'satellite';

interface Props {
	children: React.ReactNode
	fullscreen?: boolean
	geolocate?: boolean
	glyphs?: string
	id?: string
	interactiveLayerIds?: string[]
	mapObject?: MapRef
	mapStyle?: MapStyle
	navigation?: boolean
	onCenterMap?: () => void
	onClick?: (arg0) => void
	onMouseEnter?: (arg0) => void // When the mouse enters the interactive layer
	onMouseLeave?: (arg0) => void // When the mouse leaves the interactive layer
	onMouseOut?: (arg0) => void // When the mouse enters the map
	onMouseOver?: (arg0) => void // When the mouse leaves the map
	onMove?: (arg0) => void
	onMoveEnd?: (arg0) => void
	onMoveStart?: (arg0) => void
	primarySourceId?: string
	scale?: boolean
	scrollZoom?: boolean
	toolbar?: boolean
}

/* * */

export function MapView({
	children,
	fullscreen = true,
	geolocate = true,
	id,
	interactiveLayerIds = [],
	mapStyle,
	navigation = true,
	onCenterMap,
	onClick = () => {},
	onMouseEnter = () => {},
	onMouseLeave = () => {},
	onMoveEnd = () => {},
	onMoveStart = () => {},
	scale = false,
	scrollZoom = true,
	toolbar = true,
}: Props) {
	//

	//
	// A. Setup variables
	const [cursor, setCursor] = useState<string>('auto');
	const allMaps = useMap();
	const mapOptionsContext = useMapOptionsContext();

	//
	// B. Transform data

	useEffect(() => {
		(async () => {
			if (!id || !allMaps || !allMaps[id]) return;
			const mapObject = allMaps[id];
			mapOptionsContext.actions.setMap(mapObject);
			for (const mapLoadAsset of MAP_LOAD_ASSETS) {
				await mapObject.loadImage(mapLoadAsset.url).then((image) => {
					if (mapObject.hasImage(mapLoadAsset.name)) return;
					mapObject.addImage(mapLoadAsset.name, image.data, { sdf: mapLoadAsset.sdf });
				});
			}
		})();
	}, [allMaps, id]);

	const mapStyleValue = mapStyle ?? mapOptionsContext.data.style;

	//
	// C. Handle actions
	const handleOnMouseEnter = useCallback((event) => {
		setCursor('pointer');

		if (onMouseEnter) {
			onMouseEnter(event);
		}
	}, []);

	const handleOnMouseLeave = useCallback((event) => {
		setCursor('auto');

		if (onMouseLeave) {
			onMouseLeave(event);
		}
	}, []);

	const handleOnMoveStart = useCallback((event) => {
		setCursor('grab');

		if (onMoveStart) {
			onMoveStart(event);
		}
	}, []);

	const handleOnMoveEnd = useCallback((event) => {
		setCursor('auto');

		if (onMoveEnd) {
			onMoveEnd(event);
		}
	}, []);

	//
	// C. Render components

	return (
		<div className={styles.container}>

			<Map
				attributionControl={false}
				cursor={cursor}
				id={id || 'map'}
				initialViewState={mapDefaults.initialViewState}
				interactive={interactiveLayerIds ? true : false}
				interactiveLayerIds={interactiveLayerIds}
				mapStyle={mapDefaults.styles[mapStyleValue] || mapDefaults.styles.default}
				maxZoom={mapDefaults.maxZoom}
				minZoom={mapDefaults.minZoom}
				onClick={onClick}
				onMouseEnter={handleOnMouseEnter}
				onMouseLeave={handleOnMouseLeave}
				onMoveEnd={handleOnMoveEnd}
				onMoveStart={handleOnMoveStart}
				scrollZoom={scrollZoom}
				style={{ height: '100%', position: 'absolute', width: '100%' }}
			>
				{navigation && <NavigationControl />}
				{fullscreen && <FullscreenControl />}
				{geolocate && <GeolocateControl />}
				{scale && <ScaleControl maxWidth={100} unit="metric" />}
				<div className={styles.childrenWrapper}>
					{children}
				</div>
				<div className={styles.attributionWrapper}>
					<a href="https://maplibre.org/" target="_blank">MapLibre</a>
					<a href="https://www.openmaptiles.org/" target="_blank">© OpenMapTiles</a>
					<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>
				</div>
			</Map>

			{toolbar && <MapViewToolbar className={styles.toolbar} onCenterMap={onCenterMap} />}
		</div>
	);
}
