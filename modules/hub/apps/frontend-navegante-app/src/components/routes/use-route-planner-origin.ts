'use client';

import { useUserLocation } from '@/contexts/UserLocation.context';
import { type RoutePlannerLocation } from '@/types/route-planner/models';
import { createRoutePlannerCurrentLocation } from '@/utils/route-planner/planning/locations';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

interface UseRoutePlannerOriginReturnType {
	cachedOrigin: null | RoutePlannerLocation
	resolveOrigin: (origin: null | RoutePlannerLocation) => Promise<null | RoutePlannerLocation>
}

/* * */

export function useRoutePlannerOrigin(): UseRoutePlannerOriginReturnType {
	//

	// A. Setup variables

	const { t } = useTranslation();
	const { data: { location: userLocation } } = useUserLocation();

	//
	// B. Handle actions

	const createCurrentLocation = useCallback((latitude: number | undefined, longitude: number | undefined) => {
		return createRoutePlannerCurrentLocation({
			detail: t('default:routes.RoutePlannerSearch.origin.current_location_detail'),
			label: t('default:routes.RoutePlannerSearch.origin.current_location'),
			latitude,
			longitude,
		});
	}, [t]);

	const cachedOrigin = userLocation ? createCurrentLocation(userLocation.latitude, userLocation.longitude) : null;

	const resolveOrigin = useCallback(async (origin: null | RoutePlannerLocation) => {
		if (origin) return origin;
		return cachedOrigin;
	}, [cachedOrigin]);

	//
	// C. Return data

	return useMemo(() => ({ cachedOrigin, resolveOrigin }), [cachedOrigin, resolveOrigin]);

	//
}
