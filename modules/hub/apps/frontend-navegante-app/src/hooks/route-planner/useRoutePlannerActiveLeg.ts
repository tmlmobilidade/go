'use client';

import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { useUserLocation } from '@/contexts/UserLocation.context';
import { getRoutePlannerActiveLegProgress, type RoutePlannerActiveLegProgress } from '@/utils/route-planner/itinerary/progress';
import { useMemo } from 'react';

/* * */

export function useRoutePlannerActiveLeg(): RoutePlannerActiveLegProgress {
	//

	//
	// A. Setup variables

	const { userLocation } = useUserLocation();
	const routePlannerContext = useRoutePlannerContext();

	//
	// B. Transform data

	const userPosition = useMemo(() => {
		if (!userLocation) return null;
		return [userLocation.longitude, userLocation.latitude] as GeoJSON.Position;
	}, [userLocation]);

	const activeLegProgress = useMemo(() => getRoutePlannerActiveLegProgress({
		destination: routePlannerContext.data.destination,
		itinerary: routePlannerContext.data.selected_itinerary,
		origin: routePlannerContext.data.origin,
		userPosition,
	}), [routePlannerContext.data.destination, routePlannerContext.data.origin, routePlannerContext.data.selected_itinerary, userPosition]);

	//
	// C. Return data

	return activeLegProgress;

	//
}
