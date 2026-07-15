'use client';

import { VehiclesCounter } from '@/components/common/display/VehiclesCounter';
import { useLinesContext } from '@/components/lines/Lines.context';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { useVehiclesContext } from '@/components/vehicles/Vehicles.context';
import { filterVehicleFeatureCollectionByLineIds, getRoutePlannerItineraryLineIds } from '@/utils/route-planner-vehicles';
import { useMemo } from 'react';

/* * */

export function RoutePlannerVehiclesCounter() {
	//

	//
	// A. Setup variables

	const linesContext = useLinesContext();
	const routePlannerContext = useRoutePlannerContext();
	const vehiclesContext = useVehiclesContext();

	//
	// B. Transform data

	const routePlannerVehicleLineIds = useMemo(() => {
		return getRoutePlannerItineraryLineIds(routePlannerContext.data.selected_itinerary, linesContext.data.lines);
	}, [linesContext.data.lines, routePlannerContext.data.selected_itinerary]);

	const vehiclesData = useMemo(() => {
		return filterVehicleFeatureCollectionByLineIds(vehiclesContext.data.fc, routePlannerVehicleLineIds);
	}, [routePlannerVehicleLineIds, vehiclesContext.data.fc]);

	//
	// C. Render components

	return <VehiclesCounter count={vehiclesData.features.length} />;

	//
}
