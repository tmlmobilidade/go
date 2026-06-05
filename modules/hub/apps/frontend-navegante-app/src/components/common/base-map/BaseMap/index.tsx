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

/* * */

export function BaseMap() {
	//

	//
	// A. Setup variables

	const stopsContext = useStopsContext();
	const alertsContext = useAlertsContext();
	const vehiclesContext = useVehiclesContext();

	const { setActiveBottomSheet } = useBottomSheet();

	const { activeBaseMapOverlays } = useBaseMap();

	//
	// C. Handle actions

	const handleMapClick = (event: MapLayerMouseEvent) => {
		if (!event.features?.length) return;
		if (event.features[0].layer?.id === MapViewStyleStopsInteractiveLayerId) {
			setActiveBottomSheet({ entityId: String(event.features[0].properties._id), view: 'stops-detail' }, { replace: true });
		} else if (event.features[0].layer?.id === MapViewStyleAlertsInteractiveLayerId) {
			setActiveBottomSheet({ entityId: String(event.features[0].properties._id), view: 'alerts-detail' }, { replace: true });
		} else if (event.features[0].layer?.id === MapViewStyleVehiclesInteractiveLayerId) {
			setActiveBottomSheet({ entityId: String(event.features[0].properties.vehicle_id), view: 'vehicles-detail' }, { replace: true });
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
