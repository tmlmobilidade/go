'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { useBaseMap } from '@/components/common/base-map/use-base-map';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { MapView } from '@/components/map/MapView';
import { MapViewOverlayVehicles, MapViewStyleVehiclesInteractiveLayerId, MapViewStyleVehiclesPrimaryLayerId } from '@/components/map/overlays/MapViewOverlayVehicles';
import { MapViewStyleAlerts, MapViewStyleAlertsInteractiveLayerId } from '@/components/map/overlays/MapViewStyleAlerts';
import { MapViewStyleStops, MapViewStyleStopsInteractiveLayerId } from '@/components/map/overlays/MapViewStyleStops';
import { useStopsContext } from '@/components/stops/Stops.context';
import { useVehiclesContext } from '@/components/vehicles/Vehicles.context';
import { MapLayerMouseEvent } from '@vis.gl/react-maplibre';
import { useEffect, useMemo } from 'react';

/* * */

export function BaseMap() {
	//

	//
	// A. Setup variables

	const stopsContext = useStopsContext();
	const alertsContext = useAlertsContext();
	const vehiclesContext = useVehiclesContext();

	const { activeBottomSheet, setActiveBottomSheet } = useBottomSheet();

	const { activeBaseMapOverlays } = useBaseMap();

	const { 'viewport-map': viewportMap } = useMap();

	const focusedAlertId = activeBottomSheet?.view === 'alerts-detail'
		? activeBottomSheet.entityId
		: null;

	const alertsMapData = useMemo(() => {
		if (!focusedAlertId) return alertsContext.data.fc;

		const collection = getBaseGeoJsonFeatureCollection();

		alertsContext.data.fc.features.forEach((feature) => {
			const featureId = feature.properties?.id ?? feature.properties?._id;

			if (featureId === focusedAlertId) collection.features.push(feature);
		});

		return collection;
	}, [alertsContext.data.fc, focusedAlertId]);

	useEffect(() => {
		if (!viewportMap || !focusedAlertId || !activeViewportMapOverlays.includes('alerts')) return;

		const focusedFeature = alertsMapData.features.find(
			feature => feature.geometry?.type === 'Point',
		);

		if (!focusedFeature || focusedFeature.geometry?.type !== 'Point') return;

		moveMap(viewportMap, focusedFeature.geometry.coordinates);
	}, [viewportMap, focusedAlertId, alertsMapData.features, activeViewportMapOverlays]);

	//
	// C. Handle actions

	const handleMapClick = (event: MapLayerMouseEvent) => {
		if (!event.features?.length) return;

		const feature = event.features[0];
		const layerId = feature.layer?.id;

		if (layerId === MapViewStyleStopsInteractiveLayerId) {
			setActiveBottomSheet({ entityId: String(feature.properties._id), view: 'stops-detail' }, { replace: true });
			return;
		}

		if (layerId === MapViewStyleAlertsInteractiveLayerId) {
			const alertId = feature.properties.id ?? feature.properties._id;

			if (!alertId || feature.geometry?.type !== 'Point') return;

			const [longitude, latitude] = feature.geometry.coordinates;

			moveMap(event.target, [longitude, latitude]);
			setActiveBottomSheet({ entityId: String(alertId), view: 'alerts-detail' }, { replace: true });
			return;
		}

		if (layerId === MapViewStyleVehiclesInteractiveLayerId) {
			setActiveBottomSheet({ entityId: String(feature.properties.vehicle_id), view: 'vehicles-detail' }, { replace: true });
		}
	};

	//
	// B. Render components

	return (
		<MapView
			id="viewport-map"
			interactiveLayerIds={[MapViewStyleVehiclesPrimaryLayerId, MapViewStyleStopsInteractiveLayerId, MapViewStyleAlertsInteractiveLayerId]}
			onClick={handleMapClick}
		>
			<MapViewStyleStops
				stopsData={stopsContext.data.fc}
				visible={activeBaseMapOverlays.includes('stops')}
			/>
			<MapViewOverlayVehicles
				vehiclesData={vehiclesContext.data.fc}
				visible={activeBaseMapOverlays.includes('vehicles')}
			/>
			<MapViewStyleAlerts
				data={alertsContext.data.fc}
				visible={activeBaseMapOverlays.includes('alerts')}
			/>
		</MapView>
	);
}
