'use client';

import { VehiclesCounter } from '@/components/common/display/VehiclesCounter';
import { useLinesDetailContext } from '@/components/lines/detail/LinesDetail.context';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { useVehiclesData } from '@/components/vehicles/use-vehicles-data';
import { useMapContext } from '@/contexts/Map.context';
import { useBottomSheet } from '@/hooks/bottom-sheet/useBottomSheet';
import { getLineDetailVehicleSelection, isVehicleOnSelectedLinePattern } from '@/utils/map/base-map-data';
import { isBaseMapAgencyVisible } from '@/utils/map/base-map-operators';
import { isVehicleIncludedInMap } from '@/utils/map/vehicle-visibility';
import { getRoutePlannerItineraryRouteDirections, isVehicleInRouteDirections } from '@/utils/route-planner/itinerary/vehicles';
import { useMemo } from 'react';

/* * */

export function RoutePlannerVehiclesCounter() {
	//

	//
	// A. Setup variables

	const routePlannerContext = useRoutePlannerContext();
	const linesDetailContext = useLinesDetailContext();
	const { activeBottomSheet } = useBottomSheet();
	const { data: { excludedBaseMapOperatorIds } } = useMapContext();
	const { data: vehicles } = useVehiclesData();

	//
	// B. Transform data

	const routePlannerVehicleRouteDirections = useMemo(() => {
		return getRoutePlannerItineraryRouteDirections(routePlannerContext.data.selected_itinerary);
	}, [routePlannerContext.data.selected_itinerary]);

	const vehicleCount = useMemo(() => {
		if (activeBottomSheet?.view === 'lines-detail') {
			const selectedLine = linesDetailContext.data.line?._id === activeBottomSheet.entityId ? linesDetailContext.data.line : undefined;
			const selection = getLineDetailVehicleSelection(selectedLine, linesDetailContext.data.active_pattern);
			return vehicles.filter(vehicle => (
				isVehicleIncludedInMap(vehicle)
				&& isBaseMapAgencyVisible(vehicle.agency_id, excludedBaseMapOperatorIds)
				&& isVehicleOnSelectedLinePattern(vehicle, selection)
			)).length;
		}

		return vehicles.filter((vehicle) => {
			return isVehicleIncludedInMap(vehicle) && isVehicleInRouteDirections(vehicle, routePlannerVehicleRouteDirections);
		}).length;
	}, [activeBottomSheet, excludedBaseMapOperatorIds, linesDetailContext.data.active_pattern, linesDetailContext.data.line, routePlannerVehicleRouteDirections, vehicles]);

	//
	// C. Render components

	return <VehiclesCounter count={vehicleCount} />;

	//
}
