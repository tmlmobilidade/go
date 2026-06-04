'use client';

import { MapView } from '@/components/map/MapView';
import { MapViewStyleStops } from '@/components/map/MapViewStyleStops';
import { MapViewStyleVehicles } from '@/components/map/MapViewStyleVehicles';
import { useStopsContext } from '@/components/stops/Stops.context';
import { ViewportMapToggle } from '@/components/viewport/ViewportMapToggle';
import { useVehiclesContext } from '@/contexts/Vehicles.context';

/* * */

export function ViewportMap() {
	//

	//
	// A. Setup variables

	const stopsContext = useStopsContext();
	const vehiclesContext = useVehiclesContext();

	//
	// B. Render components

	return (
		<>
			<MapView id="viewport-map">
				<MapViewStyleStops
					stopsData={stopsContext.data.fc}
					visible={stopsContext.data.fc?.features.length > 0}
				/>
				<MapViewStyleVehicles
					showCounter="always"
					vehiclesData={vehiclesContext.data.fc}
				/>
			</MapView>
			<ViewportMapToggle />
		</>
	);
}
