'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { useBottomSheet } from '@/components/common/bottom-sheet/use-bottom-sheet';
import { MapView } from '@/components/map/MapView';
import { MapViewOverlayVehicles, MapViewStyleVehiclesInteractiveLayerId, MapViewStyleVehiclesPrimaryLayerId } from '@/components/map/overlays/MapViewOverlayVehicles';
import { MapViewStyleAlerts, MapViewStyleAlertsInteractiveLayerId } from '@/components/map/overlays/MapViewStyleAlerts';
import { MapViewStyleStops, MapViewStyleStopsInteractiveLayerId } from '@/components/map/overlays/MapViewStyleStops';
import { useStopsContext } from '@/components/stops/Stops.context';
import { useVehiclesContext } from '@/components/vehicles/Vehicles.context';
import { useViewportMapOverlays } from '@/hooks/use-viewport-map-overlays';
import { MapLayerMouseEvent } from '@vis.gl/react-maplibre';

/* * */

export function ViewportMap() {
	//

	//
	// A. Setup variables

	const stopsContext = useStopsContext();
	const alertsContext = useAlertsContext();
	const vehiclesContext = useVehiclesContext();

	const { setActiveBottomSheet } = useBottomSheet();

	const { activeViewportMapOverlays } = useViewportMapOverlays();

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

			if (!alertId) return;

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
				visible={activeViewportMapOverlays.includes('stops')}
			/>
			<MapViewOverlayVehicles
				vehiclesData={vehiclesContext.data.fc}
				visible={activeViewportMapOverlays.includes('vehicles')}
			/>
			<MapViewStyleAlerts
				data={alertsContext.data.fc}
				visible={activeViewportMapOverlays.includes('alerts')}
			/>
		</MapView>
	);
}
