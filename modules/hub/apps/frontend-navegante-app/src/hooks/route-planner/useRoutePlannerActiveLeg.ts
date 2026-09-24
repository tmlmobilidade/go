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

	const userLocationContext = useUserLocation();
	const routePlannerContext = useRoutePlannerContext();

	//
	// B. Transform data

	const userPosition = useMemo(() => {
		if (!userLocationContext.data.location) return null;
		return [userLocationContext.data.location.longitude, userLocationContext.data.location.latitude] as GeoJSON.Position;
	}, [userLocationContext.data.location]);

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
