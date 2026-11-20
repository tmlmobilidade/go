'use client';

import { centerMapView, MapContextProvider, MapOverlayVehicles, MapOverlayVehiclesInteractiveLayerId, MapView, useMapViewContext } from '@tmlmobilidade/ui';
import { type MapLayerMouseEvent } from '@vis.gl/react-maplibre';
import { useEffect, useMemo, useRef, useState } from 'react';

import styles from './styles.module.css';

import { LandingMapVehiclePopup } from '../LandingMapVehiclePopup';
import { useLandingVehiclesData } from './use-landing-vehicles-data';

/* * */

const LISBON_VIEW = {
	latitude: 38.734,
	longitude: -9.145,
	zoom: 12.4,
};

/* * */

export function LandingMap() {
	//

	//
	// A. Setup variables

	const { data, geoJson } = useLandingVehiclesData();
	const [hoveredVehicleKey, setHoveredVehicleKey] = useState<null | string>(null);

	//
	// B. Transform data

	const hoveredVehicle = useMemo(() => {
		if (!hoveredVehicleKey) return null;
		return data.find(position => `${position.agency_id}-${position.vehicle_id}` === hoveredVehicleKey) ?? null;
	}, [data, hoveredVehicleKey]);

	//
	// C. Handle actions

	const handleMouseEnter = (event: MapLayerMouseEvent) => {
		const properties = event.features?.[0]?.properties;
		setHoveredVehicleKey(properties ? `${properties.agency_id}-${properties.vehicle_id}` : null);
	};

	const handleMouseLeave = () => {
		setHoveredVehicleKey(null);
	};

	//
	// D. Render components

	return (
		<div className={styles.container}>
			<MapContextProvider preferenceScope="landing-map">
				<MapView
					id="landing-map"
					interactiveLayerIds={[MapOverlayVehiclesInteractiveLayerId]}
					layers={{ navigation: true }}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					showSearchPin={false}
					toolbar={false}
				>
					<LandingMapViewport features={geoJson.features} />
					<MapOverlayVehicles vehiclesData={geoJson} />
					{hoveredVehicle && <LandingMapVehiclePopup data={hoveredVehicle} />}
				</MapView>
			</MapContextProvider>
		</div>
	);

	//
}

/* * */

function LandingMapViewport({ features }: { features: GeoJSON.Feature<GeoJSON.Point>[] }) {
	//

	//
	// A. Setup variables

	const mapViewContext = useMapViewContext();
	const isLoading = mapViewContext.flags.loading;
	const mapRef = mapViewContext.ref.map;
	const hasCenteredOnVehicles = useRef(false);

	//
	// B. Handle actions

	useEffect(() => {
		if (isLoading || !mapRef.current) return;
		mapRef.current.jumpTo(LISBON_VIEW);
	}, [isLoading, mapRef]);

	useEffect(() => {
		if (hasCenteredOnVehicles.current || isLoading || !mapRef.current || features.length === 0) return;
		hasCenteredOnVehicles.current = true;
		centerMapView(mapRef.current, features);
	}, [features, isLoading, mapRef]);

	return null;

	//
}
