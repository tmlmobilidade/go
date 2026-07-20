'use client';

import { useUserLocation } from '@/components/map/use-user-location';
import { useRoutePlannerContext } from '@/components/routes/RoutePlanner.context';
import { formatMotisPlanDurationMinutes, getMotisItineraryActiveLegIndex, getMotisLegDurationSeconds, getMotisLegRemainingDistanceMeters, getMotisLegRemainingSeconds, type MotisPlanLeg } from '@/utils/route-planner-motis';
import { useMemo } from 'react';

/* * */

interface UseRoutePlannerActiveLegReturnType {
	activeLeg: MotisPlanLeg | null
	activeLegIndex: number
	// Whether the active leg was determined from the user's live location, or is just a fallback
	// (e.g. no location permission yet) defaulting to the itinerary's first leg.
	isTrackingLocation: boolean
	remainingDistanceMeters: null | number
	remainingMinutes: null | number
}

/**
 * Determines which leg of the active itinerary the user is currently on, based on their live
 * GPS location, and how many minutes are left on it. Used to power the "current step" surfaces
 * shown while a trip is being navigated (compact sheet bar, live bar).
 */
export function useRoutePlannerActiveLeg(): UseRoutePlannerActiveLegReturnType {
	//

	//
	// A. Setup variables

	const { userLocation } = useUserLocation();
	const routePlannerContext = useRoutePlannerContext();

	//
	// B. Transform data

	const itinerary = routePlannerContext.data.selected_itinerary;

	const legs = useMemo(() => {
		return Array.isArray(itinerary?.legs) ? itinerary.legs : [];
	}, [itinerary]);

	const userPosition = useMemo(() => {
		if (!userLocation) return null;
		return [userLocation.longitude, userLocation.latitude] as GeoJSON.Position;
	}, [userLocation]);

	const activeLegIndex = useMemo(() => {
		if (!itinerary || !userPosition || legs.length === 0) return 0;
		return getMotisItineraryActiveLegIndex(itinerary, userPosition, routePlannerContext.data.origin, routePlannerContext.data.destination);
	}, [itinerary, legs.length, routePlannerContext.data.destination, routePlannerContext.data.origin, userPosition]);

	const activeLeg = legs[activeLegIndex] ?? legs[0] ?? null;

	const remainingMinutes = useMemo(() => {
		if (!activeLeg) return null;
		if (userPosition) return formatMotisPlanDurationMinutes(getMotisLegRemainingSeconds(activeLeg, userPosition));
		return formatMotisPlanDurationMinutes(getMotisLegDurationSeconds(activeLeg));
	}, [activeLeg, userPosition]);

	const remainingDistanceMeters = useMemo(() => {
		if (!activeLeg) return null;
		return getMotisLegRemainingDistanceMeters(activeLeg, userPosition);
	}, [activeLeg, userPosition]);

	//
	// C. Return data

	return {
		activeLeg,
		activeLegIndex,
		isTrackingLocation: Boolean(userPosition),
		remainingDistanceMeters,
		remainingMinutes,
	};

	//
}
