'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { MapView } from '@/components/map/MapView';
import { MapViewOverlayVehicles, MapViewStyleVehiclesInteractiveLayerId, MapViewStyleVehiclesPrimaryLayerId } from '@/components/map/overlays/MapViewOverlayVehicles';
import { MapViewStyleAlerts, MapViewStyleAlertsInteractiveLayerId } from '@/components/map/overlays/MapViewStyleAlerts';
import { MapViewStyleStops, MapViewStyleStopsInteractiveLayerId } from '@/components/map/overlays/MapViewStyleStops';
import { useStopsContext } from '@/components/stops/Stops.context';
import { useVehiclesContext } from '@/components/vehicles/Vehicles.context';
import { useBottomSheet } from '@/hooks/use-bottom-sheet';
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
		if (event.features[0].layer?.id === MapViewStyleStopsInteractiveLayerId) {
			setActiveBottomSheet({ entityId: String(event.features[0].properties._id), view: 'stops-detail' }, { replace: true });
		} else if (event.features[0].layer?.id === MapViewStyleAlertsInteractiveLayerId) {
			setActiveBottomSheet({ entityId: String(event.features[0].properties._id), view: 'alerts-detail' });
		} else if (event.features[0].layer?.id === MapViewStyleVehiclesInteractiveLayerId) {
			setActiveBottomSheet({ entityId: String(event.features[0].properties.vehicle_id), view: 'vehicles-detail' });
		}
	};

	//
	// B. Render components

	return (
		<MapView
			id="viewport-map"
			interactiveLayerIds={[MapViewStyleVehiclesPrimaryLayerId, MapViewStyleStopsInteractiveLayerId]}
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
