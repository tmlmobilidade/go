'use client';

import { LoadingOverlay, MapContextProvider, MapView, useMapViewContext } from '@tmlmobilidade/ui';
import { Layer, type MapLayerMouseEvent, type MapProps, Source } from '@vis.gl/react-maplibre';
import { useEffect, useMemo, useRef, useState } from 'react';

import styles from './styles.module.css';

import { LandingMapVehiclePopup } from '../LandingMapVehiclePopup';
import { useDocumentThemeMode } from './use-document-theme-mode';
import { useLandingVehiclesData } from './use-landing-vehicles-data';
import { setVehicleArrowImage, usePrimaryColor, VEHICLE_ARROW_IMAGE } from './vehicle-arrow';

/* * */

const LISBON_METRO_VIEW = {
	latitude: 38.7,
	longitude: -9.15,
	zoom: 10,
};

const VEHICLES_LAYER_ID = 'landing-vehicles';
const VEHICLE_ARROWS_LAYER_ID = 'landing-vehicle-arrows';

/** From this zoom on, vehicles with a known bearing render as arrows instead of dots. */
const ARROWS_MIN_ZOOM = 13;

const POPUP_CLOSE_DELAY_MS = 300;

/* * */

interface LandingMapProps {
	/** Fit the initial view to every vehicle instead of the Lisbon metro area. */
	fitToVehicles?: boolean
	/** Show navigation controls. Pointer interaction is blocked by the parent when false. */
	interactive?: boolean
}

/* * */

export function LandingMap({ fitToVehicles = false, interactive = false }: LandingMapProps) {
	//

	//
	// A. Setup variables

	const { data, geoJson, isLoading } = useLandingVehiclesData();
	const primaryColor = usePrimaryColor();
	const themeMode = useDocumentThemeMode();
	const [hoveredVehicleKey, setHoveredVehicleKey] = useState<null | string>(null);
	const closeTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

	useEffect(() => () => clearTimeout(closeTimeout.current), []);

	//
	// B. Transform data

	const initialViewState = useMemo<MapProps['initialViewState']>(() => {
		if (!fitToVehicles || !geoJson.features.length) return LISBON_METRO_VIEW;
		const coordinates = geoJson.features.map(feature => feature.geometry.coordinates).filter(([longitude, latitude]) => Number.isFinite(longitude) && Number.isFinite(latitude));
		if (!coordinates.length) return LISBON_METRO_VIEW;
		const longitudes = coordinates.map(([longitude]) => longitude);
		const latitudes = coordinates.map(([, latitude]) => latitude);
		return {
			bounds: [[Math.min(...longitudes), Math.min(...latitudes)], [Math.max(...longitudes), Math.max(...latitudes)]],
			fitBoundsOptions: { padding: 25 },
		};
	}, [fitToVehicles, geoJson.features]);

	const hoveredVehicle = useMemo(() => {
		if (!hoveredVehicleKey) return null;
		return data.find(position => `${position.agency_id}-${position.vehicle_id}` === hoveredVehicleKey) ?? null;
	}, [data, hoveredVehicleKey]);

	//
	// C. Handle actions

	const cancelClose = () => clearTimeout(closeTimeout.current);

	const scheduleClose = () => {
		cancelClose();
		closeTimeout.current = setTimeout(() => setHoveredVehicleKey(null), POPUP_CLOSE_DELAY_MS);
	};

	const handleMouseEnter = (event: MapLayerMouseEvent) => {
		const properties = event.features?.[0]?.properties;
		if (!properties) return;
		cancelClose();
		setHoveredVehicleKey(`${properties.agency_id}-${properties.vehicle_id}`);
	};

	//
	// D. Render components

	return (
		<div className={styles.container}>
			{fitToVehicles && isLoading ? <div className={styles.loading}><LoadingOverlay /></div> : (
				<MapContextProvider preferenceScope="landing-map">
					<MapView
						id={interactive ? 'landing-map-explore' : 'landing-map'}
						initialViewState={initialViewState}
						interactiveLayerIds={[VEHICLES_LAYER_ID, VEHICLE_ARROWS_LAYER_ID]}
						layers={{ navigation: interactive }}
						onMouseEnter={handleMouseEnter}
						onMouseLeave={scheduleClose}
						showSearchPin={false}
						themeMode={themeMode}
						toolbar={false}
					>
						<LandingMapVehicleArrowImage color={primaryColor} />
						<Source data={geoJson} id={VEHICLES_LAYER_ID} type="geojson">
							<Layer
								id={VEHICLES_LAYER_ID}
								type="circle"
								paint={{
									'circle-color': primaryColor,
									'circle-opacity': ['step', ['zoom'], 1, ARROWS_MIN_ZOOM, ['case', ['!=', ['get', 'bearing'], null], 0, 1]],
									'circle-radius': ['interpolate', ['linear'], ['zoom'], 6, 3, 10, 3.5, 13, 4.5, 16, 7],
									'circle-stroke-color': '#ffffff',
									'circle-stroke-opacity': ['step', ['zoom'], 1, ARROWS_MIN_ZOOM, ['case', ['!=', ['get', 'bearing'], null], 0, 1]],
									'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 6, 0.5, 13, 1],
								}}
							/>
							<Layer
								filter={['!=', ['get', 'bearing'], null]}
								id={VEHICLE_ARROWS_LAYER_ID}
								minzoom={ARROWS_MIN_ZOOM}
								type="symbol"
								layout={{
									'icon-allow-overlap': true,
									'icon-ignore-placement': true,
									'icon-image': VEHICLE_ARROW_IMAGE,
									'icon-rotate': ['get', 'bearing'],
									'icon-rotation-alignment': 'map',
									'icon-size': ['interpolate', ['linear'], ['zoom'], ARROWS_MIN_ZOOM, 0.8, 17, 1.4],
								}}
							/>
						</Source>
						{hoveredVehicle && <LandingMapVehiclePopup data={hoveredVehicle} onMouseEnter={cancelClose} onMouseLeave={scheduleClose} />}
					</MapView>
				</MapContextProvider>
			)}
		</div>
	);

	//
}

/* * */

function LandingMapVehicleArrowImage({ color }: { color: string }) {
	const mapViewContext = useMapViewContext();
	const isLoading = mapViewContext.flags.loading;
	const mapRef = mapViewContext.ref.map;

	useEffect(() => {
		if (isLoading || !mapRef.current) return;
		setVehicleArrowImage(mapRef.current.getMap(), color);
	}, [color, isLoading, mapRef]);

	return null;
}
