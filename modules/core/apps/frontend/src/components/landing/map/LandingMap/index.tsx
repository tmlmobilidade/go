'use client';

import { centerMapView, MapContextProvider, MapView, useMapViewContext } from '@tmlmobilidade/ui';
import { Layer, type MapLayerMouseEvent, Source } from '@vis.gl/react-maplibre';
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

const VEHICLES_LAYER_ID = 'landing-vehicles';

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
					interactiveLayerIds={[VEHICLES_LAYER_ID]}
					layers={{ navigation: true }}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
					showSearchPin={false}
					toolbar={false}
				>
					<LandingMapViewport features={geoJson.features} />
					<Source data={geoJson} id={VEHICLES_LAYER_ID} type="geojson">
						<Layer
							id={VEHICLES_LAYER_ID}
							type="circle"
							paint={{
								'circle-color': '#ffdd01',
								'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 3, 16, 8],
								'circle-stroke-color': '#000000',
								'circle-stroke-width': 1,
							}}
						/>
					</Source>
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
