'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { MapView } from '@/components/map/MapView';
import { MapViewStyleAlerts } from '@/components/map/MapViewStyleAlerts';
import { MapViewStyleStops } from '@/components/map/MapViewStyleStops';
import { MapViewStyleVehicles, MapViewStyleVehiclesPrimaryLayerId } from '@/components/map/MapViewStyleVehicles';
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
		const feature = event.features[0];
		console.log(event.features);
		if (!feature) return;
		if (feature.source === 'default-source-vehicles') {
			setActiveBottomSheet({
				entityId: feature.properties.vehicle_id,
				view: 'vehicle-detail',
			});
		}
		// if (feature.source === 'default-source-alerts') {
		// 	setActiveBottomSheet({
		// 		entityId: String(feature.id),
		// 		view: 'alert-detail',
		// 	});
		// }
		if (feature.source === 'default-source-stops') {
			setActiveBottomSheet({
				entityId: String(feature.id),
				view: 'stop-detail',
			});
		}
	};

	//
	// B. Render components

	return (
		<MapView
			id="viewport-map"
			interactiveLayerIds={[MapViewStyleVehiclesPrimaryLayerId]}
			onClick={handleMapClick}
		>
			<MapViewStyleStops
				stopsData={stopsContext.data.fc}
				visible={activeViewportMapOverlays.includes('stops')}
			/>
			<MapViewStyleVehicles
				showCounter="always"
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
