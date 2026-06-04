'use client';

import { MapView } from '@/components/map/MapView';
import { MapViewStyleStops } from '@/components/map/MapViewStyleStops';
import { MapViewStyleVehicles } from '@/components/map/MapViewStyleVehicles';
import { useStopsListContext } from '@/components/stops/list/StopsList.context';
import { useVehiclesContext } from '@/contexts/Vehicles.context';
import { useEffect } from 'react';

import { StopsListViewMapVehiclesToggle } from '../StopsListViewMapVehiclesToggle';

/* * */

export function StopsListViewMap() {
	//

	//
	// A. Setup variables

	const vehiclesContext = useVehiclesContext();
	const stopsListContext = useStopsListContext();

	//
	// B. Handle actions

	useEffect(() => {
		// Exit early if there are no stops or map
		if (!stopsListContext.data.fc?.features.length) return;
		// When there are no search filters, center the map on all stops
		if (!stopsListContext.filters.search.value) {
			// centerMapView(stopsListContext.data.fc);
			return;
		}
	}, [stopsListContext.data.fc, stopsListContext.filters.search.value]);

	//
	// C. Render components

	return (
		<>
			<MapView id="stops-list">
				<MapViewStyleStops
					stopsData={stopsListContext.data.fc}
				/>
				{stopsListContext.view.showVehicles && (
					<MapViewStyleVehicles
						showCounter="always"
						vehiclesData={vehiclesContext.data.fc}
					/>
				)}
			</MapView>
			<StopsListViewMapVehiclesToggle />
		</>
	);
}
