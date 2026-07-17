'use client';

import { VehiclesCounter } from '@/components/common/display/VehiclesCounter';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { useVehiclesContext } from '@/components/vehicles/Vehicles.context';
import { filterVehicleFeatureCollectionByPatternIds, getRoutePlannerItineraryPatternIds } from '@/utils/route-planner-vehicles';
import { useMemo } from 'react';

/* * */

export function RoutePlannerVehiclesCounter() {
	//

	//
	// A. Setup variables

	const routePlannerContext = useRoutePlannerContext();
	const vehiclesContext = useVehiclesContext();

	//
	// B. Transform data

	const routePlannerVehiclePatternIds = useMemo(() => {
		return getRoutePlannerItineraryPatternIds(routePlannerContext.data.selected_itinerary);
	}, [routePlannerContext.data.selected_itinerary]);

	const vehiclesData = useMemo(() => {
		return filterVehicleFeatureCollectionByPatternIds(vehiclesContext.data.fc, routePlannerVehiclePatternIds);
	}, [routePlannerVehiclePatternIds, vehiclesContext.data.fc]);

	//
	// C. Render components

	return <VehiclesCounter count={vehiclesData.features.length} />;

	//
}
