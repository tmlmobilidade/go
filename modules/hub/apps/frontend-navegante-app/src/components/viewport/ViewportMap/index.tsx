'use client';

import { MapView } from '@/components/map/MapView';
import { MapViewStyleStops } from '@/components/map/MapViewStyleStops';
import { MapViewStyleVehicles } from '@/components/map/MapViewStyleVehicles';
import { useStopsContext } from '@/components/stops/Stops.context';
import { useVehiclesContext } from '@/contexts/Vehicles.context';
import { useViewportMapSources } from '@/hooks/use-viewport-map-sources';

/* * */

export function ViewportMap() {
	//

	//
	// A. Setup variables

	const stopsContext = useStopsContext();
	const vehiclesContext = useVehiclesContext();

	const { activeViewportMapSources } = useViewportMapSources();

	//
	// B. Render components

	return (
		<MapView id="viewport-map">
			<MapViewStyleStops
				stopsData={stopsContext.data.fc}
				visible={activeViewportMapSources.includes('stops')}
			/>
			<MapViewStyleVehicles
				showCounter="always"
				vehiclesData={vehiclesContext.data.fc}
				visible={activeViewportMapSources.includes('vehicles')}
			/>
		</MapView>
	);
}
