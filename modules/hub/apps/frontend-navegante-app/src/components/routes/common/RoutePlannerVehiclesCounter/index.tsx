'use client';

import { VehiclesCounter } from '@/components/common/display/VehiclesCounter';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { useVehiclesContext } from '@/components/vehicles/Vehicles.context';
import { filterVehicleFeatureCollectionByRouteDirections, getRoutePlannerItineraryRouteDirections } from '@/utils/route-planner/vehicles';
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

	const routePlannerVehicleRouteDirections = useMemo(() => {
		return getRoutePlannerItineraryRouteDirections(routePlannerContext.data.selected_itinerary);
	}, [routePlannerContext.data.selected_itinerary]);

	const vehiclesData = useMemo(() => {
		return filterVehicleFeatureCollectionByRouteDirections(vehiclesContext.data.fc, routePlannerVehicleRouteDirections);
	}, [routePlannerVehicleRouteDirections, vehiclesContext.data.fc]);

	//
	// C. Render components

	return <VehiclesCounter count={vehiclesData.features.length} />;

	//
}
