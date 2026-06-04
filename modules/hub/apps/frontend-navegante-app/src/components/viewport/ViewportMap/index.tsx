'use client';

import { useAlertsContext } from '@/components/alerts/Alerts.context';
import { MapView } from '@/components/map/MapView';
import { MapViewStyleAlerts } from '@/components/map/MapViewStyleAlerts';
import { MapViewStyleStops } from '@/components/map/MapViewStyleStops';
import { MapViewStyleVehicles } from '@/components/map/MapViewStyleVehicles';
import { useStopsContext } from '@/components/stops/Stops.context';
import { useVehiclesContext } from '@/contexts/Vehicles.context';
import { useViewportMapOverlays } from '@/hooks/use-viewport-map-overlays';

/* * */

export function ViewportMap() {
	//

	//
	// A. Setup variables

	const stopsContext = useStopsContext();
	const alertsContext = useAlertsContext();
	const vehiclesContext = useVehiclesContext();

	const { activeViewportMapOverlays } = useViewportMapOverlays();

	//
	// B. Render components

	return (
		<MapView id="viewport-map">
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
